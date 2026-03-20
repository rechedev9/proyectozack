/**
 * Sync real follower counts from YouTube and Twitch APIs.
 * Updates followers_display in talent_socials for all yt and twitch rows.
 *
 * Run: npx tsx scripts/sync-followers.ts
 * Dry run: npx tsx scripts/sync-followers.ts --dry-run
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// ── Load .env.local ──────────────────────────────────────────────────────────
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && val && !process.env[key]) process.env[key] = val;
  }
} catch {}

// ── Config ───────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');
const YT_API_KEY = process.env.YOUTUBE_API_KEY!;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!YT_API_KEY) { console.error('YOUTUBE_API_KEY not set'); process.exit(1); }
if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) { console.error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not set'); process.exit(1); }

// ── Format helpers ───────────────────────────────────────────────────────────

/** Format a raw subscriber/follower count to display string: "63", "1.2K", "95K", "1.2M" */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(n);
}

// ── YouTube ──────────────────────────────────────────────────────────────────

/**
 * Extract the YouTube channel identifier from a profile_url.
 * Returns { type: 'id' | 'handle' | 'username' | 'custom', value: string }
 */
function parseYouTubeUrl(profileUrl: string): { type: string; value: string } | null {
  try {
    // Strip query params and trailing slashes/paths like /videos
    const url = new URL(profileUrl);
    const path = url.pathname.replace(/\/$/, '').replace(/\/videos$/, '').replace(/\/featured$/, '');

    // /channel/UCxxxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]+)$/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    // /@handle
    const handleMatch = path.match(/^\/@([\w.-]+)$/);
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` };

    // /c/customname
    const customMatch = path.match(/^\/c\/([\w.-]+)$/);
    if (customMatch) return { type: 'custom', value: customMatch[1] };

    // /user/username
    const userMatch = path.match(/^\/user\/([\w.-]+)$/);
    if (userMatch) return { type: 'username', value: userMatch[1] };

    // /rawname (e.g. /nikozfps, /German62hz, /p0melow)
    const rawMatch = path.match(/^\/([\w.-]+)$/);
    if (rawMatch) return { type: 'custom', value: rawMatch[1] };

    return null;
  } catch {
    return null;
  }
}

/** Fetch subscriber count for a YouTube channel. Returns null on failure. */
async function fetchYouTubeSubscribers(profileUrl: string, handle: string): Promise<number | null> {
  const parsed = parseYouTubeUrl(profileUrl);
  if (!parsed) {
    console.warn(`  [YT] Cannot parse URL: ${profileUrl}`);
    return null;
  }

  const base = 'https://www.googleapis.com/youtube/v3/channels';
  let url: string;

  if (parsed.type === 'id') {
    url = `${base}?part=statistics&id=${encodeURIComponent(parsed.value)}&key=${YT_API_KEY}`;
  } else if (parsed.type === 'handle') {
    // forHandle requires the @ prefix
    url = `${base}?part=statistics&forHandle=${encodeURIComponent(parsed.value)}&key=${YT_API_KEY}`;
  } else {
    // custom / username — use forUsername (legacy but still works for many)
    url = `${base}?part=statistics&forUsername=${encodeURIComponent(parsed.value)}&key=${YT_API_KEY}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  [YT] HTTP ${res.status} for ${handle}`);
    return null;
  }
  const data = await res.json() as { items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[] };

  const item = data.items?.[0];
  if (!item) {
    // forUsername failed → retry with forHandle using the handle column
    if (parsed.type !== 'handle' && handle && !handle.startsWith('UC')) {
      const fallbackHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const fallbackUrl = `${base}?part=statistics&forHandle=${encodeURIComponent(fallbackHandle)}&key=${YT_API_KEY}`;
      const res2 = await fetch(fallbackUrl);
      if (res2.ok) {
        const data2 = await res2.json() as { items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[] };
        const item2 = data2.items?.[0];
        if (item2?.statistics?.hiddenSubscriberCount) return null; // channel hides subs
        const count2 = item2?.statistics?.subscriberCount;
        if (count2) return parseInt(count2, 10);
      }
    }
    console.warn(`  [YT] No channel found for ${handle} (${profileUrl})`);
    return null;
  }

  if (item.statistics?.hiddenSubscriberCount) {
    console.warn(`  [YT] Hidden subscriber count for ${handle}`);
    return null;
  }

  const count = item.statistics?.subscriberCount;
  if (!count) return null;
  return parseInt(count, 10);
}

// ── Twitch ───────────────────────────────────────────────────────────────────

/** Get Twitch app access token via client credentials. */
async function getTwitchToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  if (!res.ok) throw new Error(`Twitch token error: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

/** Extract Twitch login from profile_url or handle. */
function parseTwitchLogin(profileUrl: string | null, handle: string): string | null {
  if (profileUrl) {
    try {
      const url = new URL(profileUrl);
      // Strip trailing /about, /videos, /clips, etc. — keep only the channel segment
      const path = url.pathname
        .replace(/\/$/, '')
        .replace(/\/(about|videos|clips|schedule|squad|followers)$/, '');
      const match = path.match(/^\/([\w]+)$/);
      if (match) return match[1].toLowerCase();
    } catch {}
  }
  // Fall back to handle (strip @ if present)
  const clean = handle.replace(/^@/, '').trim();
  if (clean && clean !== 'about') return clean || null;
  return null;
}

/** Fetch follower count for a Twitch channel. Returns null on failure. */
async function fetchTwitchFollowers(token: string, profileUrl: string | null, handle: string): Promise<number | null> {
  const login = parseTwitchLogin(profileUrl, handle);
  if (!login) {
    console.warn(`  [TW] Cannot parse login from handle="${handle}" url="${profileUrl}"`);
    return null;
  }

  // First get user ID from login
  const userRes = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
    { headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` } },
  );
  if (!userRes.ok) {
    console.warn(`  [TW] HTTP ${userRes.status} getting user for ${login}`);
    return null;
  }
  const userData = await userRes.json() as { data?: { id: string }[] };
  const userId = userData.data?.[0]?.id;
  if (!userId) {
    console.warn(`  [TW] User not found: ${login}`);
    return null;
  }

  // Then get follower count
  const follRes = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
    { headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` } },
  );
  if (!follRes.ok) {
    console.warn(`  [TW] HTTP ${follRes.status} getting followers for ${login}`);
    return null;
  }
  const follData = await follRes.json() as { total?: number };
  if (follData.total === undefined) return null;
  return follData.total;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const sql = neon(DATABASE_URL);

  console.log(`\n🔄 Syncing followers${DRY_RUN ? ' (DRY RUN — no DB writes)' : ''}\n`);

  // Fetch all yt and twitch socials
  const rows = await sql`
    SELECT ts.id, ts.platform, ts.handle, ts.profile_url, ts.followers_display, t.name
    FROM talent_socials ts
    JOIN talents t ON t.id = ts.talent_id
    WHERE ts.platform IN ('yt', 'twitch')
    ORDER BY ts.platform, t.name
  ` as { id: number; platform: string; handle: string; profile_url: string | null; followers_display: string; name: string }[];

  console.log(`Found ${rows.length} rows to sync (${rows.filter(r => r.platform === 'yt').length} YT, ${rows.filter(r => r.platform === 'twitch').length} Twitch)\n`);

  // Get Twitch token once
  console.log('Getting Twitch token...');
  const twitchToken = await getTwitchToken();
  console.log('Twitch token OK\n');

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const prefix = row.platform === 'yt' ? '[YT]' : '[TW]';
    process.stdout.write(`${prefix} ${row.name} (${row.handle})... `);

    let count: number | null = null;

    if (row.platform === 'yt') {
      count = await fetchYouTubeSubscribers(row.profile_url ?? '', row.handle);
    } else {
      count = await fetchTwitchFollowers(twitchToken, row.profile_url, row.handle);
    }

    if (count === null) {
      console.log(`FAILED (keeping "${row.followers_display}")`);
      failed++;
      continue;
    }

    const display = formatCount(count);

    if (display === row.followers_display) {
      console.log(`unchanged (${display})`);
      skipped++;
      continue;
    }

    console.log(`${row.followers_display} → ${display} (${count.toLocaleString()})`);

    if (!DRY_RUN) {
      await sql`UPDATE talent_socials SET followers_display = ${display} WHERE id = ${row.id}`;
    }
    updated++;

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n✅ Done: ${updated} updated, ${skipped} unchanged, ${failed} failed`);
  if (DRY_RUN) console.log('(DRY RUN — no changes written to DB)');
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1); });
