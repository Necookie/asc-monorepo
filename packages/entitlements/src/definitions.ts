import type { ResolvedEntitlements } from '@asc/types';

export const STANDARD_ENTITLEMENTS: ResolvedEntitlements = {
  canCustomBackground: false,
  canCustomTitle: false,
  canGradientAccent: false,
  canProfileStudio: false,
  maxTags: 5,
  maxLinks: 5,
};

export const SUPPORTER_ENTITLEMENTS: ResolvedEntitlements = {
  canCustomBackground: true,
  canCustomTitle: true,
  canGradientAccent: true,
  canProfileStudio: true,
  maxTags: 10,
  maxLinks: 10,
};
