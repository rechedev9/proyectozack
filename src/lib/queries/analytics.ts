import { eq, and, gte, lte, inArray, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talentMetricSnapshots, talentSocials } from '@/db/schema';
import { normalizeTrackablePlatform, TRACKABLE_SOCIAL_PLATFORM_KEYS } from '@/lib/platform';
import type { TalentMetricSnapshot } from '@/types';

/** Fetch all talent_socials rows that have a platformId for YouTube or Twitch */
export async function getTrackableSocials() {
  const rows = await db
    .select({
      talentId: talentSocials.talentId,
      platform: talentSocials.platform,
      platformId: talentSocials.platformId,
    })
    .from(talentSocials)
    .where(
      and(
        sql`${talentSocials.platformId} IS NOT NULL`,
        inArray(talentSocials.platform, [...TRACKABLE_SOCIAL_PLATFORM_KEYS]),
      ),
    );

  return rows.flatMap((r) => {
    const platform = normalizeTrackablePlatform(r.platform);

    if (!platform) {
      return [];
    }

    return [{
      talentId: r.talentId,
      platform,
      platformId: r.platformId!,
    }];
  });
}

/** Insert a snapshot, ignoring duplicates */
export async function insertSnapshot(data: {
  talentId: number;
  platform: string;
  metricType: string;
  value: number;
  snapshotDate: string; // YYYY-MM-DD
}) {
  await db
    .insert(talentMetricSnapshots)
    .values({
      talentId: data.talentId,
      platform: data.platform,
      metricType: data.metricType,
      value: data.value,
      snapshotDate: data.snapshotDate,
    })
    .onConflictDoNothing({
      target: [
        talentMetricSnapshots.talentId,
        talentMetricSnapshots.platform,
        talentMetricSnapshots.metricType,
        talentMetricSnapshots.snapshotDate,
      ],
    });
}

/** Get snapshots for a date range, optionally filtered by talent/platform */
export async function getSnapshots(opts: {
  from: string;
  to: string;
  talentIds?: number[];
  platform?: 'youtube' | 'twitch';
}): Promise<TalentMetricSnapshot[]> {
  const conditions = [
    gte(talentMetricSnapshots.snapshotDate, opts.from),
    lte(talentMetricSnapshots.snapshotDate, opts.to),
  ];

  if (opts.talentIds && opts.talentIds.length > 0) {
    conditions.push(inArray(talentMetricSnapshots.talentId, opts.talentIds));
  }
  if (opts.platform) {
    conditions.push(eq(talentMetricSnapshots.platform, opts.platform));
  }

  return db
    .select()
    .from(talentMetricSnapshots)
    .where(and(...conditions))
    .orderBy(asc(talentMetricSnapshots.snapshotDate));
}

/** Get the latest snapshot per talent per platform */
export async function getLatestSnapshots(): Promise<TalentMetricSnapshot[]> {
  const latestDates = db
    .select({
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      maxDate: sql<string>`max(${talentMetricSnapshots.snapshotDate})`.as('max_date'),
    })
    .from(talentMetricSnapshots)
    .groupBy(
      talentMetricSnapshots.talentId,
      talentMetricSnapshots.platform,
      talentMetricSnapshots.metricType,
    )
    .as('latest');

  return db
    .select({
      id: talentMetricSnapshots.id,
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      value: talentMetricSnapshots.value,
      snapshotDate: talentMetricSnapshots.snapshotDate,
      createdAt: talentMetricSnapshots.createdAt,
    })
    .from(talentMetricSnapshots)
    .innerJoin(
      latestDates,
      and(
        eq(talentMetricSnapshots.talentId, latestDates.talentId),
        eq(talentMetricSnapshots.platform, latestDates.platform),
        eq(talentMetricSnapshots.metricType, latestDates.metricType),
        eq(talentMetricSnapshots.snapshotDate, latestDates.maxDate),
      ),
    );
}

/** Get the earliest snapshot per talent per platform within a date range */
export async function getEarliestSnapshots(from: string): Promise<TalentMetricSnapshot[]> {
  const earliestDates = db
    .select({
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      minDate: sql<string>`min(${talentMetricSnapshots.snapshotDate})`.as('min_date'),
    })
    .from(talentMetricSnapshots)
    .where(gte(talentMetricSnapshots.snapshotDate, from))
    .groupBy(
      talentMetricSnapshots.talentId,
      talentMetricSnapshots.platform,
      talentMetricSnapshots.metricType,
    )
    .as('earliest');

  return db
    .select({
      id: talentMetricSnapshots.id,
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      value: talentMetricSnapshots.value,
      snapshotDate: talentMetricSnapshots.snapshotDate,
      createdAt: talentMetricSnapshots.createdAt,
    })
    .from(talentMetricSnapshots)
    .innerJoin(
      earliestDates,
      and(
        eq(talentMetricSnapshots.talentId, earliestDates.talentId),
        eq(talentMetricSnapshots.platform, earliestDates.platform),
        eq(talentMetricSnapshots.metricType, earliestDates.metricType),
        eq(talentMetricSnapshots.snapshotDate, earliestDates.minDate),
      ),
    );
}

/** Count talents that have at least one platformId configured */
export async function countTrackedTalents(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(distinct ${talentSocials.talentId})` })
    .from(talentSocials)
    .where(
      and(
        sql`${talentSocials.platformId} IS NOT NULL`,
        inArray(talentSocials.platform, [...TRACKABLE_SOCIAL_PLATFORM_KEYS]),
      ),
    );
  return rows[0]?.count ?? 0;
}

/** Get snapshots for a single talent */
export async function getTalentSnapshots(
  talentId: number,
  from: string,
  to: string,
): Promise<TalentMetricSnapshot[]> {
  return db
    .select()
    .from(talentMetricSnapshots)
    .where(
      and(
        eq(talentMetricSnapshots.talentId, talentId),
        gte(talentMetricSnapshots.snapshotDate, from),
        lte(talentMetricSnapshots.snapshotDate, to),
      ),
    )
    .orderBy(asc(talentMetricSnapshots.snapshotDate));
}
