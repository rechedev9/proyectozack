# SocialPro — Pending Work

> Last updated: 2026-04-01. Historical bootstrap phases (1–10) are complete.
> Read this file at the start of every session before touching any code.

---

## 🔴 Target Discovery — CS2/Gaming Client

### Objective

Build a table of potential creators to contact for a CS2/gaming campaign:
- **Instagram**: 50K–5M followers from LATAM
- **YouTube**: CS2 niche, 500–50K average video views
- **Twitch**: channels streaming CS2 regularly
- **Kick**: manual-only (no public API)

### Current State

- YouTube Data API v3 works. Search finds channels but has NO video-level stats (avg views).
- Instascout (Instagram scraper) is broken — Instagram anti-bot blocks it.
- Twitch service exists at `src/lib/services/twitch.ts` (OAuth + follower counts only). User has API credentials ready.
- Kick has no public API. No integration possible.
- Platform enum (`target_platform`) only allows `instagram | youtube` — must expand.
- CSV import hardcodes `platform: 'instagram'` — must make flexible.

### Constraints

- YouTube API daily quota: 10,000 units. Search = 100 units. Video stats = 3 units/channel.
- Twitch API does NOT expose historical game data per VOD — "50% CS2 in last 3 months" cannot be computed via API. Closest approximation: find channels currently streaming CS2 + keyword match.
- Instagram has no viable automated path. Admin will research manually and import via CSV.

---

### Phase T1: Platform enum + CSV flexibility ✅
*Unlocks all subsequent phases — do first*

**DB migration:**
- `src/db/schema/targets.ts` — add `'twitch'` and `'kick'` to `targetPlatformEnum`
- Generate + apply: `npx drizzle-kit generate && npx drizzle-kit migrate`

**Schema + query updates:**
- `src/lib/schemas/target.ts:37` — Zod enum: `z.enum(['instagram', 'youtube', 'twitch', 'kick'])`
- `src/lib/schemas/target.ts:12` — add optional `platform` field to `csvTargetRowSchema` (default `'instagram'`)
- `src/lib/queries/targets.ts` — `upsertTargetsFromCSV` reads platform from row instead of hardcoding `'instagram'`
- Profile URL generation per platform: instagram.com, youtube.com, twitch.tv, kick.com

**Checkpoint:** `npx tsc --noEmit` passes, CSV import accepts `platform` column.

---

### Phase T2: YouTube CS2 avg video views ✅
*Highest value — API works, just needs video-level stats*

**New service functions** (`src/lib/services/youtube.ts`):
- `getUploadsPlaylistId(channelId)` — `channels?part=contentDetails` (1 quota unit)
- `getRecentVideoIds(playlistId, count=10)` — `playlistItems?part=snippet` (1 unit)
- `getVideoViewCounts(videoIds[])` — `videos?part=statistics` (1 unit per 50 vids)
- `getChannelAvgViews(channelId, count=10)` — chains the above, returns avg views

**New action** (`src/app/admin/(dashboard)/targets/youtube-actions.ts`):
- `enrichYouTubeAvgViewsAction(channelIds[])` — returns `Record<channelId, { avgViews, videoCount }>`

**UI** (`src/app/admin/(dashboard)/targets/YouTubeSearch.tsx`):
- "Avg Views" column in results table
- "Enrich views" button — fetches avg views for selected channels
- Min/max avg views filter inputs
- Loading state during enrichment

**On import:** avg views stored in `notes` field. No schema change needed.

**Checkpoint:** search "counter strike 2", enrich avg views, filter 500–50K, import works.

---

### Phase T3: Twitch CS2 search ✅
*Prerequisite: add `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` to `.env.local` and Vercel*

**Expand Twitch service** (`src/lib/services/twitch.ts`):
- `searchTwitchChannels(query, liveOnly?)` — `GET /helix/search/channels`
- `getCS2LiveStreams(first=100)` — `GET /helix/streams?game_id=32399`
- `getTwitchChannelInfo(broadcasterIds[])` — `GET /helix/channels?broadcaster_id=...`
- Reuse existing `fetchTwitchFollowerCounts()` and `getAppAccessToken()`

**New files:**
- `src/app/admin/(dashboard)/targets/twitch-actions.ts` — `searchTwitchCS2Action`, `importTwitchChannelsAction`
- `src/app/admin/(dashboard)/targets/TwitchSearch.tsx` — collapsible panel (#9146FF), search input, language filter (es/pt), min followers, results table, import

**Wire:** add `<TwitchSearch />` in `TargetsSpreadsheet.tsx` alongside YouTube and Instagram panels.

**50% CS2 limitation:** API cannot compute this. Show current game + followers + language. Admin reviews manually.

**Checkpoint:** search CS2 on Twitch, filter by language=es, import selected channels.

---

### Phase T4: Instagram LATAM (manual workflow) ⬜
*No code changes needed beyond Phase T1*

Admin researches LATAM gaming Instagram profiles manually using public tools (Social Blade, Instagram explore, esports team rosters, competitor followers). Compiles CSV with: `username, followers, biography, full_name, platform`. Imports via existing CSV flow.

Optional: use `claude-in-chrome` MCP tools during a Claude Code session for semi-automated browsing of analytics platforms.

---

### Targets — Phase 5: Promote target → talent (future)
Pattern already proven by `scripts/migrate-agency-to-talents.ts`:
- Button "Promover a Roster" on a `finalizado` target
- Creates `talent` (visibility='internal') + `talent_socials` with `platform_id`
- Once `platform_id` exists, the daily cron (`/api/cron/snapshot-metrics`) picks it up automatically

---

## 🟢 Pending (no blockers)

### TalentModal — focus trap ✅
`TalentModal` now has a manual focus trap — Tab/Shift+Tab cycles within the dialog, Escape closes it.
- File: `src/components/sections/TalentModal.tsx`

### KEVO / LUNA photos
Talent profiles for KEVO (Argentina) and LUNA (México) are in the DB but using placeholder images.
- Add real photos to `public/images/talents/`
- Update seed or run a direct DB update with correct `photo_url`

### Growth H — SEO content (ongoing)
- Calendario editorial: 2–3 artículos/mes
- Target keywords: "cómo conseguir sponsor como streamer", "agencia gaming España", "marketing gaming LATAM"
- Schema already exists (`posts` table, `/blog` routes live)
- Just needs content written and inserted

### logos/3.png cleanup ✅
Confirmed unreferenced and trashed.

### Dark/light theme
- Plan exists but unexecuted
- Design tokens are in `tailwind.config.ts`; no implementation started
- Low priority

---

## Architecture reminders

| Concern | Where |
|---|---|
| YouTube API | `src/lib/services/youtube.ts` — `YOUTUBE_API_KEY` env (10K units/day) |
| Twitch API | `src/lib/services/twitch.ts` — `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` env |
| DB singleton | `src/lib/db.ts` — Neon + Drizzle, edge-safe |
| Auth guard | `src/lib/auth-guard.ts` — `requireRole('admin' \| 'brand')` |
| Server actions pattern | `src/app/admin/(dashboard)/giveaways/actions.ts` — reference impl |
| Spreadsheet UI pattern | `src/app/admin/(dashboard)/talents/RosterSpreadsheet.tsx` |
| Follower sync | `scripts/sync-followers.ts` — YouTube + Twitch via real APIs |
| Committer | `scripts/committer "type(scope): msg" file1 file2 ...` |
| Migration workflow | `npx drizzle-kit generate` → `npx drizzle-kit migrate` |
