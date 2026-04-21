# SocialPro — Roadmap

> Last updated: 2026-04-03. All bootstrap and structural phases complete.
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

## Pending

### R2 — Server actions naming (apply on next touch, not proactively)

Convention: multi-domain routes use `[domain]-actions.ts`, no bare `actions.ts`.

| Current | Rename to |
|---|---|
| `app/admin/(dashboard)/targets/actions.ts` | `targets-actions.ts` |
| `app/admin/(dashboard)/giveaways/actions.ts` | `giveaway-actions.ts` |

When renamed, update the "Server actions pattern" pointer in the architecture table above.
