import { eq, and, type SQL } from 'drizzle-orm';
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

  const rows = await db.query.talents.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });

  // Client-side filter for tags (requires join that Drizzle relational queries don't support inline)
  let filtered = rows;
  if (filters?.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((talent) =>
      talent.tags.some((t) => lowerTags.includes(t.tag.toLowerCase())),
    );
  }

  return filtered;
}

export async function getTalentBySlug(slug: string): Promise<TalentWithRelations | undefined> {
  const row = await db.query.talents.findFirst({
    where: eq(talents.slug, slug),
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
  });
  return row ?? undefined;
}

// Re-export for convenience
export { talents, talentTags, talentStats, talentSocials };
