import { eq, and } from 'drizzle-orm';
import {
  db,
  users,
  profileLinks,
  tags,
  type ASCDatabase,
} from '@asc/db';
import { getResolvedMemberEntitlements } from './entitlements';
import type {
  AuthenticatedMember,
  CommunityRole,
  ProfileLink,
  Tag,
  ResolvedEntitlements,
} from '@asc/types';

export interface DashboardData {
  member: AuthenticatedMember;
  links: ProfileLink[];
  selectedTagIds: string[];
  availableTags: Tag[];
  entitlements: ResolvedEntitlements;
}

export async function getDashboardData(
  member: AuthenticatedMember,
  database: ASCDatabase = db
): Promise<DashboardData> {
  // 1. Fetch member's profile links
  const linksRecords = await database.query.profileLinks.findMany({
    where: eq(profileLinks.profileId, member.profile.id),
    orderBy: (links, { asc }) => [asc(links.displayOrder)],
  });

  const links: ProfileLink[] = linksRecords.map((l) => ({
    id: l.id,
    profileId: l.profileId,
    label: l.label,
    url: l.url,
    displayOrder: l.displayOrder,
    createdAt: l.createdAt,
  }));

  // 2. Fetch member's assigned tags
  const memberWithTags = await database.query.users.findFirst({
    where: eq(users.id, member.user.id),
    with: {
      memberTags: true,
    },
  });

  const selectedTagIds = (memberWithTags?.memberTags || []).map((mt) => mt.tagId);

  // 3. Fetch all active community tags
  const allTagsRecords = await database.query.tags.findMany({
    where: eq(tags.isActive, true),
    orderBy: (t, { asc }) => [asc(t.name)],
  });

  const availableTags: Tag[] = allTagsRecords.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    color: t.color,
    isActive: t.isActive,
    createdAt: t.createdAt,
  }));

  // 4. Resolve entitlements
  const entitlements = await getResolvedMemberEntitlements(member, database);

  return {
    member,
    links,
    selectedTagIds,
    availableTags,
    entitlements,
  };
}
