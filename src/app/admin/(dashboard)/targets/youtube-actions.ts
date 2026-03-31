'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { searchYouTubeChannels } from '@/lib/services/youtube';
import type { YouTubeChannelPreview } from '@/lib/services/youtube';
import { bulkUpsertTargets } from '@/lib/queries/targets';
import type { CreateTargetInput } from '@/lib/schemas/target';

const REVALIDATE = '/admin/targets';

export async function searchYouTubeAction(
  query: string,
): Promise<YouTubeChannelPreview[]> {
  await requireRole('admin', '/admin/login');
  if (!query.trim()) return [];
  return searchYouTubeChannels(query.trim(), 10);
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
    const handle =
      typeof c.handle === 'string' && c.handle
        ? c.handle
        : typeof c.channelId === 'string'
          ? c.channelId
          : null;
    if (!handle) continue;

    const channelId = typeof c.channelId === 'string' ? c.channelId : handle;
    rows.push({
      username: handle,
      fullName: typeof c.title === 'string' ? c.title : undefined,
      platform: 'youtube',
      profileUrl:
        handle !== channelId
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
