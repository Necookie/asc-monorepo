export type EntitlementKey =
  | 'profile.background'
  | 'profile.custom_title'
  | 'profile.gradient'
  | 'profile.frame'
  | 'profile.max_tags'
  | 'profile.max_links';

export interface Entitlement {
  id: string;
  userId: string;
  key: EntitlementKey;
  value: string; // JSON or string value
  source: string; // 'ROLE_SUPPORTER' | 'ADMIN_GRANT' etc.
  grantedAt: Date;
  expiresAt: Date | null;
}

export interface ResolvedEntitlements {
  canCustomBackground: boolean;
  canCustomTitle: boolean;
  canGradientAccent: boolean;
  maxTags: number;
  maxLinks: number;
}
