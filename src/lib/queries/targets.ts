import { eq, desc, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { targets } from '@/db/schema';
import type { Target } from '@/types';
import type { CreateTargetInput, CsvTargetRow } from '@/lib/schemas/target';

export async function getAllTargets(): Promise<Target[]> {
  return db.select().from(targets).orderBy(desc(targets.createdAt));
}

export async function getTargetStats(): Promise<{
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
}> {
  const byStatusRows = await db
    .select({ status: targets.status, count: sql<number>`count(*)::int` })
    .from(targets)
    .groupBy(targets.status);

  const byPlatformRows = await db
    .select({ platform: targets.platform, count: sql<number>`count(*)::int` })
    .from(targets)
    .groupBy(targets.platform);

  const byStatus: Record<string, number> = {};
  for (const row of byStatusRows) byStatus[row.status] = row.count;

  const byPlatform: Record<string, number> = {};
  for (const row of byPlatformRows) byPlatform[row.platform] = row.count;

  return { byStatus, byPlatform };
}

export async function upsertTargetsFromCSV(
  rows: CsvTargetRow[],
  batchId: string,
): Promise<{ inserted: number; updated: number }> {
  if (rows.length === 0) return { inserted: 0, updated: 0 };

  const values = rows.map((r) => ({
    username: r.username,
    fullName: r.full_name ?? null,
    platform: 'instagram' as const,
    profileUrl: `https://www.instagram.com/${encodeURIComponent(r.username)}/`,
    profilePicUrl: r.profile_pic_url ?? null,
    followers: r.followers ?? 0,
    following: r.following ?? null,
    posts: r.posts ?? null,
    bio: r.biography ?? null,
    externalUrl: r.external_url ?? null,
    isPrivate: r.is_private ?? null,
    isVerified: r.is_verified ?? null,
    isBusiness: r.is_business ?? null,
    isCreator: r.is_creator ?? null,
    businessCategory: r.business_category ?? null,
    discoveredVia: r.discovered_via ?? null,
    importBatchId: batchId,
    enrichedAt: r.enriched_at ?? null,
    status: 'pendiente' as const,
  }));

  const result = await db
    .insert(targets)
    .values(values)
    .onConflictDoUpdate({
      target: [targets.platform, targets.username],
      set: {
        fullName: sql`excluded.full_name`,
        profilePicUrl: sql`excluded.profile_pic_url`,
        followers: sql`excluded.followers`,
        following: sql`excluded.following`,
        posts: sql`excluded.posts`,
        bio: sql`excluded.bio`,
        externalUrl: sql`excluded.external_url`,
        isPrivate: sql`excluded.is_private`,
        isVerified: sql`excluded.is_verified`,
        isBusiness: sql`excluded.is_business`,
        isCreator: sql`excluded.is_creator`,
        businessCategory: sql`excluded.business_category`,
        discoveredVia: sql`excluded.discovered_via`,
        importBatchId: sql`excluded.import_batch_id`,
        enrichedAt: sql`excluded.enriched_at`,
        updatedAt: new Date(),
        // status and notes are intentionally NOT updated on conflict
      },
    })
    .returning({ id: targets.id, createdAt: targets.createdAt });

  const now = new Date();
  // rows where createdAt is within a few seconds of now were inserted (not updated)
  const threshold = new Date(now.getTime() - 5000);
  const inserted = result.filter((r) => r.createdAt >= threshold).length;
  const updated = result.length - inserted;

  return { inserted, updated };
}

export async function updateTargetStatus(
  id: number,
  status: 'pendiente' | 'contactado' | 'finalizado',
): Promise<void> {
  await db
    .update(targets)
    .set({
      status,
      contactedAt: status === 'contactado' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(targets.id, id));
}

export async function updateTargetNotes(id: number, notes: string): Promise<void> {
  await db.update(targets).set({ notes, updatedAt: new Date() }).where(eq(targets.id, id));
}

export async function createTarget(data: CreateTargetInput): Promise<Target> {
  const [row] = await db
    .insert(targets)
    .values({
      username: data.username,
      fullName: data.fullName ?? null,
      platform: data.platform,
      profileUrl: data.profileUrl,
      profilePicUrl: data.profilePicUrl ?? null,
      followers: data.followers ?? 0,
      following: data.following ?? null,
      posts: data.posts ?? null,
      bio: data.bio ?? null,
      externalUrl: data.externalUrl ?? null,
      isPrivate: data.isPrivate ?? null,
      isVerified: data.isVerified ?? null,
      isBusiness: data.isBusiness ?? null,
      isCreator: data.isCreator ?? null,
      businessCategory: data.businessCategory ?? null,
      notes: data.notes ?? null,
      discoveredVia: data.discoveredVia ?? null,
    })
    .returning();
  return row!;
}

export async function deleteTargets(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(targets).where(inArray(targets.id, ids));
}

export async function bulkUpsertTargets(
  rows: CreateTargetInput[],
): Promise<{ inserted: number; updated: number }> {
  if (rows.length === 0) return { inserted: 0, updated: 0 };

  const values = rows.map((r) => ({
    username: r.username,
    fullName: r.fullName ?? null,
    platform: r.platform,
    profileUrl: r.profileUrl,
    profilePicUrl: r.profilePicUrl ?? null,
    followers: r.followers ?? 0,
    bio: r.bio ?? null,
    discoveredVia: r.discoveredVia ?? null,
    status: 'pendiente' as const,
    notes: r.notes ?? null,
  }));

  const result = await db
    .insert(targets)
    .values(values)
    .onConflictDoUpdate({
      target: [targets.platform, targets.username],
      set: {
        fullName: sql`excluded.full_name`,
        profilePicUrl: sql`excluded.profile_pic_url`,
        followers: sql`excluded.followers`,
        bio: sql`excluded.bio`,
        discoveredVia: sql`excluded.discovered_via`,
        updatedAt: new Date(),
        // status and notes intentionally NOT updated on conflict
      },
    })
    .returning({ id: targets.id, createdAt: targets.createdAt });

  const now = new Date();
  const threshold = new Date(now.getTime() - 5000);
  const inserted = result.filter((r) => r.createdAt >= threshold).length;
  const updated = result.length - inserted;
  return { inserted, updated };
}

export async function bulkUpdateStatus(
  ids: number[],
  status: 'pendiente' | 'contactado' | 'finalizado',
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(targets)
    .set({
      status,
      contactedAt: status === 'contactado' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(inArray(targets.id, ids));
}
