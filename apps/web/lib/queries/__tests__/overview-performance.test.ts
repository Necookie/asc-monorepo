import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createDb, users, communityRoles, memberRoles } from '@asc/db';
import { getAdminMembers, getAdminOverview } from '../admin';
import { getCommunityOverview } from '../community';

describe('Overview aggregates and bounded searches', () => {
  let database: ReturnType<typeof createDb>;
  beforeEach(async () => {
    database = createDb(':memory:');
    await migrate(database, { migrationsFolder: path.resolve(__dirname, '../../../../../packages/db/drizzle') });
  });
  afterEach(() => database.$client.close());

  it('counts distinct active supporters without counting ordinary roles or former members', async () => {
    const now = new Date();
    const members = await database.insert(users).values([
      { externalUserId: '1', username: 'booster', displayName: 'Booster', firstJoinedAt: now, lastSyncedAt: now },
      { externalUserId: '2', username: 'ordinary', displayName: 'Ordinary', firstJoinedAt: now, lastSyncedAt: now },
      { externalUserId: '3', username: 'former', displayName: 'Former', membershipStatus: 'LEFT', firstJoinedAt: now, lastSyncedAt: now },
      { externalUserId: '4', username: 'banned', displayName: 'Banned', membershipStatus: 'BANNED', firstJoinedAt: now, lastSyncedAt: now },
    ]).returning();
    const roles = await database.insert(communityRoles).values([
      { externalRoleId: '1', name: 'Booster', isSupporter: true },
      { externalRoleId: '2', name: 'Supporter', isSupporter: true },
      { externalRoleId: '3', name: 'Member', isSupporter: false },
    ]).returning();
    await database.insert(memberRoles).values([
      { userId: members[0].id, roleId: roles[0].id },
      { userId: members[0].id, roleId: roles[1].id },
      { userId: members[1].id, roleId: roles[2].id },
      { userId: members[2].id, roleId: roles[0].id },
      { userId: members[3].id, roleId: roles[0].id },
    ]);
    expect((await getAdminOverview(database)).stats).toMatchObject({ totalMembers: 4, activeMembers: 2, leftMembers: 1, bannedMembers: 1, totalSupporters: 1 });
    expect(await getCommunityOverview(database)).toMatchObject({ totalMembers: 2, totalSupporters: 1 });
  });

  it('finds a matching member beyond the unfiltered staff list limit', async () => {
    const now = new Date();
    await database.insert(users).values(Array.from({ length: 101 }, (_, index) => ({
      externalUserId: String(index + 1), username: `member${index}`, displayName: index === 100 ? 'Find This Person' : 'Member',
      firstJoinedAt: new Date(now.getTime() - index * 1000), lastSyncedAt: now,
    })));
    expect((await getAdminMembers(' find this ', database)).map(member => member.username)).toEqual(['member100']);
  });
});
