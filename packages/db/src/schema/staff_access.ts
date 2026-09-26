import { check, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

// Website access is independent of synchronized Discord roles.
export const staffAccess = sqliteTable('staff_access', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['ADMIN', 'MODERATOR'] }).notNull(),
  grantedBy: text('granted_by').notNull().references(() => users.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [check('staff_access_role_check', sql`${table.role} in ('ADMIN', 'MODERATOR')`)]);
