import { sql, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  talents,
  caseStudies,
  contactSubmissions,
  giveaways,
  user,
} from '@/db/schema';
import { countAgencyCreators } from './agencyCreators';
import { getAllTalents } from './talents';
import { parseFollowers, formatCompact, totalFollowersForCreator } from '@/lib/format';

export type DashboardStats = {
  talentCount: number;
  publicCount: number;
  internalCount: number;
  agencyCount: number;
  caseCount: number;
  contactCount: number;
  activeBrandCount: number;
  activeGiveawayCount: number;
  followersByPlatform: Record<string, number>;
};

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  const [
    talentRows,
    publicRows,
    internalRows,
    agencyCount,
    caseRows,
    contactRows,
    brandRows,
    giveawayRows,
    allTalents,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(talents),
    db.select({ count: sql<number>`count(*)` }).from(talents).where(eq(talents.visibility, 'public')),
    db.select({ count: sql<number>`count(*)` }).from(talents).where(eq(talents.visibility, 'internal')),
    countAgencyCreators(),
    db.select({ count: sql<number>`count(*)` }).from(caseStudies),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions),
    db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'brand')),
    db.select({ count: sql<number>`count(*)` }).from(giveaways).where(gt(giveaways.endsAt, now)),
    getAllTalents(),
  ]);

  // Aggregate followers by platform across all talents
  const followersByPlatform: Record<string, number> = {};
  for (const t of allTalents) {
    for (const s of t.socials) {
      const parsed = parseFollowers(s.followersDisplay);
      followersByPlatform[s.platform] = (followersByPlatform[s.platform] ?? 0) + parsed;
    }
  }

  return {
    talentCount: talentRows[0]?.count ?? 0,
    publicCount: publicRows[0]?.count ?? 0,
    internalCount: internalRows[0]?.count ?? 0,
    agencyCount,
    caseCount: caseRows[0]?.count ?? 0,
    contactCount: contactRows[0]?.count ?? 0,
    activeBrandCount: brandRows[0]?.count ?? 0,
    activeGiveawayCount: giveawayRows[0]?.count ?? 0,
    followersByPlatform,
  };
}

export type TopCreator = {
  name: string;
  slug: string;
  totalFollowers: number;
  totalFormatted: string;
  socials: Array<{ platform: string; followersDisplay: string }>;
};

export async function getTopCreatorsByFollowers(limit = 5): Promise<TopCreator[]> {
  const allTalents = await getAllTalents();

  const ranked = allTalents
    .map((t) => ({
      name: t.name,
      slug: t.slug,
      totalFollowers: totalFollowersForCreator(t.socials),
      totalFormatted: formatCompact(totalFollowersForCreator(t.socials)),
      socials: t.socials.map((s) => ({
        platform: s.platform,
        followersDisplay: s.followersDisplay,
      })),
    }))
    .sort((a, b) => b.totalFollowers - a.totalFollowers)
    .slice(0, limit);

  return ranked;
}

export type RecentContact = {
  id: number;
  name: string;
  email: string;
  type: string;
  company: string | null;
  createdAt: Date;
};

export async function getRecentContacts(limit = 5): Promise<RecentContact[]> {
  const rows = await db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      email: contactSubmissions.email,
      type: contactSubmissions.type,
      company: contactSubmissions.company,
      createdAt: contactSubmissions.createdAt,
    })
    .from(contactSubmissions)
    .orderBy(sql`${contactSubmissions.createdAt} DESC`)
    .limit(limit);

  return rows;
}
