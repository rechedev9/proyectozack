/**
 * Populate talents.audience_language and talents.top_geos using
 * Twitch broadcaster_language + YouTube channel snippet.defaultLanguage as signals.
 * Falls back to 'es' (agency is Spanish-first) when no signal is available.
 *
 * Run:        npx tsx scripts/sync-geo.ts
 * Dry run:    npx tsx scripts/sync-geo.ts --dry-run
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
const YT_API_KEY = process.env.YOUTUBE_API_KEY ?? '';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID ?? '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET ?? '';
const DATABASE_URL = process.env.DATABASE_URL ?? '';

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!YT_API_KEY) { console.error('YOUTUBE_API_KEY not set'); process.exit(1); }
if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) { console.error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not set'); process.exit(1); }

// ── Heuristic: language → top_geos distribution ──────────────────────────────

type GeoEntry = { country: string; pct: number };

const GEO_BY_LANG: Record<string, GeoEntry[]> = {
  es: [
    { country: 'España', pct: 60 },
    { country: 'México', pct: 25 },
    { country: 'Argentina', pct: 15 },
  ],
  en: [
    { country: 'Estados Unidos', pct: 70 },
    { country: 'Reino Unido', pct: 20 },
    { country: 'Canadá', pct: 10 },
  ],
  pt: [
    { country: 'Brasil', pct: 90 },
    { country: 'Portugal', pct: 10 },
  ],
  fr: [
    { country: 'Francia', pct: 80 },
    { country: 'Bélgica', pct: 10 },
    { country: 'Canadá', pct: 10 },
  ],
  de: [
    { country: 'Alemania', pct: 80 },
    { country: 'Austria', pct: 10 },
    { country: 'Suiza', pct: 10 },
  ],
};

function geosForLanguage(lang: string): GeoEntry[] {
  return GEO_BY_LANG[lang] ?? GEO_BY_LANG.es;
}

// ── ISO-2 → Spanish display name (used by the public stats UI) ───────────────
const ISO_TO_NAME_ES: Record<string, string> = {
  ES: 'España', MX: 'México', AR: 'Argentina', CL: 'Chile',
  CO: 'Colombia', PE: 'Perú', UY: 'Uruguay', VE: 'Venezuela',
  EC: 'Ecuador', BO: 'Bolivia', PY: 'Paraguay', CR: 'Costa Rica',
  PA: 'Panamá', DO: 'Rep. Dominicana', GT: 'Guatemala',
  HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
  PR: 'Puerto Rico',
  US: 'Estados Unidos', GB: 'Reino Unido', CA: 'Canadá', AU: 'Australia',
  IE: 'Irlanda', NZ: 'Nueva Zelanda',
  BR: 'Brasil', PT: 'Portugal',
  FR: 'Francia', BE: 'Bélgica',
  DE: 'Alemania', AT: 'Austria', CH: 'Suiza',
  IT: 'Italia',
  RU: 'Rusia', BG: 'Bulgaria', BY: 'Bielorrusia',
  PL: 'Polonia', UA: 'Ucrania', NL: 'Países Bajos', SE: 'Suecia',
  NO: 'Noruega', DK: 'Dinamarca', FI: 'Finlandia', RO: 'Rumanía',
  HU: 'Hungría', GR: 'Grecia', TR: 'Turquía', CZ: 'Chequia',
  JP: 'Japón', KR: 'Corea del Sur', CN: 'China', IN: 'India',
};

/**
 * Refine the language-default distribution using the creator's country:
 *  - creator already at top      → no change
 *  - creator in default mix      → promote to 60%, rest rebalanced proportionally
 *  - creator not in default mix  → prepend at 50%, default mix scaled to 50
 *  - creator_country unknown to us → no change
 */
function refineGeos(lang: string, creatorCountry: string | null): GeoEntry[] {
  const base = geosForLanguage(lang);
  if (!creatorCountry) return base;

  const name = ISO_TO_NAME_ES[creatorCountry];
  if (!name) return base;

  const idx = base.findIndex((g) => g.country === name);
  if (idx === 0) return base;

  if (idx > 0) {
    const others = base.filter((_, i) => i !== idx);
    const remaining = 100 - 60;
    const totalOther = others.reduce((s, g) => s + g.pct, 0);
    return [
      { country: name, pct: 60 },
      ...others.map((g) => ({
        country: g.country,
        pct: Math.round((g.pct / totalOther) * remaining),
      })),
    ];
  }

  const totalBase = base.reduce((s, g) => s + g.pct, 0);
  const scaled = base.map((g) => ({
    country: g.country,
    pct: Math.round((g.pct / totalBase) * 50),
  }));
  return [{ country: name, pct: 50 }, ...scaled];
}

