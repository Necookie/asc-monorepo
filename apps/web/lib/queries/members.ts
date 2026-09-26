import { eq, or, like, and, inArray, notInArray, isNull } from 'drizzle-orm';
import { db, users, profiles, profileSlugs, communityRoles, memberRoles, tags as tagsTable, memberTags as memberTagsTable, type ASCDatabase } from '@asc/db';

export interface MemberDirectoryItem {
  id: string;
  externalUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  slug: string;
  isSupporter: boolean;
  primaryRole?: {
    id: string;
    name: string;
    color: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

export interface GetMembersOptions {
  search?: string;
  filter?: 'all' | 'supporters';
  database?: ASCDatabase;
  limit?: number;
}

export async function getMembersDirectory({
  search = '',
  filter = 'all',
  database = db,
  limit,
}: GetMembersOptions = {}): Promise<MemberDirectoryItem[]> {
  const searchTerm = search.trim().toLowerCase();

  let matchedUserIds: string[] | null = null;

  if (searchTerm) {
    // 1. Direct user match by username or displayName
    const directUsers = await database.query.users.findMany({
      where: and(
        eq(users.membershipStatus, 'ACTIVE'),
        or(
          like(users.username, `%${searchTerm}%`),
          like(users.displayName, `%${searchTerm}%`)
        )
      ),
      columns: { id: true },
    });

    // 2. Match by associated tag names
    const tagMatches = await database
      .select({ userId: memberTagsTable.userId })
      .from(memberTagsTable)
      .innerJoin(tagsTable, eq(memberTagsTable.tagId, tagsTable.id))
      .leftJoin(profiles, eq(memberTagsTable.userId, profiles.userId))
      .where(and(
        like(tagsTable.name, `%${searchTerm}%`),
        eq(tagsTable.isActive, true),
        or(isNull(profiles.userId), and(eq(profiles.isPrivate, false), eq(profiles.showTags, true)))
      ));

    const tagUserIds = tagMatches.map((match) => match.userId);
    const mergedUserIds = new Set([...directUsers.map((u) => u.id), ...tagUserIds]);

    matchedUserIds = Array.from(mergedUserIds);
    if (matchedUserIds.length === 0) {
      return [];
    }
  }

  // Keep former members' profiles reachable by slug without listing them as current members.
  // Privacy and role filters must run before the limit (also used by the homepage).
  const privateProfiles = database.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.isPrivate, true));
  const whereConditions = [eq(users.membershipStatus, 'ACTIVE'), notInArray(users.id, privateProfiles)];
  if (filter === 'supporters') {
    const visibleSupporters = database.select({ userId: memberRoles.userId }).from(memberRoles)
      .innerJoin(communityRoles, eq(memberRoles.roleId, communityRoles.id))
      .leftJoin(profiles, eq(memberRoles.userId, profiles.userId))
      .where(and(eq(communityRoles.isSupporter, true), or(isNull(profiles.userId), eq(profiles.showRoles, true))));
    whereConditions.push(inArray(users.id, visibleSupporters));
  }
  if (matchedUserIds) {
    whereConditions.push(inArray(users.id, matchedUserIds));
  }

  const userRows = await database.query.users.findMany({
    where: and(...whereConditions),
    with: {
      profile: true,
      slugs: {
        where: eq(profileSlugs.isPrimary, true),
      },
      memberRoles: {
        with: {
          role: true,
        },
      },
      memberTags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: (users, { desc }) => [desc(users.lastSyncedAt)],
    limit: limit ?? 60,
  });

  const members: MemberDirectoryItem[] = [];

  for (const user of userRows) {
    const roles = user.memberRoles
      .map((mr) => mr.role)
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));

    const isSupporter = user.profile?.showRoles !== false && roles.some((r) => r.isSupporter === true);

    if (filter === 'supporters' && !isSupporter) {
      continue;
    }

    const tags = (user.profile?.showTags !== false ? user.memberTags : [])
      .map((mt) => mt.tag)
      .filter((t): t is NonNullable<typeof t> => Boolean(t && t.isActive))
      .map((t) => ({ id: t.id, name: t.name }));

    const primaryRole = user.profile?.showRoles !== false && roles[0]
      ? {
          id: roles[0].id,
          name: roles[0].name,
          color: roles[0].color || '#5865f2',
        }
      : undefined;

    const slug = user.slugs[0]?.slug || user.username;

    members.push({
      id: user.id,
      externalUserId: user.externalUserId,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      slug,
      isSupporter,
      primaryRole,
      tags,
    });
  }

  return members;
}
