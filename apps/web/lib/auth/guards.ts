import { UnauthorizedError, ForbiddenError } from '@asc/permissions';
import type { AuthenticatedMember } from '@asc/types';

/**
 * Validates that an authenticated member owns the target profile being modified.
 *
 * Anti-Spoofing & Zero-Trust Invariants:
 * 1. The target identity is matched strictly against immutable Discord snowflakes and user IDs.
 * 2. Matching by username or slug is strictly prohibited. Knowing another member's
 *    username or slug grants zero authorization.
 * 3. Cross-profile mutations immediately throw ForbiddenError.
 */
export function assertProfileOwnership(
  authenticatedMember: AuthenticatedMember | null | undefined,
  targetUser: { id: string; externalUserId: string }
): void {
  if (!authenticatedMember) {
    throw new UnauthorizedError('Authentication required to modify profile');
  }

  if (
    authenticatedMember.user.id !== targetUser.id ||
    authenticatedMember.user.externalUserId !== targetUser.externalUserId
  ) {
    throw new ForbiddenError(
      'Cross-profile mutations are strictly forbidden. You can only modify your own profile.'
    );
  }
}

/**
 * Validates that the authenticated member has administrative permissions.
 */
export function assertAdminMember(
  authenticatedMember: AuthenticatedMember | null | undefined
): void {
  if (!authenticatedMember) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!authenticatedMember.isAdmin) {
    throw new ForbiddenError('Administrative permissions required to perform this action');
  }
}

/**
 * Validates that the authenticated member has moderator or administrative permissions.
 */
export function assertModeratorMember(
  authenticatedMember: AuthenticatedMember | null | undefined
): void {
  if (!authenticatedMember) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!authenticatedMember.isModerator && !authenticatedMember.isAdmin) {
    throw new ForbiddenError('Moderation permissions required to perform this action');
  }
}

export function assertOwnerMember(member: AuthenticatedMember | null | undefined): void {
  if (!member) throw new UnauthorizedError('Authentication required');
  if (member.isOwner !== true || member.user.membershipStatus !== 'ACTIVE') {
    throw new ForbiddenError('Only the owner can manage staff permissions');
  }
}
