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
  layout: z.enum(['classic', 'split']).default('classic'),
  supporterLayout: z.enum(['arcade', 'showcase']).nullable().optional(),
  typography: z.enum(['balanced', 'bold', 'playful']).optional(),
  avatarFrame: z.enum(['none', 'pixel', 'neon', 'crest']).optional(),
  coverTreatment: z.enum(['solid', 'artwork', 'pattern']).optional(),
  coverPosition: z.number().int().min(0).max(100).optional(),
  motion: z.enum(['off', 'subtle', 'lively']).optional(),
  backgroundUrl: z
    .string()
    .trim()
    .max(1024)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      {
        message: 'Background URL must be a valid HTTPS URL',
      }
    ),
});

export const updateMemberTagsSchema = z.object({
  tagIds: z
    .array(z.string().min(1))
    .max(10, 'Cannot select more than 10 tags'),
});

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(32, 'Slug must not exceed 32 characters')
  .regex(/^[a-z0-9_]+(-[a-z0-9_]+)*$/, {
    message: 'Slug must consist of lowercase alphanumeric characters, underscores, and hyphens',
  });

/**
 * Validates that a URL string strictly uses http: or https: protocol and rejects dangerous schemes.
 */
export function isValidHttpUrl(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const lower = val.toLowerCase().trim();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('about:') ||
    lower.startsWith('chrome:') ||
    lower.startsWith('ftp:')
  ) {
    return false;
  }
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes an external URL, returning a normalized URL string or null if unsafe.
 */
export function sanitizeExternalUrl(val: string): string | null {
  if (!isValidHttpUrl(val)) return null;
  try {
    const parsed = new URL(val);
    return parsed.toString();
  } catch {
    return null;
  }
}

export function validateSlug(slug: string) {
  return slugSchema.safeParse(slug);
}

export function validateBio(bio: string) {
  return z.string().max(500).safeParse(bio);
}

export function validateCustomTitle(title: string) {
  return z.string().max(64).safeParse(title);
}

export function validateProfileLink(link: unknown) {
  return profileLinkSchema.safeParse(link);
}

export type UpdateBioInput = z.infer<typeof updateBioSchema>;
export type ProfileLinkInput = z.infer<typeof profileLinkSchema>;
export type UpdateLinksInput = z.infer<typeof updateLinksSchema>;
export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;
export type UpdateAppearanceDraft = z.input<typeof updateAppearanceSchema>;
export type UpdateMemberTagsInput = z.infer<typeof updateMemberTagsSchema>;
