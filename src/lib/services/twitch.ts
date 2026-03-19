interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchFollowerResponse {
  total: number;
}

interface TwitchFollowerResult {
  broadcasterId: string;
  followerCount: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get an app access token via client credentials grant.
 * Caches the token until expiry.
 */
async function getAppAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET is not set');
  }

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch token error (${res.status}): ${text}`);
  }

  const data: TwitchTokenResponse = await res.json();
  cachedToken = data.access_token;
  // Expire 5 minutes early to avoid edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

/**
 * Fetch follower counts for multiple Twitch broadcaster IDs.
 */
export async function fetchTwitchFollowerCounts(
  broadcasterIds: string[],
): Promise<TwitchFollowerResult[]> {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const token = await getAppAccessToken();
  const results: TwitchFollowerResult[] = [];

  for (const broadcasterId of broadcasterIds) {
    const url = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}`;

    const res = await fetch(url, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Twitch followers API error for ${broadcasterId} (${res.status}): ${text}`);
      continue; // Skip this creator, don't fail the batch
    }

    const data: TwitchFollowerResponse = await res.json();
    results.push({ broadcasterId, followerCount: data.total });
  }

  return results;
}
