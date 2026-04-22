import { gt, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveaways } from '@/db/schema';
import type { CreatorCodeWithTalent, GiveawayWithTalent } from '@/types';

export type BrandOption = {
  readonly name: string;
  readonly logo: string | null;
  readonly count: number;
};

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

export function extractUniqueBrands(
  giveaways: readonly GiveawayWithTalent[],
  codes: readonly CreatorCodeWithTalent[] = [],
): BrandOption[] {
  const map = new Map<string, { logo: string | null; count: number }>();
  const bump = (name: string, logo: string | null): void => {
    const current = map.get(name);
    if (current) {
      current.count += 1;
      if (!current.logo && logo) current.logo = logo;
      return;
    }
    map.set(name, { logo, count: 1 });
  };
  for (const g of giveaways) bump(g.brandName, g.brandLogo);
  for (const c of codes) bump(c.brandName, c.brandLogo);
  return Array.from(map, ([name, { logo, count }]) => ({ name, logo, count })).sort(
    (a, b) => b.count - a.count,
  );
}
