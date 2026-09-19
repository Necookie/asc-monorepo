import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { createDb, type ASCDatabase, users, profiles, profileSlugs, communityRoles, memberRoles } from '@asc/db';
import { UnauthorizedError, ForbiddenError } from '@asc/permissions';
import { extractDiscordSnowflake, isValidDiscordSnowflake } from '../claims';
import { resolveMemberByIdentity, linkClerkAccount } from '../identity';
import { assertProfileOwnership, assertAdminMember, assertModeratorMember } from '../guards';
import type { AuthenticatedMember } from '@asc/types';

describe('ASC Authentication, Identity Linkage & Zero-Trust Ownership', () => {
  let testDb: ASCDatabase & { $client: any };

  beforeEach(async () => {
    testDb = createDb(':memory:');
    const migrationsFolder = path.resolve(__dirname, '../../../../../packages/db/drizzle');
    await migrate(testDb, { migrationsFolder });
  });

  afterEach(() => {
    try {
      testDb.$client.close();
    } catch {}
  });

  describe('1. Discord OAuth Claims Extraction', () => {
    it('validates Discord Snowflake format (17 to 20 digits)', () => {
      expect(isValidDiscordSnowflake('12345678901234567')).toBe(true); // 17 digits
      expect(isValidDiscordSnowflake('123456789012345678')).toBe(true); // 18 digits
      expect(isValidDiscordSnowflake('12345678901234567890')).toBe(true); // 20 digits

      // Invalid formats
      expect(isValidDiscordSnowflake('1234567890123456')).toBe(false); // 16 digits (too short)
      expect(isValidDiscordSnowflake('123456789012345678901')).toBe(false); // 21 digits (too long)
      expect(isValidDiscordSnowflake('12345678901234567a')).toBe(false); // non-digits
      expect(isValidDiscordSnowflake('')).toBe(false);
      expect(isValidDiscordSnowflake(null)).toBe(false);
      expect(isValidDiscordSnowflake(undefined)).toBe(false);
      expect(isValidDiscordSnowflake(123456789012345678)).toBe(false);
    });

    it('extracts Discord Snowflake from oauth_discord provider account', () => {
      const clerkUser = {
        id: 'user_clerk_123',
        externalAccounts: [
          {
            provider: 'oauth_discord',
            providerUserId: '100000000000000001',
            externalId: '100000000000000001',
            username: 'alice',
          },
        ],
      };

      const snowflake = extractDiscordSnowflake(clerkUser);
      expect(snowflake).toBe('100000000000000001');
    });

    it('extracts Discord Snowflake when provider is labeled "discord"', () => {
      const clerkUser = {
        id: 'user_clerk_456',
        externalAccounts: [
          {
            provider: 'discord',
            externalId: '100000000000000002',
          },
        ],
      };

      const snowflake = extractDiscordSnowflake(clerkUser);
      expect(snowflake).toBe('100000000000000002');
    });

    it('returns null when user has no external accounts or only non-discord accounts', () => {
      expect(extractDiscordSnowflake(null)).toBeNull();
      expect(extractDiscordSnowflake({ id: 'user_none', externalAccounts: [] })).toBeNull();
      expect(
        extractDiscordSnowflake({
          id: 'user_github_only',
          externalAccounts: [
            {
              provider: 'oauth_github',
              providerUserId: '987654',
            },
          ],
        })
      ).toBeNull();
    });

    it('returns null if Discord account has invalid snowflake format', () => {
      const clerkUser = {
        id: 'user_clerk_invalid',
        externalAccounts: [
          {
            provider: 'oauth_discord',
            providerUserId: 'not_a_snowflake',
          },
        ],
      };

      expect(extractDiscordSnowflake(clerkUser)).toBeNull();
    });
  });

  describe('2. Identity Linkage Service', () => {
    it('links Clerk user ID to an existing canonical member whose clerk_user_id was null', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000001',
          clerkUserId: null,
          username: 'bob',
          displayName: 'Bob Builder',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'bob',
        isPrimary: true,
      });

      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_clerk_bob',
        discordSnowflake: '200000000000000001',
        database: testDb,
      });

      expect(result.status).toBe('RESOLVED');
      if (result.status === 'RESOLVED') {
        expect(result.member.user.id).toBe(user.id);
        expect(result.member.user.externalUserId).toBe('200000000000000001');
        expect(result.member.user.clerkUserId).toBe('user_clerk_bob');
        expect(result.member.primarySlug).toBe('bob');
      }

      // Verify in database that clerk_user_id was updated
      const updatedUser = await testDb.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      expect(updatedUser?.clerkUserId).toBe('user_clerk_bob');
    });

    it('updates Clerk linkage when member logs in with a new Clerk account ID', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000002',
          clerkUserId: 'user_old_clerk_id',
          username: 'charlie',
          displayName: 'Charlie Brown',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_new_clerk_id',
        discordSnowflake: '200000000000000002',
        database: testDb,
      });

      expect(result.status).toBe('RESOLVED');
      if (result.status === 'RESOLVED') {
        expect(result.member.user.clerkUserId).toBe('user_new_clerk_id');
      }

      const updatedUser = await testDb.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      expect(updatedUser?.clerkUserId).toBe('user_new_clerk_id');
    });

    it('returns NOT_FOUND when Discord snowflake does not exist in ASC database', async () => {
      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_stranger',
        discordSnowflake: '999999999999999999',
        database: testDb,
      });

      expect(result.status).toBe('NOT_FOUND');
      if (result.status === 'NOT_FOUND') {
        expect(result.discordSnowflake).toBe('999999999999999999');
        expect(result.clerkUserId).toBe('user_stranger');
      }
    });

    it('returns NOT_FOUND if member status is BANNED', async () => {
      await testDb.insert(users).values({
        externalUserId: '200000000000000003',
        username: 'banned_user',
        displayName: 'Banned User',
        membershipStatus: 'BANNED',
        firstJoinedAt: new Date(),
        lastSyncedAt: new Date(),
      });

      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_banned',
        discordSnowflake: '200000000000000003',
        database: testDb,
      });

      expect(result.status).toBe('NOT_FOUND');
    });

    it('returns UNLINKED_DISCORD when snowflake is missing', async () => {
      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_no_discord',
        discordSnowflake: '',
        database: testDb,
      });

      expect(result.status).toBe('UNLINKED_DISCORD');
    });

    it('automatically ensures default profile row exists if missing', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000004',
          username: 'david',
          displayName: 'David Bowman',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_david',
        discordSnowflake: '200000000000000004',
        database: testDb,
      });

      expect(result.status).toBe('RESOLVED');
      if (result.status === 'RESOLVED') {
        expect(result.member.profile.accentColor).toBe('#5865f2');
        expect(result.member.profile.theme).toBe('canvas');
      }

      const createdProfile = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      expect(createdProfile).toBeDefined();
    });
  });

  describe('3. Zero-Trust Ownership & Anti-Spoofing', () => {
    const createMockMember = (id: string, externalId: string): AuthenticatedMember => ({
      user: {
        id,
        externalUserId: externalId,
        clerkUserId: `clerk_${id}`,
        username: 'alice',
        displayName: 'Alice',
        nickname: null,
        avatar: null,
        membershipStatus: 'ACTIVE',
        firstJoinedAt: new Date(),
        leftAt: null,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      profile: {
        id: `profile_${id}`,
        userId: id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      roles: [],
      isAdmin: false,
      isModerator: false,
      isSupporter: false,
      primarySlug: 'alice',
    });

    it('permits profile mutation when member modifies their own profile', () => {
      const member = createMockMember('user_1', '100000000000000001');

      expect(() => {
        assertProfileOwnership(member, {
          id: 'user_1',
          externalUserId: '100000000000000001',
        });
      }).not.toThrow();
    });

    it('strictly rejects cross-profile mutation when User A targets User B', () => {
      const memberA = createMockMember('user_A', '100000000000000001');
      const targetUserB = {
        id: 'user_B',
        externalUserId: '100000000000000002',
      };

      expect(() => {
        assertProfileOwnership(memberA, targetUserB);
      }).toThrow(ForbiddenError);
    });

    it('rejects mutation when external user ID does not match even if user.id matches (spoofing prevention)', () => {
      const memberA = createMockMember('user_A', '100000000000000001');
      const spoofedTarget = {
        id: 'user_A',
        externalUserId: '999999999999999999', // Mismatched snowflake
      };

      expect(() => {
        assertProfileOwnership(memberA, spoofedTarget);
      }).toThrow(ForbiddenError);
    });

    it('rejects unauthenticated request with UnauthorizedError', () => {
      expect(() => {
        assertProfileOwnership(null, {
          id: 'user_1',
          externalUserId: '100000000000000001',
        });
      }).toThrow(UnauthorizedError);
    });
  });

  describe('4. Administrative Role & Moderation Permissions', () => {
    it('assertAdminMember succeeds for administrator and rejects non-admin', () => {
      const adminMember: AuthenticatedMember = {
        ...createMockMember('user_admin', '100000000000000001'),
        isAdmin: true,
      };

      const regularMember: AuthenticatedMember = {
        ...createMockMember('user_regular', '100000000000000002'),
        isAdmin: false,
      };

      expect(() => assertAdminMember(adminMember)).not.toThrow();
      expect(() => assertAdminMember(regularMember)).toThrow(ForbiddenError);
      expect(() => assertAdminMember(null)).toThrow(UnauthorizedError);
    });

    it('assertModeratorMember succeeds for moderator or admin and rejects regular member', () => {
      const modMember: AuthenticatedMember = {
        ...createMockMember('user_mod', '100000000000000001'),
        isAdmin: false,
        isModerator: true,
      };

      const regularMember: AuthenticatedMember = {
        ...createMockMember('user_regular', '100000000000000002'),
        isAdmin: false,
        isModerator: false,
      };

      expect(() => assertModeratorMember(modMember)).not.toThrow();
      expect(() => assertModeratorMember(regularMember)).toThrow(ForbiddenError);
    });

    it('resolves roles and supporter status from database during identity resolution', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '300000000000000001',
          username: 'admin_user',
          displayName: 'ASC Administrator',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [role] = await testDb
        .insert(communityRoles)
        .values({
          externalRoleId: 'role_admin_snowflake',
          name: 'Administrator',
          color: '#f47fff',
          position: 100,
          isAdmin: true,
          isModerator: true,
          isSupporter: true,
        })
        .returning();

      await testDb.insert(memberRoles).values({
        userId: user.id,
        roleId: role.id,
      });

      const result = await resolveMemberByIdentity({
        clerkUserId: 'user_clerk_admin',
        discordSnowflake: '300000000000000001',
        database: testDb,
      });

      expect(result.status).toBe('RESOLVED');
      if (result.status === 'RESOLVED') {
        expect(result.member.isAdmin).toBe(true);
        expect(result.member.isModerator).toBe(true);
        expect(result.member.isSupporter).toBe(true);
        expect(result.member.roles.length).toBe(1);
        expect(result.member.roles[0].name).toBe('Administrator');
      }
    });
  });
});

function createMockMember(id: string, externalId: string): AuthenticatedMember {
  return {
    user: {
      id,
      externalUserId: externalId,
      clerkUserId: `clerk_${id}`,
      username: 'alice',
      displayName: 'Alice',
      nickname: null,
      avatar: null,
      membershipStatus: 'ACTIVE',
      firstJoinedAt: new Date(),
      leftAt: null,
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    profile: {
      id: `profile_${id}`,
      userId: id,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    roles: [],
    isAdmin: false,
    isModerator: false,
    isSupporter: false,
    primarySlug: 'alice',
  };
}
