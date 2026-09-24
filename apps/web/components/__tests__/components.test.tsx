import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '../ui/button';
import { Card, CardTitle, CardContent } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { RoleChip } from '../identity/role-chip';
import { TagChip } from '../identity/tag-chip';
import { SupporterBadge } from '../identity/supporter-badge';
import { IdentityCard } from '../identity/identity-card';
import { MemberCard } from '../identity/member-card';
import { ProfileWidget } from '../ui/profile-widget';
import { LoadingState, EmptyState, ErrorState, LockedState } from '../ui/states';

describe('ASC Design System UI Components', () => {
  it('renders Button with primary, green, and danger variants', () => {
    const primaryHtml = renderToString(<Button variant="primary">Save</Button>);
    expect(primaryHtml).toContain('bg-primary');
    expect(primaryHtml).toContain('Save');

    const greenHtml = renderToString(<Button variant="green">Join ASC</Button>);
    expect(greenHtml).toContain('bg-[#35ed7e]');
    expect(greenHtml).toContain('Join ASC');

    const dangerHtml = renderToString(<Button variant="danger">Reset</Button>);
    expect(dangerHtml).toContain('bg-[#ed4245]');
  });

  it('renders Card with Raised Indigo surface tokens', () => {
    const html = renderToString(
      <Card>
        <CardTitle>Member Profile</CardTitle>
        <CardContent>Content details</CardContent>
      </Card>
    );
    expect(html).toContain('bg-surface-indigo');
    expect(html).toContain('Member Profile');
    expect(html).toContain('Content details');
  });

  it('renders Avatar with fallback and sizes', () => {
    const html = renderToString(<Avatar alt="Necookie" size={64} fallbackText="NC" />);
    expect(html).toContain('NC');
    expect(html).toContain('rounded-full');
  });

  it('renders RoleChip with distinct community role styling', () => {
    const html = renderToString(<RoleChip name="Administrator" color="#f47fff" isAdmin={true} />);
    expect(html).toContain('Administrator');
    expect(html).toContain('background-color:#f47fff');
  });

  it('renders TagChip with pill styling and subtle violet border', () => {
    const html = renderToString(<TagChip name="Developer" />);
    expect(html).toContain('Developer');
    expect(html).toContain('rounded-full');
  });

  it('renders SupporterBadge with a restrained supporter treatment', () => {
    const html = renderToString(<SupporterBadge />);
    expect(html).toContain('Supporter');
    expect(html).toContain('bg-[#ec48bd]/12');
    expect(html).toContain('text-[#ff9bda]');
  });

  it('renders IdentityCard with authoritative synchronized badge and fields', () => {
    const html = renderToString(
      <IdentityCard
        displayName="Dheyn"
        username="necookie"
        nickname="Cookie"
        roles={[{ id: '1', name: 'Developer', color: '#5865f2' }]}
        isSupporter={true}
        joinedAt={new Date('2024-01-01')}
      />
    );
    expect(html).toContain('Dheyn');
    expect(html).toContain('necookie');
    expect(html).toContain('Synced with ASC');
    expect(html).toContain('Developer');
    expect(html).toContain('Supporter');
  });

  it('renders MemberCard with link to profile', () => {
    const html = renderToString(
      <MemberCard
        slug="necookie"
        displayName="Dheyn"
        username="necookie"
        isSupporter={true}
        tags={[{ id: 't1', name: 'AI' }]}
      />
    );
    expect(html).toContain('href="/necookie"');
    expect(html).toContain('Dheyn');
    expect(html).toContain('necookie');
    expect(html).toContain('AI');
  });

  it('renders ProfileWidget container', () => {
    const html = renderToString(
      <ProfileWidget title="About">
        <p>User biography goes here.</p>
      </ProfileWidget>
    );
    expect(html).toContain('About');
    expect(html).toContain('User biography goes here.');
  });

  it('renders application states (Loading, Empty, Error, Locked)', () => {
    const loading = renderToString(<LoadingState message="Fetching members..." />);
    expect(loading).toContain('Fetching members...');

    const empty = renderToString(<EmptyState title="No members found" />);
    expect(empty).toContain('No members found');

    const error = renderToString(<ErrorState title="Connection failed" />);
    expect(error).toContain('Connection failed');

    const locked = renderToString(<LockedState perkName="Custom Background" />);
    expect(locked).toContain('Custom Background');
  });
});
