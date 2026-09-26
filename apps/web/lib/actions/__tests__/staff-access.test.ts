import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { createDb, users, profiles, profileSlugs, staffAccess, auditLogs, entitlements, communityRoles, memberRoles } from '@asc/db';
import type { AuthenticatedMember } from '@asc/types';
import { resolveMemberByIdentity } from '../../auth/identity';
import { setStaffAccess, getStaffAccessMembers } from '../staff-access-service';
import { setMemberPerks } from '../perks-service';
import { adminModerateProfileAction } from '../admin-service';
import { getMembersDirectory } from '../../queries/members';
import { getPublicProfileBySlug } from '../../queries/profiles';
import { getResolvedMemberEntitlements } from '../../queries/entitlements';
import { updateProfilePrivacyAction } from '../profile-service';

describe('Owner-managed website access', () => {
  let database: ReturnType<typeof createDb>;
  let file: string;
  let owner: AuthenticatedMember;
  const discordId = (id: number) => `10000000000000000${id}`;
  async function member(id = 2, clerkOwner = false) {
    const result = await resolveMemberByIdentity({ clerkUserId: `clerk-${id}`, discordSnowflake: discordId(id), database, isClerkOwner: clerkOwner });
    if (result.status !== 'RESOLVED') throw new Error('Missing test member');
    return result.member;
  }
  const grant = (role: 'ADMIN' | 'MODERATOR' | 'NONE', expectedRole: 'ADMIN' | 'MODERATOR' | 'NONE' = 'NONE') =>
    setStaffAccess({ targetUserId: 'member-2', role, expectedRole, reason: 'Approved community staff change' }, database, owner);

  beforeEach(async () => {
    file = path.join(os.tmpdir(), `asc-staff-test-${crypto.randomUUID()}.db`);
    database = createDb(`file:${file.replaceAll('\\', '/')}`);
    await migrate(database, { migrationsFolder: path.resolve(__dirname, '../../../../../packages/db/drizzle') });
    for (const id of [1, 2, 3]) {
      await database.insert(users).values({ id: `member-${id}`, externalUserId: discordId(id), username: `person${id}`, displayName: `Person ${id}`, firstJoinedAt: new Date(), lastSyncedAt: new Date() });
      await database.insert(profiles).values({ userId: `member-${id}`, bio: 'Keep my biography' });
      await database.insert(profileSlugs).values({ userId: `member-${id}`, slug: `person${id}`, isPrimary: true });
    }
    owner = await member(1, true);
  });
  afterEach(() => { database.$client.close(); try { fs.rmSync(file, { force: true }); } catch { /* Windows may retain a transaction handle until GC. */ } });

  it('grants an admin by canonical member identity and records the owner and change', async () => {
    expect(await grant('ADMIN')).toEqual({ success: true });
    expect(await member()).toMatchObject({ isAdmin: true, isModerator: true, isOwner: false, staffRole: 'ADMIN' });
    const audit = await database.query.auditLogs.findFirst();
    expect(audit).toMatchObject({ actorId: owner.user.id, targetId: 'member-2', action: 'UPDATE_STAFF_ACCESS' });
    expect(JSON.parse(audit!.metadata!)).toMatchObject({ previousRole: 'NONE', role: 'ADMIN' });
    expect((await getStaffAccessMembers(discordId(2), database, owner))[0]).toMatchObject({ id: 'member-2', role: 'ADMIN' });
  });

  it.each(['ADMIN', 'MODERATOR', 'NONE'] as const)('prevents %s members from managing staff access or reading the owner list', async role => {
    if (role !== 'NONE') await grant(role);
    const actor = await member();
    const result = await setStaffAccess({ targetUserId: 'member-3', role: 'ADMIN', expectedRole: 'NONE', reason: 'Attempt to promote a friend' }, database, actor);
    expect(result.success).toBe(false);
    await expect(getStaffAccessMembers('', database, actor)).rejects.toThrow('Only the owner');
    expect(await database.query.staffAccess.findFirst({ where: eq(staffAccess.userId, 'member-3') })).toBeUndefined();
  });

  it('cannot create owner access on the website or overwrite its Clerk authority', async () => {
    expect((await setStaffAccess({ targetUserId: 'member-1', role: 'ADMIN', expectedRole: 'NONE', reason: 'Change own access' }, database, owner)).success).toBe(false);
    const input = { targetUserId: 'member-2', role: 'OWNER', expectedRole: 'NONE', reason: 'Create another owner' };
    expect((await setStaffAccess(input as never, database, owner)).success).toBe(false);
    expect(await database.query.staffAccess.findMany()).toHaveLength(0);
    expect((await member(1, true)).isOwner).toBe(true);
    await expect(database.insert(staffAccess).values({ userId: 'member-2', role: 'OWNER' as never, grantedBy: owner.user.id })).rejects.toThrow();
  });

  it('does not derive website access from Discord admin roles', async () => {
    const [role] = await database.insert(communityRoles).values({ name: 'Discord Administrator', externalRoleId: 'discord-admin', isAdmin: true, isModerator: true }).returning();
    await database.insert(memberRoles).values({ userId: 'member-2', roleId: role.id });
    expect(await member()).toMatchObject({ isAdmin: false, isModerator: false, isOwner: false });
  });

  it.each(['LEFT', 'BANNED'] as const)('rejects new grants for %s members', async status => {
    await database.update(users).set({ membershipStatus: status }).where(eq(users.id, 'member-2'));
    expect((await grant('ADMIN')).success).toBe(false);
    expect(await database.query.staffAccess.findMany()).toHaveLength(0);
  });

  it('revokes access on the next server resolution without deleting the profile', async () => {
    await grant('ADMIN');
    expect((await member()).isAdmin).toBe(true);
    expect(await grant('NONE', 'ADMIN')).toEqual({ success: true });
    expect(await member()).toMatchObject({ isAdmin: false, isModerator: false, staffRole: null });
    expect(await database.query.profiles.findFirst({ where: eq(profiles.userId, 'member-2') })).toMatchObject({ bio: 'Keep my biography' });
  });

  it('does not silently overwrite a concurrent permission change', async () => {
    await grant('ADMIN');
    expect((await grant('MODERATOR', 'NONE')).success).toBe(false);
    expect((await member()).staffRole).toBe('ADMIN');
    expect(await database.query.auditLogs.findMany()).toHaveLength(1);
  });

  it('rolls back a grant when its audit record cannot be written', async () => {
    await database.$client.execute("CREATE TRIGGER reject_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END;");
    expect((await grant('ADMIN')).success).toBe(false);
    expect(await database.query.staffAccess.findMany()).toHaveLength(0);
  });

  it('suspends owner and staff access for former members while retaining grant history', async () => {
    await grant('ADMIN');
    await database.update(users).set({ membershipStatus: 'LEFT' }).where(eq(users.id, 'member-2'));
    expect(await member()).toMatchObject({ isAdmin: false, isModerator: false });
    expect(await database.query.staffAccess.findMany()).toHaveLength(1);
    await database.update(users).set({ membershipStatus: 'LEFT' }).where(eq(users.id, owner.user.id));
    expect(await member(1, true)).toMatchObject({ isOwner: false, isAdmin: false });
  });

  it('allows moderators to hide profiles but blocks content resets and customization grants', async () => {
    await grant('MODERATOR');
    const moderator = await member();
    expect((await adminModerateProfileAction({ targetUserId: 'member-3', action: 'HIDE_PROFILE', reason: 'Reported unsafe profile' }, database, moderator)).success).toBe(true);
    expect((await adminModerateProfileAction({ targetUserId: 'member-3', action: 'RESET_BIO', reason: 'Remove content' }, database, moderator)).success).toBe(false);
    expect((await setMemberPerks({ targetUserId: 'member-3', enabled: true, expectedEnabled: false, reason: 'Grant extras' }, database, moderator)).success).toBe(false);
    expect(await database.query.profiles.findFirst({ where: eq(profiles.userId, 'member-3') })).toMatchObject({ bio: 'Keep my biography', isModerated: true });
  });

  it('keeps moderation hidden after the member changes privacy, and strips discovery and public access', async () => {
    await grant('MODERATOR');
    await adminModerateProfileAction({ targetUserId: 'member-3', action: 'HIDE_PROFILE', reason: 'Reported unsafe profile' }, database, await member());
    const result = await updateProfilePrivacyAction({ isPrivate: false, showRoles: true, showMembershipDate: true, showTags: true, showLinks: true }, database, await member(3));
    expect(result.success).toBe(true);
    expect(await getPublicProfileBySlug('person3', database)).toEqual({ notFound: true });
    expect((await getMembersDirectory({ database })).some(item => item.username === 'person3')).toBe(false);
  });

  it('restores moderation without overriding a member’s own privacy preference', async () => {
    await database.update(profiles).set({ isPrivate: true, isModerated: true }).where(eq(profiles.userId, 'member-3'));
    await grant('MODERATOR');
    await adminModerateProfileAction({ targetUserId: 'member-3', action: 'UNHIDE_PROFILE', reason: 'Appeal accepted' }, database, await member());
    expect(await database.query.profiles.findFirst({ where: eq(profiles.userId, 'member-3') })).toMatchObject({ isPrivate: true, isModerated: false });
  });

  it('rolls back moderation when the audit write fails', async () => {
    await database.$client.execute("CREATE TRIGGER reject_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END;");
    expect((await adminModerateProfileAction({ targetUserId: 'member-3', action: 'HIDE_PROFILE', reason: 'Hide unsafe content' }, database, owner)).success).toBe(false);
    expect(await database.query.profiles.findFirst({ where: eq(profiles.userId, 'member-3') })).toMatchObject({ isModerated: false });
    expect(await database.query.moderationActions.findMany()).toHaveLength(0);
  });

  it('grants and revokes website perks without removing Discord-earned entitlements', async () => {
    await database.insert(entitlements).values({ userId: 'member-3', key: 'profile.custom_title', value: 'true', source: 'DISCORD_ROLE' });
    const input = { targetUserId: 'member-3', enabled: true, expectedEnabled: false, reason: 'Thank you for helping' };
    expect(await setMemberPerks(input, database, owner)).toEqual({ success: true });
    expect(await getResolvedMemberEntitlements(await member(3), database)).toMatchObject({ canProfileStudio: true, canCustomBackground: true, maxLinks: 10, maxTags: 10 });
    expect((await setMemberPerks(input, database, owner)).success).toBe(false);
    expect(await setMemberPerks({ ...input, enabled: false, expectedEnabled: true }, database, owner)).toEqual({ success: true });
    expect(await getResolvedMemberEntitlements(await member(3), database)).toMatchObject({ canProfileStudio: false, canCustomTitle: true, maxLinks: 5 });
    expect(await database.query.entitlements.findMany()).toHaveLength(1);
  });

  it('suspends website perks when a member leaves', async () => {
    await setMemberPerks({ targetUserId: 'member-3', enabled: true, expectedEnabled: false, reason: 'Community contributor' }, database, owner);
    await database.update(users).set({ membershipStatus: 'LEFT' }).where(eq(users.id, 'member-3'));
    expect(await getResolvedMemberEntitlements(await member(3), database)).toMatchObject({ canProfileStudio: false, canCustomBackground: false });
    expect((await getPublicProfileBySlug('person3', database)).profile?.entitlements.canProfileStudio).toBe(false);
  });
});
