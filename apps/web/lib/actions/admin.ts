'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import {
  db,
  profiles,
  profileLinks,
  tags,
  moderationActions,
  auditLogs,
  siteSettings,
  type ASCDatabase,
} from '@asc/db';
import { requireAdminMember, assertAdminMember } from '../auth';
import {
  adminModerateProfileSchema,
  adminTagSchema,
  siteSettingsSchema,
  type AdminModerateProfileInput,
  type AdminTagInput,
  type SiteSettingsInput,
} from '@asc/validation';
import type { AuthenticatedMember } from '@asc/types';

function safeRevalidate(path: string, type?: 'page' | 'layout') {
  try {
    revalidatePath(path, type);
  } catch {
    // Graceful no-op outside Next.js request context (e.g. in test suites)
  }
}

export interface AdminActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Administrative Action: Moderate Member Profile
 * Gated strictly by server-side is_admin role verification.
 */
export async function adminModerateProfileAction(
  input: AdminModerateProfileInput,
  database: ASCDatabase = db,
  adminOverride?: AuthenticatedMember
): Promise<AdminActionResponse<{ actionId: string }>> {
  try {
    const admin = adminOverride || (await requireAdminMember(database));
    assertAdminMember(admin);

    const validated = adminModerateProfileSchema.parse(input);
    const { targetUserId, action, reason } = validated;

    // 1. Execute moderation mutation
    switch (action) {
      case 'HIDE_PROFILE':
        await database
          .update(profiles)
          .set({ isPrivate: true, updatedAt: new Date() })
          .where(eq(profiles.userId, targetUserId));
        break;

      case 'UNHIDE_PROFILE':
        await database
          .update(profiles)
          .set({ isPrivate: false, updatedAt: new Date() })
          .where(eq(profiles.userId, targetUserId));
        break;

      case 'RESET_BIO':
        await database
          .update(profiles)
          .set({ bio: null, customTitle: null, updatedAt: new Date() })
          .where(eq(profiles.userId, targetUserId));
        break;

      case 'RESET_BACKGROUND':
        await database
          .update(profiles)
          .set({ backgroundUrl: null, updatedAt: new Date() })
          .where(eq(profiles.userId, targetUserId));
        break;

      case 'RESET_LINKS': {
        const targetProfile = await database.query.profiles.findFirst({
          where: eq(profiles.userId, targetUserId),
        });
        if (targetProfile) {
          await database
            .delete(profileLinks)
            .where(eq(profileLinks.profileId, targetProfile.id));
        }
        break;
      }
    }

    // 2. Append to moderation_actions table
    const [actionRecord] = await database
      .insert(moderationActions)
      .values({
        targetUserId,
        actorUserId: admin.user.id,
        actionType: action,
        reason,
        metadata: JSON.stringify({ actorUsername: admin.user.username }),
      })
      .returning();

    // 3. Append to audit_logs table
    await database.insert(auditLogs).values({
      actorId: admin.user.id,
      action: `MODERATE_PROFILE:${action}`,
      targetType: 'USER',
      targetId: targetUserId,
      metadata: JSON.stringify({
        reason,
        moderationActionId: actionRecord?.id,
      }),
    });

    safeRevalidate('/admin');
    safeRevalidate('/admin/profiles');
    safeRevalidate('/admin/audit');

    return { success: true, data: { actionId: actionRecord?.id || 'ok' } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Moderation action failed';
    return { success: false, error: message };
  }
}

/**
 * Administrative Action: Create or Update Community Tag
 */
export async function adminManageTagAction(
  input: AdminTagInput,
  database: ASCDatabase = db,
  adminOverride?: AuthenticatedMember
): Promise<AdminActionResponse<{ tagId: string }>> {
  try {
    const admin = adminOverride || (await requireAdminMember(database));
    assertAdminMember(admin);

    const validated = adminTagSchema.parse(input);

    let tagId = validated.tagId;

    if (tagId) {
      // Update existing tag
      await database
        .update(tags)
        .set({
          name: validated.name,
          slug: validated.slug,
          description: validated.description || null,
          color: validated.color,
          isActive: validated.isActive,
        })
        .where(eq(tags.id, tagId));

      await database.insert(auditLogs).values({
        actorId: admin.user.id,
        action: 'UPDATE_TAG',
        targetType: 'TAG',
        targetId: tagId,
        metadata: JSON.stringify({ name: validated.name, slug: validated.slug }),
      });
    } else {
      // Create new tag
      const [newTag] = await database
        .insert(tags)
        .values({
          name: validated.name,
          slug: validated.slug,
          description: validated.description || null,
          color: validated.color,
          isActive: validated.isActive,
        })
        .returning();

      tagId = newTag?.id;

      await database.insert(auditLogs).values({
        actorId: admin.user.id,
        action: 'CREATE_TAG',
        targetType: 'TAG',
        targetId: tagId || 'unknown',
        metadata: JSON.stringify({ name: validated.name, slug: validated.slug }),
      });
    }

    safeRevalidate('/admin');
    safeRevalidate('/admin/tags');
    safeRevalidate('/dashboard/tags');
    safeRevalidate('/explore');

    return { success: true, data: { tagId: tagId || 'ok' } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tag operation failed';
    return { success: false, error: message };
  }
}

/**
 * Administrative Action: Update Site Settings
 */
export async function adminUpdateSiteSettingsAction(
  input: SiteSettingsInput,
  database: ASCDatabase = db,
  adminOverride?: AuthenticatedMember
): Promise<AdminActionResponse> {
  try {
    const admin = adminOverride || (await requireAdminMember(database));
    assertAdminMember(admin);

    const validated = siteSettingsSchema.parse(input);

    // Upsert maintenance mode
    await database
      .insert(siteSettings)
      .values({
        key: 'maintenance_mode',
        value: String(validated.maintenanceMode),
        updatedBy: admin.user.username,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: String(validated.maintenanceMode),
          updatedBy: admin.user.username,
          updatedAt: new Date(),
        },
      });

    // Upsert system announcement
    await database
      .insert(siteSettings)
      .values({
        key: 'system_announcement',
        value: validated.announcement || '',
        updatedBy: admin.user.username,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: validated.announcement || '',
          updatedBy: admin.user.username,
          updatedAt: new Date(),
        },
      });

    await database.insert(auditLogs).values({
      actorId: admin.user.id,
      action: 'UPDATE_SETTINGS',
      targetType: 'SITE_SETTINGS',
      targetId: 'global',
      metadata: JSON.stringify(validated),
    });

    safeRevalidate('/admin');
    safeRevalidate('/admin/settings');
    safeRevalidate('/');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    return { success: false, error: message };
  }
}
