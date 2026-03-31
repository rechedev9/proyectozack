'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { searchYouTubeChannels } from '@/lib/services/youtube';
import type { YouTubeChannelPreview } from '@/lib/services/youtube';
import { bulkUpsertTargets } from '@/lib/queries/targets';
import type { CreateTargetInput } from '@/lib/schemas/target';

const REVALIDATE = '/admin/targets';

export type YouTubeSearchResult = {
  readonly ok: boolean;
  readonly results: YouTubeChannelPreview[];
  readonly error: string | null;
};

function getYouTubeSearchError(err: unknown): string {
  if (!(err instanceof Error)) return 'Error buscando en YouTube';
  if (err.message === 'YOUTUBE_API_KEY is not set') {
    return 'YouTube no configurado - revisa YOUTUBE_API_KEY';
  }

  if (err.message.includes('(400)') || err.message.includes('(403)')) {
    return 'YouTube rechazo la clave API - revisa YOUTUBE_API_KEY, sus restricciones y YouTube Data API v3';
  }

  return 'Error buscando en YouTube';
}

export async function searchYouTubeAction(
  query: string,
): Promise<YouTubeSearchResult> {
  await requireRole('admin', '/admin/login');
  if (!query.trim()) {
    return { ok: true, results: [], error: null };
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return {
      ok: false,
      results: [],
      error: 'YouTube no configurado - revisa YOUTUBE_API_KEY',
    };
  }

  try {
    const results = await searchYouTubeChannels(query.trim(), 10);
    return { ok: true, results, error: null };
  } catch (err) {
    return { ok: false, results: [], error: getYouTubeSearchError(err) };
  }
}

export async function importYouTubeChannelsAction(
  formData: FormData,
): Promise<{ imported: number; updated: number }> {
  await requireRole('admin', '/admin/login');

  const raw = formData.get('channels') as string | null;
  if (!raw) return { imported: 0, updated: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { imported: 0, updated: 0 };
  }

  if (!Array.isArray(parsed)) return { imported: 0, updated: 0 };

  const rows: CreateTargetInput[] = [];
  for (const ch of parsed) {
    if (typeof ch !== 'object' || ch === null) continue;
    const c = ch as Record<string, unknown>;
    const channelId = typeof c.channelId === 'string' ? c.channelId : null;
    if (!channelId) continue;

    const handle = typeof c.handle === 'string' && c.handle ? c.handle : null;
    rows.push({
      username: channelId,
      fullName: typeof c.title === 'string' ? c.title : undefined,
      platform: 'youtube',
      profileUrl: handle
        ? `https://youtube.com/@${handle}`
        : `https://youtube.com/channel/${channelId}`,
      profilePicUrl:
        typeof c.thumbnailUrl === 'string' ? c.thumbnailUrl : undefined,
      followers:
        typeof c.subscriberCount === 'number' ? c.subscriberCount : 0,
      bio:
        typeof c.description === 'string' && c.description
          ? c.description
          : undefined,
      discoveredVia: 'youtube_search',
    });
  }

  const result = await bulkUpsertTargets(rows);
  revalidatePath(REVALIDATE);
  return { imported: result.inserted, updated: result.updated };
}
