import { eq, and } from 'drizzle-orm';
import { db, users, profiles, profileSlugs, type ASCDatabase } from '@asc/db';
import { hasAdminPermission, hasModeratorPermission, hasSupporterStatus } from '@asc/permissions';
import type { AuthenticatedMember, IdentityResolutionResult, CommunityRole } from '@asc/types';

export interface ResolveIdentityOptions {
  clerkUserId: string;
  discordSnowflake: string;
  database?: ASCDatabase;
}

/**
 * Links a verified Clerk user ID to an existing canonical ASC user record.
 * This is an atomic operation adhering strictly to the identity invariants.
 */
export async function linkClerkAccount(
  externalUserId: string,
  clerkUserId: string,
  database: ASCDatabase = db
): Promise<void> {
  await database
    .update(users)
    .set({
      clerkUserId,
      updatedAt: new Date(),
    })
    .where(eq(users.externalUserId, externalUserId));
}

/**
 * Resolves an authenticated member by verifying their Discord Snowflake anchor.
 *
 * 1. Queries canonical ASC user by immutable `externalUserId` (Discord Snowflake).
 * 2. If found, links the `clerkUserId` if not already linked.
 * 3. Assembles full permissions, roles, primary slug, and profile data.
 * 4. If not found in ASC, returns NOT_FOUND (members do NOT register to create profiles;
 *    profiles originate exclusively from Discord community sync).
 */
export async function resolveMemberByIdentity({
  clerkUserId,
  discordSnowflake,
  database = db,
}: ResolveIdentityOptions): Promise<IdentityResolutionResult> {
  if (!discordSnowflake) {
    return {
      status: 'UNLINKED_DISCORD',
      clerkUserId,
    };
  }

  // 1. Fetch user by canonical external ID
  const userRecord = await database.query.users.findFirst({
    where: eq(users.externalUserId, discordSnowflake),
    with: {
      profile: true,
      memberRoles: {
        with: {
          role: true,
        },
      },
      entitlements: true,
    },
  });

  if (!userRecord || userRecord.membershipStatus === 'BANNED') {
    return {
      status: 'NOT_FOUND',
      discordSnowflake,
      clerkUserId,
    };
  }

  // 2. Identity linkage: Link Clerk User ID if not currently linked or changed
  if (userRecord.clerkUserId !== clerkUserId) {
    await linkClerkAccount(userRecord.externalUserId, clerkUserId, database);
    userRecord.clerkUserId = clerkUserId;
  }

  // 3. Ensure profile row exists defensively
  let userProfile = userRecord.profile;
  if (!userProfile) {
    const defaultProfile = {
      id: crypto.randomUUID(),
      userId: userRecord.id,
      bio: null,
      customTitle: null,
      accentColor: '#5865f2',
      theme: 'canvas' as const,
      backgroundUrl: null,
      layout: 'classic' as const,
      supporterLayout: null,
      typography: 'balanced' as const,
      avatarFrame: 'none' as const,
      coverTreatment: 'solid' as const,
      coverPosition: 50,
      motion: 'subtle' as const,
      isPrivate: false,
      showRoles: true,
      showMembershipDate: true,
      showTags: true,
      showLinks: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await database.insert(profiles).values(defaultProfile);
    userProfile = defaultProfile;
  }

  // 4. Fetch primary slug
  const primarySlugRecord = await database.query.profileSlugs.findFirst({
    where: and(
      eq(profileSlugs.userId, userRecord.id),
      eq(profileSlugs.isPrimary, true)
    ),
  });

  // 5. Extract roles and compute permissions
  // Saved role relations are historical after departure, not current privileges.
  const roles: CommunityRole[] = (userRecord.membershipStatus === 'ACTIVE' ? userRecord.memberRoles || [] : [])
    .map((mr) => mr.role)
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      id: r.id,
      externalRoleId: r.externalRoleId,
      name: r.name,
      color: r.color,
      position: r.position,
      isSupporter: r.isSupporter,
      isAdmin: r.isAdmin,
      isModerator: r.isModerator,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

  const isAdmin = hasAdminPermission(roles);
  const isModerator = hasModeratorPermission(roles);
  const isSupporter = hasSupporterStatus(roles);

  const member: AuthenticatedMember = {
    user: {
      id: userRecord.id,
      externalUserId: userRecord.externalUserId,
      clerkUserId: userRecord.clerkUserId,
      username: userRecord.username,
      displayName: userRecord.displayName,
      nickname: userRecord.nickname,
      avatar: userRecord.avatar,
      membershipStatus: userRecord.membershipStatus as 'ACTIVE' | 'LEFT' | 'BANNED',
      firstJoinedAt: userRecord.firstJoinedAt,
      leftAt: userRecord.leftAt,
      lastSyncedAt: userRecord.lastSyncedAt,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    },
    profile: {
      id: userProfile.id,
      userId: userProfile.userId,
      bio: userProfile.bio,
      customTitle: userProfile.customTitle,
      accentColor: userProfile.accentColor,
      theme: userProfile.theme as 'canvas' | 'indigo' | 'onyx',
      backgroundUrl: userProfile.backgroundUrl,
      layout: userProfile.layout,
      supporterLayout: userProfile.supporterLayout,
      typography: userProfile.typography,
      avatarFrame: userProfile.avatarFrame,
      coverTreatment: userProfile.coverTreatment,
      coverPosition: userProfile.coverPosition,
      motion: userProfile.motion,
      isPrivate: userProfile.isPrivate,
      showRoles: userProfile.showRoles,
      showMembershipDate: userProfile.showMembershipDate,
      showTags: userProfile.showTags,
      showLinks: userProfile.showLinks,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    },
    roles,
    isAdmin,
    isModerator,
    isSupporter,
    primarySlug: primarySlugRecord?.slug || userRecord.username.toLowerCase(),
  };

  return {
    status: 'RESOLVED',
    member,
  };
}
