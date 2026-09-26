import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({ session: vi.fn(), redirect: vi.fn(), signIn: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ resolveCurrentSession: mocks.session }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@clerk/nextjs', () => ({
  SignIn: (props: Record<string, unknown>) => { mocks.signIn(props); return <div>Discord authentication</div>; },
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
}));

import LoginPage from '../[[...sign-in]]/page';
const visit = (steps?: string[]) => LoginPage({ params: Promise.resolve({ 'sign-in': steps }) });

describe('Discord login routing', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session.mockResolvedValue(null);
    mocks.redirect.mockImplementation((path: string) => { throw new Error(`redirect:${path}`); });
  });

  it('supports existing and first-time Clerk accounts without a separate registration route', async () => {
    renderToStaticMarkup(await visit());
    expect(mocks.signIn).toHaveBeenCalledWith(expect.objectContaining({
      routing: 'path', path: '/login', oauthFlow: 'redirect', withSignUp: true,
      forceRedirectUrl: '/dashboard', signUpForceRedirectUrl: '/dashboard',
    }));
  });

  it.each(['sso-callback', 'continue', 'verify-email-address'])('lets Clerk complete %s without an early member redirect', async (step) => {
    mocks.session.mockResolvedValue({ status: 'RESOLVED' });
    expect(renderToStaticMarkup(await visit([step]))).toContain('Discord authentication');
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each([['RESOLVED', '/dashboard'], ['NOT_FOUND', '/not-a-member']])('routes an already authenticated %s session from the base login URL', async (status, target) => {
    mocks.session.mockResolvedValue({ status });
    await expect(visit()).rejects.toThrow(`redirect:${target}`);
  });

  it('shows recovery instead of starting OAuth again during a service outage', async () => {
    mocks.session.mockResolvedValue({ status: 'UNAVAILABLE' });
    expect(renderToStaticMarkup(await visit())).toContain('Try again');
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('requires switching accounts when the current identity has no Discord link', async () => {
    mocks.session.mockResolvedValue({ status: 'UNLINKED_DISCORD' });
    expect(renderToStaticMarkup(await visit())).toContain('Sign out and try Discord');
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
