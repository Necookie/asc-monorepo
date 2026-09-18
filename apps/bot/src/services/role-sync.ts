import { eq, inArray, and } from 'drizzle-orm';
import type { ASCDatabase } from '@asc/db';
import { communityRoles, memberRoles } from '@asc/db';
import type { SyncRoleData } from '../mappers/role';
import { logger } from '../lib/logger';

export class RoleSyncService {
  private db: ASCDatabase;
  private log = logger.forSubsystem('RoleSync');

  constructor(db: ASCDatabase) {
    this.db = db;
  }

  /**
   * Idempotently upserts a single community role.
   */
  async syncRole(role: SyncRoleData): Promise<string> {
    const existing = await this.db.query.communityRoles.findFirst({
      where: eq(communityRoles.externalRoleId, role.externalRoleId),
    });

    if (existing) {
      await this.db
        .update(communityRoles)
        .set({
          name: role.name,
          color: role.color,
          position: role.position,
          isSupporter: role.isSupporter,
          isAdmin: role.isAdmin,
          isModerator: role.isModerator,
          updatedAt: new Date(),
        })
        .where(eq(communityRoles.id, existing.id));
      return existing.id;
    } else {
      const inserted = await this.db
        .insert(communityRoles)
        .values({
          externalRoleId: role.externalRoleId,
          name: role.name,
          color: role.color,
          position: role.position,
          isSupporter: role.isSupporter,
          isAdmin: role.isAdmin,
          isModerator: role.isModerator,
        })
        .returning({ id: communityRoles.id });
      return inserted[0].id;
    }
  }

  /**
   * Idempotently upserts multiple community roles and returns a mapping from externalRoleId -> internal id.
   */
  async syncAllRoles(roles: SyncRoleData[]): Promise<Map<string, string>> {
    const idMap = new Map<string, string>();
    for (const role of roles) {
      const internalId = await this.syncRole(role);
      idMap.set(role.externalRoleId, internalId);
    }
    this.log.info(`Synchronized ${roles.length} community roles`);
    return idMap;
  }

  /**
   * Reconciles assigned roles for a given member in member_roles.
   */
  async reconcileMemberRoles(userId: string, externalRoleIds: string[]): Promise<void> {
    if (externalRoleIds.length === 0) {
      // Remove all roles for member
      await this.db.delete(memberRoles).where(eq(memberRoles.userId, userId));
      return;
    }

    // Resolve internal role IDs
    const matchedRoles = await this.db.query.communityRoles.findMany({
      where: inArray(communityRoles.externalRoleId, externalRoleIds),
    });
    const targetInternalRoleIds = new Set(matchedRoles.map((r) => r.id));

    // Fetch current member roles
    const currentMemberRoles = await this.db.query.memberRoles.findMany({
      where: eq(memberRoles.userId, userId),
    });
    const currentInternalRoleIds = new Set(currentMemberRoles.map((r) => r.roleId));

    // Determine additions and removals
    const toAdd = Array.from(targetInternalRoleIds).filter((id) => !currentInternalRoleIds.has(id));
    const toRemove = Array.from(currentInternalRoleIds).filter((id) => !targetInternalRoleIds.has(id));

    for (const roleId of toAdd) {
      await this.db
        .insert(memberRoles)
        .values({
          userId,
          roleId,
          assignedAt: new Date(),
        })
        .onConflictDoNothing();
    }

    for (const roleId of toRemove) {
      await this.db
        .delete(memberRoles)
        .where(and(eq(memberRoles.userId, userId), eq(memberRoles.roleId, roleId)));
    }

    this.log.debug(`Reconciled roles for user ${userId}: +${toAdd.length}, -${toRemove.length}`);
  }
}
