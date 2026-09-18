import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    externalUserId: text('external_user_id').notNull().unique(), // Immutable Discord Snowflake
    clerkUserId: text('clerk_user_id').unique(),
    username: text('username').notNull(),
    displayName: text('display_name').notNull(),
    nickname: text('nickname'),
    avatar: text('avatar'),
    membershipStatus: text('membership_status', {
      enum: ['ACTIVE', 'LEFT', 'BANNED'],
    })
      .notNull()
      .default('ACTIVE'),
    firstJoinedAt: integer('first_joined_at', { mode: 'timestamp' }).notNull(),
    leftAt: integer('left_at', { mode: 'timestamp' }),
    lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_users_external_user_id').on(table.externalUserId),
    index('idx_users_clerk_user_id').on(table.clerkUserId),
    index('idx_users_username').on(table.username),
  ]
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
