import { and, eq, count, countDistinct } from 'drizzle-orm';
import { db, users, communityRoles, memberRoles, type ASCDatabase } from '@asc/db';
import { getMembersDirectory, type MemberDirectoryItem } from './members';

export interface CommunityOverview {
  totalMembers: number;
  totalSupporters: number;
  recentMembers: MemberDirectoryItem[];
}

export async function getCommunityOverview(
  database: ASCDatabase = db
): Promise<CommunityOverview> {
  // The community total reflects the currently selected Discord guild.
  const [totalRows, supporterRows, recentMembers] = await Promise.all([
    database
    .select({ val: count() })
    .from(users)
    .where(eq(users.membershipStatus, 'ACTIVE')),
    database
      .select({ val: countDistinct(memberRoles.userId) })
      .from(memberRoles)
      .innerJoin(users, eq(memberRoles.userId, users.id))
      .innerJoin(communityRoles, eq(memberRoles.roleId, communityRoles.id))
      .where(and(eq(communityRoles.isSupporter, true), eq(users.membershipStatus, 'ACTIVE'))),
    getMembersDirectory({ database, limit: 8 }),
  ]);

  return {
    totalMembers: totalRows[0]?.val ?? 0,
    totalSupporters: supporterRows[0]?.val ?? 0,
    recentMembers,
  };
}
