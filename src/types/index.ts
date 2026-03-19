import type { InferSelectModel } from 'drizzle-orm';
import type {
  talents,
  talentTags,
  talentStats,
  talentSocials,
  collaborators,
  teamMembers,
  brands,
  portfolioItems,
  caseStudies,
  caseBody,
  caseTags,
  caseCreators,
  contactSubmissions,
  posts,
  brandCampaigns,
  talentProposals,
} from '@/db/schema';

// ─── Base model types ────────────────────────────────────────────────────────

export type Talent = InferSelectModel<typeof talents>;
export type TalentTag = InferSelectModel<typeof talentTags>;
export type TalentStat = InferSelectModel<typeof talentStats>;
export type TalentSocial = InferSelectModel<typeof talentSocials>;

export type Collaborator = InferSelectModel<typeof collaborators>;
export type TeamMember = InferSelectModel<typeof teamMembers>;
export type Brand = InferSelectModel<typeof brands>;
export type PortfolioItem = InferSelectModel<typeof portfolioItems>;

export type CaseStudy = InferSelectModel<typeof caseStudies>;
export type CaseBodyRow = InferSelectModel<typeof caseBody>;
export type CaseTag = InferSelectModel<typeof caseTags>;
export type CaseCreator = InferSelectModel<typeof caseCreators>;

export type ContactSubmission = InferSelectModel<typeof contactSubmissions>;

export type Post = InferSelectModel<typeof posts>;

export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
export type TalentProposal = InferSelectModel<typeof talentProposals>;

// ─── With-relations types ────────────────────────────────────────────────────

export type TalentWithRelations = Talent & {
  tags: TalentTag[];
  stats: TalentStat[];
  socials: TalentSocial[];
};

export type CaseStudyWithRelations = CaseStudy & {
  body: CaseBodyRow[];
  tags: CaseTag[];
  creators: CaseCreator[];
};

export type BrandCampaignWithRelations = BrandCampaign & {
  talent: Talent;
  caseStudy: CaseStudy | null;
};

export type TalentProposalWithTalent = TalentProposal & {
  talent: Talent;
};
