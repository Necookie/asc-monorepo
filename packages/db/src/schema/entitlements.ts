import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const entitlements = sqliteTable(
  'entitlements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: text('value').notNull(),
    source: text('source').notNull(),
    grantedAt: integer('granted_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_entitlements_user_id').on(table.userId),
    index('idx_entitlements_key').on(table.key),
  ]
);

export type EntitlementRow = typeof entitlements.$inferSelect;
export type NewEntitlementRow = typeof entitlements.$inferInsert;
