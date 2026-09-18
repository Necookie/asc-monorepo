export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'dashboard',
  'login',
  'logout',
  'members',
  'explore',
  'settings',
  'privacy',
  'terms',
  'about',
  'support',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  '_next',
]);

/**
 * Sanitizes a username and generates a URL-safe profile slug.
 * Resolves collisions with reserved routes by appending a suffix.
 */
export function generateSlug(rawUsername: string, externalUserId?: string): string {
  if (!rawUsername) {
    const fallbackId = externalUserId ? externalUserId.slice(-4) : 'member';
    return `member-${fallbackId}`;
  }

  // Convert to lowercase, replace non-alphanumeric with hyphens
  let slug = rawUsername
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug || slug.length < 2) {
    const fallbackId = externalUserId ? externalUserId.slice(-4) : 'member';
    slug = `user-${fallbackId}`;
  }

  // Ensure slug does not collide with reserved routes
  if (RESERVED_SLUGS.has(slug)) {
    const suffix = externalUserId ? externalUserId.slice(-4) : 'asc';
    slug = `${slug}-${suffix}`;
  }

  // Clamp length to 32 chars
  return slug.slice(0, 32);
}
