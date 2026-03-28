# Agency Creators Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import ~70 agency creators from Excel into a private DB table, display them in the admin dashboard, redesign the Talents page as a pitch-deck-style landing for brand meetings, and remove Cases from Analytics.

**Architecture:** New `agency_creators` table (separate from public `talents`). Server-side only — no public routes or components touch this data. The admin talents page becomes a presentation-ready view with aggregate KPIs and a searchable creator roster. Analytics drops its Cases section.

**Tech Stack:** Drizzle ORM · Neon Postgres · Next.js Server Components · Tailwind CSS

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/db/schema/agencyCreators.ts` | Schema for `agency_creators` table |
| Modify | `src/db/schema/index.ts` | Re-export new schema |
| Create | `src/lib/queries/agencyCreators.ts` | Query functions (getAll, count, getByCountry) |
| Create | `scripts/seed-agency-creators.ts` | Parse Excel → INSERT into agency_creators |
| Modify | `src/app/admin/(dashboard)/page.tsx` | Add Agency Creators count card |
| Rewrite | `src/app/admin/(dashboard)/talents/page.tsx` | Pitch-deck landing page |
| Create | `src/app/admin/(dashboard)/talents/AgencyRoster.tsx` | Client component: search, filter, table |
| Modify | `src/app/admin/(dashboard)/analytics/AnalyticsDashboard.tsx` | Remove Cases references |
| Modify | `src/app/admin/(dashboard)/layout.tsx` | Update sidebar nav (rename Talentos → Roster) |

---

### Task 1: Database Schema — `agency_creators` table

**Files:**
- Create: `src/db/schema/agencyCreators.ts`
- Modify: `src/db/schema/index.ts`

- [ ] **Step 1: Create schema file**

```ts
// src/db/schema/agencyCreators.ts
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

export const agencyCreators = pgTable('agency_creators', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  country: varchar('country', { length: 50 }),
  youtubeUrl: text('youtube_url'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  tiktokUrl: text('tiktok_url'),
  twitchUrl: text('twitch_url'),
  kickUrl: text('kick_url'),
  geostatsUrl: text('geostats_url'),
  statsUrl: text('stats_url'),
  trackerUrl: text('tracker_url'),
});
```

- [ ] **Step 2: Add re-export in schema index**

Add `export * from './agencyCreators';` to `src/db/schema/index.ts`.

- [ ] **Step 3: Generate migration**

Run: `npx drizzle-kit generate`
Expected: New migration SQL file in `drizzle/`

- [ ] **Step 4: Apply migration**

Run: `npx drizzle-kit migrate`
Expected: `agency_creators` table created in Neon

- [ ] **Step 5: Verify table exists**

Run via Neon MCP: `SELECT count(*) FROM agency_creators`
Expected: `0` rows

- [ ] **Step 6: Commit**

```
scripts/committer "feat(db): add agency_creators table for internal creator roster" \
  src/db/schema/agencyCreators.ts src/db/schema/index.ts drizzle/
```

---

### Task 2: Seed Script — Parse Excel and INSERT

**Files:**
- Create: `scripts/seed-agency-creators.ts`

- [ ] **Step 1: Install xlsx dependency**

Run: `npm install xlsx --save-dev`

- [ ] **Step 2: Create seed script**

The script should:
1. Read the Excel file from a path argument (default: the known Windows path via WSL)
2. Parse each row: Name, YouTube, Twitter, Instagram/TikTok, Twitch/Kick, GEOSTATS, STATS WEBS, Twitchtracker, Country
3. Split combined fields (e.g. `instagram + tiktok`) into separate columns
4. Split `Twitch/Kick` into `twitchUrl` and `kickUrl`
5. Skip empty rows (name is empty)
6. Skip duplicate names (Dilanzito appears twice)
7. TRUNCATE `agency_creators` then INSERT all rows
8. Log count of inserted rows

Key parsing logic:
- Instagram/TikTok column: split on `+` → instagram entries go to `instagramUrl`, tiktok to `tiktokUrl`
- Twitch/Kick column: split on `+` → twitch entries go to `twitchUrl`, kick to `kickUrl`
- YouTube column: take first URL if multiple separated by `+`
- Values of `-` or empty → null

- [ ] **Step 3: Run seed**

Run: `npx tsx scripts/seed-agency-creators.ts`
Expected: `Inserted ~70 agency creators`

- [ ] **Step 4: Verify data**

Run via Neon MCP: `SELECT name, country FROM agency_creators ORDER BY name LIMIT 10`

- [ ] **Step 5: Commit**

```
scripts/committer "feat(seed): agency creators import from Excel" \
  scripts/seed-agency-creators.ts package.json package-lock.json
```

---

### Task 3: Query Functions

**Files:**
- Create: `src/lib/queries/agencyCreators.ts`

- [ ] **Step 1: Create query file**

```ts
// src/lib/queries/agencyCreators.ts
import { db } from '@/lib/db';
import { agencyCreators } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function getAgencyCreators() {
  return db.select().from(agencyCreators).orderBy(agencyCreators.name);
}

