import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq, and, desc } from 'drizzle-orm';
import { createDb, type ASCDatabase } from '@asc/db';
import {
  users,
  profiles,
  profileSlugs,
  membershipPeriods,
  communityRoles,
  memberRoles,
  entitlements,
} from '@asc/db';
import { MemberSyncService } from '../services/member-sync';
import { RoleSyncService } from '../services/role-sync';
import { ReconciliationService } from '../services/reconciliation';
import type { SyncMemberData } from '../mappers/member';
import type { SyncRoleData } from '../mappers/role';
import { generateSlug, RESERVED_SLUGS } from '../lib/slug';

describe('ASC Member Synchronization Subsystem', () => {
  let testDb: ASCDatabase & { $client: any };
  const testDbFile = path.resolve(__dirname, 'sync-test.db');
  let roleSyncService: RoleSyncService;
  let memberSyncService: MemberSyncService;
  let reconciliationService: ReconciliationService;

  beforeEach(async () => {
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
    testDb = createDb(`file:${testDbFile}`);
    const migrationsFolder = path.resolve(__dirname, '../../../../packages/db/drizzle');
    await migrate(testDb, { migrationsFolder });

    roleSyncService = new RoleSyncService(testDb);
    memberSyncService = new MemberSyncService(testDb, roleSyncService);
    reconciliationService = new ReconciliationService(
      testDb,
      memberSyncService,
      roleSyncService
    );
  });

  afterEach(() => {
    testDb.$client.close();
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
  });

  describe('1. Slug Generation & Reserved Slugs', () => {
    it('generates clean URL-safe slugs', () => {
      expect(generateSlug('Necookie')).toBe('necookie');
      expect(generateSlug('User.Name#1234')).toBe('user-name-1234');
      expect(generateSlug('Special @#$ Name')).toBe('special-name');
    });

    it('prevents collisions with reserved routes', () => {
      for (const reserved of Array.from(RESERVED_SLUGS)) {
        const slug = generateSlug(reserved, '123456789');
        expect(RESERVED_SLUGS.has(slug)).toBe(false);
        expect(slug.startsWith(reserved)).toBe(true);
      }
    });
  });

  describe('2. Member Join & Initial Creation', () => {
    it('creates active member with profile, slug, and open membership period', async () => {
      const memberData: SyncMemberData = {
        externalUserId: '100000000000000001',
        username: 'alice',
        displayName: 'Alice In Wonderland',
        nickname: 'Alice',
        avatar: 'https://cdn.discordapp.com/avatars/100000000000000001/abc.png',
        roles: [],
        joinedAt: new Date('2024-01-01T00:00:00Z'),
        isBot: false,
      };

      const result = await memberSyncService.upsertMember(memberData);

      expect(result.isNew).toBe(true);
      expect(result.slug).toBe('alice');

      // Verify user record
      const user = await testDb.query.users.findFirst({
        where: eq(users.externalUserId, memberData.externalUserId),
      });
      expect(user).toBeDefined();
      expect(user?.membershipStatus).toBe('ACTIVE');
      expect(user?.username).toBe('alice');

      // Verify profile record
      const profile = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user!.id),
      });
      expect(profile).toBeDefined();
      expect(profile?.theme).toBe('canvas');
      expect(profile?.accentColor).toBe('#5865f2');
      expect(profile?.isPrivate).toBe(false);

      // Verify slug record
      const slugs = await testDb.query.profileSlugs.findMany({
        where: eq(profileSlugs.userId, user!.id),
      });
      expect(slugs.length).toBe(1);
      expect(slugs[0].slug).toBe('alice');
      expect(slugs[0].isPrimary).toBe(true);

      // Verify membership period
      const periods = await testDb.query.membershipPeriods.findMany({
        where: eq(membershipPeriods.userId, user!.id),
      });
      expect(periods.length).toBe(1);
      expect(periods[0].leftAt).toBeNull();
    });
  });

  describe('3. Synchronization Idempotency', () => {
    it('repeatedly syncing the exact same event does not duplicate records', async () => {
      const memberData: SyncMemberData = {
        externalUserId: '100000000000000002',
        username: 'bob',
        displayName: 'Bob The Builder',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-02T00:00:00Z'),
        isBot: false,
      };

      // Process event 5 times
      for (let i = 0; i < 5; i++) {
        await memberSyncService.upsertMember(memberData);
      }

      // Check counts
      const userList = await testDb.query.users.findMany({
        where: eq(users.externalUserId, memberData.externalUserId),
      });
      expect(userList.length).toBe(1);

      const profileList = await testDb.query.profiles.findMany({
        where: eq(profiles.userId, userList[0].id),
      });
      expect(profileList.length).toBe(1);

      const periodList = await testDb.query.membershipPeriods.findMany({
        where: eq(membershipPeriods.userId, userList[0].id),
      });
      expect(periodList.length).toBe(1);

      const slugList = await testDb.query.profileSlugs.findMany({
        where: eq(profileSlugs.userId, userList[0].id),
      });
      expect(slugList.length).toBe(1);
    });
  });

  describe('4. Member Departure & Rejoin Lifecycle', () => {
    it('leaving sets status to LEFT and closes period while preserving profile', async () => {
      const memberData: SyncMemberData = {
        externalUserId: '100000000000000003',
        username: 'charlie',
        displayName: 'Charlie Brown',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-03T00:00:00Z'),
        isBot: false,
      };

      await memberSyncService.upsertMember(memberData);
      const userBefore = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, memberData.externalUserId),
      }))!;

      // Add a custom bio to profile
      await testDb
        .update(profiles)
        .set({ bio: 'Hello from Charlie!' })
        .where(eq(profiles.userId, userBefore.id));

      // Simulate departure
      const departureTime = new Date('2024-02-01T12:00:00Z');
      const left = await memberSyncService.handleMemberDeparture(
        memberData.externalUserId,
        departureTime
      );
      expect(left).toBe(true);

      // Verify status & period
      const userAfter = (await testDb.query.users.findFirst({
        where: eq(users.id, userBefore.id),
      }))!;
      expect(userAfter.membershipStatus).toBe('LEFT');
      expect(userAfter.leftAt).toBeDefined();

      const period = (await testDb.query.membershipPeriods.findFirst({
        where: eq(membershipPeriods.userId, userBefore.id),
      }))!;
      expect(period.leftAt).toBeDefined();

      // Ensure profile and bio are completely preserved
      const profile = (await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, userBefore.id),
      }))!;
      expect(profile.bio).toBe('Hello from Charlie!');
    });

    it('rejoining restores ACTIVE status and adds a second membership period', async () => {
      const memberData: SyncMemberData = {
        externalUserId: '100000000000000004',
        username: 'david',
        displayName: 'David Bowman',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-04T00:00:00Z'),
        isBot: false,
      };

      // 1. Join
      await memberSyncService.upsertMember(memberData);
      // 2. Leave
      await memberSyncService.handleMemberDeparture(memberData.externalUserId);
      // 3. Rejoin
      const rejoinResult = await memberSyncService.upsertMember(memberData);

      expect(rejoinResult.isNew).toBe(false);

      const user = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, memberData.externalUserId),
      }))!;
      expect(user.membershipStatus).toBe('ACTIVE');
      expect(user.leftAt).toBeNull();

      // Verify multiple membership periods
      const periods = await testDb.query.membershipPeriods.findMany({
        where: eq(membershipPeriods.userId, user.id),
        orderBy: [desc(membershipPeriods.joinedAt)],
      });
      expect(periods.length).toBe(2);
      expect(periods[0].leftAt).toBeNull(); // Current active period
      expect(periods[1].leftAt).not.toBeNull(); // Past closed period
    });
  });

  describe('5. Username Changes & Slug Transitions', () => {
    it('demotes old slug to alias and activates new slug on username change', async () => {
      const initialData: SyncMemberData = {
        externalUserId: '100000000000000005',
        username: 'dheyn',
        displayName: 'Dheyn',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-05T00:00:00Z'),
        isBot: false,
      };

      await memberSyncService.upsertMember(initialData);

      // Change username to necookie
      const updatedData: SyncMemberData = {
        ...initialData,
        username: 'necookie',
      };

      const result = await memberSyncService.upsertMember(updatedData);
      expect(result.slug).toBe('necookie');

      const user = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, initialData.externalUserId),
      }))!;
      expect(user.username).toBe('necookie');

      const slugs = await testDb.query.profileSlugs.findMany({
        where: eq(profileSlugs.userId, user.id),
      });

      expect(slugs.length).toBe(2);

      const newPrimary = slugs.find((s) => s.slug === 'necookie');
      expect(newPrimary).toBeDefined();
      expect(newPrimary?.isPrimary).toBe(true);
      expect(newPrimary?.releasedAt).toBeNull();

      const oldAlias = slugs.find((s) => s.slug === 'dheyn');
      expect(oldAlias).toBeDefined();
      expect(oldAlias?.isPrimary).toBe(false);
      expect(oldAlias?.releasedAt).not.toBeNull();
    });
  });

  describe('6. Role & Supporter Entitlement Synchronization', () => {
    it('synchronizes roles and grants supporter entitlements when role is added', async () => {
      // 1. Sync community roles
      const supporterRole: SyncRoleData = {
        externalRoleId: 'role_supporter_01',
        name: 'Server Booster',
        color: '#f47fff',
        position: 10,
        isSupporter: true,
        isAdmin: false,
        isModerator: false,
      };
      await roleSyncService.syncRole(supporterRole);

      // 2. Add member without supporter role
      const memberData: SyncMemberData = {
        externalUserId: '100000000000000006',
        username: 'eve',
        displayName: 'Eve',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-06T00:00:00Z'),
        isBot: false,
      };
      await memberSyncService.upsertMember(memberData);

      const user = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, memberData.externalUserId),
      }))!;

      // Verify no supporter entitlements initially
      let activeEnts = await testDb.query.entitlements.findMany({
        where: and(eq(entitlements.userId, user.id), eq(entitlements.source, 'discord_role')),
      });
      expect(activeEnts.length).toBe(0);

      // 3. Update member with supporter role
      const memberWithRole: SyncMemberData = {
        ...memberData,
        roles: ['role_supporter_01'],
      };
      await memberSyncService.upsertMember(memberWithRole);

      // Verify roles assigned
      const memberRolesList = await testDb.query.memberRoles.findMany({
        where: eq(memberRoles.userId, user.id),
      });
      expect(memberRolesList.length).toBe(1);

      // Verify entitlements granted
      activeEnts = await testDb.query.entitlements.findMany({
        where: and(
          eq(entitlements.userId, user.id),
          eq(entitlements.source, 'discord_role')
        ),
      });
      expect(activeEnts.length).toBeGreaterThanOrEqual(2);
      expect(activeEnts.some((e) => e.key === 'profile.background')).toBe(true);
      expect(activeEnts.some((e) => e.key === 'profile.custom_title')).toBe(true);

      // 4. Remove supporter role
      const memberWithoutRole: SyncMemberData = {
        ...memberData,
        roles: [],
      };
      await memberSyncService.upsertMember(memberWithoutRole);

      // Verify entitlements are expired
      const expiredEnts = await testDb.query.entitlements.findMany({
        where: and(
          eq(entitlements.userId, user.id),
          eq(entitlements.source, 'discord_role')
        ),
      });
      expect(expiredEnts.every((e) => e.expiresAt !== null)).toBe(true);
    });
  });

  describe('7. Reconciliation Service', () => {
    it('heals missed joins and departures in a single reconciliation pass', async () => {
      const role1: SyncRoleData = {
        externalRoleId: 'r1',
        name: 'Member',
        color: '#ffffff',
        position: 1,
        isSupporter: false,
        isAdmin: false,
        isModerator: false,
      };

      // In ASC DB: Frank is already ACTIVE
      await memberSyncService.upsertMember({
        externalUserId: 'user_frank',
        username: 'frank',
        displayName: 'Frank',
        nickname: null,
        avatar: null,
        roles: [],
        joinedAt: new Date('2024-01-01T00:00:00Z'),
        isBot: false,
      });

      // Discord Guild State:
      // Frank has left the server (not in guild members list)
      // Grace has joined the server (new member in list)
      const currentGuildMembers: SyncMemberData[] = [
        {
          externalUserId: 'user_grace',
          username: 'grace',
          displayName: 'Grace Hopper',
          nickname: null,
          avatar: null,
          roles: ['r1'],
          joinedAt: new Date('2024-02-01T00:00:00Z'),
          isBot: false,
        },
      ];

      const summary = await reconciliationService.reconcileGuild(
        currentGuildMembers,
        [role1]
      );

      expect(summary.scannedCount).toBe(1);
      expect(summary.addedCount).toBe(1); // Grace added
      expect(summary.leftCount).toBe(1); // Frank marked left

      // Verify Frank is LEFT
      const frank = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, 'user_frank'),
      }))!;
      expect(frank.membershipStatus).toBe('LEFT');

      // Verify Grace is ACTIVE
      const grace = (await testDb.query.users.findFirst({
        where: eq(users.externalUserId, 'user_grace'),
      }))!;
      expect(grace.membershipStatus).toBe('ACTIVE');
    });
  });
});
