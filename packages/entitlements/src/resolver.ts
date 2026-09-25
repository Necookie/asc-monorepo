import type {
  CommunityRole,
  Entitlement,
  ResolvedEntitlements,
} from '@asc/types';
import { STANDARD_ENTITLEMENTS, SUPPORTER_ENTITLEMENTS } from './definitions';

export function resolveMemberEntitlements(
  roles: CommunityRole[] = [],
  explicitEntitlements: Entitlement[] = []
): ResolvedEntitlements {
  const isSupporter = roles.some((r) => r.isSupporter === true);
  const isAdmin = roles.some((r) => r.isAdmin === true);

  // Start with standard baseline
  const result: ResolvedEntitlements = isSupporter || isAdmin
    ? { ...SUPPORTER_ENTITLEMENTS }
    : { ...STANDARD_ENTITLEMENTS };

  // Apply explicit overrides from entitlements table if active
  const now = new Date();
  for (const ent of explicitEntitlements) {
    if (ent.expiresAt && ent.expiresAt < now) {
      // Expired entitlement
      continue;
    }

    switch (ent.key) {
      case 'profile.background':
        result.canCustomBackground = ent.value === 'true';
        break;
      case 'profile.custom_title':
        result.canCustomTitle = ent.value === 'true';
        break;
      case 'profile.gradient':
        result.canGradientAccent = ent.value === 'true';
        break;
      case 'profile.studio':
        result.canProfileStudio = ent.value === 'true';
        break;
      case 'profile.frame':
        result.canProfileStudio = ent.value === 'true';
        break;
      case 'profile.max_tags':
        result.maxTags = Math.max(result.maxTags, parseInt(ent.value, 10) || 5);
        break;
      case 'profile.max_links':
        result.maxLinks = Math.max(result.maxLinks, parseInt(ent.value, 10) || 5);
        break;
    }
  }

  return result;
}
