import { desc, sql, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveawayWinners } from '@/db/schema';
import type { GiveawayWinnerWithGiveaway } from '@/types';

export async function getRecentWinners(limit = 10): Promise<GiveawayWinnerWithGiveaway[]> {
  const rows = await db.query.giveawayWinners.findMany({
    with: { giveaway: true },
    orderBy: (w, { desc }) => [desc(w.wonAt)],
    limit,
  });
  return rows as GiveawayWinnerWithGiveaway[];
}

export async function getTopWinners(limit = 10): Promise<{ winnerName: string; winnerAvatar: string | null; wins: number }[]> {
  return db
    .select({
      winnerName: giveawayWinners.winnerName,
      winnerAvatar: giveawayWinners.winnerAvatar,
      wins: sql<number>`count(*)::int`.as('wins'),
    })
    .from(giveawayWinners)
    .groupBy(giveawayWinners.winnerName, giveawayWinners.winnerAvatar)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getAllWinners(): Promise<GiveawayWinnerWithGiveaway[]> {
  const rows = await db.query.giveawayWinners.findMany({
    with: { giveaway: true },
    orderBy: (w, { desc }) => [desc(w.wonAt)],
  });
  return rows as GiveawayWinnerWithGiveaway[];
}

export async function createWinner(data: {
  giveawayId: number;
  winnerName: string;
  winnerAvatar?: string | null | undefined;
  wonAt?: Date;
}): Promise<void> {
  await db.insert(giveawayWinners).values(data);
}

export async function deleteWinner(id: number): Promise<void> {
  await db.delete(giveawayWinners).where(eq(giveawayWinners.id, id));
}
