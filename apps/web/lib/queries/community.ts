import { and, eq, inArray, count, countDistinct } from 'drizzle-orm';
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
  const [totalRes] = await database
    .select({ val: count() })
    .from(users)
    .where(eq(users.membershipStatus, 'ACTIVE'));
  const totalMembers = totalRes?.val ?? 0;

  // Count supporters
  const supporterRoles = await database.query.communityRoles.findMany({
    where: eq(communityRoles.isSupporter, true),
  });
  const supporterRoleIds = supporterRoles.map((r) => r.id);

  let totalSupporters = 0;
  if (supporterRoleIds.length > 0) {
    const [supporterRes] = await database
      .select({ val: countDistinct(memberRoles.userId) })
      .from(memberRoles)
      .innerJoin(users, eq(memberRoles.userId, users.id))
      .where(and(inArray(memberRoles.roleId, supporterRoleIds), eq(users.membershipStatus, 'ACTIVE')));
    totalSupporters = supporterRes?.val ?? 0;
  }

  // Fetch recent members for showcase (homepage features top 8)
  const recentMembers = await getMembersDirectory({ database, limit: 8 });

  return {
    totalMembers,
    totalSupporters,
    recentMembers,
  };
}
