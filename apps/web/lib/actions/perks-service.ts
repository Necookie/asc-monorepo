import { and, eq, like, or } from 'drizzle-orm';
import { db, users, entitlements, auditLogs, type ASCDatabase } from '@asc/db';
import { adminPerksSchema, type AdminPerksInput } from '@asc/validation';
import { requireAdminMember } from '../auth/session';
import { assertAdminMember } from '../auth/guards';
import type { AuthenticatedMember } from '@asc/types';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

const source = 'WEBSITE_ADMIN';
const bundle = { 'profile.studio': 'true', 'profile.background': 'true', 'profile.custom_title': 'true', 'profile.max_links': '10', 'profile.max_tags': '10' };
export interface PerksMember { id: string; username: string; displayName: string; membershipStatus: string; enabled: boolean }

export async function getPerksMembers(search = '', database: ASCDatabase = db, adminOverride?: AuthenticatedMember): Promise<PerksMember[]> {
  const admin = adminOverride ?? await requireAdminMember(database);
  assertAdminMember(admin);
  const term = search.trim().slice(0, 100);
  const members = await database.query.users.findMany({
    where: term ? or(like(users.username, `%${term}%`), like(users.displayName, `%${term}%`), eq(users.externalUserId, term)) : undefined,
    columns: { id: true, username: true, displayName: true, membershipStatus: true },
    with: { entitlements: { where: eq(entitlements.source, source), columns: { key: true, value: true } } },
    orderBy: users.username, limit: 100,
  });
  return members.map(({ entitlements: grants, ...member }) => ({ ...member, enabled: grants.some(grant => grant.key === 'profile.studio' && grant.value === 'true') }));
}

export async function setMemberPerks(input: AdminPerksInput, database: ASCDatabase = db, adminOverride?: AuthenticatedMember) {
  try {
    const admin = adminOverride ?? await requireAdminMember(database);
    assertAdminMember(admin);
    const value = adminPerksSchema.parse(input);
    await database.transaction(async tx => {
      const member = await tx.query.users.findFirst({ where: eq(users.id, value.targetUserId) });
      if (!member) throw new Error('Member not found.');
      if (value.enabled && member.membershipStatus !== 'ACTIVE') throw new Error('Perks can only be granted to active members.');
      const existing = await tx.query.entitlements.findMany({ where: and(eq(entitlements.userId, member.id), eq(entitlements.source, source)) });
      const previous = existing.some(grant => grant.key === 'profile.studio' && grant.value === 'true');
      if (previous !== value.expectedEnabled) throw new Error('These perks changed. Refresh the page before saving.');
      if (previous === value.enabled) return;
      await tx.delete(entitlements).where(and(eq(entitlements.userId, member.id), eq(entitlements.source, source)));
      if (value.enabled) await tx.insert(entitlements).values(Object.entries(bundle).map(([key, grantValue]) => ({ userId: member.id, key, value: grantValue, source })));
      await tx.insert(auditLogs).values({ actorId: admin.user.id, action: 'UPDATE_CUSTOMIZATION_PERKS', targetType: 'USER', targetId: member.id,
        metadata: JSON.stringify({ enabled: value.enabled, previous, reason: value.reason }) });
    });
    try { revalidatePath('/', 'layout'); } catch { /* Outside Next.js in tests. */ }
    return { success: true as const };
  } catch (error) {
    unstable_rethrow(error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not update customization perks.' };
  }
}
