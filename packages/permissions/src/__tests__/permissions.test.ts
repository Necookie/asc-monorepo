import { describe, it, expect } from 'vitest';
import {
  assertOwnership,
  assertAdmin,
  assertModerator,
  UnauthorizedError,
  ForbiddenError,
} from '../index';
import type { CommunityRole } from '@asc/types';

describe('Permissions & Guards', () => {
  describe('assertOwnership', () => {
    it('allows mutation when authenticated external ID matches target ID', () => {
      expect(() =>
        assertOwnership('123456789012345678', '123456789012345678')
      ).not.toThrow();
    });

    it('throws UnauthorizedError when authenticated ID is missing or null', () => {
      expect(() =>
        assertOwnership(null, '123456789012345678')
      ).toThrow(UnauthorizedError);

      expect(() =>
        assertOwnership(undefined, '123456789012345678')
      ).toThrow(UnauthorizedError);
    });

    it('strictly throws ForbiddenError when IDs differ (User A cannot edit User B)', () => {
      expect(() =>
        assertOwnership('111111111111111111', '222222222222222222')
      ).toThrow(ForbiddenError);
    });
  });

  describe('assertAdmin', () => {
    const adminRole: CommunityRole = {
      id: 'role-1',
      externalRoleId: '1001',
      name: 'Administrator',
      color: '#ed4245',
      position: 10,
      isSupporter: false,
      isAdmin: true,
      isModerator: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const regularRole: CommunityRole = {
      id: 'role-2',
      externalRoleId: '1002',
      name: 'Member',
      color: '#5865f2',
      position: 1,
      isSupporter: false,
      isAdmin: false,
      isModerator: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('allows action when user possesses admin role', () => {
      expect(() => assertAdmin([adminRole, regularRole])).not.toThrow();
    });

    it('throws ForbiddenError when user has only regular roles', () => {
      expect(() => assertAdmin([regularRole])).toThrow(ForbiddenError);
    });

    it('throws ForbiddenError when roles array is empty', () => {
      expect(() => assertAdmin([])).toThrow(ForbiddenError);
    });
  });
});
