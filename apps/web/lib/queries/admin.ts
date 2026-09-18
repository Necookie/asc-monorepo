import { eq, desc, sql, count, and } from 'drizzle-orm';
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
  // Counts
  const allUsers = await database.select({ status: users.membershipStatus }).from(users);
  const totalMembers = allUsers.length;
  const activeMembers = allUsers.filter((u) => u.status === 'ACTIVE').length;
  const leftMembers = allUsers.filter((u) => u.status === 'LEFT').length;
  const bannedMembers = allUsers.filter((u) => u.status === 'BANNED').length;

  const [tagsCount] = await database.select({ count: count() }).from(tags);
  const [modActionsCount] = await database
    .select({ count: count() })
    .from(moderationActions);
  const [auditLogsCount] = await database
    .select({ count: count() })
    .from(auditLogs);

  // Supporters count
  const supporterRoles = await database.query.communityRoles.findMany({
    where: eq(communityRoles.isSupporter, true),
  });
  const supporterRoleIds = supporterRoles.map((r) => r.id);

  let totalSupporters = 0;
  if (supporterRoleIds.length > 0) {
    const supporterMembers = await database
      .select({ userId: memberRoles.userId })
      .from(memberRoles)
      .groupBy(memberRoles.userId);
    totalSupporters = supporterMembers.length;
  }

  // Recent audit
  const recentAuditRecords = await database.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 10,
  });

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
      totalMembers,
      activeMembers,
      leftMembers,
      bannedMembers,
      totalSupporters,
      totalTags: tagsCount?.count || 0,
      totalModerationActions: modActionsCount?.count || 0,
      totalAuditLogs: auditLogsCount?.count || 0,
    },
    recentAudit,
  };
}

export async function getAdminMembers(
  search?: string,
  database: ASCDatabase = db
): Promise<AdminMemberItem[]> {
  const usersWithRelations = await database.query.users.findMany({
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

  let filtered = usersWithRelations;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.externalUserId.includes(q)
    );
  }

  return filtered.map((u) => {
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
