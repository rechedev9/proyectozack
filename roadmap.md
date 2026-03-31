# SocialPro — Pending Work

> Last updated: 2026-03-31. Historical bootstrap phases (1–10) are complete.
> Read this file at the start of every session before touching any code.

---

## 🟡 In Progress / Next Up

### Targets — Phase 4: Promote target → talent (future)
Pattern already proven by `scripts/migrate-agency-to-talents.ts`:
- Button "Promover a Roster" on a `finalizado` target
- Creates `talent` (visibility='internal') + `talent_socials` with `platform_id`
- Once `platform_id` exists, the daily cron (`/api/cron/snapshot-metrics`) picks it up automatically

---

## 🟢 Pending (no blockers)

### TalentModal — focus trap
`TalentModal` has `aria-modal="true"` but keyboard focus escapes the modal (tab cycles the whole page).
- Add focus trap: `focus-trap-react` or manual implementation
- File: `src/components/sections/TalentModal.tsx` (or adjacent client wrapper)

### KEVO / LUNA photos
Talent profiles for KEVO (Argentina) and LUNA (México) are in the DB but using placeholder images.
- Add real photos to `public/images/talents/`
- Update seed or run a direct DB update with correct `photo_url`

### Growth H — SEO content (ongoing)
- Calendario editorial: 2–3 artículos/mes
- Target keywords: "cómo conseguir sponsor como streamer", "agencia gaming España", "marketing gaming LATAM"
- Schema already exists (`posts` table, `/blog` routes live)
- Just needs content written and inserted

### logos/3.png cleanup
- `public/images/logos/3.png` (172 KB) — not referenced in any source file
- Safe to delete once confirmed not needed
- Use `trash public/images/logos/3.png` (never `rm`)

### Dark/light theme
- Plan exists but unexecuted
- Design tokens are in `tailwind.config.ts`; no implementation started
- Low priority

---

## Architecture reminders

| Concern | Where |
|---|---|
| YouTube API | `src/lib/services/youtube.ts` — `YOUTUBE_API_KEY` env |
| DB singleton | `src/lib/db.ts` — Neon + Drizzle, edge-safe |
| Auth guard | `src/lib/auth-guard.ts` — `requireRole('admin' \| 'brand')` |
| Server actions pattern | `src/app/admin/(dashboard)/giveaways/actions.ts` — reference impl |
| Spreadsheet UI pattern | `src/app/admin/(dashboard)/talents/RosterSpreadsheet.tsx` |
| Follower sync | `scripts/sync-followers.ts` — YouTube + Twitch via real APIs |
| Committer | `scripts/committer "type(scope): msg" file1 file2 ...` |
| Migration workflow | `npx drizzle-kit generate` → `npx drizzle-kit migrate` |
