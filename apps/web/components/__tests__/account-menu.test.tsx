import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { AccountMenu } from '../layout/account-menu';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@clerk/nextjs', () => ({ SignOutButton: ({ children }: { children: React.ReactNode }) => children }));

describe('ASC account navigation', () => {
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
