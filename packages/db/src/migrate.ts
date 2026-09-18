import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './client';
import path from 'path';

export async function runMigrations() {
  const migrationsFolder = path.resolve(__dirname, '../drizzle');
  console.log(`Running database migrations from: ${migrationsFolder}`);
  try {
    await migrate(db, { migrationsFolder });
    console.log('Database migrations applied successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.endsWith('migrate.ts'))) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
