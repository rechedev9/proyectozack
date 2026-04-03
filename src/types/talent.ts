import type { InferSelectModel } from 'drizzle-orm';
import type { talents, talentTags, talentStats, talentSocials } from '@/db/schema';

export type Talent = InferSelectModel<typeof talents>;
export type TalentTag = InferSelectModel<typeof talentTags>;
export type TalentStat = InferSelectModel<typeof talentStats>;
export type TalentSocial = InferSelectModel<typeof talentSocials>;

export type TalentWithRelations = Talent & {
  tags: TalentTag[];
  stats: TalentStat[];
  socials: TalentSocial[];
};
