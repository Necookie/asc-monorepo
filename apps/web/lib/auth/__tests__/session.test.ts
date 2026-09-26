import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), resolveMember: vi.fn(), redirect: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ currentUser: mocks.currentUser }));
vi.mock('../identity', () => ({ resolveMemberByIdentity: mocks.resolveMember }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, unstable_rethrow: vi.fn() }));

import { resolveCurrentSession, requireAuthenticatedMember } from '../session';

describe('Member session recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.redirect.mockImplementation((path: string) => { throw new Error(`redirect:${path}`); });
  });

  it('distinguishes a signed-out visitor from a provider outage', async () => {
    mocks.currentUser.mockResolvedValue(null);
    expect(await resolveCurrentSession()).toBeNull();
    expect(mocks.resolveMember).not.toHaveBeenCalled();
    mocks.currentUser.mockRejectedValue(new Error('private provider detail'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await resolveCurrentSession()).toEqual({ status: 'UNAVAILABLE' });
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('private provider detail'));
    log.mockRestore();
  });

  it('rejects a signed-in account without a Discord provider', async () => {
    mocks.currentUser.mockResolvedValue({ id: 'clerk-a', externalAccounts: [] });
    expect(await resolveCurrentSession()).toEqual({ status: 'UNLINKED_DISCORD', clerkUserId: 'clerk-a' });
    expect(mocks.resolveMember).not.toHaveBeenCalled();
  });

  it('links the verified Discord ID rather than a username', async () => {
    mocks.currentUser.mockResolvedValue({ id: 'clerk-a', externalAccounts: [{ provider: 'oauth_discord', externalId: '123456789012345678', username: 'another-member' }] });
    mocks.resolveMember.mockResolvedValue({ status: 'RESOLVED', member: { primarySlug: 'own-profile' } });
    expect(await requireAuthenticatedMember()).toEqual({ primarySlug: 'own-profile' });
    expect(mocks.resolveMember).toHaveBeenCalledWith(expect.objectContaining({ clerkUserId: 'clerk-a', discordSnowflake: '123456789012345678' }));
  });

  it('shows a recoverable error when the member database is unavailable', async () => {
    mocks.currentUser.mockResolvedValue({ id: 'clerk-a', externalAccounts: [{ provider: 'oauth_discord', externalId: '123456789012345678' }] });
    mocks.resolveMember.mockRejectedValue(new Error('database secret'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(requireAuthenticatedMember()).rejects.toThrow('redirect:/login?error=service_unavailable');
    log.mockRestore();
  });

  it('sends an unsynchronized Discord account to membership recovery', async () => {
    mocks.currentUser.mockResolvedValue({ id: 'clerk-a', externalAccounts: [{ provider: 'oauth_discord', externalId: '123456789012345678' }] });
    mocks.resolveMember.mockResolvedValue({ status: 'NOT_FOUND' });
    await expect(requireAuthenticatedMember()).rejects.toThrow('redirect:/not-a-member');
  });

  it('redirects signed-out visitors to sign-in', async () => {
    mocks.currentUser.mockResolvedValue(null);
    await expect(requireAuthenticatedMember()).rejects.toThrow('redirect:/login');
  });
});
