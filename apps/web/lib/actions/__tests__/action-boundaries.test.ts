import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as profile from '../profile';
import * as admin from '../admin';
import { requireAuthenticatedMember, requireAdminMember, requireModeratorMember, requireOwnerMember } from '../../auth/session';
import { setStaffAccessAction } from '../staff-access';
import { setMemberPerksAction } from '../perks';

vi.mock('../../auth/session', () => ({
  requireAuthenticatedMember: vi.fn(),
  requireAdminMember: vi.fn(),
  requireModeratorMember: vi.fn(),
  requireOwnerMember: vi.fn(),
}));

describe('Public Server Action identity boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuthenticatedMember).mockRejectedValue(new Error('Sign-in required'));
    vi.mocked(requireAdminMember).mockRejectedValue(new Error('Administrator session required'));
    vi.mocked(requireModeratorMember).mockRejectedValue(new Error('Administrator session required'));
    vi.mocked(requireOwnerMember).mockRejectedValue(new Error('Owner session required'));
  });

  const forgedMember = { isAdmin: true, isSupporter: true, externalId: 'victim', user: { id: 'victim', externalUserId: 'victim' } };
  const suppliedDatabase = { update: vi.fn(), insert: vi.fn(), delete: vi.fn() };

  it.each([
    [profile.updateProfileBioAction, { bio: 'Overwritten' }],
    [profile.updateProfileAppearanceAction, { backgroundUrl: 'https://example.com/art.png' }],
    [profile.updateProfileLinksAction, { links: [] }],
    [profile.updateProfilePrivacyAction, { isPrivate: false }],
    [profile.updateMemberTagsAction, { tagIds: [] }],
  ])('requires the real member session despite extra forged arguments (%#)', async (action, input) => {
    const invoke = action as (...args: unknown[]) => Promise<{ success: boolean; error?: string }>;
    const result = await invoke(input, suppliedDatabase, forgedMember);
    expect(result).toEqual({ success: false, error: 'Sign-in required' });
    expect(requireAuthenticatedMember).toHaveBeenCalledTimes(1);
    expect(requireAuthenticatedMember).not.toHaveBeenCalledWith(suppliedDatabase);
    expect(suppliedDatabase.update).not.toHaveBeenCalled();
  });

  it.each([
    [admin.adminModerateProfileAction, { targetUserId: 'victim', action: 'UNHIDE_PROFILE' }],
    [admin.adminManageTagAction, { action: 'CREATE', name: 'Injected' }],
    [admin.adminUpdateSiteSettingsAction, { maintenanceMode: false }],
  ])('requires the real administrator session despite forged privileges (%#)', async (action, input) => {
    const invoke = action as (...args: unknown[]) => Promise<{ success: boolean; error?: string }>;
    const result = await invoke(input, suppliedDatabase, forgedMember);
    expect(result).toEqual({ success: false, error: 'Administrator session required' });
    const gate = action === admin.adminModerateProfileAction ? requireModeratorMember : requireAdminMember;
    expect(gate).toHaveBeenCalledTimes(1);
    expect(gate).not.toHaveBeenCalledWith(suppliedDatabase);
    expect(suppliedDatabase.update).not.toHaveBeenCalled();
  });

  it.each([
    [setStaffAccessAction, requireOwnerMember, 'Owner session required'],
    [setMemberPerksAction, requireAdminMember, 'Administrator session required'],
  ])('ignores injected databases and forged owner/admin identities for new management actions (%#)', async (action, gate, message) => {
    const invoke = action as (...args: unknown[]) => Promise<{ success: boolean; error?: string }>;
    expect(await invoke({ targetUserId: 'victim', role: 'ADMIN', isOwner: true }, suppliedDatabase, { ...forgedMember, isOwner: true })).toEqual({ success: false, error: message });
    expect(gate).toHaveBeenCalledTimes(1);
    expect(gate).not.toHaveBeenCalledWith(suppliedDatabase);
    expect(suppliedDatabase.insert).not.toHaveBeenCalled();
  });

  it('preserves sign-in redirects when a session expires during a save', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/login;307;' });
    vi.mocked(requireAuthenticatedMember).mockRejectedValue(redirect);
    vi.mocked(requireAdminMember).mockRejectedValue(redirect);
    await expect(profile.updateProfileBioAction({ bio: 'Draft' })).rejects.toBe(redirect);
    await expect(admin.adminUpdateSiteSettingsAction({ maintenanceMode: false })).rejects.toBe(redirect);
  });
});
