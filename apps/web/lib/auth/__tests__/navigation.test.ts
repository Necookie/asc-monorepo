import { describe, expect, it } from 'vitest';
import { getNavigationAccount } from '../navigation';
import type { AuthenticatedMember } from '@asc/types';

describe('Public navigation account data', () => {
  it('serializes only the account fields needed by navigation', () => {
    const member = { user: { id: 'internal', externalUserId: '123456789012345678', clerkUserId: 'clerk-secret', username: 'alex', displayName: 'Alex', avatar: null }, profile: { bio: 'private biography' }, roles: [{ name: 'hidden role' }], primarySlug: 'alex', isAdmin: false } as unknown as AuthenticatedMember;
    expect(getNavigationAccount({ status: 'RESOLVED', member })).toEqual({ status: 'MEMBER', username: 'alex', displayName: 'Alex', avatar: null, slug: 'alex', isAdmin: false });
  });

  it('preserves recovery states without serializing identity IDs', () => {
    expect(getNavigationAccount(null)).toEqual({ status: 'SIGNED_OUT' });
    expect(getNavigationAccount({ status: 'NOT_FOUND', discordSnowflake: '123456789012345678', clerkUserId: 'clerk-secret' })).toEqual({ status: 'NOT_FOUND' });
    expect(getNavigationAccount({ status: 'UNLINKED_DISCORD', clerkUserId: 'clerk-secret' })).toEqual({ status: 'UNLINKED_DISCORD' });
    expect(getNavigationAccount({ status: 'UNAVAILABLE' })).toEqual({ status: 'UNAVAILABLE' });
  });
});
