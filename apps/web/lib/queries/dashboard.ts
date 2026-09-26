import { eq } from 'drizzle-orm';
import {
  db,
  memberTags,
  profileLinks,
  tags,
  type ASCDatabase,
} from '@asc/db';
import { getResolvedMemberEntitlements } from './entitlements';
import type {
  AuthenticatedMember,
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
  // These reads share the verified member but do not depend on one another.
  const [linksRecords, tagAssignments, allTagsRecords, entitlements] = await Promise.all([
    database.query.profileLinks.findMany({
    where: eq(profileLinks.profileId, member.profile.id),
    orderBy: (links, { asc }) => [asc(links.displayOrder)],
    }),
    database.select({ tagId: memberTags.tagId }).from(memberTags).where(eq(memberTags.userId, member.user.id)),
    database.query.tags.findMany({
      where: eq(tags.isActive, true),
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
    getResolvedMemberEntitlements(member, database),
  ]);

  const links: ProfileLink[] = linksRecords.map((l) => ({
    id: l.id,
    profileId: l.profileId,
    label: l.label,
    url: l.url,
    displayOrder: l.displayOrder,
    createdAt: l.createdAt,
  }));

  const selectedTagIds = tagAssignments.map((assignment) => assignment.tagId);

  const availableTags: Tag[] = allTagsRecords.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    color: t.color,
    isActive: t.isActive,
    createdAt: t.createdAt,
  }));

  return {
    member,
    links,
    selectedTagIds,
    availableTags,
    entitlements,
  };
}
