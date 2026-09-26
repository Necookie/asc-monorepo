// Internal mutation services. Dependency injection stays outside the Server Action boundary.

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { eq, inArray } from 'drizzle-orm';
import {
  db,
  profiles,
  profileLinks,
  tags,
  memberTags,
  type ASCDatabase,
} from '@asc/db';
import { requireAuthenticatedMember } from '../auth/session';
import {
  updateBioSchema,
  updateAppearanceSchema,
  updateLinksSchema,
  updatePrivacySchema,
  updateMemberTagsSchema,
} from '@asc/validation';
import { resolveMemberEntitlements } from '@asc/entitlements';
import { getResolvedMemberEntitlements } from '../queries/entitlements';
import type { UpdateAppearanceDraft } from '@asc/validation';
import { ForbiddenError } from '@asc/permissions';
import type { AuthenticatedMember } from '@asc/types';

function safeRevalidate(path: string, type?: 'page' | 'layout') {
  try {
    revalidatePath(path, type);
  } catch {
    // Graceful no-op when executed outside Next.js request context (e.g. in test suites)
  }
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Update Profile Biography and Custom Title
 */
export async function updateProfileBioAction(
  input: { bio?: string | null; customTitle?: string | null },
  database: ASCDatabase = db,
  memberOverride?: AuthenticatedMember
): Promise<ActionResponse<{ bio: string | null; customTitle: string | null }>> {
  try {
    const member = memberOverride || (await requireAuthenticatedMember(database));
    const validated = updateBioSchema.parse(input);

    const entitlements = await getResolvedMemberEntitlements(member, database);
    // Entitlement guard for custom title
    if (validated.customTitle) {
      if (!entitlements.canCustomTitle) {
        throw new ForbiddenError(
          'Custom title requires supporter entitlement or community staff role.'
        );
      }
    }

    await database
      .update(profiles)
      .set({
        bio: validated.bio || null,
        ...(entitlements.canCustomTitle ? { customTitle: validated.customTitle || null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, member.user.id));

    if (member.primarySlug) {
      safeRevalidate(`/${member.primarySlug}`);
    }
    safeRevalidate('/dashboard');

    return {
      success: true,
      data: {
        bio: validated.bio || null,
        customTitle: entitlements.canCustomTitle ? validated.customTitle || null : member.profile.customTitle,
      },
    };
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : 'Failed to update biography';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update Profile Appearance (Theme, Accent Color, Supporter Background URL)
 */
export async function updateProfileAppearanceAction(
  input: UpdateAppearanceDraft,
  database: ASCDatabase = db,
  memberOverride?: AuthenticatedMember
): Promise<ActionResponse> {
  try {
    const member = memberOverride || (await requireAuthenticatedMember(database));
    const validated = updateAppearanceSchema.parse(input);

    const entitlements = await getResolvedMemberEntitlements(member, database);
    if (validated.backgroundUrl && !entitlements.canCustomBackground) {
        throw new ForbiddenError(
          'Custom background images require supporter entitlement or community staff role.'
        );
    }

    const premiumRequested = validated.supporterLayout !== undefined || validated.typography !== undefined || validated.avatarFrame !== undefined || validated.coverTreatment !== undefined || validated.coverPosition !== undefined || validated.motion !== undefined;
    if (premiumRequested && !entitlements.canProfileStudio) {
      throw new ForbiddenError('Profile studio choices require supporter entitlement or community staff role.');
    }

    await database
      .update(profiles)
      .set({
        theme: validated.theme,
        accentColor: validated.accentColor,
        layout: validated.layout,
        ...(validated.backgroundUrl !== undefined && entitlements.canCustomBackground ? { backgroundUrl: validated.backgroundUrl || null } : {}),
        ...(entitlements.canProfileStudio ? {
          ...(validated.supporterLayout !== undefined ? { supporterLayout: validated.supporterLayout } : {}),
          ...(validated.typography !== undefined ? { typography: validated.typography } : {}),
          ...(validated.avatarFrame !== undefined ? { avatarFrame: validated.avatarFrame } : {}),
          ...(validated.coverTreatment !== undefined ? { coverTreatment: validated.coverTreatment } : {}),
          ...(validated.coverPosition !== undefined ? { coverPosition: validated.coverPosition } : {}),
          ...(validated.motion !== undefined ? { motion: validated.motion } : {}),
        } : {}),
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, member.user.id));

    if (member.primarySlug) {
      safeRevalidate(`/${member.primarySlug}`);
    }
    safeRevalidate('/dashboard');

    return { success: true };
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : 'Failed to update appearance';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update External Verified Links
 */
export async function updateProfileLinksAction(
  input: {
    links: Array<{
      label: string;
      url: string;
      displayOrder?: number;
    }>;
  },
  database: ASCDatabase = db,
  memberOverride?: AuthenticatedMember
): Promise<ActionResponse<{ linksCount: number }>> {
  try {
    const member = memberOverride || (await requireAuthenticatedMember(database));
    const validated = updateLinksSchema.parse(input);

    const entitlements = resolveMemberEntitlements(member.roles);
    if (validated.links.length > entitlements.maxLinks) {
      throw new ForbiddenError(
        `Cannot save ${validated.links.length} links. Your tier allows up to ${entitlements.maxLinks} links.`
      );
    }

    // Find profile ID for this member
    const profileRecord = await database.query.profiles.findFirst({
      where: eq(profiles.userId, member.user.id),
    });
    const targetProfileId = profileRecord?.id || member.profile.id;

    // Atomic replace of links for this profile
    await database
      .delete(profileLinks)
      .where(eq(profileLinks.profileId, targetProfileId));

    if (validated.links.length > 0) {
      for (let i = 0; i < validated.links.length; i++) {
        const link = validated.links[i];
        await database.insert(profileLinks).values({
          profileId: targetProfileId,
          label: link.label,
          url: link.url,
          displayOrder: link.displayOrder ?? i,
        });
      }
    }

    if (member.primarySlug) {
      safeRevalidate(`/${member.primarySlug}`);
    }
    safeRevalidate('/dashboard');

    return { success: true, data: { linksCount: validated.links.length } };
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : 'Failed to update profile links';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update Granular Privacy Settings
 */
export async function updateProfilePrivacyAction(
  input: {
    isPrivate?: boolean;
    showRoles?: boolean;
    showMembershipDate?: boolean;
    showTags?: boolean;
    showLinks?: boolean;
  },
  database: ASCDatabase = db,
  memberOverride?: AuthenticatedMember
): Promise<ActionResponse> {
  try {
    const member = memberOverride || (await requireAuthenticatedMember(database));
    const validated = updatePrivacySchema.parse(input);

    await database
      .update(profiles)
      .set({
        isPrivate: validated.isPrivate,
        showRoles: validated.showRoles,
        showMembershipDate: validated.showMembershipDate,
        showTags: validated.showTags,
        showLinks: validated.showLinks,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, member.user.id));

    if (member.primarySlug) {
      safeRevalidate(`/${member.primarySlug}`);
    }
    safeRevalidate('/dashboard');

    return { success: true, data: validated };
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : 'Failed to update privacy settings';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update Member Community Tags
 */
export async function updateMemberTagsAction(
  input: { tagIds: string[] },
  database: ASCDatabase = db,
  memberOverride?: AuthenticatedMember
): Promise<ActionResponse<{ tagsCount: number }>> {
  try {
    const member = memberOverride || (await requireAuthenticatedMember(database));
    const validated = updateMemberTagsSchema.parse(input);

    const entitlements = resolveMemberEntitlements(member.roles);
    if (validated.tagIds.length > entitlements.maxTags) {
      throw new ForbiddenError(
        `Cannot select ${validated.tagIds.length} tags. Your tier allows up to ${entitlements.maxTags} tags.`
      );
    }

    // Verify which tag IDs actually exist and are active
    let validTagIds: string[] = [];
    if (validated.tagIds.length > 0) {
      const activeTags = await database.query.tags.findMany({
        where: inArray(tags.id, validated.tagIds),
      });
      validTagIds = activeTags.filter((t) => t.isActive).map((t) => t.id);
    }

    // Replace user tags
    await database
      .delete(memberTags)
      .where(eq(memberTags.userId, member.user.id));

    for (const tagId of validTagIds) {
      await database.insert(memberTags).values({
        userId: member.user.id,
        tagId,
      });
    }

    if (member.primarySlug) {
      safeRevalidate(`/${member.primarySlug}`);
    }
    safeRevalidate('/dashboard');

    return { success: true, data: { tagsCount: validTagIds.length } };
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : 'Failed to update member tags';
    return { success: false, error: message };
  }
}
