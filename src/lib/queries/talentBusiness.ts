import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talentBusiness, talentVerticals } from '@/db/schema';
import type { TalentBusiness, TalentVertical, TalentVerticalRow, NewTalentBusiness } from '@/types';

export async function getTalentBusiness(talentId: number): Promise<TalentBusiness | null> {
  const [row] = await db.select().from(talentBusiness).where(eq(talentBusiness.talentId, talentId)).limit(1);
  return row ?? null;
}

export async function listTalentBusiness(talentIds: readonly number[]): Promise<readonly TalentBusiness[]> {
  if (talentIds.length === 0) return [];
  return db.select().from(talentBusiness).where(inArray(talentBusiness.talentId, [...talentIds]));
}

export async function getTalentVerticals(talentId: number): Promise<readonly TalentVertical[]> {
  const rows = await db
    .select({ vertical: talentVerticals.vertical })
    .from(talentVerticals)
    .where(eq(talentVerticals.talentId, talentId));
  return rows.map((r) => r.vertical);
}

export async function listAllVerticals(): Promise<readonly TalentVerticalRow[]> {
  return db.select().from(talentVerticals);
}

export async function upsertTalentBusiness(
  talentId: number,
  patch: Partial<Omit<NewTalentBusiness, 'talentId'>>,
): Promise<TalentBusiness> {
  const existing = await getTalentBusiness(talentId);
  if (existing) {
    const [row] = await db
      .update(talentBusiness)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(talentBusiness.talentId, talentId))
      .returning();
    if (!row) throw new Error('Failed to update talent business');
    return row;
  }
  const [row] = await db
    .insert(talentBusiness)
    .values({ talentId, ...patch })
    .returning();
  if (!row) throw new Error('Failed to insert talent business');
  return row;
}

export async function setTalentVerticals(
  talentId: number,
  verticals: readonly TalentVertical[],
): Promise<void> {
  await db.delete(talentVerticals).where(eq(talentVerticals.talentId, talentId));
  if (verticals.length === 0) return;
  await db
    .insert(talentVerticals)
    .values(verticals.map((v) => ({ talentId, vertical: v })));
}
