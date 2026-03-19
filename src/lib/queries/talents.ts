import { cache } from 'react';
import { eq, and, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talents, talentTags, talentStats, talentSocials } from '@/db/schema';
import type { TalentWithRelations } from '@/types';

export interface TalentFilters {
  platform?: 'twitch' | 'youtube';
  tags?: string[];
  followersMin?: number;
  followersMax?: number;
  region?: string;
  status?: 'active' | 'available';
}

export async function getTalentSlugs(): Promise<{ slug: string }[]> {
  return db.select({ slug: talents.slug }).from(talents);
}

export async function getTalents(filters?: TalentFilters): Promise<TalentWithRelations[]> {
  const conditions: SQL[] = [];

  if (filters?.platform) {
    conditions.push(eq(talents.platform, filters.platform));
  }
  if (filters?.status) {
    conditions.push(eq(talents.status, filters.status));
  }

  // Pre-filter by tags at DB level via subquery
  if (filters?.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    const matchingIds = db
      .select({ talentId: talentTags.talentId })
      .from(talentTags)
      .where(inArray(sql`lower(${talentTags.tag})`, lowerTags));
    conditions.push(inArray(talents.id, matchingIds));
  }

  const rows = await db.query.talents.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });

  return rows;
}

export const getTalentBySlug = cache(async (slug: string): Promise<TalentWithRelations | undefined> => {
  const row = await db.query.talents.findFirst({
    where: eq(talents.slug, slug),
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
  });
  return row ?? undefined;
});

export async function getTalentsByIds(ids: number[]): Promise<TalentWithRelations[]> {
  if (ids.length === 0) return [];
  return db.query.talents.findMany({
    where: inArray(talents.id, ids),
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
  });
}

// Re-export for convenience
export { talents, talentTags, talentStats, talentSocials };
