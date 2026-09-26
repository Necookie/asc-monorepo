import { cache } from 'react';
import { eq, and } from 'drizzle-orm';
import { db, users, profileSlugs, profiles, type ASCDatabase } from '@asc/db';
import { resolveMemberEntitlements, resolveVisibleAppearance } from '@asc/entitlements';
import type { ResolvedEntitlements, AppearanceSettings } from '@asc/types';

export interface PublicProfileResult {
  profile?: PublicProfileData;
  redirect?: string;
  notFound?: boolean;
}

export interface PublicProfileData {
  user: {
    username: string;
    displayName: string;
    nickname: string | null;
    avatar: string | null;
    membershipStatus: 'ACTIVE' | 'LEFT';
    firstJoinedAt: Date | null;
    slug: string;
  };
  profile: AppearanceSettings & {
    activeLayout: 'classic' | 'split' | 'arcade' | 'showcase';
    bio: string | null;
    customTitle: string | null;
    isPrivate: boolean;
  };
  roles: {
    id: string;
    name: string;
    color: string;
    isAdmin: boolean;
    isSupporter: boolean;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  links: {
    id: string;
    label: string;
    url: string;
  }[];
  isSupporter: boolean;
  entitlements: ResolvedEntitlements;
}

export async function getPublicProfileBySlug(
  slug: string,
  database: ASCDatabase = db
): Promise<PublicProfileResult> {
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Look up slug in profile_slugs
  const slugRecord = await database.query.profileSlugs.findFirst({
    where: eq(profileSlugs.slug, normalizedSlug),
  });

  if (!slugRecord) {
    // Check fallback by username directly
    const fallbackUser = await database.query.users.findFirst({
      where: eq(users.username, normalizedSlug),
    });
    if (!fallbackUser || fallbackUser.membershipStatus === 'BANNED') {
      return { notFound: true };
    }

    // Get their primary slug
    const primarySlug = await database.query.profileSlugs.findFirst({
      where: and(eq(profileSlugs.userId, fallbackUser.id), eq(profileSlugs.isPrimary, true)),
    });
    if (primarySlug && primarySlug.slug !== normalizedSlug) {
      return { redirect: primarySlug.slug };
    }
  }

  // 2. If slug was an old released alias, redirect to current primary slug
  if (slugRecord && !slugRecord.isPrimary) {
    const primarySlug = await database.query.profileSlugs.findFirst({
      where: and(eq(profileSlugs.userId, slugRecord.userId), eq(profileSlugs.isPrimary, true)),
    });
    if (primarySlug && primarySlug.slug !== normalizedSlug) {
      return { redirect: primarySlug.slug };
    }
  }

  const targetUserId = slugRecord?.userId;
  if (!targetUserId) {
    return { notFound: true };
  }

  // 3. Fetch full member data with relations
  const user = await database.query.users.findFirst({
    where: eq(users.id, targetUserId),
    with: {
      profile: {
        with: {
          links: {
            orderBy: (links, { asc }) => [asc(links.displayOrder)],
          },
        },
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
      entitlements: true,
    },
  });

  if (!user || user.membershipStatus === 'BANNED' || user.profile?.isModerated) {
    return { notFound: true };
  }

  // Map roles and resolve supporter state
  const roles = (user.membershipStatus === 'ACTIVE' ? user.memberRoles : [])
    .map((mr) => mr.role)
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));

  const isSupporter = roles.some((r) => r.isSupporter === true);

  // Entitlement resolution
  const resolvedEntitlements = resolveMemberEntitlements(
    roles,
    user.entitlements.filter(e => e.source !== 'WEBSITE_ADMIN' || user.membershipStatus === 'ACTIVE').map((e) => ({
      id: e.id,
      userId: e.userId,
      key: e.key as import('@asc/types').EntitlementKey,
      value: e.value,
      source: e.source,
      grantedAt: e.grantedAt,
      expiresAt: e.expiresAt,
    }))
  );

  const profile = user.profile || {
    bio: null,
    customTitle: null,
    accentColor: '#5865f2',
    theme: 'canvas' as const,
    backgroundUrl: null,
    layout: 'classic' as const,
    supporterLayout: null,
    typography: 'balanced' as const,
    avatarFrame: 'none' as const,
    coverTreatment: 'solid' as const,
    coverPosition: 50,
    motion: 'subtle' as const,
    isPrivate: false,
    showRoles: true,
    showMembershipDate: true,
    showTags: true,
    showLinks: true,
    links: [],
  };

  // Server-side privacy and entitlement stripping
  const isPrivate = profile.isPrivate === true;

  const publicData: PublicProfileData = {
    user: {
      username: user.username,
      displayName: user.displayName,
      nickname: isPrivate ? null : user.nickname,
      avatar: user.avatar,
      membershipStatus: user.membershipStatus === 'LEFT' ? 'LEFT' : 'ACTIVE',
      firstJoinedAt: isPrivate || !profile.showMembershipDate ? null : user.firstJoinedAt,
      slug: slugRecord?.slug || user.username,
    },
    profile: {
      ...resolveVisibleAppearance({
        theme: profile.theme,
        accentColor: profile.accentColor,
        backgroundUrl: profile.backgroundUrl,
        layout: profile.layout,
        supporterLayout: profile.supporterLayout,
        typography: profile.typography,
        avatarFrame: profile.avatarFrame,
        coverTreatment: profile.coverTreatment,
        coverPosition: profile.coverPosition,
        motion: profile.motion,
      }, resolvedEntitlements),
      bio: isPrivate ? null : profile.bio,
      customTitle: isPrivate || !resolvedEntitlements.canCustomTitle ? null : profile.customTitle,
      backgroundUrl:
        isPrivate || !resolvedEntitlements.canCustomBackground ? null : profile.backgroundUrl,
      isPrivate,
    },
    roles:
      isPrivate || !profile.showRoles
        ? []
        : roles.map((r) => ({
            id: r.id,
            name: r.name,
            color: r.color || '#5865f2',
            isAdmin: r.isAdmin,
            isSupporter: r.isSupporter,
          })),
    tags:
      isPrivate || !profile.showTags
        ? []
        : user.memberTags
            .map((mt) => mt.tag)
            .filter((t): t is NonNullable<typeof t> => Boolean(t && t.isActive))
            .map((t) => ({ id: t.id, name: t.name })),
    links:
      isPrivate || !profile.showLinks
        ? []
        : (profile.links || []).map((l) => ({
            id: l.id,
            label: l.label,
            url: l.url,
          })),
    isSupporter: !isPrivate && profile.showRoles ? isSupporter : false,
    entitlements: resolvedEntitlements,
  };

  return { profile: publicData };
}

export const getCachedPublicProfileBySlug = cache(
  async (slug: string, database: ASCDatabase = db): Promise<PublicProfileResult> => {
    return getPublicProfileBySlug(slug, database);
  }
);
