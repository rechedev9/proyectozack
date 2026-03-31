type YouTubeChannelStats = {
  channelId: string;
  subscriberCount: number;
}

type YouTubeAPIResponse = {
  items?: Array<{
    id: string;
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
  }>;
}

type YouTubeSearchAPIResponse = {
  items?: Array<{
    id: {
      channelId: string;
    };
  }>;
}

type YouTubeChannelsAPIResponse = {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails?: {
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics: {
      subscriberCount?: string;
    };
  }>;
}

export type YouTubeChannelPreview = {
  readonly channelId: string;
  readonly handle: string | null;
  readonly title: string;
  readonly description: string;
  readonly thumbnailUrl: string | null;
  readonly subscriberCount: number;
}

/**
 * Fetch subscriber counts for multiple YouTube channel IDs.
 * Batches up to 50 IDs per request (YouTube API limit).
 */
export async function fetchYouTubeSubscriberCounts(
  channelIds: string[],
): Promise<YouTubeChannelStats[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  const results: YouTubeChannelStats[] = [];
  const batchSize = 50;

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const ids = batch.join(',');
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ids}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube API error (${res.status}): ${text}`);
    }

    const data: YouTubeAPIResponse = await res.json();
    if (data.items) {
      for (const item of data.items) {
        results.push({
          channelId: item.id,
          subscriberCount: parseInt(item.statistics.subscriberCount, 10) || 0,
        });
      }
    }
  }

  return results;
}

/**
 * Search YouTube channels by keyword query.
 * Returns up to maxResults channels with snippet + statistics.
 */
export async function searchYouTubeChannels(
  query: string,
  maxResults = 10,
): Promise<YouTubeChannelPreview[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel` +
    `&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`YouTube search API error (${searchRes.status}): ${text}`);
  }

  const searchData: YouTubeSearchAPIResponse = await searchRes.json();
  const channelIds = (searchData.items ?? [])
    .map((item) => item.id.channelId)
    .filter(Boolean);

  if (channelIds.length === 0) return [];
  return getChannelDetails(channelIds);
}

/**
 * Fetch snippet + statistics for a list of YouTube channel IDs.
 * Batches up to 50 IDs per request (YouTube API limit).
 */
export async function getChannelDetails(
  channelIds: string[],
): Promise<YouTubeChannelPreview[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const results: YouTubeChannelPreview[] = [];
  const batchSize = 50;

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const ids = batch.join(',');
    const url =
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics` +
      `&id=${ids}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube channels API error (${res.status}): ${text}`);
    }

    const data: YouTubeChannelsAPIResponse = await res.json();
    for (const item of data.items ?? []) {
      // customUrl arrives as "@handle" — strip the leading @
      const handle = item.snippet.customUrl
        ? item.snippet.customUrl.replace(/^@/, '')
        : null;

      results.push({
        channelId: item.id,
        handle,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl:
          item.snippet.thumbnails?.medium?.url ??
          item.snippet.thumbnails?.default?.url ??
          null,
        subscriberCount: parseInt(item.statistics.subscriberCount ?? '0', 10) || 0,
      });
    }
  }

  return results;
}
