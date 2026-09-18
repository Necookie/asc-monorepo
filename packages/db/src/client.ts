import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables if running outside Next.js
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

export type ASCDatabase = LibSQLDatabase<typeof schema>;

export function createDb(
  url: string = process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: string | undefined = process.env.TURSO_AUTH_TOKEN
): ASCDatabase & { $client: Client } {
  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  const db = drizzle(client, { schema }) as ASCDatabase & { $client: Client };
  db.$client = client;
  return db;
}

export const db = createDb();
