import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const moderationActions = sqliteTable(
  'moderation_actions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    targetUserId: text('target_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').notNull(),
    actionType: text('action_type').notNull(), // 'HIDE_PROFILE', 'RESET_BIO', etc.
    reason: text('reason').notNull(),
    metadata: text('metadata'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_moderation_actions_target').on(table.targetUserId),
    index('idx_moderation_actions_actor').on(table.actorUserId),
  ]
);

export type ModerationActionRow = typeof moderationActions.$inferSelect;
export type NewModerationActionRow = typeof moderationActions.$inferInsert;
