import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { AccountMenu } from '../layout/account-menu';

const auth = vi.hoisted(() => ({ isLoaded: false, isSignedIn: false, sessionId: null as string | null }));
const lifecycle = vi.hoisted(() => ({ effects: [] as (() => void | (() => void))[], refresh: vi.fn() }));
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal<typeof import('react')>(),
  useEffect: (effect: () => void | (() => void)) => { lifecycle.effects.push(effect); },
}));
vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ refresh: lifecycle.refresh }) }));
vi.mock('@clerk/nextjs', () => ({ useAuth: () => auth, SignOutButton: ({ children }: { children: React.ReactNode }) => children }));

describe('ASC account navigation', () => {
  beforeEach(() => {
    auth.isLoaded = false; auth.isSignedIn = false; auth.sessionId = null;
    lifecycle.effects = []; lifecycle.refresh.mockClear();
  });
  it('lets a browser-authenticated member recover a stale signed-out landing page', () => {
    auth.isLoaded = true;
    auth.isSignedIn = true;
    auth.sessionId = 'session-a';
    const html = renderToString(<AccountMenu account={{ status: 'SIGNED_OUT' }} />);
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('Open my profile');
    expect(html).not.toContain('href="/login"');
    lifecycle.effects[0]();
    lifecycle.effects[0]();
    expect(lifecycle.refresh).toHaveBeenCalledTimes(1);
  });

  it('does not repeatedly refresh matching or not-yet-loaded sessions', () => {
    renderToString(<AccountMenu account={{ status: 'SIGNED_OUT' }} />);
    lifecycle.effects[0]();
    expect(lifecycle.refresh).not.toHaveBeenCalled();
    lifecycle.effects = [];
    auth.isLoaded = true;
    renderToString(<AccountMenu account={{ status: 'SIGNED_OUT' }} />);
    lifecycle.effects[0]();
    lifecycle.effects[0]();
    expect(lifecycle.refresh).not.toHaveBeenCalled();
  });

  it('removes cached member actions after the browser session ends', () => {
    auth.isLoaded = true;
    const html = renderToString(<AccountMenu account={{ status: 'MEMBER', username: 'alex', displayName: 'Alex', avatar: null, slug: 'alex', isAdmin: true }} />);
    expect(html).toContain('Sign in');
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain('href="/alex"');
    lifecycle.effects[0]();
    lifecycle.effects[0]();
    expect(lifecycle.refresh).toHaveBeenCalledTimes(1);
  });
  it('does not assume an identity or expose account actions while streaming the session', () => {
    const html = renderToString(<AccountMenu account={{ status: 'LOADING' }} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('href=');
    expect(html).not.toContain('Sign Out');
  });
  it('links members to their own public profile and editing tools', () => {
    const html = renderToString(<AccountMenu account={{ status: 'MEMBER', username: 'alex', displayName: 'Alex', avatar: null, slug: 'alex-profile', isAdmin: false }} />);
    expect(html).toContain('href="/alex-profile"');
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/dashboard/appearance"');
    expect(html).toContain('href="/dashboard/privacy"');
    expect(html).toContain('Sign Out');
    expect(html).not.toContain('href="/admin"');
  });

  it('provides membership recovery instead of another person’s profile', () => {
    const html = renderToString(<AccountMenu account={{ status: 'NOT_FOUND' }} />);
    expect(html).toContain('href="/not-a-member"');
    expect(html).not.toContain('My Profile');
    expect(html).toContain('Sign out');
  });

  it('shows sign-in for visitors and retry for unavailable sessions', () => {
    expect(renderToString(<AccountMenu account={{ status: 'SIGNED_OUT' }} />)).toContain('Sign in');
    expect(renderToString(<AccountMenu account={{ status: 'UNAVAILABLE' }} />)).toContain('Retry sign-in');
  });
});
