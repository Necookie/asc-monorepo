import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import {
  createDb,
  type ASCDatabase,
  users,
  profiles,
  profileLinks,
  communityRoles,
  memberRoles,
  tags,
  moderationActions,
  auditLogs,
  siteSettings,
} from '@asc/db';
import {
  adminModerateProfileAction,
  adminManageTagAction,
  adminUpdateSiteSettingsAction,
} from '../admin';
import {
  getAdminOverview,
  getAdminMembers,
  getAdminTags,
  getAdminSiteSettings,
  getAdminAuditLogsList,
} from '../../queries/admin';
import { ForbiddenError } from '@asc/permissions';
import type { AuthenticatedMember, CommunityRole } from '@asc/types';

describe('Administration & Moderation Subsystem', () => {
  let testDb: ASCDatabase & { $client: any };
  const testDbFile = path.resolve(__dirname, 'admin-test.db');

  beforeEach(async () => {
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
    testDb = createDb(`file:${testDbFile}`);
    const migrationsFolder = path.resolve(__dirname, '../../../../../packages/db/drizzle');
    await migrate(testDb, { migrationsFolder });
  });

  afterEach(() => {
    testDb.$client.close();
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
  });

  function createAdminMember(id: string, username: string): AuthenticatedMember {
    const adminRole: CommunityRole = {
      id: 'r_admin',
      externalRoleId: 'snow_admin',
      name: 'Administrator',
      color: '#f47fff',
      position: 100,
      isSupporter: true,
      isAdmin: true,
      isModerator: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      user: {
        id,
        externalUserId: '900000000000000001',
        clerkUserId: `clerk_${id}`,
        username,
        displayName: 'Admin User',
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
        id: `prof_${id}`,
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
      roles: [adminRole],
      isAdmin: true,
      isModerator: true,
      isSupporter: true,
      primarySlug: username,
    };
  }

  function createRegularMember(id: string, username: string): AuthenticatedMember {
    return {
      user: {
        id,
        externalUserId: '800000000000000001',
        clerkUserId: `clerk_${id}`,
        username,
        displayName: 'Regular User',
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
        id: `prof_${id}`,
        userId: id,
        bio: 'User bio',
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
      primarySlug: username,
    };
  }

  describe('1. Profile Moderation Actions & Audit Trail', () => {
    it('HIDE_PROFILE: hides profile and records in moderation_actions and audit_logs', async () => {
      const [target] = await testDb
        .insert(users)
        .values({
          id: 'target_1',
          externalUserId: '100000000000000001',
          username: 'bad_user',
          displayName: 'Bad User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_target_1',
        userId: target.id,
        isPrivate: false,
      });

      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminModerateProfileAction(
        {
          targetUserId: target.id,
          action: 'HIDE_PROFILE',
          reason: 'Inappropriate content on profile',
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);

      // Verify profile is now hidden (private)
      const updatedProfile = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, target.id),
      });
      expect(updatedProfile?.isPrivate).toBe(true);

      // Verify moderation action record
      const modRecord = await testDb.query.moderationActions.findFirst({
        where: eq(moderationActions.targetUserId, target.id),
      });
      expect(modRecord).toBeDefined();
      expect(modRecord?.actionType).toBe('HIDE_PROFILE');
      expect(modRecord?.reason).toBe('Inappropriate content on profile');

      // Verify audit log record
      const auditRecord = await testDb.query.auditLogs.findFirst({
        where: eq(auditLogs.targetId, target.id),
      });
      expect(auditRecord).toBeDefined();
      expect(auditRecord?.action).toBe('MODERATE_PROFILE:HIDE_PROFILE');
    });

    it('RESET_BIO: clears bio and custom title', async () => {
      const [target] = await testDb
        .insert(users)
        .values({
          id: 'target_2',
          externalUserId: '100000000000000002',
          username: 'offensive_bio_user',
          displayName: 'Offensive Bio',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_target_2',
        userId: target.id,
        bio: 'Offensive hate speech bio',
        customTitle: 'Illegal Title',
      });

      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminModerateProfileAction(
        {
          targetUserId: target.id,
          action: 'RESET_BIO',
          reason: 'Hate speech in biography',
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);

      const updatedProfile = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, target.id),
      });
      expect(updatedProfile?.bio).toBeNull();
      expect(updatedProfile?.customTitle).toBeNull();
    });

    it('RESET_LINKS: deletes all links for target user', async () => {
      const [target] = await testDb
        .insert(users)
        .values({
          id: 'target_3',
          externalUserId: '100000000000000003',
          username: 'phishing_user',
          displayName: 'Phishing User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [prof] = await testDb
        .insert(profiles)
        .values({
          id: 'prof_target_3',
          userId: target.id,
        })
        .returning();

      await testDb.insert(profileLinks).values({
        profileId: prof.id,
        label: 'Free Nitro',
        url: 'https://phishing-site.example.com',
      });

      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminModerateProfileAction(
        {
          targetUserId: target.id,
          action: 'RESET_LINKS',
          reason: 'Phishing URLs posted',
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);

      const links = await testDb.query.profileLinks.findMany({
        where: eq(profileLinks.profileId, prof.id),
      });
      expect(links.length).toBe(0);
    });

    it('rejects non-admin member from performing moderation', async () => {
      const regular = createRegularMember('regular_1', 'reguser');

      const res = await adminModerateProfileAction(
        {
          targetUserId: 'some_user',
          action: 'HIDE_PROFILE',
          reason: 'I want to hide them',
        },
        testDb,
        regular
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Administrative permissions required');
    });

    it('rejects moderation when reason is too short (<3 characters)', async () => {
      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminModerateProfileAction(
        {
          targetUserId: 'some_user',
          action: 'HIDE_PROFILE',
          reason: 'no',
        },
        testDb,
        admin
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('at least 3 characters');
    });
  });

  describe('2. Tag Management Actions', () => {
    it('creates a new community tag and appends to audit log', async () => {
      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminManageTagAction(
        {
          name: 'AI Researcher',
          slug: 'ai-researcher',
          description: 'Specializes in machine learning and LLMs',
          color: '#06b6d4',
          isActive: true,
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);
      expect(res.data?.tagId).toBeDefined();

      const created = await testDb.query.tags.findFirst({
        where: eq(tags.slug, 'ai-researcher'),
      });
      expect(created).toBeDefined();
      expect(created?.name).toBe('AI Researcher');

      // Verify audit record
      const audit = await testDb.query.auditLogs.findFirst({
        where: eq(auditLogs.action, 'CREATE_TAG'),
      });
      expect(audit).toBeDefined();
      expect(audit?.targetId).toBe(created?.id);
    });

    it('updates an existing tag and appends UPDATE_TAG audit log', async () => {
      const [existing] = await testDb
        .insert(tags)
        .values({
          name: 'DevOps',
          slug: 'devops',
          color: '#5865f2',
          isActive: true,
        })
        .returning();

      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminManageTagAction(
        {
          tagId: existing.id,
          name: 'DevOps & SRE',
          slug: 'devops-sre',
          color: '#35ed7e',
          isActive: true,
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);

      const updated = await testDb.query.tags.findFirst({
        where: eq(tags.id, existing.id),
      });
      expect(updated?.name).toBe('DevOps & SRE');
      expect(updated?.slug).toBe('devops-sre');
      expect(updated?.color).toBe('#35ed7e');

      const audit = await testDb.query.auditLogs.findFirst({
        where: eq(auditLogs.action, 'UPDATE_TAG'),
      });
      expect(audit).toBeDefined();
    });

    it('rejects invalid tag slug format', async () => {
      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminManageTagAction(
        {
          name: 'Invalid Tag',
          slug: 'Invalid Slug With Spaces!',
          color: '#5865f2',
          isActive: true,
        },
        testDb,
        admin
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Tag slug may only contain');
    });
  });

  describe('3. Site Settings Management', () => {
    it('updates maintenance mode and announcement banner', async () => {
      const admin = createAdminMember('admin_1', 'superadmin');

      const res = await adminUpdateSiteSettingsAction(
        {
          maintenanceMode: true,
          announcement: 'Scheduled database upgrade at 02:00 UTC.',
        },
        testDb,
        admin
      );

      expect(res.success).toBe(true);

      const settings = await getAdminSiteSettings(testDb);
      expect(settings.maintenanceMode).toBe(true);
      expect(settings.announcement).toBe('Scheduled database upgrade at 02:00 UTC.');

      const audit = await testDb.query.auditLogs.findFirst({
        where: eq(auditLogs.action, 'UPDATE_SETTINGS'),
      });
      expect(audit).toBeDefined();
    });
  });

  describe('4. Admin Overview & Query Helpers', () => {
    it('computes accurate community stats and recent audit entries', async () => {
      // 1 active, 1 left
      await testDb.insert(users).values([
        {
          externalUserId: '100000000000000010',
          username: 'u1',
          displayName: 'User One',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        },
        {
          externalUserId: '100000000000000011',
          username: 'u2',
          displayName: 'User Two',
          membershipStatus: 'LEFT',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      ]);

      const overview = await getAdminOverview(testDb);
      expect(overview.stats.totalMembers).toBe(2);
      expect(overview.stats.activeMembers).toBe(1);
      expect(overview.stats.leftMembers).toBe(1);
      expect(overview.stats.bannedMembers).toBe(0);
    });

    it('returns filtered members list by search query', async () => {
      await testDb.insert(users).values([
        {
          externalUserId: '100000000000000020',
          username: 'charlie_brown',
          displayName: 'Charlie Brown',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        },
        {
          externalUserId: '100000000000000021',
          username: 'lucy_vanpelt',
          displayName: 'Lucy Van Pelt',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      ]);

      const searchCharlie = await getAdminMembers('charlie', testDb);
      expect(searchCharlie.length).toBe(1);
      expect(searchCharlie[0].username).toBe('charlie_brown');

      const searchSnowflake = await getAdminMembers('100000000000000021', testDb);
      expect(searchSnowflake.length).toBe(1);
      expect(searchSnowflake[0].username).toBe('lucy_vanpelt');
    });
  });
});
