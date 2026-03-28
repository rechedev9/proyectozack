# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Protocol
- Docs: run `scripts/docs-list` before deep work; honor `read_when` hints.
- Commit helper: `scripts/committer "type(scope): message" file1 file2`.
- Keep files <500 LOC; split when exceeded.

## Session Continuity
- `/handoff`: read `docs/handoff.md` — dump state for next session.
- `/pickup`: read `docs/pickup.md` — rehydrate context when starting.

## Project Overview

A Next.js 16 app for a gaming/esports talent agency (SocialPro). All code lives at the repo root. The migration plan and phase tracking live in `roadmap.md`. Read it before any work.

## Running the Project

```bash
npm run dev          # dev server (port 3000)
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # type-check

# Database
npx drizzle-kit generate   # generate migration SQL
npx drizzle-kit migrate    # run migrations against DATABASE_URL
npx tsx scripts/seed.ts    # seed data (run after extract-images.mjs)
node scripts/extract-images.mjs  # extract base64 images from HTML → public/images/

# Tests
npm test                    # unit (jest)
npm run test:e2e            # playwright e2e
npm run test:coverage
```

## Next.js App Architecture

**Stack:** Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Drizzle ORM · Neon Postgres · Better Auth · Resend · shadcn/ui · Zod v4 · react-hook-form · @vercel/blob

**Required env vars** (`.env.local`):
- `DATABASE_URL` — Neon connection string
- `RESEND_API_KEY`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`

### File Structure (target — being built out)

```
src/
  app/
    layout.tsx                   # Root: fonts, metadata, Nav, globals
    page.tsx                     # Home: Server Component, Promise.all, revalidate=3600
    globals.css
    admin/
      layout.tsx                 # Better Auth session guard (uses requireRole)
      page.tsx, talents/, cases/, testimonials/
      brands/                    # Brand account management (invite + list)
    marcas/
      login/page.tsx             # Brand login page
      (portal)/
        layout.tsx               # Brand portal layout (requireRole('brand'))
        page.tsx                 # Brand dashboard
        talentos/page.tsx        # Talent catalog with filters
        talentos/[slug]/         # Talent ficha + proposal modal
        comparar/page.tsx        # Side-by-side talent comparison
        propuestas/page.tsx      # Brand's proposals list
    api/
      contact/route.ts           # POST → DB insert + Resend email
      auth/[...all]/route.ts     # Better Auth catch-all
      marcas/proposals/route.ts  # POST proposal submission
  components/
    layout/                      # Nav.tsx (CLIENT), Footer.tsx (SERVER), PortalSidebar.tsx (SERVER)
    sections/                    # One file per page section
    brand/                       # BrandTalentCard, FilterChips, ProposalModal, EmptyState, ComparisonView
    ui/                          # GradientText, SectionTag, SectionHeading, StatusBadge, SocialIcon
  db/
    index.ts                     # Neon + Drizzle singleton (edge-safe)
    schema/                      # talents.ts, content.ts, cases.ts, submissions.ts, brands.ts, auth.ts → re-exported from index.ts
  lib/
    queries/                     # talents.ts, content.ts, cases.ts, portfolio.ts, brands.ts
    schemas/                     # Zod schemas (contact.ts, proposal.ts)
    env.ts                       # @t3-oss/env-nextjs schema
    email.ts                     # Resend helpers (contact + brand invite)
    auth.ts                      # Better Auth config
    auth-guard.ts                # Shared requireRole() util for admin + brand portals
  types/index.ts                 # InferSelectModel exports
