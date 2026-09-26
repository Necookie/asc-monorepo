import type { SessionResolution } from './session';

export type NavigationAccount =
  | { status: 'LOADING' | 'SIGNED_OUT' | 'UNAVAILABLE' | 'UNLINKED_DISCORD' | 'NOT_FOUND' }
  | { status: 'MEMBER'; username: string; displayName: string; avatar: string | null; slug: string | null; isAdmin: boolean; isModerator?: boolean; isOwner?: boolean };

export function getNavigationAccount(session: SessionResolution | null): NavigationAccount {
  if (!session) return { status: 'SIGNED_OUT' };
  if (session.status !== 'RESOLVED') return { status: session.status };
  const { member } = session;
  return { status: 'MEMBER', username: member.user.username, displayName: member.user.displayName, avatar: member.user.avatar, slug: member.primarySlug, isAdmin: member.isAdmin, isModerator: member.isModerator === true, isOwner: member.isOwner === true };
}
