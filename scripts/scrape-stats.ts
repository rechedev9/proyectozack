/**
 * Scrape supplementary stats via Firecrawl:
 *  - avg_viewers (Twitch) from twitchtracker.com — last 30d concurrent average
 *  - creator_country (YouTube + Twitch fallback) from socialblade.com
 *
 * Run examples:
 *   npx tsx scripts/scrape-stats.ts --dry-run --limit=3
 *   npx tsx scripts/scrape-stats.ts --source=twitch --limit=10
 *   npx tsx scripts/scrape-stats.ts --apply           (full sweep, missing-only)
 *   npx tsx scripts/scrape-stats.ts --apply --refresh (re-scrape everything)
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// ── Load .env.local ─────────────────────────────────────────────────────────
try {
  const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
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

// ── Args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run') || !argv.includes('--apply');
const REFRESH = argv.includes('--refresh');
const LIMIT_ARG = argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : 0;
const SOURCE_ARG = argv.find((a) => a.startsWith('--source='));
const SOURCE = (SOURCE_ARG ? SOURCE_ARG.split('=')[1] : 'all') as 'twitch' | 'yt' | 'all';

if (!['twitch', 'yt', 'all'].includes(SOURCE)) {
  console.error(`--source must be one of: twitch, yt, all (got "${SOURCE}")`);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!FIRECRAWL_API_KEY) {
  console.error('FIRECRAWL_API_KEY not set in .env.local');
  console.error('Add: FIRECRAWL_API_KEY=fc-...');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ── Firecrawl client ─────────────────────────────────────────────────────────
interface FirecrawlScrapeResponse {
  readonly success: boolean;
  readonly data?: {
    readonly markdown?: string;
    readonly html?: string;
  };
  readonly error?: string;
}

async function firecrawlScrape(url: string): Promise<string | null> {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: false,
      waitFor: 1500,
      timeout: 30000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`    firecrawl HTTP ${res.status}: ${body.slice(0, 200)}`);
    return null;
  }

  const data = (await res.json()) as FirecrawlScrapeResponse;
  if (!data.success || !data.data?.markdown) {
    console.warn(`    firecrawl error: ${data.error ?? 'no markdown'}`);
    return null;
  }
  return data.data.markdown;
}

// ── URL helpers ──────────────────────────────────────────────────────────────

function twitchLogin(profileUrl: string | null, handle: string): string | null {
  if (profileUrl) {
    try {
      const url = new URL(profileUrl);
      const path = url.pathname
        .replace(/\/$/, '')
        .replace(/\/(about|videos|clips|schedule|squad|followers)$/, '');
      const m = path.match(/^\/([\w]+)$/);
      if (m) return m[1].toLowerCase();
    } catch {}
  }
  const clean = handle.replace(/^@/, '').trim();
  return clean || null;
}

function youtubeIdentifier(profileUrl: string | null, handle: string): { kind: 'channel' | 'handle' | 'user' | 'c'; value: string } | null {
  if (profileUrl) {
    try {
      const url = new URL(profileUrl);
      const path = url.pathname.replace(/\/$/, '');
      const channel = path.match(/^\/channel\/(UC[\w-]+)$/);
      if (channel) return { kind: 'channel', value: channel[1] };
      const at = path.match(/^\/@([\w.-]+)$/);
      if (at) return { kind: 'handle', value: at[1] };
      const c = path.match(/^\/c\/([\w.-]+)$/);
      if (c) return { kind: 'c', value: c[1] };
      const u = path.match(/^\/user\/([\w.-]+)$/);
      if (u) return { kind: 'user', value: u[1] };
      const raw = path.match(/^\/([\w.-]+)$/);
      if (raw) return { kind: 'c', value: raw[1] };
    } catch {}
  }
  const clean = handle.replace(/^@/, '').trim();
  if (!clean) return null;
  return { kind: 'handle', value: clean };
}

// ── Parsers ──────────────────────────────────────────────────────────────────

/**
 * TwitchTracker shows "Average viewers" near the top of /<login>.
 * Markdown variants we've seen: "Average viewers\n\n123" and "Avg. viewers: 123".
 * We grab the first integer that follows the label.
 */
