# SocialPro — Pending Work

> Last updated: 2026-04-01. Historical bootstrap phases (1–11) are complete.
> Instascout (Instagram) removed — only YouTube + Twitch remain.
> Read this file at the start of every session before touching any code.

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

---

## Phase 11 — Target search: region/language filters ✓ DONE

### Objective

Enable the admin to search for Hispanic CS2 creators on YouTube (1K–100K subs, 500–50K avg views, Spain + LATAM) and Twitch (followers, viewers, language) from the Targets page.

### Current state

- **YouTube search** has: query, min/max subs, description-contains, handle filter, limit, avg views enrichment + min/max avg views filter. NO region or language filtering.
- **Twitch search** has: query, language dropdown (post-filter), min followers, live-only, CS2 live mode. NO max followers, NO viewer count filters, language NOT passed to API.
- YouTube API v3 supports `regionCode` and `relevanceLanguage` params natively.
- Twitch Helix supports `language` on `/streams` (NOT on `/search/channels`).

### Constraints

- YouTube API quota: 10K units/day. Each search costs ~100 units. Multi-region parallel calls are too expensive. Use `relevanceLanguage` to bias toward Spanish globally instead.
- Twitch `/search/channels` does NOT accept `language` param. Language filtering stays as server-side post-filter for search mode. Only `/streams` (CS2 live mode) supports API-side language filtering.
- Files must stay under 500 LOC. `YouTubeSearch.tsx` is already 522 — needs a minor table extraction refactor first.

### Step-by-step plan (bottom-up)

#### Step 1 — Service: `src/lib/services/youtube.ts`

Add optional `regionCode` and `relevanceLanguage` params to `searchYouTubeChannels()`. Append to the search URL conditionally. **+6 LOC.**

#### Step 2 — Service: `src/lib/services/twitch.ts`

Add optional `language` param to `getCS2LiveStreams()`. Append `&language=` to the streams URL conditionally. **+4 LOC.**

#### Step 3 — Actions: `youtube-actions.ts`

Expand `YouTubeSearchParams` with `regionCode: string` and `relevanceLanguage: string`. Pass them through to `searchYouTubeChannels()`.

Region strategy (1 API call always):
- "Hispano" preset → `relevanceLanguage=es`, no `regionCode`
- Single country (ES, MX, AR…) → `regionCode=XX` + selected language
- "Todas" → no filter

**+10 LOC.**

#### Step 4 — Actions: `twitch-actions.ts`

Expand `TwitchSearchParams` with `maxFollowers`, `minViewers`, `maxViewers`. Add post-filters. In CS2 Live mode, pass `language` to `getCS2LiveStreams()`. **+15 LOC.**

#### Step 5 — UI: `YouTubeSearch.tsx`

Refactor: extract results table (~93 lines) into a local component in the same file. Then add two new `<select>` dropdowns to the filter grid:
- **Región**: Todas | Hispanoamérica | España | México | Argentina | Chile | Colombia | Perú
- **Idioma**: Todos | Español | English | Português

**Target: ~490 LOC.**

#### Step 6 — UI: `TwitchSearch.tsx`

Add three new `<input type="number">` fields to the filter grid:
- **Max. seguidores** (placeholder "ilimitado")
- **Min. viewers** (placeholder "0")
- **Max. viewers** (placeholder "ilimitado")

**Target: ~450 LOC.**

### Files affected

| File | Change | LOC after |
|---|---|---|
| `src/lib/services/youtube.ts` | Add params to search function | ~302 |
| `src/lib/services/twitch.ts` | Add language to CS2 streams | ~286 |
| `src/app/admin/(dashboard)/targets/youtube-actions.ts` | Expand params + pass-through | ~210 |
| `src/app/admin/(dashboard)/targets/twitch-actions.ts` | Expand params + post-filters | ~130 |
| `src/app/admin/(dashboard)/targets/YouTubeSearch.tsx` | Refactor table + add dropdowns | ~490 |
| `src/app/admin/(dashboard)/targets/TwitchSearch.tsx` | Add 3 filter inputs | ~450 |

### Risks

- **YouTube `regionCode` is not a hard filter.** It biases results toward a country, not a strict match. Combined with `relevanceLanguage=es` it works well for Hispanic targeting but is not 100% precise. The description-contains filter can further refine.
- **Twitch viewer filters only useful for live channels.** Offline channels have `viewerCount=0`. The UI should make this obvious.

### Verification

1. `npx tsc --noEmit` — clean
2. `npm run lint` — no new errors
3. Chrome tests:
   - YouTube: "cs2" + Hispanoamérica + Español → Spanish CS2 channels
   - YouTube: "cs2" + España → Spanish channels from Spain
   - YouTube: avg views enrichment → 500–50K filter works
   - Twitch: CS2 Live + es → only Spanish streams
   - Twitch: "cs2" + max 100K followers + min 50 viewers → filtered results
4. Searches without new filters still return same results as before
