import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const profiles = sqliteTable(
  'profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    bio: text('bio'),
    customTitle: text('custom_title'),
    accentColor: text('accent_color').notNull().default('#5865f2'),
    theme: text('theme', { enum: ['canvas', 'indigo', 'onyx'] })
      .notNull()
      .default('canvas'),
    backgroundUrl: text('background_url'),
    layout: text('layout', { enum: ['classic', 'split'] }).notNull().default('classic'),
    supporterLayout: text('supporter_layout', { enum: ['arcade', 'showcase'] }),
    typography: text('typography', { enum: ['balanced', 'bold', 'playful'] }).notNull().default('balanced'),
    avatarFrame: text('avatar_frame', { enum: ['none', 'pixel', 'neon', 'crest'] }).notNull().default('none'),
    coverTreatment: text('cover_treatment', { enum: ['solid', 'artwork', 'pattern'] }).notNull().default('solid'),
    coverPosition: integer('cover_position').notNull().default(50),
    motion: text('motion', { enum: ['off', 'subtle', 'lively'] }).notNull().default('subtle'),
    isPrivate: integer('is_private', { mode: 'boolean' })
      .notNull()
      .default(false),
    showRoles: integer('show_roles', { mode: 'boolean' })
      .notNull()
      .default(true),
    showMembershipDate: integer('show_membership_date', { mode: 'boolean' })
      .notNull()
      .default(true),
    showTags: integer('show_tags', { mode: 'boolean' })
      .notNull()
      .default(true),
    showLinks: integer('show_links', { mode: 'boolean' })
      .notNull()
      .default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_profiles_user_id').on(table.userId),
  ]
);

export type ProfileRow = typeof profiles.$inferSelect;
export type NewProfileRow = typeof profiles.$inferInsert;
