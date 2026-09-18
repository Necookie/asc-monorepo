import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createDb, type ASCDatabase } from '@asc/db';
import {
  users,
  profiles,
  profileSlugs,
  communityRoles,
  memberRoles,
  tags,
  memberTags,
  profileLinks,
  entitlements,
} from '@asc/db';
import { getPublicProfileBySlug } from '../profiles';
import { getMembersDirectory } from '../members';
import { getCommunityOverview } from '../community';

describe('Public Website Queries & Privacy Enforcement', () => {
  let testDb: ASCDatabase & { $client: any };
  const testDbFile = path.resolve(__dirname, 'public-test.db');

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

  describe('1. Profile Query, Slugs & 308 Alias Redirects', () => {
    it('resolves primary slug and returns public profile', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000001',
          username: 'necookie',
          displayName: 'Dheyn',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date('2024-01-01'),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        userId: user.id,
        bio: 'Core Maintainer of ASC',
        customTitle: 'Lead Architect',
        accentColor: '#5865f2',
        theme: 'canvas',
        isPrivate: false,
        showRoles: true,
        showMembershipDate: true,
        showTags: true,
        showLinks: true,
      });

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'necookie',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('necookie', testDb);
      expect(res.profile).toBeDefined();
      expect(res.profile?.user.username).toBe('necookie');
      expect(res.profile?.user.displayName).toBe('Dheyn');
      expect(res.profile?.profile.bio).toBe('Core Maintainer of ASC');
    });

    it('returns redirect instruction when requesting historical alias slug', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000002',
          username: 'necookie',
          displayName: 'Dheyn',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date('2024-01-01'),
          lastSyncedAt: new Date(),
        })
        .returning();

      // Old released alias
      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'dheyn',
        isPrimary: false,
        releasedAt: new Date(),
      });

      // Current primary slug
      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'necookie',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('dheyn', testDb);
      expect(res.redirect).toBe('necookie');
      expect(res.profile).toBeUndefined();
    });

    it('returns notFound for non-existent or banned members', async () => {
      const notFoundRes = await getPublicProfileBySlug('nonexistent_user', testDb);
      expect(notFoundRes.notFound).toBe(true);

      // Banned member
      const [banned] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000003',
          username: 'badactor',
          displayName: 'Bad Actor',
          membershipStatus: 'BANNED',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profileSlugs).values({
        userId: banned.id,
        slug: 'badactor',
        isPrimary: true,
      });

      const bannedRes = await getPublicProfileBySlug('badactor', testDb);
      expect(bannedRes.notFound).toBe(true);
    });
  });

  describe('2. Server-Side Privacy Enforcement', () => {
    it('strips private data on server when isPrivate is true', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000004',
          username: 'private_user',
          displayName: 'Private Person',
          nickname: 'Secret',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date('2024-01-01'),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        userId: user.id,
        bio: 'Very secret bio',
        customTitle: 'Agent 007',
        isPrivate: true,
      });

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'private_user',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('private_user', testDb);
      expect(res.profile).toBeDefined();
      expect(res.profile?.profile.isPrivate).toBe(true);
      expect(res.profile?.profile.bio).toBeNull();
      expect(res.profile?.profile.customTitle).toBeNull();
      expect(res.profile?.user.firstJoinedAt).toBeNull();
      expect(res.profile?.user.nickname).toBeNull();
      expect(res.profile?.roles).toEqual([]);
      expect(res.profile?.tags).toEqual([]);
      expect(res.profile?.links).toEqual([]);
    });

    it('strips individually hidden fields (roles, joined date, tags, links)', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000005',
          username: 'semi_private',
          displayName: 'Semi Private',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date('2024-01-01'),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        userId: user.id,
        bio: 'Public bio',
        isPrivate: false,
        showRoles: false,
        showMembershipDate: false,
        showTags: false,
        showLinks: false,
      });

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'semi_private',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('semi_private', testDb);
      expect(res.profile).toBeDefined();
      expect(res.profile?.profile.bio).toBe('Public bio');
      expect(res.profile?.user.firstJoinedAt).toBeNull();
      expect(res.profile?.roles).toEqual([]);
      expect(res.profile?.tags).toEqual([]);
      expect(res.profile?.links).toEqual([]);
    });
  });

  describe('3. Supporter Entitlements Enforcement', () => {
    it('strips supporter background and custom title if member is not a supporter', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000006',
          username: 'standard_user',
          displayName: 'Standard User',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      await testDb.insert(profiles).values({
        userId: user.id,
        customTitle: 'Unearned Title',
        backgroundUrl: 'https://images.unsplash.com/photo-1234',
        isPrivate: false,
      });

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'standard_user',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('standard_user', testDb);
      expect(res.profile).toBeDefined();
      expect(res.profile?.isSupporter).toBe(false);
      expect(res.profile?.profile.backgroundUrl).toBeNull();
      expect(res.profile?.profile.customTitle).toBeNull();
    });

    it('preserves supporter background and title if member has supporter role', async () => {
      const [user] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000007',
          username: 'vip_supporter',
          displayName: 'VIP Supporter',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [role] = await testDb
        .insert(communityRoles)
        .values({
          externalRoleId: 'r_booster',
          name: 'Server Booster',
          isSupporter: true,
        })
        .returning();

      await testDb.insert(memberRoles).values({
        userId: user.id,
        roleId: role.id,
      });

      await testDb.insert(profiles).values({
        userId: user.id,
        customTitle: 'Diamond Supporter',
        backgroundUrl: 'https://images.unsplash.com/photo-1234',
        isPrivate: false,
      });

      await testDb.insert(profileSlugs).values({
        userId: user.id,
        slug: 'vip_supporter',
        isPrimary: true,
      });

      const res = await getPublicProfileBySlug('vip_supporter', testDb);
      expect(res.profile).toBeDefined();
      expect(res.profile?.isSupporter).toBe(true);
      expect(res.profile?.profile.backgroundUrl).toBe('https://images.unsplash.com/photo-1234');
      expect(res.profile?.profile.customTitle).toBe('Diamond Supporter');
    });
  });

  describe('4. Member Directory & Community Overview', () => {
    it('searches by username, display name, and tags', async () => {
      const [u1] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000008',
          username: 'coder_john',
          displayName: 'Johnathan Doe',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [t1] = await testDb
        .insert(tags)
        .values({
          name: 'TypeScript',
          slug: 'typescript',
        })
        .returning();

      await testDb.insert(memberTags).values({
        userId: u1.id,
        tagId: t1.id,
      });

      // Search by username
      const searchUser = await getMembersDirectory({ search: 'coder', database: testDb });
      expect(searchUser.length).toBe(1);
      expect(searchUser[0].username).toBe('coder_john');

      // Search by displayName
      const searchDisplay = await getMembersDirectory({ search: 'Johnathan', database: testDb });
      expect(searchDisplay.length).toBe(1);

      // Search by Tag name
      const searchTag = await getMembersDirectory({ search: 'TypeScript', database: testDb });
      expect(searchTag.length).toBe(1);
    });

    it('computes real community overview statistics', async () => {
      const [u] = await testDb
        .insert(users)
        .values({
          externalUserId: '200000000000000009',
          username: 'stat_user',
          displayName: 'Stat User',
          membershipStatus: 'ACTIVE',
          firstJoinedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .returning();

      const [r] = await testDb
        .insert(communityRoles)
        .values({
          externalRoleId: 'r_boost',
          name: 'Booster',
          isSupporter: true,
        })
        .returning();

      await testDb.insert(memberRoles).values({
        userId: u.id,
        roleId: r.id,
      });

      const overview = await getCommunityOverview(testDb);
      expect(overview.totalMembers).toBeGreaterThanOrEqual(1);
      expect(overview.totalSupporters).toBeGreaterThanOrEqual(1);
    });
  });
});
