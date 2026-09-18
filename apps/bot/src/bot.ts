import {
  Client,
  GatewayIntentBits,
  Events,
  type Guild,
  type GuildMember,
  type User,
  type PartialGuildMember,
} from 'discord.js';
import type { ASCDatabase } from '@asc/db';
import { db } from '@asc/db';
import { logger } from './lib/logger';
import { RoleSyncService } from './services/role-sync';
import { MemberSyncService } from './services/member-sync';
import { ReconciliationService } from './services/reconciliation';
import { mapGuildMemberToSyncData, mapUserToSyncData } from './mappers/member';
import { mapDiscordRoleToSyncData } from './mappers/role';

export interface BotConfig {
  token: string;
  guildId: string;
  syncIntervalMs?: number;
}

export class AscSyncBot {
  private client: Client;
  private config: BotConfig;
  private db: ASCDatabase;
  private roleSyncService: RoleSyncService;
  private memberSyncService: MemberSyncService;
  private reconciliationService: ReconciliationService;
  private reconTimer: NodeJS.Timeout | null = null;
  private log = logger.forSubsystem('Gateway');

  constructor(config: BotConfig, database: ASCDatabase = db) {
    this.config = config;
    this.db = database;
    this.roleSyncService = new RoleSyncService(this.db);
    this.memberSyncService = new MemberSyncService(this.db, this.roleSyncService);
    this.reconciliationService = new ReconciliationService(
      this.db,
      this.memberSyncService,
      this.roleSyncService
    );

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.client.once(Events.ClientReady, async (readyClient) => {
      this.log.info(`Discord Gateway connected as ${readyClient.user.tag}`);
      await this.runInitialSync();
      this.scheduleReconciliation();
    });

    this.client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
      if (member.guild.id !== this.config.guildId || member.user.bot) {
        return;
      }
      try {
        const syncData = mapGuildMemberToSyncData(member);
        await this.memberSyncService.upsertMember(syncData);
        this.log.info(`Handled guildMemberAdd: @${member.user.username}`);
      } catch (err) {
        this.log.error(`Failed to process guildMemberAdd for ${member.id}`, { error: String(err) });
      }
    });

    this.client.on(
      Events.GuildMemberRemove,
      async (member: GuildMember | PartialGuildMember) => {
        if (member.guild.id !== this.config.guildId) {
          return;
        }
        try {
          await this.memberSyncService.handleMemberDeparture(member.id);
          this.log.info(`Handled guildMemberRemove: ${member.id}`);
        } catch (err) {
          this.log.error(`Failed to process guildMemberRemove for ${member.id}`, {
            error: String(err),
          });
        }
      }
    );

    this.client.on(
      Events.GuildMemberUpdate,
      async (_oldMember, newMember: GuildMember) => {
        if (newMember.guild.id !== this.config.guildId || newMember.user.bot) {
          return;
        }
        try {
          const syncData = mapGuildMemberToSyncData(newMember);
          await this.memberSyncService.upsertMember(syncData);
          this.log.debug(`Handled guildMemberUpdate: @${newMember.user.username}`);
        } catch (err) {
          this.log.error(`Failed to process guildMemberUpdate for ${newMember.id}`, {
            error: String(err),
          });
        }
      }
    );

    this.client.on(Events.UserUpdate, async (_oldUser, newUser: User) => {
      if (newUser.bot) {
        return;
      }
      try {
        const syncData = mapUserToSyncData(newUser);
        await this.memberSyncService.handleUserUpdate(syncData);
        this.log.debug(`Handled userUpdate: @${newUser.username}`);
      } catch (err) {
        this.log.error(`Failed to process userUpdate for ${newUser.id}`, {
          error: String(err),
        });
      }
    });

    this.client.on(Events.Error, (error) => {
      this.log.error('Discord client error encountered', { error: error.message });
    });
  }

  private async fetchGuild(): Promise<Guild | null> {
    try {
      return await this.client.guilds.fetch(this.config.guildId);
    } catch (err) {
      this.log.error(`Failed to fetch target guild ${this.config.guildId}`, { error: String(err) });
      return null;
    }
  }

  async runInitialSync(): Promise<void> {
    const guild = await this.fetchGuild();
    if (!guild) {
      this.log.warn(`Cannot perform sync: guild ${this.config.guildId} not found`);
      return;
    }

    try {
      this.log.info(`Fetching roles and members for guild: ${guild.name} (${guild.id})...`);
      const [fetchedRoles, fetchedMembers] = await Promise.all([
        guild.roles.fetch(),
        guild.members.fetch(),
      ]);

      const roleData = Array.from(fetchedRoles.values()).map(mapDiscordRoleToSyncData);
      const memberData = Array.from(fetchedMembers.values()).map(mapGuildMemberToSyncData);

      await this.reconciliationService.reconcileGuild(memberData, roleData);
      this.log.info('Initial guild synchronization completed successfully');
    } catch (err) {
      this.log.error('Initial guild synchronization failed', { error: String(err) });
    }
  }

  private scheduleReconciliation(): void {
    const interval = this.config.syncIntervalMs || 12 * 60 * 60 * 1000; // 12 hours
    this.reconTimer = setInterval(async () => {
      this.log.info('Executing scheduled periodic reconciliation cycle...');
      await this.runInitialSync();
    }, interval);
    this.log.info(`Scheduled background reconciliation every ${interval}ms`);
  }

  async start(): Promise<void> {
    this.log.info('Starting ASC Synchronization Bot...');
    await this.client.login(this.config.token);
  }

  async stop(): Promise<void> {
    this.log.info('Stopping ASC Synchronization Bot...');
    if (this.reconTimer) {
      clearInterval(this.reconTimer);
      this.reconTimer = null;
    }
    this.client.destroy();
    this.log.info('Bot Gateway connection cleanly closed');
  }
}
