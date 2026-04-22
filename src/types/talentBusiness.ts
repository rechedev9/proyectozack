import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { talentBusiness, talentVerticals } from '@/db/schema';

export type TalentBusiness = InferSelectModel<typeof talentBusiness>;
export type NewTalentBusiness = InferInsertModel<typeof talentBusiness>;

export type TalentVerticalRow = InferSelectModel<typeof talentVerticals>;
export type TalentVertical = TalentVerticalRow['vertical'];

