import { pgTable, serial, integer, text, date, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';

export const talentMetricSnapshots = pgTable('talent_metric_snapshots', {
  id: serial('id').primaryKey(),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // 'youtube' | 'twitch'
  metricType: text('metric_type').notNull(), // 'subscribers' | 'followers'
  value: integer('value').notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  index('tms_talent_date_idx').on(t.talentId, t.snapshotDate),
  index('tms_platform_idx').on(t.platform),
  unique('tms_unique_snapshot').on(t.talentId, t.platform, t.metricType, t.snapshotDate),
]);

export const talentMetricSnapshotsRelations = relations(talentMetricSnapshots, ({ one }) => ({
  talent: one(talents, { fields: [talentMetricSnapshots.talentId], references: [talents.id] }),
}));