function parseAvgViewers(markdown: string): number | null {
  const patterns: ReadonlyArray<RegExp> = [
    /average\s+viewers?\s*[:\-]?\s*\n*\s*([\d,\.]+)/i,
    /avg\.?\s+viewers?\s*[:\-]?\s*\n*\s*([\d,\.]+)/i,
    /viewers?\s*\(avg\)\s*[:\-]?\s*([\d,\.]+)/i,
  ];
  for (const re of patterns) {
    const m = markdown.match(re);
    if (m) {
      const n = parseInt(m[1].replace(/[,\.]/g, ''), 10);
      if (!Number.isNaN(n) && n >= 0 && n < 10_000_000) return n;
    }
  }
  return null;
}

/**
 * SocialBlade renders the creator country as a leaderboard link of the form
 *   [ES](https://socialblade.com/youtube/lists/top/100/subscribers/all/ES) Rank
 * That URL pattern is the most reliable signal — the channel's own country leaderboard.
 * Anything else (related-channel cards, "SET India" suggestions) gives false positives.
 */
function parseCountry(markdown: string): string | null {
  const m = markdown.match(/\/lists\/top\/\d+\/subscribers\/all\/([A-Z]{2})\)\s*Rank/);
  if (m) return m[1];
  return null;
}

// ── DB rows ──────────────────────────────────────────────────────────────────

interface TwitchRow {
  readonly socialId: number;
  readonly talentId: number;
  readonly talentName: string;
  readonly handle: string;
  readonly profileUrl: string | null;
  readonly avgViewers: number | null;
}

interface YtRow {
  readonly socialId: number;
  readonly talentId: number;
  readonly talentName: string;
  readonly handle: string;
  readonly profileUrl: string | null;
  readonly creatorCountry: string | null;
}

async function loadTwitchRows(): Promise<ReadonlyArray<TwitchRow>> {
  const rows = (await sql`
    SELECT ts.id AS social_id, ts.talent_id, t.name AS talent_name,
           ts.handle, ts.profile_url, ts.avg_viewers
    FROM talent_socials ts
    JOIN talents t ON t.id = ts.talent_id
    WHERE ts.platform = 'twitch'
    ORDER BY t.name
  `) as unknown as ReadonlyArray<{
    readonly social_id: number;
    readonly talent_id: number;
    readonly talent_name: string;
    readonly handle: string;
    readonly profile_url: string | null;
    readonly avg_viewers: number | null;
  }>;
  return rows.map((r) => ({
    socialId: r.social_id,
    talentId: r.talent_id,
    talentName: r.talent_name,
    handle: r.handle,
    profileUrl: r.profile_url,
    avgViewers: r.avg_viewers,
  }));
}

async function loadYtRows(): Promise<ReadonlyArray<YtRow>> {
  const rows = (await sql`
    SELECT ts.id AS social_id, ts.talent_id, t.name AS talent_name,
           ts.handle, ts.profile_url, t.creator_country
    FROM talent_socials ts
    JOIN talents t ON t.id = ts.talent_id
    WHERE ts.platform = 'yt'
    ORDER BY t.name
  `) as unknown as ReadonlyArray<{
    readonly social_id: number;
    readonly talent_id: number;
    readonly talent_name: string;
    readonly handle: string;
    readonly profile_url: string | null;
    readonly creator_country: string | null;
  }>;
  return rows.map((r) => ({
    socialId: r.social_id,
    talentId: r.talent_id,
    talentName: r.talent_name,
    handle: r.handle,
    profileUrl: r.profile_url,
    creatorCountry: r.creator_country,
  }));
}

// ── Main flows ───────────────────────────────────────────────────────────────

