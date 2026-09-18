import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';

export const profileLinks = sqliteTable(
  'profile_links',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    url: text('url').notNull(),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_profile_links_profile_id').on(table.profileId),
  ]
);

export type ProfileLinkRow = typeof profileLinks.$inferSelect;
export type NewProfileLinkRow = typeof profileLinks.$inferInsert;
