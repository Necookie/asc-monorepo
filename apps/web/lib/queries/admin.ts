import { eq, desc, sql, count, countDistinct, and, or, like } from 'drizzle-orm';
import {
  db,
  users,
  profiles,
  profileSlugs,
  tags,
  memberTags,
  communityRoles,
  memberRoles,
  moderationActions,
  auditLogs,
  siteSettings,
  type ASCDatabase,
} from '@asc/db';

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  leftMembers: number;
  bannedMembers: number;
  totalSupporters: number;
  totalTags: number;
  totalModerationActions: number;
  totalAuditLogs: number;
}

export interface AdminMemberItem {
  id: string;
  externalUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  membershipStatus: 'ACTIVE' | 'LEFT' | 'BANNED';
  firstJoinedAt: Date;
  primarySlug: string;
  roles: { id: string; name: string; color: string; isAdmin: boolean; isSupporter: boolean }[];
  isPrivate: boolean;
  isModerated: boolean;
}

export interface AdminTagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  isActive: boolean;
  memberCount: number;
}

export interface AdminAuditItem {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: string | null;
  createdAt: Date;
}

export async function getAdminOverview(
  database: ASCDatabase = db
): Promise<{ stats: AdminStats; recentAudit: AdminAuditItem[] }> {
  const [statusCounts, tagCounts, moderationCounts, auditCounts, supporterCounts, recentAuditRecords] = await Promise.all([
    database.select({ status: users.membershipStatus, count: count() }).from(users).groupBy(users.membershipStatus),
    database.select({ count: count() }).from(tags),
    database.select({ count: count() }).from(moderationActions),
    database.select({ count: count() }).from(auditLogs),
    database.select({ count: countDistinct(memberRoles.userId) }).from(memberRoles)
      .innerJoin(users, eq(memberRoles.userId, users.id))
      .innerJoin(communityRoles, eq(memberRoles.roleId, communityRoles.id))
      .where(and(eq(users.membershipStatus, 'ACTIVE'), eq(communityRoles.isSupporter, true))),
    database.query.auditLogs.findMany({ orderBy: [desc(auditLogs.createdAt)], limit: 10 }),
  ]);
  const countStatus = (status: string) => statusCounts.find(row => row.status === status)?.count ?? 0;

  const recentAudit: AdminAuditItem[] = recentAuditRecords.map((a) => ({
    id: a.id,
    actorId: a.actorId,
    action: a.action,
    targetType: a.targetType,
    targetId: a.targetId,
    metadata: a.metadata,
    createdAt: a.createdAt,
  }));

  return {
    stats: {
      totalMembers: statusCounts.reduce((total, row) => total + row.count, 0),
      activeMembers: countStatus('ACTIVE'),
      leftMembers: countStatus('LEFT'),
      bannedMembers: countStatus('BANNED'),
      totalSupporters: supporterCounts[0]?.count ?? 0,
      totalTags: tagCounts[0]?.count ?? 0,
      totalModerationActions: moderationCounts[0]?.count ?? 0,
      totalAuditLogs: auditCounts[0]?.count ?? 0,
    },
    recentAudit,
  };
}

export async function getAdminMembers(
  search?: string,
  database: ASCDatabase = db
): Promise<AdminMemberItem[]> {
  const usersWithRelations = await database.query.users.findMany({
    where: search?.trim() ? or(like(users.username, `%${search.trim()}%`), like(users.displayName, `%${search.trim()}%`), like(users.externalUserId, `%${search.trim()}%`)) : undefined,
    with: {
      profile: true,
      memberRoles: {
        with: {
          role: true,
        },
      },
      slugs: true,
    },
    orderBy: [desc(users.firstJoinedAt)],
    limit: 100,
  });

  return usersWithRelations.map((u) => {
    const primary = u.slugs.find((s) => s.isPrimary)?.slug || u.username.toLowerCase();
    const roles = (u.memberRoles || [])
      .map((mr) => mr.role)
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        isAdmin: r.isAdmin,
        isSupporter: r.isSupporter,
      }));

    return {
      id: u.id,
      externalUserId: u.externalUserId,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      membershipStatus: u.membershipStatus as 'ACTIVE' | 'LEFT' | 'BANNED',
      firstJoinedAt: u.firstJoinedAt,
      primarySlug: primary,
      roles,
      isPrivate: u.profile?.isPrivate || false,
      isModerated: u.profile?.isModerated || false,
    };
  });
}

export async function getAdminTags(database: ASCDatabase = db): Promise<AdminTagItem[]> {
  const allTags = await database.query.tags.findMany({
    with: {
      memberTags: true,
    },
    orderBy: [tags.name],
  });

  return allTags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    color: t.color,
    isActive: t.isActive,
    memberCount: t.memberTags?.length || 0,
  }));
}

export async function getAdminSiteSettings(
  database: ASCDatabase = db
): Promise<{ maintenanceMode: boolean; announcement: string }> {
  const settingsRecords = await database.query.siteSettings.findMany();
  const maintenanceRecord = settingsRecords.find((s) => s.key === 'maintenance_mode');
  const announcementRecord = settingsRecords.find((s) => s.key === 'system_announcement');

  return {
    maintenanceMode: maintenanceRecord?.value === 'true',
    announcement: announcementRecord?.value || '',
  };
}

export async function getAdminAuditLogsList(
  database: ASCDatabase = db
): Promise<AdminAuditItem[]> {
  const logs = await database.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 100,
  });

  return logs.map((a) => ({
    id: a.id,
    actorId: a.actorId,
    action: a.action,
    targetType: a.targetType,
    targetId: a.targetId,
    metadata: a.metadata,
    createdAt: a.createdAt,
  }));
}