```

### Server vs Client Component Rule

- **SERVER:** anything that only reads data (no onClick/useState/useEffect/scroll events)
- **CLIENT:** Nav, TalentGrid, TalentCard/Modal, ServicesSection (tabs), CaseCard, PortfolioGrid, ContactSection, FilterChips, ProposalModal, BrandTalentFichaClient
- **Data flow:** Server shell fetches all data → passes full array as prop to Client child → Client filters locally. No client-side DB calls ever.

### Database Schema Summary

See `roadmap.md` Phase 2 for exact column definitions. Tables:
- `talents`, `talent_tags`, `talent_stats`, `talent_socials`
- `testimonials`, `collaborators`, `team_members`, `brands`, `portfolio_items`
- `case_studies`, `case_body`, `case_tags`, `case_creators` (has `talent_id` FK)
- `contact_submissions`, `creator_applications`, `posts`
- `brand_campaigns`, `talent_proposals` (Growth G)
- Auth: `user` (with `role` text column), `session`, `account`, `verification`

Enums: `platform` (twitch|youtube), `status` (active|available), `portfolio_type` (thumb|video|campaign), `proposal_status` (pendiente|en_revision|aceptada|rechazada).

## Database Migrations
- **Drizzle is the single source of truth.** Never create tables or alter columns via raw SQL, seed scripts, or the Neon console. All schema changes go through `npx drizzle-kit generate` → `npx drizzle-kit migrate`.
- **Verify `__drizzle_migrations` exists** before assuming migrations are current. If it's missing, the DB was provisioned outside Drizzle and must be reconciled before any new migration work.
- **After applying migrations manually** (to fix drift), always backfill the `__drizzle_migrations` table with the correct hashes so future `drizzle-kit migrate` runs are idempotent.

## CSS / Design System

**Brand tokens** defined in `tailwind.config.ts` under `theme.extend.colors`:
`sp-orange:#f5632a`, `sp-pink:#e03070`, `sp-dpink:#c42880`, `sp-purple:#8b3aad`, `sp-blue:#5b9bd5`, `sp-dark`, `sp-black`, `sp-muted`, `sp-border`, `sp-off`, `sp-bg2`.

**Fonts:** `font-display` = Barlow Condensed 800–900 uppercase; `font-body` = Inter.

**Gradient signature:** `bg-sp-grad` = `linear-gradient(135deg, #f5632a 0%, #e03070 35%, #c42880 62%, #8b3aad 100%)`. Use with restraint.

Complex CSS (marquee, gradient text, modals) stays in `globals.css` — do not force-migrate to Tailwind utilities.

## Design Context

Full context in `.impeccable.md`. Summary:

**Brand:** Premium · Sharp · Credible. Spanish market, international ambition. Anti-pattern: neon-on-black gamer aesthetic.

**Principles:**
1. Credibility over hype — gradient is signature, not decoration
2. Creators are the product — foreground name, platform, numbers
3. Dark hero + light interior sections — alternating rhythm is intentional
4. Typography does the heavy lifting — Barlow Condensed IS the energy
5. Motion earns attention — remove it if it makes no difference

## Change Order — Bottom-Up (STRICT)

**Always implement in this order: DB → Query/API → Frontend. Never the reverse.**

Violating this order breaks something every time:
- Writing frontend before the query exists → TypeScript errors, shape mismatches
- Writing a query before the schema exists → runtime errors, wrong column names
- Assuming a column/table exists without reading the schema → silent bugs

Rules:
1. **Schema first.** Read `db/schema/` before touching any query or component. Verify column names, types, and relations exist before using them.
2. **Query second.** Write or update `lib/queries/` after schema is confirmed. Run `npx tsc --noEmit` to verify types.
3. **Frontend last.** Only build components after the data shape is proven correct end-to-end.
4. **`followers_display` values come from `scripts/sync-followers.ts`.** Never hardcode follower counts — run the sync script against real APIs.

## TypeScript Rules

Hard lessons from this project — never skip these:

1. **Never assume a field name — read the schema.** Column names in Drizzle use camelCase in TS but snake_case in SQL. `followers_display` in DB = `followersDisplay` in TS. Always verify in `db/schema/` before using.
2. **Never guess what an API returns.** Type the response explicitly or cast to a typed interface. Untyped `await res.json()` silently gives `any` and hides bugs.
3. **Parse, don't assume data formats.** `followers_display` can be `"180K"`, `"1.2M"`, `"63"`, or `"-"`. Always verify real DB values before writing a parser — the format you assume is never the full picture.
4. **`parseFollowers("-")` must return 0** — treat unknown/missing values explicitly, not as a fallback edge case.
5. **Sort comparators with unknowns need explicit sentinel logic.** When sorting by a numeric field derived from display strings, creators with `totalFollowers === 0` (no data) must always go to the bottom regardless of sort direction — otherwise they flood the top in `asc` and make the sort useless.
6. **Platform filters affect sort context.** When filtering by platform(s) and sorting by followers, sort by followers on the *filtered* platforms only — not total across all networks. A creator with 1M Twitch followers and 63 YT subs should not rank first in a YT-filtered followers sort.
