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
  memberTags,
  entitlements,
} from '@asc/db';
import {
  updateProfileBioAction,
  updateProfileAppearanceAction,
  updateProfileLinksAction,
  updateProfilePrivacyAction,
  updateMemberTagsAction,
} from '../profile';
import type { AuthenticatedMember, CommunityRole } from '@asc/types';

describe('Profile Customization Server Actions & Entitlement Enforcement', () => {
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

  function createMember(
    id: string,
    externalId: string,
    roles: CommunityRole[] = []
  ): AuthenticatedMember {
    const isSupporter = roles.some((r) => r.isSupporter);
    const isAdmin = roles.some((r) => r.isAdmin);
    return {
      user: {
        id,
        externalUserId: externalId,
        clerkUserId: `clerk_${id}`,
        username: `user_${id}`,
        displayName: `User ${id}`,
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
        bio: 'Initial bio',
        customTitle: null,
        accentColor: '#5865f2',
        theme: 'canvas',
        backgroundUrl: null,
        layout: 'classic', supporterLayout: null, typography: 'balanced', avatarFrame: 'none', coverTreatment: 'solid', coverPosition: 50, motion: 'subtle',
        isPrivate: false,
        showRoles: true,
        showMembershipDate: true,
        showTags: true,
        showLinks: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      roles,
      isAdmin,
      isModerator: false,
      isSupporter,
      primarySlug: `user_${id}`,
    };
  }

  describe('1. Biography & Custom Title', () => {
    it('updates member biography successfully', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_1',
          externalUserId: '100000000000000001',
          username: 'alice',
          displayName: 'Alice',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_1',
        userId: user.id,
        bio: 'Old bio',
      });

      const member = createMember(user.id, user.externalUserId);

      const res = await updateProfileBioAction(
        { bio: 'Hello ASC community! I am a full-stack engineer.' },
        testDb,
        member
      );

      expect(res.success).toBe(true);
      expect(res.data?.bio).toBe('Hello ASC community! I am a full-stack engineer.');

      const updated = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      expect(updated?.bio).toBe('Hello ASC community! I am a full-stack engineer.');
    });

    it('permits custom title when member has supporter entitlement', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_supporter',
          externalUserId: '100000000000000002',
          username: 'supporter_bob',
          displayName: 'Bob Supporter',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_supporter',
        userId: user.id,
      });

      const supporterRole: CommunityRole = {
        id: 'role_supporter',
        externalRoleId: 'snowflake_supporter',
        name: 'Supporter',
        color: '#f47fff',
        position: 10,
        isSupporter: true,
        isAdmin: false,
        isModerator: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const member = createMember(user.id, user.externalUserId, [supporterRole]);

      const res = await updateProfileBioAction(
        { bio: 'Supporter bio', customTitle: 'Core Benefactor' },
        testDb,
        member
      );

      expect(res.success).toBe(true);
      expect(res.data?.customTitle).toBe('Core Benefactor');

      const updated = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      expect(updated?.customTitle).toBe('Core Benefactor');
    });

    it('rejects custom title when standard member lacks supporter tier', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_std',
          externalUserId: '100000000000000003',
          username: 'standard_user',
          displayName: 'Standard User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_std',
        userId: user.id,
      });

      const member = createMember(user.id, user.externalUserId, []);

      const res = await updateProfileBioAction(
        { customTitle: 'VIP Member' },
        testDb,
        member
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Custom title requires supporter entitlement');
    });

    it('rejects bio exceeding 500 characters', async () => {
      const member = createMember('user_long', '100000000000000004');
      const longBio = 'a'.repeat(501);

      const res = await updateProfileBioAction({ bio: longBio }, testDb, member);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Biography must not exceed 500 characters');
    });
  });

  describe('2. Appearance & Supporter Background', () => {
    it('retains premium choices through downgrade and restores editing with an active grant', async () => {
      const [user] = await testDb.insert(users).values({ id: 'studio_member', externalUserId: '100000000000000105', username: 'studio_member', displayName: 'Studio Member', firstJoinedAt: new Date(), lastSyncedAt: new Date() }).returning();
      await testDb.insert(profiles).values({ userId: user.id, layout: 'classic', supporterLayout: 'arcade', typography: 'bold', avatarFrame: 'neon', coverTreatment: 'pattern', motion: 'lively' });
      const member = createMember(user.id, user.externalUserId);
      const rejected = await updateProfileAppearanceAction({ theme: 'canvas', accentColor: '#5865f2', supporterLayout: 'showcase' }, testDb, member);
      expect(rejected.success).toBe(false);
      const standard = await updateProfileAppearanceAction({ theme: 'indigo', accentColor: '#35ed7e', layout: 'split' }, testDb, member);
      expect(standard.success).toBe(true);
      let stored = await testDb.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
      expect(stored?.supporterLayout).toBe('arcade');
      expect(stored?.avatarFrame).toBe('neon');
      expect(stored?.layout).toBe('split');
      await testDb.insert(entitlements).values({ userId: user.id, key: 'profile.studio', value: 'true', source: 'ADMIN_GRANT', expiresAt: new Date(Date.now() + 86400000) });
      const granted = await updateProfileAppearanceAction({ theme: 'indigo', accentColor: '#35ed7e', layout: 'split', supporterLayout: 'showcase', coverPosition: 67 }, testDb, member);
      expect(granted.success).toBe(true);
      stored = await testDb.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
      expect(stored?.supporterLayout).toBe('showcase');
      expect(stored?.coverPosition).toBe(67);
    });
    it('updates theme and accent color', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_app',
          externalUserId: '100000000000000005',
          username: 'style_user',
          displayName: 'Style User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_app',
        userId: user.id,
      });

      const member = createMember(user.id, user.externalUserId);

      const res = await updateProfileAppearanceAction(
        { theme: 'onyx', accentColor: '#35ed7e' },
        testDb,
        member
      );

      expect(res.success).toBe(true);

      const updated = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      expect(updated?.theme).toBe('onyx');
      expect(updated?.accentColor).toBe('#35ed7e');
    });

    it('rejects invalid hex color code', async () => {
      const member = createMember('user_bad_color', '100000000000000006');
      const res = await updateProfileAppearanceAction(
        { theme: 'canvas', accentColor: 'not-a-hex' },
        testDb,
        member
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain('Must be a valid hex color code');
    });

    it('rejects custom background for non-supporter member', async () => {
      const member = createMember('user_no_bg', '100000000000000007', []);
      const res = await updateProfileAppearanceAction(
        {
          theme: 'canvas',
          accentColor: '#5865f2',
          backgroundUrl: 'https://images.example.com/banner.png',
        },
        testDb,
        member
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Custom background images require supporter entitlement');
    });

    it('permits custom background for supporter member and rejects dangerous schemes', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_supporter_bg',
          externalUserId: '100000000000000008',
          username: 'banner_user',
          displayName: 'Banner User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_supporter_bg',
        userId: user.id,
      });

      const supporterRole: CommunityRole = {
        id: 'r_sup',
        externalRoleId: 's_sup',
        name: 'Supporter',
        color: '#f47fff',
        position: 10,
        isSupporter: true,
        isAdmin: false,
        isModerator: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const member = createMember(user.id, user.externalUserId, [supporterRole]);

      // Valid HTTPS URL
      const validRes = await updateProfileAppearanceAction(
        {
          theme: 'indigo',
          accentColor: '#ec48bd',
          backgroundUrl: 'https://images.example.com/my-bg.jpg',
        },
        testDb,
        member
      );
      expect(validRes.success).toBe(true);

      // Dangerous javascript scheme
      const badRes = await updateProfileAppearanceAction(
        {
          theme: 'indigo',
          accentColor: '#ec48bd',
          backgroundUrl: 'javascript:alert(1)',
        },
        testDb,
        member
      );
      expect(badRes.success).toBe(false);
    });
  });

  describe('3. Outbound Links & Sanitization', () => {
    it('saves valid outbound links up to standard tier limit (5)', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_links',
          externalUserId: '100000000000000009',
          username: 'link_user',
          displayName: 'Link User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_links',
        userId: user.id,
      });

      const member = createMember(user.id, user.externalUserId, []);

      const res = await updateProfileLinksAction(
        {
          links: [
            { label: 'GitHub', url: 'https://github.com/alice', displayOrder: 0 },
            { label: 'Website', url: 'https://alice.dev', displayOrder: 1 },
          ],
        },
        testDb,
        member
      );

      expect(res.success).toBe(true);
      expect(res.data?.linksCount).toBe(2);

      const dbLinks = await testDb.query.profileLinks.findMany({
        where: eq(profileLinks.profileId, 'prof_links'),
      });
      expect(dbLinks.length).toBe(2);
      expect(dbLinks[0].label).toBe('GitHub');
      expect(dbLinks[1].label).toBe('Website');
    });

    it('rejects links exceeding the member entitlement limit (6 links on standard tier)', async () => {
      const member = createMember('user_links_limit', '100000000000000010', []);

      const tooManyLinks = Array.from({ length: 6 }, (_, i) => ({
        label: `Link ${i}`,
        url: `https://example.com/${i}`,
        displayOrder: i,
      }));

      const res = await updateProfileLinksAction(
        { links: tooManyLinks },
        testDb,
        member
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Your tier allows up to 5 links');
    });

    it('rejects dangerous protocols (javascript: data: file:)', async () => {
      const member = createMember('user_xss_links', '100000000000000011', []);

      const res = await updateProfileLinksAction(
        {
          links: [
            { label: 'XSS', url: 'javascript:alert(document.domain)', displayOrder: 0 },
          ],
        },
        testDb,
        member
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Only secure http/https URLs are permitted');
    });
  });

  describe('4. Privacy Controls', () => {
    it('updates granular privacy flags in database', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_privacy',
          externalUserId: '100000000000000012',
          username: 'privacy_user',
          displayName: 'Privacy User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        id: 'prof_privacy',
        userId: user.id,
        isPrivate: false,
        showRoles: true,
        showMembershipDate: true,
      });

      const member = createMember(user.id, user.externalUserId);

      const res = await updateProfilePrivacyAction(
        {
          isPrivate: true,
          showRoles: false,
          showMembershipDate: false,
          showTags: true,
          showLinks: false,
        },
        testDb,
        member
      );

      expect(res.success).toBe(true);

      const updated = await testDb.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      expect(updated?.isPrivate).toBe(true);
      expect(updated?.showRoles).toBe(false);
      expect(updated?.showMembershipDate).toBe(false);
      expect(updated?.showLinks).toBe(false);
    });
  });

  describe('5. Member Community Tags', () => {
    it('saves member tags within limit and filters active tags', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          id: 'user_tags',
          externalUserId: '100000000000000013',
          username: 'tag_user',
          displayName: 'Tag User',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [tag1] = await testDb
        .insert(tags)
        .values({
          id: 'tag_1',
          name: 'Developer',
          slug: 'developer',
          color: '#5865f2',
          isActive: true,
        })
        .returning();

      const [tag2] = await testDb
        .insert(tags)
        .values({
          id: 'tag_2',
          name: 'Designer',
          slug: 'designer',
          color: '#ec48bd',
          isActive: true,
        })
        .returning();

      const [inactiveTag] = await testDb
        .insert(tags)
        .values({
          id: 'tag_3',
          name: 'Inactive',
          slug: 'inactive',
          color: '#8b92d6',
          isActive: false,
        })
        .returning();

      const member = createMember(user.id, user.externalUserId);

      // Attempt to save tag1, tag2, and inactiveTag
      const res = await updateMemberTagsAction(
        { tagIds: [tag1.id, tag2.id, inactiveTag.id] },
        testDb,
        member
      );

      expect(res.success).toBe(true);
      // Only 2 active tags should be saved
      expect(res.data?.tagsCount).toBe(2);

      const memberTagsRecords = await testDb.query.memberTags.findMany({
        where: eq(memberTags.userId, user.id),
      });
      expect(memberTagsRecords.length).toBe(2);
      expect(memberTagsRecords.map((mt) => mt.tagId).sort()).toEqual(
        [tag1.id, tag2.id].sort()
      );
    });

    it('rejects selecting more tags than allowed by tier limit (6 tags for standard tier)', async () => {
      const member = createMember('user_too_many_tags', '100000000000000014', []);

      const tooManyTagIds = ['t1', 't2', 't3', 't4', 't5', 't6'];

      const res = await updateMemberTagsAction(
        { tagIds: tooManyTagIds },
        testDb,
        member
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Your tier allows up to 5 tags');
    });
  });
});