// ── Twitch helpers ───────────────────────────────────────────────────────────

type TwitchTokenResponse = { access_token: string };
type TwitchUsersResponse = { data?: Array<{ id: string; login: string }> };
type TwitchChannelsResponse = { data?: Array<{ broadcaster_id: string; broadcaster_language: string }> };

async function getTwitchToken(): Promise<string> {
  // Match the proven working pattern in scripts/sync-followers.ts: GET-style with query params
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitch token error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json() as TwitchTokenResponse;
  return data.access_token;
}

function parseTwitchLogin(profileUrl: string | null, handle: string): string | null {
  if (profileUrl) {
    try {
      const url = new URL(profileUrl);
      const path = url.pathname
        .replace(/\/$/, '')
        .replace(/\/(about|videos|clips|schedule|squad|followers)$/, '');
      const match = path.match(/^\/([\w]+)$/);
      if (match) return match[1].toLowerCase();
    } catch {}
  }
  const clean = handle.replace(/^@/, '').trim().toLowerCase();
  return clean || null;
}

/** Resolve mixed broadcaster_id / login values to broadcaster_id by login. */
async function resolveTwitchBroadcasterIds(
  token: string,
  logins: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (logins.length === 0) return map;

  // Helix /users supports up to 100 logins per call
  const batchSize = 100;
  for (let i = 0; i < logins.length; i += batchSize) {
    const batch = logins.slice(i, i + batchSize);
    const params = batch.map((l) => `login=${encodeURIComponent(l)}`).join('&');
    const res = await fetch(`https://api.twitch.tv/helix/users?${params}`, {
      headers: { 'Client-Id': TWITCH_CLIENT_ID, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn(`  [TW] users HTTP ${res.status} for batch ${i / batchSize}`);
      continue;
    }
    const data = await res.json() as TwitchUsersResponse;
    for (const u of data.data ?? []) {
      map.set(u.login.toLowerCase(), u.id);
    }
  }
  return map;
}

/** Fetch broadcaster_language for a list of broadcaster IDs. */
async function fetchTwitchLanguages(
  token: string,
  broadcasterIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (broadcasterIds.length === 0) return map;

  // Helix /channels supports up to 100 broadcaster_id values per call
  const batchSize = 100;
  for (let i = 0; i < broadcasterIds.length; i += batchSize) {
    const batch = broadcasterIds.slice(i, i + batchSize);
    const params = batch.map((id) => `broadcaster_id=${encodeURIComponent(id)}`).join('&');
    const res = await fetch(`https://api.twitch.tv/helix/channels?${params}`, {
      headers: { 'Client-Id': TWITCH_CLIENT_ID, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn(`  [TW] channels HTTP ${res.status} for batch ${i / batchSize}`);
      continue;
    }
    const data = await res.json() as TwitchChannelsResponse;
    for (const c of data.data ?? []) {
      const lang = c.broadcaster_language?.trim().toLowerCase();
      if (lang) map.set(c.broadcaster_id, lang);
    }
  }
  return map;
}

// ── YouTube helpers ──────────────────────────────────────────────────────────

type YouTubeSnippetResponse = {
  items?: Array<{
    id: string;
    snippet: { defaultLanguage?: string; country?: string };
  }>;
}

function parseYouTubeChannelId(profileUrl: string | null, platformId: string | null): { type: 'id' | 'handle' | 'username'; value: string } | null {
  // Prefer stored UC... id
  if (platformId && platformId.startsWith('UC')) {
    return { type: 'id', value: platformId };
  }
  if (!profileUrl) return null;
  try {
    const url = new URL(profileUrl);
    const path = url.pathname.replace(/\/$/, '').replace(/\/(videos|featured|about)$/, '');
    const channelMatch = path.match(/^\/channel\/(UC[\w-]+)$/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };
    const handleMatch = path.match(/^\/@([\w.-]+)$/);
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` };
    const customMatch = path.match(/^\/c\/([\w.-]+)$/);
    if (customMatch) return { type: 'username', value: customMatch[1] };
    const userMatch = path.match(/^\/user\/([\w.-]+)$/);
    if (userMatch) return { type: 'username', value: userMatch[1] };
    const rawMatch = path.match(/^\/([\w.-]+)$/);
    if (rawMatch) return { type: 'username', value: rawMatch[1] };
    return null;
  } catch {
    return null;
  }
}

/** Resolve handles/usernames → channel IDs. One API call per non-id input. */
async function resolveYouTubeChannelIds(
  refs: Array<{ talentId: number; ref: { type: 'id' | 'handle' | 'username'; value: string } }>,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const base = 'https://www.googleapis.com/youtube/v3/channels';

  for (const { talentId, ref } of refs) {
    if (ref.type === 'id') {
      map.set(talentId, ref.value);
      continue;
    }
    const param = ref.type === 'handle' ? 'forHandle' : 'forUsername';
    const url = `${base}?part=id&${param}=${encodeURIComponent(ref.value)}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  [YT] resolve HTTP ${res.status} for ${ref.value}`);
      continue;
    }
    const data = await res.json() as { items?: Array<{ id: string }> };
    const id = data.items?.[0]?.id;
    if (id) map.set(talentId, id);
  }

  return map;
}

/** Fetch defaultLanguage for a list of channel IDs (batched 50). */
async function fetchYouTubeDefaultLanguages(channelIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (channelIds.length === 0) return map;
  const batchSize = 50;
  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${batch.join(',')}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  [YT] snippet HTTP ${res.status} for batch ${i / batchSize}`);
      continue;
    }
    const data = await res.json() as YouTubeSnippetResponse;
    for (const item of data.items ?? []) {
      const lang = item.snippet.defaultLanguage?.trim().toLowerCase();
      if (lang) {
        // Normalize "es-ES" → "es"
        map.set(item.id, lang.split('-')[0]);
      }
    }
  }
  return map;
}

// ── Main ─────────────────────────────────────────────────────────────────────

type SocialRow = {
  talent_id: number;
  platform: string;
  handle: string;
  profile_url: string | null;
  platform_id: string | null;
};

type TalentRow = {
  id: number;
  name: string;
  audience_language: string | null;
  top_geos: GeoEntry[] | null;
  creator_country: string | null;
};

function geosEqual(a: GeoEntry[] | null, b: GeoEntry[] | null): boolean {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((g, i) => g.country === b[i].country && g.pct === b[i].pct);
}

async function main(): Promise<void> {
  const sql = neon(DATABASE_URL);
  console.log(`\nSyncing geo data${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const talents = await sql`
    select id, name, audience_language, top_geos, creator_country
    from talents
    order by id
  ` as TalentRow[];

  const socials = await sql`
    select talent_id, platform, handle, profile_url, platform_id
    from talent_socials
    where platform in ('yt', 'twitch')
  ` as SocialRow[];

  console.log(`Talents: ${talents.length} · Socials: ${socials.length} (${socials.filter(s => s.platform === 'twitch').length} twitch, ${socials.filter(s => s.platform === 'yt').length} yt)\n`);

  // ── Twitch resolution (best-effort: skips if creds invalid) ──
  const twitchSocials = socials.filter((s) => s.platform === 'twitch');
  const twitchByTalent = new Map<number, string>();
  let twitchLangByBroadcaster = new Map<string, string>();

  let twitchToken: string | null = null;
  try {
    console.log('Twitch: getting token...');
    twitchToken = await getTwitchToken();
  } catch (err) {
    console.warn(`Twitch: skipping (token error: ${(err as Error).message})\n`);
  }

  if (twitchToken) {
    const loginsToResolve: string[] = [];
    const loginByTalent = new Map<number, string>();

    for (const s of twitchSocials) {
      if (s.platform_id && /^\d+$/.test(s.platform_id)) {
        twitchByTalent.set(s.talent_id, s.platform_id);
        continue;
      }
      const login = parseTwitchLogin(s.profile_url, s.handle);
      if (!login) {
        console.warn(`  [TW] cannot resolve login for talent_id=${s.talent_id} handle="${s.handle}"`);
        continue;
      }
      loginByTalent.set(s.talent_id, login);
      loginsToResolve.push(login);
    }

    console.log(`Twitch: resolving ${loginsToResolve.length} logins → broadcaster_ids...`);
    const loginToId = await resolveTwitchBroadcasterIds(twitchToken, loginsToResolve);
    for (const [talentId, login] of loginByTalent.entries()) {
      const id = loginToId.get(login);
      if (id) twitchByTalent.set(talentId, id);
    }
    console.log(`Twitch: resolved ${twitchByTalent.size}/${twitchSocials.length} broadcaster_ids`);

    console.log('Twitch: fetching languages...');
    twitchLangByBroadcaster = await fetchTwitchLanguages(
      twitchToken,
      Array.from(new Set(twitchByTalent.values())),
    );
    console.log(`Twitch: got language for ${twitchLangByBroadcaster.size} broadcasters\n`);
  }

  // ── YouTube resolution ──
  const ytSocials = socials.filter((s) => s.platform === 'yt');
  const ytRefs: Array<{ talentId: number; ref: { type: 'id' | 'handle' | 'username'; value: string } }> = [];
  for (const s of ytSocials) {
    const ref = parseYouTubeChannelId(s.profile_url, s.platform_id);
    if (!ref) {
      console.warn(`  [YT] cannot resolve channel for talent_id=${s.talent_id} handle="${s.handle}"`);
      continue;
    }
    ytRefs.push({ talentId: s.talent_id, ref });
  }

  console.log(`YouTube: resolving ${ytRefs.length} channel refs → channel_ids...`);
  const ytChannelByTalent = await resolveYouTubeChannelIds(ytRefs);
  console.log(`YouTube: resolved ${ytChannelByTalent.size}/${ytRefs.length} channel_ids`);

  console.log('YouTube: fetching snippets...');
  const ytLangByChannel = await fetchYouTubeDefaultLanguages(
    Array.from(new Set(ytChannelByTalent.values())),
  );
  console.log(`YouTube: got defaultLanguage for ${ytLangByChannel.size}/${ytChannelByTalent.size} channels\n`);

  // ── Resolve and write ──
  let updated = 0;
  let unchanged = 0;
  const langCounts = new Map<string, number>();

  for (const t of talents) {
    // Twitch first (most reliable for streamers)
    let lang: string | null = null;
    let source = 'default';
    const broadcasterId = twitchByTalent.get(t.id);
    if (broadcasterId) {
      const tl = twitchLangByBroadcaster.get(broadcasterId);
      if (tl) { lang = tl; source = 'twitch'; }
    }
    if (!lang) {
      const channelId = ytChannelByTalent.get(t.id);
      if (channelId) {
        const yl = ytLangByChannel.get(channelId);
        if (yl) { lang = yl; source = 'yt'; }
      }
    }
    if (!lang) lang = 'es';

    // Normalize "es-419" → "es", clamp to 2 letters
    let langKey = lang.split('-')[0].slice(0, 2);
    // Unsupported languages (e.g. "af" from a misconfigured YouTube channel) fall back to ES
    if (!GEO_BY_LANG[langKey]) {
      langKey = 'es';
      source = 'default';
    }
    const geos = refineGeos(langKey, t.creator_country);
    const refined = t.creator_country && geos[0].country !== geosForLanguage(langKey)[0].country;
    const sourceLabel = refined ? `${source}+${t.creator_country}` : source;
    langCounts.set(`${langKey} (${sourceLabel})`, (langCounts.get(`${langKey} (${sourceLabel})`) ?? 0) + 1);

    if (t.audience_language === langKey && geosEqual(t.top_geos, geos)) {
      unchanged++;
      continue;
    }

    const summary = `${t.name.padEnd(22)} → ${langKey} [${sourceLabel}] ${geos.map((g) => `${g.country} ${g.pct}%`).join(' / ')}`;
    console.log(summary);

    if (!DRY_RUN) {
      await sql`
        update talents
        set audience_language = ${langKey}, top_geos = ${JSON.stringify(geos)}::jsonb
        where id = ${t.id}
      `;
    }
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${unchanged} unchanged${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('Distribution:');
  for (const [k, v] of Array.from(langCounts.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('\nFatal:', err); process.exit(1); });
