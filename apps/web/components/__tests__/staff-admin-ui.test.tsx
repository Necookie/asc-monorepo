import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ owner: false, admin: false, moderator: false, staffQuery: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/auth/session', () => ({
  requireOwnerMember: async () => { if (!state.owner) throw new Error('Owner required'); },
  requireModeratorMember: async () => ({ user: { username: 'alex' }, isOwner: state.owner, isAdmin: state.admin, isModerator: state.moderator }),
}));
vi.mock('@/lib/actions/staff-access-service', () => ({ getStaffAccessMembers: state.staffQuery }));
vi.mock('@/lib/actions/staff-access', () => ({ setStaffAccessAction: vi.fn() }));
vi.mock('@/lib/actions/admin', () => ({ adminModerateProfileAction: vi.fn() }));

import StaffPermissionsPage from '../../app/dashboard/permissions/page';
import AdminLayout from '../../app/admin/layout';
import { ProfileModerationPanel } from '../admin/profile-moderation-panel';
import type { AdminMemberItem } from '@/lib/queries/admin';

describe('Staff dashboard boundaries and controls', () => {
  beforeEach(() => { state.owner = false; state.admin = false; state.moderator = false; state.staffQuery.mockReset(); });

  it('checks owner authority before loading permission-management data', async () => {
    state.admin = true;
    await expect(StaffPermissionsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('Owner required');
    expect(state.staffQuery).not.toHaveBeenCalled();
  });

  it('renders the owner’s searchable access controls with the main account protected', async () => {
    state.owner = true;
    state.staffQuery.mockResolvedValue([
      { id: 'owner', displayName: 'Owner', username: 'owner', externalUserId: '100000000000000001', membershipStatus: 'ACTIVE', role: 'NONE', isCurrentOwner: true },
      { id: 'alex', displayName: 'Alex', username: 'alex', externalUserId: '100000000000000002', membershipStatus: 'ACTIVE', role: 'NONE', isCurrentOwner: false },
    ]);
    const html = renderToStaticMarkup(await StaffPermissionsPage({ searchParams: Promise.resolve({ search: 'alex' }) }));
    expect(html).toContain('Owner · Clerk');
    expect(html).toContain('Staff permissions');
    expect(html).toContain('Reason for this change');
    expect(html).toContain('value="MODERATOR"');
    expect(html).toContain('value="ADMIN"');
    expect(html).not.toContain('value="OWNER"');
  });

  it('shows moderators only the moderation area in the staff navigation', async () => {
    state.moderator = true;
    const html = renderToStaticMarkup(await AdminLayout({ children: <p>Staff content</p> }));
    expect(html).toContain('href="/admin/profiles"');
    for (const route of ['members', 'tags', 'settings', 'audit', 'perks']) expect(html).not.toContain(`href="/admin/${route}"`);
    expect(html).not.toContain('href="/dashboard/permissions"');
  });

  it('shows admins broader tools while keeping owner permission controls absent', async () => {
    state.admin = true; state.moderator = true;
    const html = renderToStaticMarkup(await AdminLayout({ children: <p>Admin content</p> }));
    expect(html).toContain('href="/admin/perks"');
    expect(html).toContain('href="/admin/settings"');
    expect(html).not.toContain('href="/dashboard/permissions"');
  });

  it('does not offer moderators content resets, even though administrators have them', () => {
    const members = [{ id: 'alex', username: 'alex', displayName: 'Alex', externalUserId: '100000000000000002', avatar: null, isPrivate: false, isModerated: false }] as AdminMemberItem[];
    const moderator = renderToStaticMarkup(<ProfileModerationPanel members={members} canResetContent={false} />);
    expect(moderator).toContain('Hide Profile');
    expect(moderator).not.toContain('Reset Bio');
    expect(moderator).not.toContain('Reset Outbound Links');
    expect(renderToStaticMarkup(<ProfileModerationPanel members={members} canResetContent />)).toContain('Reset Bio');
  });
});
