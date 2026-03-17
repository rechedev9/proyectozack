import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { portfolioItems } from '@/db/schema';
import type { PortfolioItem } from '@/types';

export async function getPortfolioItems(type?: 'thumb' | 'video' | 'campaign'): Promise<PortfolioItem[]> {
  return db.query.portfolioItems.findMany({
    where: type ? eq(portfolioItems.type, type) : undefined,
    orderBy: (p, { asc }) => [asc(p.sortOrder)],
  });
}
