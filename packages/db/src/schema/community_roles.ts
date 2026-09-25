import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const communityRoles = sqliteTable(
  'community_roles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    externalRoleId: text('external_role_id').notNull().unique(), // Discord Role Snowflake
    name: text('name').notNull(),
    color: text('color').notNull().default('#5865f2'),
    position: integer('position').notNull().default(0),
    isSupporter: integer('is_supporter', { mode: 'boolean' })
      .notNull()
      .default(false),
    isAdmin: integer('is_admin', { mode: 'boolean' })
      .notNull()
      .default(false),
    isModerator: integer('is_moderator', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_community_roles_external_id').on(table.externalRoleId),
    index('idx_community_roles_is_supporter').on(table.isSupporter),
  ]
);

export type CommunityRoleRow = typeof communityRoles.$inferSelect;
export type NewCommunityRoleRow = typeof communityRoles.$inferInsert;
