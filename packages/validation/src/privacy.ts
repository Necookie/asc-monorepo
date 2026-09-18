import { z } from 'zod';

export const updatePrivacySchema = z.object({
  isPrivate: z.boolean().default(false),
  showRoles: z.boolean().default(true),
  showMembershipDate: z.boolean().default(true),
  showTags: z.boolean().default(true),
  showLinks: z.boolean().default(true),
});

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
