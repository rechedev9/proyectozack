import { eq, gt, lte, desc, asc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveaways } from '@/db/schema';
import type { Giveaway, GiveawayWithTalent } from '@/types';

export async function getActiveGiveaways(talentId: number): Promise<Giveaway[]> {
  return db
    .select()
    .from(giveaways)
    .where(
      and(
        eq(giveaways.talentId, talentId),
        gt(giveaways.endsAt, new Date()),
      ),
    )
    .orderBy(asc(giveaways.endsAt));
}

export async function getFinishedGiveaways(talentId: number): Promise<Giveaway[]> {
  return db
    .select()
    .from(giveaways)
    .where(
      and(
        eq(giveaways.talentId, talentId),
        lte(giveaways.endsAt, new Date()),
      ),
    )
    .orderBy(desc(giveaways.endsAt));
}

export async function getAllGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    with: { talent: true },
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });
  return rows as GiveawayWithTalent[];
}

export async function getGiveawayById(id: number): Promise<GiveawayWithTalent | undefined> {
  const row = await db.query.giveaways.findFirst({
    where: eq(giveaways.id, id),
    with: { talent: true },
  });
  return row as GiveawayWithTalent | undefined;
}

export async function createGiveaway(data: {
  talentId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  brandName: string;
  brandLogo?: string | null;
  value?: string | null;
  redirectUrl: string;
  startsAt: Date;
  endsAt: Date;
  sortOrder?: number;
}): Promise<Giveaway> {
  const [row] = await db.insert(giveaways).values(data).returning();
  return row;
}

export async function updateGiveaway(
  id: number,
  data: Partial<typeof giveaways.$inferInsert>,
): Promise<void> {
  await db.update(giveaways).set({ ...data, updatedAt: new Date() }).where(eq(giveaways.id, id));
}

export async function deleteGiveaway(id: number): Promise<void> {
  await db.delete(giveaways).where(eq(giveaways.id, id));
}
