'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { searchYouTubeChannels, getChannelAvgViews } from '@/lib/services/youtube';
import type { YouTubeChannelPreview, YouTubeAvgViewsResult } from '@/lib/services/youtube';
import { bulkUpsertTargets } from '@/lib/queries/targets';
import type { CreateTargetInput } from '@/lib/schemas/target';

const REVALIDATE = '/admin/targets';

export type YouTubeSearchResult = {
  readonly ok: boolean;
  readonly results: YouTubeChannelPreview[];
  readonly fetchedResults: YouTubeChannelPreview[];
  readonly error: string | null;
  readonly fetchedCount: number;
  readonly filteredCount: number;
};

// '' = no filter; 'hispano' = relevanceLanguage=es (no regionCode); country codes = YouTube regionCode param
export type YouTubeRegionCode = '' | 'hispano' | 'ES' | 'MX' | 'AR' | 'CL' | 'CO' | 'PE';

export type YouTubeSearchParams = {
  readonly query: string;
  readonly minSubscribers: number;
  readonly maxSubscribers: number;
  readonly requiresHandle: boolean;
  readonly description: string;
  readonly limit: number;
  readonly regionCode: YouTubeRegionCode;
  readonly relevanceLanguage: string;
};

function parseKeywords(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function filterYouTubeResults(
  results: YouTubeChannelPreview[],
  params: YouTubeSearchParams,
): YouTubeChannelPreview[] {
  const descriptionTerms = parseKeywords(params.description);

  return results
    .filter((channel) => {
      if (params.minSubscribers > 0 && channel.subscriberCount < params.minSubscribers) {
        return false;
      }

      if (params.maxSubscribers > 0 && channel.subscriberCount > params.maxSubscribers) {
        return false;
      }

      if (params.requiresHandle && !channel.handle) {
        return false;
      }

      if (
        descriptionTerms.length > 0 &&
        !descriptionTerms.some((term) => channel.description.toLowerCase().includes(term))
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.subscriberCount - a.subscriberCount)
    .slice(0, params.limit);
}

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
  params: YouTubeSearchParams,
): Promise<YouTubeSearchResult> {
  await requireRole('admin', '/admin/login');
  if (!params.query.trim()) {
    return { ok: true, results: [], fetchedResults: [], error: null, fetchedCount: 0, filteredCount: 0 };
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return {
      ok: false,
      results: [],
      fetchedResults: [],
      error: 'YouTube no configurado - revisa YOUTUBE_API_KEY',
      fetchedCount: 0,
      filteredCount: 0,
    };
  }

  try {
    const fetchLimit = Math.min(Math.max(params.limit * 5, 25), 50);
    let serviceRegionCode: string | undefined;
    let serviceRelevanceLanguage: string | undefined;
    if (params.regionCode === 'hispano') {
      serviceRelevanceLanguage = 'es';
    } else {
      if (params.regionCode) serviceRegionCode = params.regionCode;
      if (params.relevanceLanguage) serviceRelevanceLanguage = params.relevanceLanguage;
    }
    const fetched = await searchYouTubeChannels(params.query.trim(), fetchLimit, serviceRegionCode, serviceRelevanceLanguage);
    const results = filterYouTubeResults(fetched, params);
    return {
      ok: true,
      results,
      fetchedResults: fetched,
      error: null,
      fetchedCount: fetched.length,
      filteredCount: results.length,
    };
  } catch (err) {
    return {
      ok: false,
      results: [],
      fetchedResults: [],
      error: getYouTubeSearchError(err),
      fetchedCount: 0,
      filteredCount: 0,
    };
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

export type AvgViewsRecord = Record<string, YouTubeAvgViewsResult>;

export async function enrichYouTubeAvgViewsAction(
  channelIds: string[],
): Promise<{ ok: boolean; data: AvgViewsRecord; error: string | null }> {
  await requireRole('admin', '/admin/login');
  if (channelIds.length === 0) return { ok: true, data: {}, error: null };

  try {
    const settled = await Promise.allSettled(channelIds.map((id) => getChannelAvgViews(id)));
    const data: AvgViewsRecord = {};
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        data[result.value.channelId] = result.value;
      }
    }
    return { ok: true, data, error: null };
  } catch (err) {
    return {
      ok: false,
      data: {},
      error: err instanceof Error ? err.message : 'Error enriching avg views',
    };
  }
}
