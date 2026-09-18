import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const membershipPeriods = sqliteTable(
  'membership_periods',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
    leftAt: integer('left_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_membership_periods_user_id').on(table.userId),
  ]
);

export type MembershipPeriodRow = typeof membershipPeriods.$inferSelect;
export type NewMembershipPeriodRow = typeof membershipPeriods.$inferInsert;
