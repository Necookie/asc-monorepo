import { eq, and, isNull, desc } from 'drizzle-orm';
import type { ASCDatabase } from '@asc/db';
import {
  users,
  profiles,
  profileSlugs,
  membershipPeriods,
  communityRoles,
  memberRoles,
  entitlements,
} from '@asc/db';
import type { SyncMemberData, SyncUserData } from '../mappers/member';
import { generateSlug } from '../lib/slug';
import { logger } from '../lib/logger';
import { RoleSyncService } from './role-sync';

export interface SyncMemberResult {
  userId: string;
  isNew: boolean;
  slug: string;
}

export class MemberSyncService {
  private db: ASCDatabase;
  private roleSyncService: RoleSyncService;
  private log = logger.forSubsystem('MemberSync');

  constructor(db: ASCDatabase, roleSyncService?: RoleSyncService) {
    this.db = db;
    this.roleSyncService = roleSyncService || new RoleSyncService(db);
  }

  /**
   * Idempotently upserts a Discord member into ASC database.
   * Handles user creation, profile initialization, slug assignment,
   * membership periods, role reconciliation, and supporter entitlements.
   */
  async upsertMember(member: SyncMemberData): Promise<SyncMemberResult> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.externalUserId, member.externalUserId),
    });

    if (!existingUser) {
      // 1. Create new user
      const [newUser] = await this.db
        .insert(users)
        .values({
          externalUserId: member.externalUserId,
          username: member.username,
          displayName: member.displayName,
          nickname: member.nickname,
          avatar: member.avatar,
          membershipStatus: 'ACTIVE',
          firstJoinedAt: member.joinedAt,
          leftAt: null,
          lastSyncedAt: new Date(),
        })
        .returning();

      // 2. Initialize default profile
      await this.db.insert(profiles).values({
        userId: newUser.id,
        bio: null,
        customTitle: null,
        accentColor: '#5865f2',
        theme: 'canvas',
        backgroundUrl: null,
        isPrivate: false,
        showRoles: true,
        showMembershipDate: true,
        showTags: true,
        showLinks: true,
      });

      // 3. Assign primary slug
      const primarySlug = await this.assignPrimarySlug(newUser.id, member.username, member.externalUserId);

      // 4. Create initial membership period
      await this.db.insert(membershipPeriods).values({
        userId: newUser.id,
        joinedAt: member.joinedAt,
        leftAt: null,
      });

      // 5. Reconcile roles & entitlements
      await this.roleSyncService.reconcileMemberRoles(newUser.id, member.roles);
      await this.syncSupporterEntitlements(newUser.id);

      this.log.info(`Initialized new ASC member: @${member.username} (${member.externalUserId})`);
      return { userId: newUser.id, isNew: true, slug: primarySlug };
    }

    // Existing user handling
    const isRejoin = existingUser.membershipStatus !== 'ACTIVE';

    // 1. Update user record
    await this.db
      .update(users)
      .set({
        username: member.username,
        displayName: member.displayName,
        nickname: member.nickname,
        avatar: member.avatar,
        membershipStatus: 'ACTIVE',
        leftAt: null,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    // 2. Handle membership period
    if (isRejoin) {
      // Check if user has an open period, if not create new one
      const openPeriod = await this.db.query.membershipPeriods.findFirst({
        where: and(eq(membershipPeriods.userId, existingUser.id), isNull(membershipPeriods.leftAt)),
      });
      if (!openPeriod) {
        await this.db.insert(membershipPeriods).values({
          userId: existingUser.id,
          joinedAt: new Date(),
          leftAt: null,
        });
      }
      this.log.info(`Restored returning member: @${member.username} (${member.externalUserId})`);
    } else {
      // Ensure at least one active membership period exists
      const latestPeriod = await this.db.query.membershipPeriods.findFirst({
        where: eq(membershipPeriods.userId, existingUser.id),
        orderBy: [desc(membershipPeriods.joinedAt)],
      });
      if (!latestPeriod || latestPeriod.leftAt !== null) {
        await this.db.insert(membershipPeriods).values({
          userId: existingUser.id,
          joinedAt: member.joinedAt,
          leftAt: null,
        });
      }
    }

    // 3. Handle slug update if username changed
    let currentSlug = '';
    if (existingUser.username !== member.username) {
      currentSlug = await this.updateUserSlugOnUsernameChange(
        existingUser.id,
        member.username,
        member.externalUserId
      );
    } else {
      const primarySlugRecord = await this.db.query.profileSlugs.findFirst({
        where: and(eq(profileSlugs.userId, existingUser.id), eq(profileSlugs.isPrimary, true)),
      });
      currentSlug = primarySlugRecord?.slug || (await this.assignPrimarySlug(existingUser.id, member.username, member.externalUserId));
    }

    // 4. Ensure profile exists (defensive check)
    const existingProfile = await this.db.query.profiles.findFirst({
      where: eq(profiles.userId, existingUser.id),
    });
    if (!existingProfile) {
      await this.db.insert(profiles).values({
        userId: existingUser.id,
        accentColor: '#5865f2',
        theme: 'canvas',
        isPrivate: false,
        showRoles: true,
        showMembershipDate: true,
        showTags: true,
        showLinks: true,
      });
    }

    // 5. Reconcile roles & entitlements
    await this.roleSyncService.reconcileMemberRoles(existingUser.id, member.roles);
    await this.syncSupporterEntitlements(existingUser.id);

    return { userId: existingUser.id, isNew: false, slug: currentSlug };
  }

  /**
   * Handles member departure from Discord guild.
   * Preserves user profile, customizations, tags, and links while updating status to LEFT.
   */
  async handleMemberDeparture(externalUserId: string, leftAt: Date = new Date()): Promise<boolean> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.externalUserId, externalUserId),
    });

    if (!user) {
      this.log.warn(`Departure event for unknown external user ID: ${externalUserId}`);
      return false;
    }

    // Set membership status to LEFT
    await this.db
      .update(users)
      .set({
        membershipStatus: 'LEFT',
        leftAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Close open membership periods
    const openPeriods = await this.db.query.membershipPeriods.findMany({
      where: and(eq(membershipPeriods.userId, user.id), isNull(membershipPeriods.leftAt)),
    });

    for (const period of openPeriods) {
      await this.db
        .update(membershipPeriods)
        .set({ leftAt })
        .where(eq(membershipPeriods.id, period.id));
    }

    // Expire supporter entitlements upon leaving
    await this.expireSupporterEntitlements(user.id);

    this.log.info(`Member departure processed for @${user.username} (${externalUserId})`);
    return true;
  }

  /**
   * Handles global Discord user update (username, avatar, global displayName).
   */
  async handleUserUpdate(userData: SyncUserData): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.externalUserId, userData.externalUserId),
    });

    if (!user) {
      return;
    }

    if (user.username !== userData.username) {
      await this.updateUserSlugOnUsernameChange(
        user.id,
        userData.username,
        userData.externalUserId
      );
    }

    await this.db
      .update(users)
      .set({
        username: userData.username,
        displayName: userData.displayName,
        avatar: userData.avatar,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    this.log.info(`Updated user details for @${userData.username} (${userData.externalUserId})`);
  }

  /**
   * Synchronizes supporter entitlements based on assigned community roles.
   */
  private async syncSupporterEntitlements(userId: string): Promise<void> {
    // Get user's current roles
    const userRoles = await this.db.query.memberRoles.findMany({
      where: eq(memberRoles.userId, userId),
      with: {
        role: true,
      },
    });

    const isSupporter = userRoles.some((ur) => ur.role?.isSupporter === true);

    if (isSupporter) {
      // Ensure supporter entitlements exist
      const keys = ['profile.background', 'profile.custom_title', 'profile.gradient'];
      for (const key of keys) {
        const existing = await this.db.query.entitlements.findFirst({
          where: and(
            eq(entitlements.userId, userId),
            eq(entitlements.key, key),
            eq(entitlements.source, 'discord_role')
          ),
        });

        if (existing) {
          if (existing.expiresAt !== null) {
            // Reactivate expired entitlement
            await this.db
              .update(entitlements)
              .set({ expiresAt: null })
              .where(eq(entitlements.id, existing.id));
          }
        } else {
          await this.db.insert(entitlements).values({
            userId,
            key,
            value: 'true',
            source: 'discord_role',
            expiresAt: null,
          });
        }
      }
    } else {
      await this.expireSupporterEntitlements(userId);
    }
  }

  private async expireSupporterEntitlements(userId: string): Promise<void> {
    const activeRoleEntitlements = await this.db.query.entitlements.findMany({
      where: and(
        eq(entitlements.userId, userId),
        eq(entitlements.source, 'discord_role'),
        isNull(entitlements.expiresAt)
      ),
    });

    const now = new Date();
    for (const ent of activeRoleEntitlements) {
      await this.db
        .update(entitlements)
        .set({ expiresAt: now })
        .where(eq(entitlements.id, ent.id));
    }
  }

  /**
   * Assigns an initial primary slug to a user.
   */
  private async assignPrimarySlug(
    userId: string,
    rawUsername: string,
    externalUserId: string
  ): Promise<string> {
    let targetSlug = generateSlug(rawUsername, externalUserId);

    // Check if taken by another user
    const existingSlug = await this.db.query.profileSlugs.findFirst({
      where: eq(profileSlugs.slug, targetSlug),
    });

    if (existingSlug && existingSlug.userId !== userId) {
      targetSlug = generateSlug(`${rawUsername}-${externalUserId.slice(-4)}`, externalUserId);
    }

    await this.db
      .insert(profileSlugs)
      .values({
        userId,
        slug: targetSlug,
        isPrimary: true,
        releasedAt: null,
      })
      .onConflictDoUpdate({
        target: profileSlugs.slug,
        set: {
          userId,
          isPrimary: true,
          releasedAt: null,
        },
      });

    return targetSlug;
  }

  /**
   * Handles slug migration when a user changes their username.
   * Demotes old primary slug to an alias (isPrimary = false, releasedAt = now)
   * and establishes the new slug as primary.
   */
  private async updateUserSlugOnUsernameChange(
    userId: string,
    newUsername: string,
    externalUserId: string
  ): Promise<string> {
    let targetSlug = generateSlug(newUsername, externalUserId);

    // Check if target slug is currently primary for another user
    const slugOwner = await this.db.query.profileSlugs.findFirst({
      where: eq(profileSlugs.slug, targetSlug),
    });

    if (slugOwner && slugOwner.userId !== userId) {
      if (slugOwner.isPrimary) {
        // Collides with another active user's primary slug; append suffix
        targetSlug = generateSlug(`${newUsername}-${externalUserId.slice(-4)}`, externalUserId);
      } else {
        // It was an old released alias of another user; claim it for current active user
        await this.db
          .update(profileSlugs)
          .set({ userId, isPrimary: true, releasedAt: null })
          .where(eq(profileSlugs.id, slugOwner.id));
      }
    }

    // Demote current primary slug to released alias
    const currentPrimary = await this.db.query.profileSlugs.findFirst({
      where: and(eq(profileSlugs.userId, userId), eq(profileSlugs.isPrimary, true)),
    });

    if (currentPrimary && currentPrimary.slug !== targetSlug) {
      await this.db
        .update(profileSlugs)
        .set({
          isPrimary: false,
          releasedAt: new Date(),
        })
        .where(eq(profileSlugs.id, currentPrimary.id));
    }

    // Insert or activate new primary slug
    const userOwnsTargetSlug = await this.db.query.profileSlugs.findFirst({
      where: and(eq(profileSlugs.userId, userId), eq(profileSlugs.slug, targetSlug)),
    });

    if (userOwnsTargetSlug) {
      await this.db
        .update(profileSlugs)
        .set({
          isPrimary: true,
          releasedAt: null,
        })
        .where(eq(profileSlugs.id, userOwnsTargetSlug.id));
    } else {
      await this.db
        .insert(profileSlugs)
        .values({
          userId,
          slug: targetSlug,
          isPrimary: true,
          releasedAt: null,
        })
        .onConflictDoUpdate({
          target: profileSlugs.slug,
          set: {
            userId,
            isPrimary: true,
            releasedAt: null,
          },
        });
    }

    this.log.info(`Migrated slug for user ${userId}: '${currentPrimary?.slug}' -> '${targetSlug}'`);
    return targetSlug;
  }
}
