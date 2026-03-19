interface YouTubeChannelStats {
  channelId: string;
  subscriberCount: number;
}

interface YouTubeAPIResponse {
  items?: Array<{
    id: string;
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
  }>;
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
