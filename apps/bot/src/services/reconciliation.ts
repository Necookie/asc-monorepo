import { eq } from 'drizzle-orm';
import type { ASCDatabase } from '@asc/db';
import { users } from '@asc/db';
import type { ReconciliationSummary } from '@asc/types';
import type { SyncMemberData } from '../mappers/member';
import type { SyncRoleData } from '../mappers/role';
import { logger } from '../lib/logger';
import { MemberSyncService } from './member-sync';
import { RoleSyncService } from './role-sync';

export class ReconciliationService {
  private db: ASCDatabase;
  private memberSyncService: MemberSyncService;
  private roleSyncService: RoleSyncService;
  private log = logger.forSubsystem('Reconciliation');

  constructor(
    db: ASCDatabase,
    memberSyncService?: MemberSyncService,
    roleSyncService?: RoleSyncService
  ) {
    this.db = db;
    this.roleSyncService = roleSyncService || new RoleSyncService(db);
    this.memberSyncService = memberSyncService || new MemberSyncService(db, this.roleSyncService);
  }

  /**
   * Reconciles the ASC database state with authoritative Discord guild state.
   * Self-heals missed joins, departures, username updates, role drifts, and supporter perks.
   */
  async reconcileGuild(
    guildMembers: SyncMemberData[],
    guildRoles: SyncRoleData[]
  ): Promise<ReconciliationSummary> {
    const startTime = Date.now();
    this.log.info(`Starting reconciliation for ${guildMembers.length} members and ${guildRoles.length} roles...`);

    // 1. Synchronize all community roles first
    await this.roleSyncService.syncAllRoles(guildRoles);

    let addedCount = 0;
    let updatedCount = 0;
    let restoredCount = 0;
    let leftCount = 0;

    const activeDiscordSnowflakes = new Set<string>();

    // 2. Synchronize all active community members (excluding bots)
    for (const member of guildMembers) {
      if (member.isBot) {
        continue;
      }
      activeDiscordSnowflakes.add(member.externalUserId);

      // Check if user was previously marked LEFT
      const existing = await this.db.query.users.findFirst({
        where: eq(users.externalUserId, member.externalUserId),
      });

      const wasLeft = existing && existing.membershipStatus !== 'ACTIVE';

      const result = await this.memberSyncService.upsertMember(member);
      if (result.isNew) {
        addedCount++;
      } else if (wasLeft) {
        restoredCount++;
      } else {
        updatedCount++;
      }
    }

    // 3. Detect missed departures (members in DB as ACTIVE who are not in Discord)
    const activeAscUsers = await this.db.query.users.findMany({
      where: eq(users.membershipStatus, 'ACTIVE'),
    });

    for (const ascUser of activeAscUsers) {
      if (!activeDiscordSnowflakes.has(ascUser.externalUserId)) {
        await this.memberSyncService.handleMemberDeparture(ascUser.externalUserId);
        leftCount++;
      }
    }

    const durationMs = Date.now() - startTime;
    const summary: ReconciliationSummary = {
      scannedCount: guildMembers.length,
      addedCount,
      updatedCount,
      leftCount,
      restoredCount,
      durationMs,
      timestamp: new Date(),
    };

    this.log.info(
      `Reconciliation complete in ${durationMs}ms: +${addedCount} added, ~${updatedCount} updated, ↺${restoredCount} restored, -${leftCount} left.`
    );

    return summary;
  }
}
