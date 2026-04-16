import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const statsShares = pgTable('stats_shares', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  createdBy: text('created_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
}, (t) => [
  index('stats_shares_token_idx').on(t.token),
]);
