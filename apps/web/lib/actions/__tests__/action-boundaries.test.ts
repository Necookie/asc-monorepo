import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as profile from '../profile';
import * as admin from '../admin';
import { requireAuthenticatedMember, requireAdminMember } from '../../auth/session';

vi.mock('../../auth/session', () => ({
  requireAuthenticatedMember: vi.fn(),
  requireAdminMember: vi.fn(),
}));

describe('Public Server Action identity boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuthenticatedMember).mockRejectedValue(new Error('Sign-in required'));
    vi.mocked(requireAdminMember).mockRejectedValue(new Error('Administrator session required'));
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
    expect(requireAdminMember).toHaveBeenCalledTimes(1);
    expect(requireAdminMember).not.toHaveBeenCalledWith(suppliedDatabase);
    expect(suppliedDatabase.update).not.toHaveBeenCalled();
  });

  it('preserves sign-in redirects when a session expires during a save', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/login;307;' });
    vi.mocked(requireAuthenticatedMember).mockRejectedValue(redirect);
    vi.mocked(requireAdminMember).mockRejectedValue(redirect);
    await expect(profile.updateProfileBioAction({ bio: 'Draft' })).rejects.toBe(redirect);
    await expect(admin.adminUpdateSiteSettingsAction({ maintenanceMode: false })).rejects.toBe(redirect);
  });
});
