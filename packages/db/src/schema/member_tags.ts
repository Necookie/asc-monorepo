import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { tags } from './tags';

export const memberTags = sqliteTable(
  'member_tags',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    assignedAt: integer('assigned_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('idx_member_tags_unique').on(table.userId, table.tagId),
    index('idx_member_tags_user_id').on(table.userId),
    index('idx_member_tags_tag_id').on(table.tagId),
  ]
);

export type MemberTagRow = typeof memberTags.$inferSelect;
export type NewMemberTagRow = typeof memberTags.$inferInsert;
