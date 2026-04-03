import type { InferSelectModel } from 'drizzle-orm';
import type { talentMetricSnapshots } from '@/db/schema';

export type TalentMetricSnapshot = InferSelectModel<typeof talentMetricSnapshots>;
