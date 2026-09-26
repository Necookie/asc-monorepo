import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { createDb, users, profiles, profileSlugs, communityRoles, memberRoles, tags, memberTags } from '@asc/db';
import { getMembersDirectory } from '../members';
import { getCommunityOverview } from '../community';
import { getPublicProfileBySlug } from '../profiles';

describe('Directory and featured member privacy', () => {
  let database: ReturnType<typeof createDb>;
  let publicId: string;
  let hiddenFieldsId: string;
  beforeEach(async () => {
    database = createDb(':memory:');
    await migrate(database, { migrationsFolder: path.resolve(__dirname, '../../../../../packages/db/drizzle') });
    const now = new Date();
    const members = await database.insert(users).values([
      { externalUserId: '300000000000000001', username: 'visible', displayName: 'Visible', firstJoinedAt: now, lastSyncedAt: now },
      { externalUserId: '300000000000000002', username: 'private', displayName: 'Private', firstJoinedAt: now, lastSyncedAt: now },
      { externalUserId: '300000000000000003', username: 'hidden_fields', displayName: 'Hidden Fields', firstJoinedAt: now, lastSyncedAt: now },
    ]).returning();
    publicId = members[0].id;
    hiddenFieldsId = members[2].id;
    await database.insert(profiles).values([
      { userId: publicId },
      { userId: members[1].id, isPrivate: true },
      { userId: hiddenFieldsId, showTags: false, showRoles: false },
    ]);
    await database.insert(profileSlugs).values(members.map(user => ({userId:user.id, slug:user.username, isPrimary:true})));
    const [role] = await database.insert(communityRoles).values({ externalRoleId: 'booster-role', name: 'Booster', isSupporter: true }).returning();
    await database.insert(memberRoles).values(members.map(user=>({userId:user.id,roleId:role.id})));
    const selectedTags = await database.insert(tags).values([
      { name: 'Public interest', slug: 'public-interest', isActive: true },
      { name: 'Secret interest', slug: 'secret-interest', isActive: true },
      { name: 'Retired interest', slug: 'retired-interest', isActive: false },
    ]).returning();
    await database.insert(memberTags).values([
      {userId:publicId,tagId:selectedTags[0].id},
      {userId:publicId,tagId:selectedTags[2].id},
      {userId:members[1].id,tagId:selectedTags[1].id},
      {userId:hiddenFieldsId,tagId:selectedTags[1].id},
    ]);
  });
  afterEach(()=>database.$client.close());

  it('excludes private profiles from directory, search and homepage selections', async () => {
    expect((await getMembersDirectory({database})).map(member=>member.username)).not.toContain('private');
    expect(await getMembersDirectory({database,search:'private'})).toEqual([]);
    expect((await getCommunityOverview(database)).recentMembers.map(member=>member.username)).not.toContain('private');
  });

  it('does not reveal hidden or deactivated tags through search or serialization', async () => {
    expect(await getMembersDirectory({database,search:'Secret interest'})).toEqual([]);
    expect(await getMembersDirectory({database,search:'Retired interest'})).toEqual([]);
    const directory = await getMembersDirectory({database});
    expect(directory.find(member=>member.id===hiddenFieldsId)?.tags).toEqual([]);
    expect(directory.find(member=>member.id===publicId)?.tags.map(tag=>tag.name)).toEqual(['Public interest']);
    expect((await getPublicProfileBySlug('visible',database)).profile?.tags.map(tag=>tag.name)).toEqual(['Public interest']);
  });

  it('strips hidden roles and badges and prevents inferring them through supporter filtering', async () => {
    const hidden = (await getMembersDirectory({database})).find(member=>member.id===hiddenFieldsId);
    expect(hidden?.primaryRole).toBeUndefined();
    expect(hidden?.isSupporter).toBe(false);
    expect((await getMembersDirectory({database,filter:'supporters'})).map(member=>member.id)).toEqual([publicId]);
    expect((await getPublicProfileBySlug('hidden_fields',database)).profile).toMatchObject({roles:[],isSupporter:false});
  });

  it('applies privacy before limiting a featured member selection', async () => {
    await database.update(users).set({lastSyncedAt:new Date(Date.now()+10000)}).where(eq(users.username,'private'));
    const featured = await getMembersDirectory({database,limit:1});
    expect(featured).toHaveLength(1);
    expect(featured[0].username).not.toBe('private');
  });
});
