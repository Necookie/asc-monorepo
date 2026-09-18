import type { CommunityRole } from '@asc/types';
import { hasAdminPermission, hasModeratorPermission } from './roles';

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden: Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function assertOwnership(
  authenticatedExternalUserId: string | null | undefined,
  targetExternalUserId: string
): void {
  if (!authenticatedExternalUserId) {
    throw new UnauthorizedError('Must be logged in to modify this resource');
  }

  // Strictly enforce that immutable external ID matches
  if (authenticatedExternalUserId !== targetExternalUserId) {
    throw new ForbiddenError(
      'Cross-profile mutations are strictly forbidden. You can only modify your own profile.'
    );
  }
}

export function assertAdmin(roles: CommunityRole[]): void {
  if (!hasAdminPermission(roles)) {
    throw new ForbiddenError(
      'Administrative permissions required to perform this action.'
    );
  }
}

export function assertModerator(roles: CommunityRole[]): void {
  if (!hasModeratorPermission(roles)) {
    throw new ForbiddenError(
      'Moderator permissions required to perform this action.'
    );
  }
}
