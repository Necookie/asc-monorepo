import { eq, like, or, desc, sql } from 'drizzle-orm';
import { db, users, staffAccess, auditLogs, type ASCDatabase } from '@asc/db';
import { staffAccessSchema, type StaffAccessInput } from '@asc/validation';
import { requireOwnerMember } from '../auth/session';
import { assertOwnerMember } from '../auth/guards';
import type { AuthenticatedMember } from '@asc/types';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

export type StaffAccessRole = 'ADMIN' | 'MODERATOR' | 'NONE';
export interface StaffAccessItem {
  id: string;
  username: string;
  displayName: string;
  externalUserId: string;
  membershipStatus: string;
  role: StaffAccessRole;
  isCurrentOwner: boolean;
}

export async function getStaffAccessMembers(search = '', database: ASCDatabase = db, ownerOverride?: AuthenticatedMember): Promise<StaffAccessItem[]> {
  const owner = ownerOverride ?? await requireOwnerMember(database);
  assertOwnerMember(owner);
  const term = search.trim().slice(0, 100);
  const rows = await database.select({ id: users.id, username: users.username, displayName: users.displayName,
    externalUserId: users.externalUserId, membershipStatus: users.membershipStatus, role: staffAccess.role })
    .from(users).leftJoin(staffAccess, eq(users.id, staffAccess.userId))
    .where(term ? or(like(users.username, `%${term}%`), like(users.displayName, `%${term}%`), eq(users.externalUserId, term)) : undefined)
    .orderBy(desc(sql`${users.id} = ${owner.user.id}`), desc(staffAccess.role), users.username).limit(100);
  return rows.map(row => ({ ...row, role: row.role ?? 'NONE', isCurrentOwner: row.id === owner.user.id }));
}

// Test injection is internal only. The public Server Action accepts validated input alone.
export async function setStaffAccess(input: StaffAccessInput, database: ASCDatabase = db, ownerOverride?: AuthenticatedMember) {
  try {
    const owner = ownerOverride ?? await requireOwnerMember(database);
    assertOwnerMember(owner);
    const validated = staffAccessSchema.parse(input);
    if (validated.targetUserId === owner.user.id) throw new Error('Your owner access is managed in Clerk, not on this page.');
    await database.transaction(async tx => {
      const target = await tx.query.users.findFirst({ where: eq(users.id, validated.targetUserId) });
      if (!target) throw new Error('Member not found.');
      if (validated.role !== 'NONE' && target.membershipStatus !== 'ACTIVE') throw new Error('Access can only be granted to active members.');
      const previous = await tx.query.staffAccess.findFirst({ where: eq(staffAccess.userId, target.id) });
      const previousRole = previous?.role ?? 'NONE';
      if (previousRole !== validated.expectedRole) throw new Error('This member’s access changed. Refresh the page before saving.');
      if (previousRole === validated.role) return;
      if (validated.role === 'NONE') {
        await tx.delete(staffAccess).where(eq(staffAccess.userId, target.id));
      } else {
        await tx.insert(staffAccess).values({ userId: target.id, role: validated.role, grantedBy: owner.user.id })
          .onConflictDoUpdate({ target: staffAccess.userId, set: { role: validated.role, grantedBy: owner.user.id, updatedAt: new Date() } });
      }
      await tx.insert(auditLogs).values({ actorId: owner.user.id, action: 'UPDATE_STAFF_ACCESS', targetType: 'USER', targetId: target.id,
        metadata: JSON.stringify({ previousRole, role: validated.role, reason: validated.reason }) });
    });
    try { revalidatePath('/dashboard/permissions'); revalidatePath('/', 'layout'); } catch { /* Outside a Next request in tests. */ }
    return { success: true as const };
  } catch (error) {
    unstable_rethrow(error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not update staff access.' };
  }
}
