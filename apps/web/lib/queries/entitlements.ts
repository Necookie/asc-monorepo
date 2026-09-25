import { eq } from 'drizzle-orm';
import { db, entitlements, type ASCDatabase } from '@asc/db';
import { resolveMemberEntitlements } from '@asc/entitlements';
import type { AuthenticatedMember, EntitlementKey } from '@asc/types';

export async function getResolvedMemberEntitlements(member: AuthenticatedMember, database: ASCDatabase = db) {
  const grants = await database.query.entitlements.findMany({ where: eq(entitlements.userId, member.user.id) });
  return resolveMemberEntitlements(member.roles, grants.map((grant) => ({ ...grant, key: grant.key as EntitlementKey })));
}
