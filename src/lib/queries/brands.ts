import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brandCampaigns, talentProposals } from '@/db/schema';
import type { BrandCampaignWithRelations, TalentProposalWithTalent } from '@/types';

export async function getBrandCampaigns(brandUserId: string): Promise<BrandCampaignWithRelations[]> {
  const rows = await db.query.brandCampaigns.findMany({
    where: eq(brandCampaigns.brandUserId, brandUserId),
    with: {
      talent: true,
      caseStudy: true,
    },
    orderBy: [desc(brandCampaigns.createdAt)],
  });
  return rows as BrandCampaignWithRelations[];
}

export async function getBrandProposals(brandUserId: string): Promise<TalentProposalWithTalent[]> {
  const rows = await db.query.talentProposals.findMany({
    where: eq(talentProposals.brandUserId, brandUserId),
    with: {
      talent: true,
    },
    orderBy: [desc(talentProposals.createdAt)],
  });
  return rows as TalentProposalWithTalent[];
}

export async function getTalentCampaignsForBrand(
  brandUserId: string,
  talentId: number,
): Promise<BrandCampaignWithRelations[]> {
  const rows = await db.query.brandCampaigns.findMany({
    where: and(
      eq(brandCampaigns.brandUserId, brandUserId),
      eq(brandCampaigns.talentId, talentId),
    ),
    with: {
      talent: true,
      caseStudy: true,
    },
    orderBy: [desc(brandCampaigns.createdAt)],
  });
  return rows as BrandCampaignWithRelations[];
}
