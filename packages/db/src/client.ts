import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables if running outside Next.js
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

export type ASCDatabase = LibSQLDatabase<typeof schema>;

import path from 'path';
import fs from 'fs';

function getDefaultDbUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  const candidates = [
    path.resolve(__dirname, '../local.db'),
    path.resolve(__dirname, '../../packages/db/local.db'),
    path.resolve(process.cwd(), 'packages/db/local.db'),
    path.resolve(process.cwd(), '../../packages/db/local.db'),
    path.resolve(process.cwd(), 'local.db'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }
  return 'file:local.db';
}

export function createDb(
  url: string = getDefaultDbUrl(),
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

const globalForDb = globalThis as unknown as {
  _ascDb?: ASCDatabase & { $client: Client };
};

export const db: ASCDatabase & { $client: Client } =
  globalForDb._ascDb ?? (globalForDb._ascDb = createDb());
