'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import {
  searchTwitchChannels,
  getCS2LiveStreams,
} from '@/lib/services/twitch';
import type { TwitchChannelPreview } from '@/lib/services/twitch';
import { bulkUpsertTargets } from '@/lib/queries/targets';
import type { CreateTargetInput } from '@/lib/schemas/target';

const REVALIDATE = '/admin/targets';

export type TwitchSearchResult = {
  readonly ok: boolean;
  readonly channels: TwitchChannelPreview[];
  readonly error: string | null;
};

export type TwitchSearchParams = {
  readonly query: string;
  readonly liveOnly: boolean;
  readonly language: string;
  readonly minFollowers: number;
  readonly useCS2Live: boolean;
  readonly maxFollowers: number;
  readonly minViewers: number;
  readonly maxViewers: number;
};

function getTwitchError(err: unknown): string {
  if (!(err instanceof Error)) return 'Error buscando en Twitch';
  if (err.message.includes('TWITCH_CLIENT_ID') || err.message.includes('TWITCH_CLIENT_SECRET')) {
    return 'Twitch no configurado — revisa TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET';
  }
  if (err.message.includes('(401)')) return 'Twitch rechazó las credenciales — revisa las API keys';
  return 'Error buscando en Twitch';
}

export async function searchTwitchAction(
  params: TwitchSearchParams,
): Promise<TwitchSearchResult> {
  await requireRole('admin', '/admin/login');

  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return {
      ok: false,
      channels: [],
      error: 'Twitch no configurado — añade TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET a .env.local',
    };
  }

  try {
    let channels: TwitchChannelPreview[];
    if (params.useCS2Live) {
      channels = await getCS2LiveStreams(100, params.language || undefined);
    } else {
      if (!params.query.trim()) return { ok: true, channels: [], error: null };
      channels = await searchTwitchChannels(params.query.trim(), params.liveOnly);
      if (params.language) {
        channels = channels.filter((c) => c.language === params.language);
      }
    }
    if (params.minFollowers > 0) {
      channels = channels.filter((c) => c.followerCount >= params.minFollowers);
    }
    if (params.maxFollowers > 0) {
      channels = channels.filter((c) => c.followerCount <= params.maxFollowers);
    }
    if (params.minViewers > 0) {
      channels = channels.filter((c) => c.viewerCount >= params.minViewers);
    }
    if (params.maxViewers > 0) {
      channels = channels.filter((c) => c.viewerCount <= params.maxViewers);
    }

    return { ok: true, channels, error: null };
  } catch (err) {
    return { ok: false, channels: [], error: getTwitchError(err) };
  }
}

export async function importTwitchChannelsAction(
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
    const login = typeof c.login === 'string' ? c.login : null;
    if (!login) continue;

    rows.push({
      username: login,
      fullName: typeof c.displayName === 'string' ? c.displayName : undefined,
      platform: 'twitch',
      profileUrl: `https://www.twitch.tv/${login}`,
      followers: typeof c.followerCount === 'number' ? c.followerCount : 0,
      notes:
        typeof c.currentGame === 'string' && c.currentGame
          ? `Juego actual: ${c.currentGame}`
          : undefined,
      discoveredVia: 'twitch_search',
    });
  }

  const result = await bulkUpsertTargets(rows);
  revalidatePath(REVALIDATE);
  return { imported: result.inserted, updated: result.updated };
}