async function syncTwitch(): Promise<{ updated: number; failed: number; skipped: number }> {
  const all = await loadTwitchRows();
  const candidates = REFRESH ? all : all.filter((r) => r.avgViewers === null);
  const todo = LIMIT > 0 ? candidates.slice(0, LIMIT) : candidates;
  console.log(`\n[twitch] ${todo.length} of ${candidates.length} candidates (total ${all.length})`);
  let updated = 0, failed = 0, skipped = 0;
  for (const row of todo) {
    const login = twitchLogin(row.profileUrl, row.handle);
    if (!login) { console.log(`  · ${row.talentName}: no login`); failed++; continue; }
    const url = `https://twitchtracker.com/${login}`;
    process.stdout.write(`  · ${row.talentName} (${login})... `);
    const md = await firecrawlScrape(url);
    if (!md) { console.log('SCRAPE FAILED'); failed++; continue; }
    const avg = parseAvgViewers(md);
    if (avg === null) { console.log('NO AVG MATCH'); failed++; continue; }
    if (avg === row.avgViewers) { console.log(`unchanged (${avg})`); skipped++; continue; }
    console.log(`${row.avgViewers ?? '∅'} → ${avg}`);
    if (!DRY_RUN) {
      await sql`UPDATE talent_socials SET avg_viewers = ${avg} WHERE id = ${row.socialId}`;
    }
    updated++;
    await new Promise((r) => setTimeout(r, 300));
  }
  return { updated, failed, skipped };
}

async function syncYt(): Promise<{ updated: number; failed: number; skipped: number }> {
  const all = await loadYtRows();
  // Group by talentId so we don't double-scrape when a talent has multiple YT socials.
  const byTalent = new Map<number, YtRow>();
  for (const r of all) if (!byTalent.has(r.talentId)) byTalent.set(r.talentId, r);
  const unique = [...byTalent.values()];
  const candidates = REFRESH ? unique : unique.filter((r) => r.creatorCountry === null);
  const todo = LIMIT > 0 ? candidates.slice(0, LIMIT) : candidates;
  console.log(`\n[yt] ${todo.length} of ${candidates.length} talent candidates (total YT socials ${all.length})`);
  let updated = 0, failed = 0, skipped = 0;
  for (const row of todo) {
    const ident = youtubeIdentifier(row.profileUrl, row.handle);
    if (!ident) { console.log(`  · ${row.talentName}: no identifier`); failed++; continue; }
    const slug =
      ident.kind === 'handle' ? `@${ident.value}` :
      ident.kind === 'channel' ? `channel/${ident.value}` :
      ident.kind === 'user' ? `user/${ident.value}` :
      `c/${ident.value}`;
    const url = `https://socialblade.com/youtube/${slug}`;
    process.stdout.write(`  · ${row.talentName} (${slug})... `);
    const md = await firecrawlScrape(url);
    if (!md) { console.log('SCRAPE FAILED'); failed++; continue; }
    const country = parseCountry(md);
    if (!country) { console.log('NO COUNTRY MATCH'); failed++; continue; }
    if (country === row.creatorCountry) { console.log(`unchanged (${country})`); skipped++; continue; }
    console.log(`${row.creatorCountry ?? '∅'} → ${country}`);
    if (!DRY_RUN) {
      await sql`UPDATE talents SET creator_country = ${country} WHERE id = ${row.talentId}`;
    }
    updated++;
    await new Promise((r) => setTimeout(r, 300));
  }
  return { updated, failed, skipped };
}

async function main(): Promise<void> {
  console.log(`scrape-stats — source=${SOURCE} dry=${DRY_RUN} refresh=${REFRESH} limit=${LIMIT || 'none'}`);

  let totals = { updated: 0, failed: 0, skipped: 0 };
  if (SOURCE === 'twitch' || SOURCE === 'all') {
    const t = await syncTwitch();
    totals = {
      updated: totals.updated + t.updated,
      failed: totals.failed + t.failed,
      skipped: totals.skipped + t.skipped,
    };
  }
  if (SOURCE === 'yt' || SOURCE === 'all') {
    const y = await syncYt();
    totals = {
      updated: totals.updated + y.updated,
      failed: totals.failed + y.failed,
      skipped: totals.skipped + y.skipped,
    };
  }
  console.log(`\nDone — updated=${totals.updated} unchanged=${totals.skipped} failed=${totals.failed}${DRY_RUN ? ' (dry run)' : ''}`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
