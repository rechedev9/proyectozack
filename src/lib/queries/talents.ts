import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talents, talentTags, talentStats, talentSocials } from '@/db/schema';
import type { TalentWithRelations } from '@/types';

export async function getTalentSlugs(): Promise<{ slug: string }[]> {
  return db.select({ slug: talents.slug }).from(talents);
}

export async function getTalents(platform?: 'twitch' | 'youtube'): Promise<TalentWithRelations[]> {
  const rows = await db.query.talents.findMany({
    where: platform ? eq(talents.platform, platform) : undefined,
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
  return rows;
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
