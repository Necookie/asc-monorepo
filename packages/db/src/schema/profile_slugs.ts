import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const profileSlugs = sqliteTable(
  'profile_slugs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    isPrimary: integer('is_primary', { mode: 'boolean' })
      .notNull()
      .default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    releasedAt: integer('released_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_profile_slugs_slug').on(table.slug),
    index('idx_profile_slugs_user_id').on(table.userId),
  ]
);

export type ProfileSlugRow = typeof profileSlugs.$inferSelect;
export type NewProfileSlugRow = typeof profileSlugs.$inferInsert;
