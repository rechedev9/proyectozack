import type { InferSelectModel } from 'drizzle-orm';
import type { brands, brandCampaigns, talentProposals } from '@/db/schema';
import type { Talent } from './talent';
import type { CaseStudy } from './case';

export type Brand = InferSelectModel<typeof brands>;
export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
export type TalentProposal = InferSelectModel<typeof talentProposals>;

export type BrandCampaignWithRelations = BrandCampaign & {
  talent: Talent;
  caseStudy: CaseStudy | null;
};

export type TalentProposalWithTalent = TalentProposal & {
  talent: Talent;
};
