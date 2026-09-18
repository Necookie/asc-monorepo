import { eq, not, count } from 'drizzle-orm';
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
  // Count non-banned users
  const [totalRes] = await database
    .select({ val: count() })
    .from(users)
    .where(not(eq(users.membershipStatus, 'BANNED')));
  const totalMembers = totalRes?.val ?? 0;

  // Count supporters
  const supporterRoles = await database.query.communityRoles.findMany({
    where: eq(communityRoles.isSupporter, true),
  });
  const supporterRoleIds = supporterRoles.map((r) => r.id);

  let totalSupporters = 0;
  if (supporterRoleIds.length > 0) {
    const supporterMembers = await database.query.memberRoles.findMany({
      where: (mr, { inArray }) => inArray(mr.roleId, supporterRoleIds),
    });
    const uniqueSupporterUserIds = new Set(supporterMembers.map((m) => m.userId));
    totalSupporters = uniqueSupporterUserIds.size;
  }

  // Fetch recent members for showcase
  const recentMembers = await getMembersDirectory({ database });

  return {
    totalMembers,
    totalSupporters,
    recentMembers: recentMembers.slice(0, 8),
  };
}
