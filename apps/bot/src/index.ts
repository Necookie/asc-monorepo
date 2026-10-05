import * as dotenv from 'dotenv';
import { logger } from './lib/logger';
import { AscSyncBot } from './bot';
import { validateBotEnv } from '@asc/validation';

dotenv.config();

export * from './bot';
export * from './lib/logger';
export * from './lib/slug';
export * from './mappers/member';
export * from './mappers/role';
export * from './services/role-sync';
export * from './services/member-sync';
export * from './services/reconciliation';

async function main(): Promise<void> {
  const env = validateBotEnv();

  const bot = new AscSyncBot({
    token: env.DISCORD_TOKEN,
    guildId: env.DISCORD_GUILD_ID,
    syncIntervalMs: env.SYNC_INTERVAL,
  });

  const handleSignal = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    await bot.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGTERM', () => handleSignal('SIGTERM'));

  try {
    await bot.start();
  } catch (err) {
    logger.error('Failed to start ASC Discord bot', { error: String(err) });
    process.exit(1);
  }
}

// If executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch((err) => {
    logger.error('Fatal unhandled exception in bot process', { error: String(err) });
    process.exit(1);
  });
}
