import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { communityRoles } from './community_roles';

export const memberRoles = sqliteTable(
  'member_roles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => communityRoles.id, { onDelete: 'cascade' }),
    assignedAt: integer('assigned_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('idx_member_roles_unique').on(table.userId, table.roleId),
    index('idx_member_roles_user_id').on(table.userId),
    index('idx_member_roles_role_id').on(table.roleId),
  ]
);

export type MemberRoleRow = typeof memberRoles.$inferSelect;
export type NewMemberRoleRow = typeof memberRoles.$inferInsert;
