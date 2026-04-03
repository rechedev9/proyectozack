# SocialPro — Pending Work

> Last updated: 2026-04-03. Historical bootstrap phases (1–11) are complete.
> Structural reorganization phases R1, R3, R4 executed 2026-04-03. R2 applies on next touch.
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
| Spreadsheet UI pattern | `src/components/admin/talents/RosterSpreadsheet.tsx` |
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

---

## Structural Reorganization — Phases R1–R4

> Objective: make the codebase consistently navigable so that any component, query, or action can be found and edited in one obvious place without a full-text search.
> These phases are independent of feature phases and can be executed incrementally.
> **Execute phases in order — R1 breaks import paths that R2/R3/R4 may touch.**

---

## Phase R1 — Move co-located components out of `app/` ✓ DONE

### Objective

Components inside `app/` route directories are invisible to `src/components/` conventions. Any edit to them requires knowing which route they live in rather than browsing `components/`. This phase moves all non-page, non-layout, non-action files from `app/` into `src/components/` under the appropriate sub-directory.

### Current state

**27 component files** are co-located inside `app/` route directories:

| File (current location) | Move to |
|---|---|
| `app/admin/(dashboard)/targets/TargetsDiagnostics.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/TargetsEmptyState.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/TargetsSpreadsheet.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/ThSortable.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/TwitchSearch.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/YouTubeSearch.tsx` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/targets/targets-constants.ts` | `src/components/admin/targets/` |
| `app/admin/(dashboard)/talents/RosterSpreadsheet.tsx` | `src/components/admin/talents/` |
| `app/admin/(dashboard)/analytics/report/[talentSlug]/GrowthReport.tsx` | `src/components/admin/analytics/` |
| `app/admin/(dashboard)/brands/invite-form.tsx` | `src/components/admin/brands/` |
| `app/admin/(dashboard)/equipo/UploadForm.tsx` | `src/components/admin/equipo/` |
| `app/marcas/(portal)/targets/BrandTargetsSpreadsheet.tsx` | `src/components/brand/targets/` |
| `app/marcas/(portal)/talentos/[slug]/client.tsx` | `src/components/brand/` → rename `BrandTalentFichaClient.tsx` |
| `app/giveaways/BrandsSidebar.tsx` | `src/components/giveaways/` |
| `app/giveaways/CodeCard.tsx` | `src/components/giveaways/` |
| `app/giveaways/CreatorsSidebar.tsx` | `src/components/giveaways/` |
| `app/giveaways/GiveawayHubCard.tsx` | `src/components/giveaways/` |
| `app/giveaways/GiveawaysHub.tsx` | `src/components/giveaways/` |
| `app/giveaways/RecentWinners.tsx` | `src/components/giveaways/` |
| `app/giveaways/StatsBar.tsx` | `src/components/giveaways/` |
| `app/giveaways/TopWinners.tsx` | `src/components/giveaways/` |
| `app/creadores/[slug]/CountdownTimer.tsx` | `src/components/creadores/` |
| `app/creadores/[slug]/CreatorHero.tsx` | `src/components/creadores/` |
| `app/creadores/[slug]/GiveawayCard.tsx` | `src/components/creadores/` |
| `app/creadores/[slug]/GiveawayGrid.tsx` | `src/components/creadores/` |
| `app/creadores/[slug]/UnboxReveal.tsx` | `src/components/creadores/` |

### Constraints

- Only move files. Do not refactor, rename (except `client.tsx` → `BrandTalentFichaClient.tsx`), or change logic.
- Update all `import` paths in their parent `page.tsx` and `layout.tsx` after each move.
- Architecture reminders table at the top of this file must be updated: `RosterSpreadsheet.tsx` new path.
- CLAUDE.md note "Spreadsheet UI pattern" must be updated after R1.
- `targets-constants.ts` is a `.ts` not a `.tsx` — move it, do not rename.

### Step-by-step plan

#### Step 1 — Create new directories

```
src/components/admin/targets/
src/components/admin/talents/
src/components/admin/analytics/
src/components/admin/brands/
src/components/admin/equipo/
src/components/brand/targets/
src/components/giveaways/
src/components/creadores/
```

#### Step 2 — Move `targets/` components (6 files + 1 constants)

Move all 7 files from `app/admin/(dashboard)/targets/` (non-page, non-action files).
Update `app/admin/(dashboard)/targets/page.tsx` imports.

#### Step 3 — Move `talents/` component (1 file)

Move `RosterSpreadsheet.tsx`. Update `app/admin/(dashboard)/talents/page.tsx`.
Update architecture reminders in this file.

#### Step 4 — Move `analytics/` component (1 file)

Move `GrowthReport.tsx`. Update `app/admin/(dashboard)/analytics/report/[talentSlug]/page.tsx`.

#### Step 5 — Move `brands/` and `equipo/` components (2 files)

Move `invite-form.tsx` and `UploadForm.tsx`. Update parent pages.

#### Step 6 — Move `marcas/` components (2 files)

Move `BrandTargetsSpreadsheet.tsx` and rename `client.tsx` → `BrandTalentFichaClient.tsx`.
Update `app/marcas/(portal)/targets/page.tsx` and `app/marcas/(portal)/talentos/[slug]/page.tsx`.

#### Step 7 — Move `giveaways/` components (8 files)

Move all non-page files from `app/giveaways/`. Update `app/giveaways/page.tsx`.

#### Step 8 — Move `creadores/` components (5 files)

Move all non-page files from `app/creadores/[slug]/`. Update `app/creadores/[slug]/page.tsx`.

### Files affected

All 27 component files listed above plus the `page.tsx` / `layout.tsx` files that import them.
After: `app/` contains only `page.tsx`, `layout.tsx`, `actions*.ts`, `route.ts`, `error.tsx`, `loading.tsx` files.

### Risks

- **Import path breaks** if any file is missed during the move. Mitigation: run `npx tsc --noEmit` after each step.
- **`client.tsx` rename** may break Fast Refresh cache — rebuild after rename.
- **Barrel `index.ts` files** do not exist in `components/` subdirs; do not create them (adds indirection for no gain).

### Verification

After each step:
1. `npx tsc --noEmit` — zero errors
2. `npm run lint` — zero new warnings
3. Dev server: manually navigate to the affected route, confirm no 404s or component errors

---

## Phase R2 — Standardize server actions naming convention ⬜ TODO

### Objective

`app/admin/(dashboard)/targets/` has three action files (`actions.ts`, `diagnostics-actions.ts`, `youtube-actions.ts`) with no consistent naming rule. `giveaways/` also has three (`actions.ts`, `codes-actions.ts`, `winners-actions.ts`). Define a convention and apply it on the next edit to each file — no mass rename needed now.

### Constraint

Do not rename files proactively. Apply the convention the next time each file is touched for a feature change. This avoids a churn commit with no behavior change.

### Convention to adopt

- **Single domain route**: one `actions.ts` — no prefix.
- **Multi-domain route** (targets, giveaways): one file per domain, always `[domain]-actions.ts`. No bare `actions.ts` in a multi-domain route.
  - `targets/`: rename `actions.ts` → `targets-actions.ts` on next touch.
  - `giveaways/`: rename `actions.ts` → `giveaway-actions.ts` on next touch.
- **Export naming**: every exported server action function must include the domain in its name (`searchYouTubeChannels`, not `search`).

### Files affected (on next touch)

| Current | Rename to |
|---|---|
| `app/admin/(dashboard)/targets/actions.ts` | `targets-actions.ts` |
| `app/admin/(dashboard)/giveaways/actions.ts` | `giveaway-actions.ts` |

### Risks

- Architecture reminders table references `giveaways/actions.ts` as the "Server actions pattern" reference impl. Update the pointer when the rename happens.

---

## Phase R3 — Split `src/types/index.ts` into domain files ✓ DONE

### Objective

`src/types/index.ts` currently re-exports all `InferSelectModel` types from a single file. As the schema grows this becomes a bottleneck: editing one domain type requires opening a catch-all file, and the flat namespace obscures domain boundaries.

### Current state

Single file at `src/types/index.ts` with 20+ type exports inferred from Drizzle schema models.

### Step-by-step plan

1. Create `src/types/talent.ts`, `src/types/giveaway.ts`, `src/types/brand.ts`, `src/types/target.ts`, `src/types/case.ts`, `src/types/post.ts`, `src/types/auth.ts`.
2. Move the relevant `InferSelectModel` type exports into each file.
3. Convert `src/types/index.ts` into a barrel that re-exports everything from the domain files — preserving all existing import paths with zero consumer changes.
4. Verify: `npx tsc --noEmit` clean.

### Constraints

- `src/types/index.ts` must continue to exist as a re-export barrel so no consumer imports break.
- Do not split until Phase R1 is complete (avoids compound diffs).

### Risks

- Low risk. The barrel pattern means zero import changes for consumers.

---

## Phase R4 — Clean up `scripts/` ✓ DONE

### Objective

`scripts/` mixes general-purpose tooling with one-off talent-specific seed files and an `.mjs` outlier, making it hard to distinguish stable scripts from historical one-offs.

### Current state

One-off seed scripts: `add-chips.ts`, `add-manolito.ts`, `add-therealfer.ts`.
Extension mismatch: `extract-images.mjs` (`.mjs` in a TypeScript project).

### Step-by-step plan

1. Create `scripts/seeds/talents/` directory.
2. Move `add-chips.ts`, `add-manolito.ts`, `add-therealfer.ts` into it.
3. Convert `extract-images.mjs` to `extract-images.ts` — replace `import.meta.url` pattern if used with `__filename`/`__dirname` via `tsx`, or keep `.mjs` and document it explicitly.
4. Update README / any docs that reference these paths.

### Constraints

- None of these scripts are referenced in `package.json`. They are run manually. No `npm run` commands break.
- Verify `extract-images.mjs` does not rely on native ES module features unavailable in `tsx` before converting.

### Risks

- Very low. These are manual-run scripts with no automated callers.

### Verification

After moves:
1. `node scripts/seeds/talents/add-chips.ts` (via tsx) still runs without error.
2. `node scripts/extract-images.mjs` (or `.ts` after conversion) still works.
3. `npx tsc --noEmit` clean (new files must resolve).
