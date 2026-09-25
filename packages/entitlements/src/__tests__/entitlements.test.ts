import { describe, it, expect } from 'vitest';
import { resolveMemberEntitlements, resolveVisibleAppearance } from '../index';
import type { CommunityRole, Entitlement, AppearanceSettings } from '@asc/types';

describe('Entitlements Engine', () => {
  const supporterRole: CommunityRole = {
    id: 'role-supporter',
    externalRoleId: '999',
    name: 'Server Booster',
    color: '#ec48bd',
    position: 5,
    isSupporter: true,
    isAdmin: false,
    isModerator: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const standardRole: CommunityRole = {
    id: 'role-standard',
    externalRoleId: '888',
    name: 'Community Member',
    color: '#5865f2',
    position: 1,
    isSupporter: false,
    isAdmin: false,
    isModerator: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('resolves standard baseline for non-supporter', () => {
    const entitlements = resolveMemberEntitlements([standardRole]);
    expect(entitlements.canCustomBackground).toBe(false);
    expect(entitlements.canCustomTitle).toBe(false);
    expect(entitlements.canGradientAccent).toBe(false);
    expect(entitlements.maxLinks).toBe(5);
    expect(entitlements.maxTags).toBe(5);
  });

  it('grants custom background, title, and increased limits for supporter', () => {
    const entitlements = resolveMemberEntitlements([supporterRole]);
    expect(entitlements.canCustomBackground).toBe(true);
    expect(entitlements.canCustomTitle).toBe(true);
    expect(entitlements.canGradientAccent).toBe(true);
    expect(entitlements.maxLinks).toBe(10);
    expect(entitlements.maxTags).toBe(10);
  });

  it('honors active explicit entitlements override', () => {
    const explicitGrant: Entitlement = {
      id: 'ent-1',
      userId: 'user-1',
      key: 'profile.max_links',
      value: '20',
      source: 'ADMIN_GRANT',
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000), // +1 day
    };

    const entitlements = resolveMemberEntitlements([standardRole], [explicitGrant]);
    expect(entitlements.maxLinks).toBe(20);
  });

  it('ignores expired explicit entitlements', () => {
    const expiredGrant: Entitlement = {
      id: 'ent-2',
      userId: 'user-1',
      key: 'profile.background',
      value: 'true',
      source: 'TEMP_EVENT',
      grantedAt: new Date(Date.now() - 86400000 * 2),
      expiresAt: new Date(Date.now() - 86400000), // expired yesterday
    };

    const entitlements = resolveMemberEntitlements([standardRole], [expiredGrant]);
    expect(entitlements.canCustomBackground).toBe(false);
  });

  it('hides saved supporter styling after loss and restores it when access returns', () => {
    const saved: AppearanceSettings = { theme: 'indigo', accentColor: '#ec48bd', backgroundUrl: 'https://example.com/art.jpg', layout: 'split', supporterLayout: 'showcase', typography: 'playful', avatarFrame: 'crest', coverTreatment: 'artwork', coverPosition: 73, motion: 'lively' };
    const lost = resolveVisibleAppearance(saved, resolveMemberEntitlements([standardRole]));
    expect(lost.activeLayout).toBe('split');
    expect(lost.backgroundUrl).toBeNull();
    expect(lost.avatarFrame).toBe('none');
    const restored = resolveVisibleAppearance(saved, resolveMemberEntitlements([supporterRole]));
    expect(restored.activeLayout).toBe('showcase');
    expect(restored.backgroundUrl).toBe(saved.backgroundUrl);
    expect(restored.avatarFrame).toBe('crest');
    expect(restored.coverPosition).toBe(73);
  });

  it('honors active explicit studio grants and ignores expired ones', () => {
    const grant: Entitlement = { id: 'studio', userId: 'member', key: 'profile.studio', value: 'true', source: 'ADMIN_GRANT', grantedAt: new Date(), expiresAt: new Date(Date.now() + 1000) };
    expect(resolveMemberEntitlements([standardRole], [grant]).canProfileStudio).toBe(true);
    expect(resolveMemberEntitlements([standardRole], [{ ...grant, expiresAt: new Date(Date.now() - 1000) }]).canProfileStudio).toBe(false);
  });
});