export async function countAgencyCreators(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(agencyCreators);
  return result[0]?.count ?? 0;
}

export async function getAgencyCreatorCountries(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ country: agencyCreators.country })
    .from(agencyCreators)
    .where(sql`${agencyCreators.country} IS NOT NULL AND ${agencyCreators.country} != ''`)
    .orderBy(agencyCreators.country);
  return rows.map(r => r.country!);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 3: Commit**

```
scripts/committer "feat(queries): agency creators query functions" \
  src/lib/queries/agencyCreators.ts
```

---

### Task 4: Admin Dashboard — Add Agency Creators Card

**Files:**
- Modify: `src/app/admin/(dashboard)/page.tsx`

- [ ] **Step 1: Add agency creators count**

Import `countAgencyCreators` and add a 4th card "Creadores Agencia" linked to `/admin/talents`.

Updated stats array:
```ts
const stats = [
  { label: 'Talentos Web', value: talentCount[0]?.count ?? 0, href: '/admin/talents' },
  { label: 'Roster Agencia', value: agencyCount, href: '/admin/talents' },
  { label: 'Casos', value: caseCount[0]?.count ?? 0, href: '/admin/cases' },
  { label: 'Contactos', value: submissionCount[0]?.count ?? 0, href: '#' },
];
```

- [ ] **Step 2: Verify locally**

Run: `npm run dev` → navigate to `/admin` → see 4 cards
Expected: "Roster Agencia" card shows ~70

- [ ] **Step 3: Commit**

```
scripts/committer "feat(admin): add agency creators count to dashboard" \
  src/app/admin/(dashboard)/page.tsx
```

---

### Task 5: Admin Talents Page — Pitch Deck Landing

**Files:**
- Rewrite: `src/app/admin/(dashboard)/talents/page.tsx`
- Create: `src/app/admin/(dashboard)/talents/AgencyRoster.tsx`

This is the main deliverable — the page that gets shared in meetings with brands. It should look like a professional pitch deck.

- [ ] **Step 1: Create the server page**

`page.tsx` should:
1. Fetch agency creators, count by country, total count
2. Calculate aggregate stats: total creators, countries covered, platforms present
3. Pass data to `AgencyRoster` client component

Layout (top to bottom):
- **Hero header**: "SOCIALPRO ROSTER" with gradient accent
- **KPI row**: 4 big numbers — Total Creators, Countries, Platforms Active, Markets
- **Country breakdown**: pills showing creator count per country
- **Creator table**: passed to client component for search/filter

- [ ] **Step 2: Create AgencyRoster client component**

Features:
- Search bar (filter by name)
- Country filter dropdown
- Table columns: Name, Country, Platforms (icon badges for each active platform)
- Click platform icon → opens URL in new tab
- Clean, professional design — white cards, subtle borders, no clutter
- No delete buttons (these are reference data, not editable from here)

Platform icons: colored dots/badges for YouTube (red), Twitter/X (black), Instagram (pink), TikTok (dark), Twitch (purple), Kick (green)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Verify visually**

Run: `npm run dev` → navigate to `/admin/talents`
Expected: Professional pitch-deck style page with all ~70 creators, searchable, filterable

- [ ] **Step 5: Commit**

```
scripts/committer "feat(admin): pitch-deck roster landing for brand meetings" \
  src/app/admin/(dashboard)/talents/page.tsx \
  src/app/admin/(dashboard)/talents/AgencyRoster.tsx
```

---

### Task 6: Remove Cases from Analytics

**Files:**
- Modify: `src/app/admin/(dashboard)/analytics/AnalyticsDashboard.tsx`

- [ ] **Step 1: Audit Cases references in analytics**

Search `AnalyticsDashboard.tsx` for any "case" or "caso" references. Based on exploration, the analytics dashboard currently only shows follower/subscriber metrics — no Cases section exists in the analytics component itself. The Cases page is a separate route (`/admin/cases`).

If no Cases references exist in analytics, this task is a no-op. Verify by reading the full component.

- [ ] **Step 2: If references found, remove them**

- [ ] **Step 3: Commit (if changes made)**

---

### Task 7: Update Sidebar Navigation

**Files:**
- Modify: `src/app/admin/(dashboard)/layout.tsx`

- [ ] **Step 1: Rename "Talentos" to "Roster" in sidebar**

In the `navItems` array, change the label for `/admin/talents` from `'Talentos'` to `'Roster'`.

- [ ] **Step 2: Commit**

```
scripts/committer "style(admin): rename Talentos → Roster in sidebar nav" \
  src/app/admin/(dashboard)/layout.tsx
```

---

### Task 8: Final Verification

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`

- [ ] **Step 2: Lint**

Run: `npm run lint`

- [ ] **Step 3: Visual QA on production**

Deploy and verify:
- Dashboard shows 4 cards including Roster Agencia count
- `/admin/talents` shows pitch-deck landing with all creators
- Search and filter work
- Analytics has no Cases references
- Public site unchanged (no agency creators visible)
