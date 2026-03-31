'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { bulkUpsertTargets } from '@/lib/queries/targets';
import type { CreateTargetInput } from '@/lib/schemas/target';

const REVALIDATE = '/admin/targets';

// Shape returned by instascout GET /api/export?format=json
type InstascoutProfile = {
  readonly username: string;
  readonly full_name: string;
  readonly biography: string;
  readonly followers: number;
  readonly following: number;
  readonly posts: number;
  readonly is_private: boolean;
  readonly is_verified: boolean;
  readonly is_business: boolean;
  readonly is_creator: boolean;
  readonly business_category: string;
  readonly external_url: string;
  readonly profile_pic_url: string;
  readonly discovered_via: string;
  readonly enriched_at: string;
};

export type InstascoutSearchParams = {
  readonly minFollowers: number;
  readonly maxFollowers: number;
  readonly isCreator: boolean | null;
  readonly enrichedOnly: boolean;
  readonly source: string;
  readonly limit: number;
};

export type InstascoutPreviewRow = {
  readonly username: string;
  readonly fullName: string;
  readonly bio: string;
  readonly followers: number;
  readonly isVerified: boolean;
  readonly isCreator: boolean;
  readonly profilePicUrl: string;
  readonly discoveredVia: string;
};

function buildInstascoutUrl(params: InstascoutSearchParams): string {
  const base = process.env.INSTASCOUT_URL;
  if (!base) throw new Error('INSTASCOUT_URL is not set');

  const q = new URLSearchParams({ format: 'json', limit: String(params.limit) });
  if (params.minFollowers > 0) q.set('min_followers', String(params.minFollowers));
  if (params.maxFollowers > 0) q.set('max_followers', String(params.maxFollowers));
  if (params.isCreator !== null) q.set('is_creator', params.isCreator ? '1' : '0');
  if (params.enrichedOnly) q.set('enriched_only', '1');
  if (params.source) q.set('source', params.source);
  return `${base}/api/export?${q.toString()}`;
}

async function fetchInstascout(params: InstascoutSearchParams): Promise<InstascoutProfile[]> {
  const secret = process.env.INSTASCOUT_SECRET;
  if (!secret) throw new Error('INSTASCOUT_SECRET is not set');

  const url = buildInstascoutUrl(params);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`instascout error (${res.status})`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as InstascoutProfile[];
}

export async function previewInstascoutAction(
  params: InstascoutSearchParams,
): Promise<InstascoutPreviewRow[]> {
  await requireRole('admin', '/admin/login');
  if (!process.env.INSTASCOUT_URL || !process.env.INSTASCOUT_SECRET) return [];

  const profiles = await fetchInstascout(params);
  return profiles.map((p) => ({
    username: p.username,
    fullName: p.full_name,
    bio: p.biography,
    followers: p.followers,
    isVerified: p.is_verified,
    isCreator: p.is_creator,
    profilePicUrl: p.profile_pic_url,
    discoveredVia: p.discovered_via,
  }));
}

export async function importInstascoutAction(
  formData: FormData,
): Promise<{ imported: number; updated: number }> {
  await requireRole('admin', '/admin/login');

  const raw = formData.get('profiles') as string | null;
  if (!raw) return { imported: 0, updated: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { imported: 0, updated: 0 };
  }

  if (!Array.isArray(parsed)) return { imported: 0, updated: 0 };

  const rows: CreateTargetInput[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const p = item as Record<string, unknown>;
    const username = typeof p.username === 'string' ? p.username : null;
    if (!username) continue;

    rows.push({
      username,
      fullName: typeof p.fullName === 'string' ? p.fullName : undefined,
      platform: 'instagram',
      profileUrl: `https://www.instagram.com/${encodeURIComponent(username)}/`,
      profilePicUrl: typeof p.profilePicUrl === 'string' ? p.profilePicUrl : undefined,
      followers: typeof p.followers === 'number' ? p.followers : 0,
      bio: typeof p.bio === 'string' && p.bio ? p.bio : undefined,
      discoveredVia: typeof p.discoveredVia === 'string' ? p.discoveredVia : 'instascout',
    });
  }

  const result = await bulkUpsertTargets(rows);
  revalidatePath(REVALIDATE);
  return { imported: result.inserted, updated: result.updated };
}
