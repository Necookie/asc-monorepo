import { z } from 'zod';

export const safeUrlSchema = z
  .string()
  .trim()
  .max(1024, 'URL must not exceed 1024 characters')
  .refine(
    (val) => {
      if (!val) return true;
      const lower = val.toLowerCase();
      // Strictly reject dangerous schemes
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('file:') ||
        lower.startsWith('vbscript:')
      ) {
        return false;
      }
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid URL. Only secure http/https URLs are permitted.',
    }
  );

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Must be a valid hex color code (e.g. #5865f2)',
  });

export const themeSchema = z.enum(['canvas', 'indigo', 'onyx']);

export const updateBioSchema = z.object({
  bio: z
    .string()
    .max(500, 'Biography must not exceed 500 characters')
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? '' : val.trim())),
  customTitle: z
    .string()
    .max(64, 'Custom title must not exceed 64 characters')
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? '' : val.trim())),
});

export const profileLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Link label is required')
    .max(32, 'Link label must not exceed 32 characters'),
  url: safeUrlSchema,
  displayOrder: z.number().int().min(0).max(20).default(0),
});

export const updateLinksSchema = z.object({
  links: z
    .array(profileLinkSchema)
    .max(10, 'Cannot exceed maximum of 10 links'),
});

export const updateAppearanceSchema = z.object({
  theme: themeSchema.default('canvas'),
  accentColor: hexColorSchema.default('#5865f2'),
  backgroundUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
          return false;
        }
      },
      {
        message: 'Background URL must be a valid http/https URL',
      }
    ),
});

export const updateMemberTagsSchema = z.object({
  tagIds: z
    .array(z.string().min(1))
    .max(10, 'Cannot select more than 10 tags'),
});

export type UpdateBioInput = z.infer<typeof updateBioSchema>;
export type ProfileLinkInput = z.infer<typeof profileLinkSchema>;
export type UpdateLinksInput = z.infer<typeof updateLinksSchema>;
export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;
export type UpdateMemberTagsInput = z.infer<typeof updateMemberTagsSchema>;
