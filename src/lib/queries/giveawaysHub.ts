import { gt, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveaways } from '@/db/schema';
import type { GiveawayWithTalent } from '@/types';

export async function getAllActiveGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    where: gt(giveaways.endsAt, new Date()),
    with: { talent: true },
    orderBy: (g, { asc }) => [asc(g.endsAt)],
  });
  return rows as GiveawayWithTalent[];
}

export async function getAllFinishedGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    where: lte(giveaways.endsAt, new Date()),
    with: { talent: true },
    orderBy: (g, { desc }) => [desc(g.endsAt)],
  });
  return rows as GiveawayWithTalent[];
}

export function extractUniqueBrands(giveaways: GiveawayWithTalent[]): { name: string; logo: string | null }[] {
  const map = new Map<string, string | null>();
  for (const g of giveaways) {
    if (!map.has(g.brandName)) map.set(g.brandName, g.brandLogo);
  }
  return Array.from(map, ([name, logo]) => ({ name, logo }));
}
