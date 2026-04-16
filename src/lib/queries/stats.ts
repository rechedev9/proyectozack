import { eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talents, talentSocials, statsShares } from '@/db/schema';
import { parseFollowers, formatCompact } from '@/lib/format';

export type StatsGeoEntry = {
  readonly country: string;
  readonly pct: number;
};

export type StatsRow = {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly platform: 'youtube' | 'twitch';
  readonly socials: ReadonlyArray<{
    readonly id: number;
    readonly platform: string;
    readonly handle: string;
    readonly followersDisplay: string;
    readonly profileUrl: string | null;
  }>;
  readonly totalFollowers: number;
  readonly totalFormatted: string;
  readonly topGeos: StatsGeoEntry[] | null;
  readonly audienceLanguage: string | null;
};

export type StatsRollup = {
  readonly totalReach: number;
  readonly totalReachFormatted: string;
  readonly channelCount: number;
  readonly avgReachPerChannel: number;
  readonly avgReachFormatted: string;
  readonly topGeoAggregate: ReadonlyArray<{ country: string; weight: number }>;
  readonly rows: StatsRow[];
};

function buildRollup(
  rows: Array<typeof talents.$inferSelect & { socials: Array<typeof talentSocials.$inferSelect> }>,
): StatsRollup {
  const statsRows: StatsRow[] = rows
    .map((t) => {
      const totalFollowers = t.socials.reduce(
        (sum, s) => sum + parseFollowers(s.followersDisplay),
        0,
      );
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        platform: t.platform,
        socials: t.socials.map((s) => ({
          id: s.id,
          platform: s.platform,
          handle: s.handle,
          followersDisplay: s.followersDisplay,
          profileUrl: s.profileUrl,
        })),
        totalFollowers,
        totalFormatted: totalFollowers > 0 ? formatCompact(totalFollowers) : '-',
        topGeos: t.topGeos ?? null,
        audienceLanguage: t.audienceLanguage ?? null,
      } satisfies StatsRow;
    })
    .sort((a, b) => {
      // Talents with no followers go to the bottom
      if (a.totalFollowers === 0 && b.totalFollowers === 0) return 0;
      if (a.totalFollowers === 0) return 1;
      if (b.totalFollowers === 0) return -1;
      return b.totalFollowers - a.totalFollowers;
    });

  let totalReach = 0;
  const geoWeights = new Map<string, number>();
  for (const row of statsRows) {
    totalReach += row.totalFollowers;
    if (row.topGeos) {
      for (const g of row.topGeos) {
        // followers × share = reach-weighted contribution per country
        const weight = (row.totalFollowers * g.pct) / 100;
        geoWeights.set(g.country, (geoWeights.get(g.country) ?? 0) + weight);
      }
    }
  }

  const channelCount = statsRows.length;
  const avgReachPerChannel = channelCount > 0 ? Math.round(totalReach / channelCount) : 0;

  const topGeoAggregate = [...geoWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([country, weight]) => ({ country, weight }));

  return {
    totalReach,
    totalReachFormatted: totalReach > 0 ? formatCompact(totalReach) : '0',
    channelCount,
    avgReachPerChannel,
    avgReachFormatted: avgReachPerChannel > 0 ? formatCompact(avgReachPerChannel) : '0',
    topGeoAggregate,
    rows: statsRows,
  };
}

async function fetchAllTalentsWithSocials(): Promise<
  Array<typeof talents.$inferSelect & { socials: Array<typeof talentSocials.$inferSelect> }>
> {
  return db.query.talents.findMany({
    with: {
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
}

export async function getStatsRollup(): Promise<StatsRollup> {
  const rows = await fetchAllTalentsWithSocials();
  return buildRollup(rows);
}

export async function getStatsRollupByToken(token: string): Promise<StatsRollup | null> {
  const share = await db
    .select()
    .from(statsShares)
    .where(eq(statsShares.token, token))
    .limit(1)
    .then((r) => r[0]);

  if (!share || share.revokedAt !== null) return null;

  const rows = await fetchAllTalentsWithSocials();
  return buildRollup(rows);
}

export async function getActiveStatsShares(): Promise<
  Array<typeof statsShares.$inferSelect>
> {
  return db.select().from(statsShares).where(isNull(statsShares.revokedAt));
}
