import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { caseStudies } from '@/db/schema';
import type { CaseStudyWithRelations } from '@/types';

export async function getCaseStudies(): Promise<CaseStudyWithRelations[]> {
  return db.query.caseStudies.findMany({
    with: {
      body: { orderBy: (b, { asc }) => [asc(b.sortOrder)] },
      tags: true,
      creators: true,
    },
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });
}

export async function getCaseBySlug(slug: string): Promise<CaseStudyWithRelations | undefined> {
  const row = await db.query.caseStudies.findFirst({
    where: eq(caseStudies.slug, slug),
    with: {
      body: { orderBy: (b, { asc }) => [asc(b.sortOrder)] },
      tags: true,
      creators: true,
    },
  });
  return row ?? undefined;
}
