import type { InferSelectModel } from 'drizzle-orm';
import type { targets } from '@/db/schema';

export type Target = InferSelectModel<typeof targets>;
