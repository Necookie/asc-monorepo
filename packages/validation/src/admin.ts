import { z } from 'zod';
import { hexColorSchema } from './profile';

export const adminModerateProfileSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  action: z.enum([
    'HIDE_PROFILE',
    'UNHIDE_PROFILE',
    'RESET_BIO',
    'RESET_BACKGROUND',
    'RESET_LINKS',
  ]),
  reason: z
    .string()
    .trim()
    .min(3, 'A reason with at least 3 characters is required')
    .max(255, 'Reason must not exceed 255 characters'),
});

export const adminTagSchema = z.object({
  tagId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Tag name must be at least 2 characters')
    .max(30, 'Tag name must not exceed 30 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Tag slug must be at least 2 characters')
    .max(30, 'Tag slug must not exceed 30 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Tag slug may only contain lowercase letters, numbers, and hyphens'
    ),
  description: z
    .string()
    .trim()
    .max(200, 'Description must not exceed 200 characters')
    .optional()
    .nullable(),
  color: hexColorSchema.default('#5865f2'),
  isActive: z.boolean().default(true),
});

export const siteSettingsSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  announcement: z
    .string()
    .trim()
    .max(255, 'Announcement must not exceed 255 characters')
    .optional()
    .nullable(),
});

export type AdminModerateProfileInput = z.infer<typeof adminModerateProfileSchema>;
export type AdminTagInput = z.infer<typeof adminTagSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const staffAccessSchema = z.object({
  targetUserId: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'MODERATOR', 'NONE']),
  expectedRole: z.enum(['ADMIN', 'MODERATOR', 'NONE']),
  reason: z.string().trim().min(3).max(255),
}).strict();
export type StaffAccessInput = z.infer<typeof staffAccessSchema>;

export const adminPerksSchema = z.object({
  targetUserId: z.string().min(1).max(100),
  enabled: z.boolean(),
  expectedEnabled: z.boolean(),
  reason: z.string().trim().min(3).max(255),
}).strict();
export type AdminPerksInput = z.infer<typeof adminPerksSchema>;
