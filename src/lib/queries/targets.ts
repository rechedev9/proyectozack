import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { targets } from '@/db/schema';
import type { Target } from '@/types';
import type { CreateTargetInput, CsvTargetRow } from '@/lib/schemas/target';

function buildProfileUrl(platform: 'instagram' | 'youtube' | 'twitch' | 'kick', username: string): string {
  switch (platform) {
    case 'youtube': return `https://www.youtube.com/channel/${encodeURIComponent(username)}`;
    case 'twitch': return `https://www.twitch.tv/${encodeURIComponent(username)}`;
    case 'kick': return `https://kick.com/${encodeURIComponent(username)}`;
    default: return `https://www.instagram.com/${encodeURIComponent(username)}/`;
  }
}

// xmax is a Postgres system column: '0' on freshly inserted rows, non-zero on conflict-updated rows
function countUpsertResults(rows: Array<{ id: number; xmax: string }>): { inserted: number; updated: number; ids: number[] } {
  const inserted = rows.filter((r) => r.xmax === '0').length;
  return { inserted, updated: rows.length - inserted, ids: rows.map((r) => r.id) };
}

export async function getAllTargets(): Promise<Target[]> {
  return db.select().from(targets).orderBy(desc(targets.createdAt));
}

export async function getTargetsByPlatformAndUsernames(
  platform: 'instagram' | 'youtube' | 'twitch' | 'kick',
  usernames: string[],
): Promise<Array<{ id: number; username: string }>> {
  if (usernames.length === 0) return [];

  return db
    .select({ id: targets.id, username: targets.username })
    .from(targets)
    .where(and(eq(targets.platform, platform), inArray(targets.username, usernames)));
}

export async function getBrandTargets(brandUserId: string): Promise<Target[]> {
  return db
    .select()
    .from(targets)
    .where(eq(targets.brandUserId, brandUserId))
    .orderBy(desc(targets.updatedAt), desc(targets.createdAt));
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
): Promise<{ inserted: number; updated: number; ids: number[] }> {
  if (rows.length === 0) return { inserted: 0, updated: 0, ids: [] };

  const values = rows.map((r) => {
    const platform = r.platform ?? 'instagram';
    return {
      username: r.username,
      fullName: r.full_name ?? null,
      platform,
      profileUrl: r.profile_url ?? buildProfileUrl(platform, r.username),
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
    };
  });

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
    .returning({ id: targets.id, xmax: sql<string>`xmax::text` });

  return countUpsertResults(result);
}

export async function updateTargetStatus(
  id: number,
  status: Target['status'],
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

export async function deleteAllTargets(): Promise<void> {
  await db.delete(targets);
}

export async function bulkUpsertTargets(
  rows: CreateTargetInput[],
): Promise<{ inserted: number; updated: number; ids: number[] }> {
  if (rows.length === 0) return { inserted: 0, updated: 0, ids: [] };

  const values = rows.map((r) => ({
    username: r.username,
    fullName: r.fullName ?? null,
    platform: r.platform,
    profileUrl: r.profileUrl,
    profilePicUrl: r.profilePicUrl ?? null,
    followers: r.followers ?? 0,
    following: r.following ?? null,
    posts: r.posts ?? null,
    bio: r.bio ?? null,
    externalUrl: r.externalUrl ?? null,
    isPrivate: r.isPrivate ?? null,
    isVerified: r.isVerified ?? null,
    isBusiness: r.isBusiness ?? null,
    isCreator: r.isCreator ?? null,
    businessCategory: r.businessCategory ?? null,
    discoveredVia: r.discoveredVia ?? null,
    enrichedAt: r.enrichedAt ?? null,
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
        enrichedAt: sql`excluded.enriched_at`,
        updatedAt: new Date(),
        // status and notes intentionally NOT updated on conflict
      },
    })
    .returning({ id: targets.id, xmax: sql<string>`xmax::text` });

  return countUpsertResults(result);
}

export async function assignTargetsToBrand(
  brandUserId: string,
  targetIds: number[],
): Promise<{ assigned: number }> {
  if (targetIds.length === 0) return { assigned: 0 };

  const result = await db
    .update(targets)
    .set({ brandUserId, updatedAt: new Date() })
    .where(inArray(targets.id, targetIds))
    .returning({ id: targets.id });

  return { assigned: result.length };
}

export async function updateBrandTargetStatus(
  brandUserId: string,
  targetId: number,
  status: Target['status'],
): Promise<void> {
  await db
    .update(targets)
    .set({
      status,
      contactedAt: status === 'contactado' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(targets.id, targetId),
        eq(targets.brandUserId, brandUserId),
      ),
    );
}

export async function updateBrandTargetNotes(
  brandUserId: string,
  targetId: number,
  notes: string,
): Promise<void> {
  await db
    .update(targets)
    .set({ notes, updatedAt: new Date() })
    .where(
      and(
        eq(targets.id, targetId),
        eq(targets.brandUserId, brandUserId),
      ),
    );
}

export async function bulkUpdateStatus(
  ids: number[],
  status: Target['status'],
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
