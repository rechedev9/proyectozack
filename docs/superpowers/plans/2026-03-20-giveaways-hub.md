# Giveaways Hub Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centralized giveaways hub at `/giveaways` with 3-column layout: creators sidebar (left), giveaway cards + codes + filters (center), brand sponsors sidebar (right). SocialPro brand colors on dark background.

**Architecture:** New `/giveaways` route (not nested under `/creadores`). Reuses existing `giveaways` DB table. New `creator_codes` table for referral codes. Server Component fetches all data, passes to a Client Component hub that handles filtering locally. Existing card components (CountdownTimer, UnboxReveal, GiveawayCard) are reused and re-themed with SP colors. Individual `/creadores/[slug]` pages remain.

**Tech Stack:** Next.js 16, Drizzle ORM, motion v12, Tailwind v4, Zod v4

**Ref screenshot:** zevocs2.com layout — 3 columns with creators left, giveaways center, brands right.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/db/schema/creatorCodes.ts` | New table for referral codes |
| Modify | `src/db/schema/index.ts` | Add creatorCodes export |
| Modify | `src/types/index.ts` | Add CreatorCode type |
| Create | `src/lib/queries/creatorCodes.ts` | Query layer for codes |
| Create | `src/lib/queries/giveawaysHub.ts` | Hub-specific queries (all giveaways with talent, unique brands, all codes) |
| Create | `src/app/giveaways/page.tsx` | Server Component — data fetching, SEO |
| Create | `src/app/giveaways/GiveawaysHub.tsx` | Client Component — 3-column layout, filters, state |
| Create | `src/app/giveaways/CreatorsSidebar.tsx` | Left sidebar — creator list with avatars, clickable filter |
| Create | `src/app/giveaways/BrandsSidebar.tsx` | Right sidebar — brand logos grid |
| Create | `src/app/giveaways/GiveawayHubCard.tsx` | SP-themed giveaway card (reuses CountdownTimer/UnboxReveal with SP colors) |
| Create | `src/app/giveaways/CodeCard.tsx` | Referral code display card with copy button |
| Create | `src/app/giveaways/StatsBar.tsx` | Stats strip — active, total value, delivered |
| Modify | `src/app/globals.css` | SP-themed giveaway CSS (replace neon green → sp-grad for hub) |
| Modify | `src/components/layout/PublicChrome.tsx:6` | Add `/giveaways` to PORTAL_PREFIXES |
| Create | `src/app/giveaways/layout.tsx` | Dark layout with SP brand accents |
| Create | `src/app/admin/(dashboard)/giveaways/codes-actions.ts` | Admin CRUD for codes |
| Modify | `src/app/admin/(dashboard)/giveaways/page.tsx` | Add codes management section |

---

## Task 1: Creator Codes — DB Schema + Migration

**Files:**
- Create: `src/db/schema/creatorCodes.ts`
- Modify: `src/db/schema/index.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create creatorCodes schema**

```typescript
// src/db/schema/creatorCodes.ts
import { pgTable, serial, integer, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';

export const creatorCodes = pgTable('creator_codes', {
  id: serial('id').primaryKey(),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 100 }).notNull(),
  brandName: varchar('brand_name', { length: 150 }).notNull(),
  brandLogo: varchar('brand_logo', { length: 500 }),
  redirectUrl: text('redirect_url').notNull(),
  description: varchar('description', { length: 300 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('creator_codes_talent_id_idx').on(t.talentId),
]);

export const creatorCodesRelations = relations(creatorCodes, ({ one }) => ({
  talent: one(talents, { fields: [creatorCodes.talentId], references: [talents.id] }),
}));
```

- [ ] **Step 2: Export from schema index**

Add to `src/db/schema/index.ts`:
```typescript
export * from './creatorCodes';
```

- [ ] **Step 3: Add types**

Add to `src/types/index.ts`:
```typescript
import type { creatorCodes } from '@/db/schema';

export type CreatorCode = InferSelectModel<typeof creatorCodes>;

export type CreatorCodeWithTalent = CreatorCode & {
  talent: Talent;
};
```

- [ ] **Step 4: Generate + apply migration**

```bash
cd /home/reche/projects/ProyectoZack && npx drizzle-kit generate
```

Apply via Neon MCP (drizzle-kit migrate fails without DATABASE_URL in shell).

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
scripts/committer "feat(db): add creator_codes table for referral codes" src/db/schema/creatorCodes.ts src/db/schema/index.ts src/types/index.ts drizzle/
```

---

## Task 2: Queries — Hub + Codes

**Files:**
- Create: `src/lib/queries/creatorCodes.ts`
- Create: `src/lib/queries/giveawaysHub.ts`

- [ ] **Step 1: Create creatorCodes queries**

```typescript
// src/lib/queries/creatorCodes.ts
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { creatorCodes } from '@/db/schema';
import type { CreatorCode, CreatorCodeWithTalent } from '@/types';

export async function getAllCodes(): Promise<CreatorCodeWithTalent[]> {
  const rows = await db.query.creatorCodes.findMany({
    with: { talent: true },
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });
  return rows as CreatorCodeWithTalent[];
}

export async function getCodesByTalent(talentId: number): Promise<CreatorCode[]> {
  return db.select().from(creatorCodes).where(eq(creatorCodes.talentId, talentId)).orderBy(asc(creatorCodes.sortOrder));
}

export async function createCode(data: {
  talentId: number;
  code: string;
  brandName: string;
  brandLogo?: string | null | undefined;
  redirectUrl: string;
  description?: string | null | undefined;
  sortOrder?: number;
}): Promise<CreatorCode> {
  const [row] = await db.insert(creatorCodes).values(data).returning();
  return row!;
}

export async function deleteCode(id: number): Promise<void> {
  await db.delete(creatorCodes).where(eq(creatorCodes.id, id));
}
```

- [ ] **Step 2: Create hub queries**

```typescript
// src/lib/queries/giveawaysHub.ts
import { gt, lte, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveaways } from '@/db/schema';
import type { GiveawayWithTalent } from '@/types';

export async function getAllActiveGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    where: gt(giveaways.endsAt, new Date()),
    with: { talent: true },
    orderBy: (g, { asc }) => [asc(g.endsAt)],
  });
  return rows as GiveawayWithTalent[];
}

export async function getAllFinishedGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    where: lte(giveaways.endsAt, new Date()),
    with: { talent: true },
    orderBy: (g, { desc }) => [desc(g.endsAt)],
  });
  return rows as GiveawayWithTalent[];
}

/** Extract unique brand names from all giveaways */
export function extractUniqueBrands(giveaways: GiveawayWithTalent[]): { name: string; logo: string | null }[] {
  const map = new Map<string, string | null>();
  for (const g of giveaways) {
    if (!map.has(g.brandName)) map.set(g.brandName, g.brandLogo);
  }
  return Array.from(map, ([name, logo]) => ({ name, logo }));
}
```

- [ ] **Step 3: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(queries): hub and creator codes query layer" src/lib/queries/creatorCodes.ts src/lib/queries/giveawaysHub.ts
```

---

## Task 3: Layout + PublicChrome Isolation

**Files:**
- Modify: `src/components/layout/PublicChrome.tsx:6`
- Create: `src/app/giveaways/layout.tsx`

- [ ] **Step 1: Add `/giveaways` to PORTAL_PREFIXES**

In `src/components/layout/PublicChrome.tsx`:
```typescript
const PORTAL_PREFIXES = ['/admin', '/marcas', '/creadores', '/giveaways'];
```

- [ ] **Step 2: Create hub layout**

```tsx
// src/app/giveaways/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giveaways — SocialPro',
  description: 'Sorteos activos de los creadores de SocialPro',
  robots: { index: true, follow: true },
};

export default function GiveawaysLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sp-black text-white font-sans gw-grid-bg gw-scanlines gw-noise">
      <div className="gw-orb-top" style={{ background: 'radial-gradient(ellipse, rgba(245,99,42,0.06) 0%, transparent 70%)' }} />
      <div className="gw-orb-bottom" style={{ background: 'radial-gradient(ellipse, rgba(139,58,173,0.04) 0%, transparent 70%)' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

Note: orbs use sp-orange and sp-purple instead of neon green.

- [ ] **Step 3: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(giveaways): hub layout with SP brand orbs" src/components/layout/PublicChrome.tsx src/app/giveaways/layout.tsx
```

---

## Task 4: SP-themed CSS additions

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add SP-themed giveaway hub styles**

Append to `src/app/globals.css`:

```css
/* ── Giveaway Hub — SP brand theme ───────────────────────────────────── */

/* SP gradient shimmer (replaces green shimmer for hub) */
@keyframes gw-sp-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.gw-sp-value {
  background: linear-gradient(90deg, #f5632a 0%, #e03070 30%, #8b3aad 60%, #f5632a 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gw-sp-shimmer 4s linear infinite;
}

/* SP button glow */
@keyframes gw-sp-btn-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(245,99,42,0.2), inset 0 0 8px rgba(245,99,42,0.05); }
  50% { box-shadow: 0 0 24px rgba(224,48,112,0.4), inset 0 0 12px rgba(224,48,112,0.1); }
}
.gw-sp-btn-glow {
  animation: gw-sp-btn-glow 2s ease-in-out infinite;
}

/* SP card border gradient on hover */
.gw-sp-card {
  position: relative;
}
.gw-sp-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, transparent 40%, rgba(245,99,42,0.2) 50%, rgba(139,58,173,0.15) 60%, transparent 70%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.gw-sp-card:hover::before {
  opacity: 1;
}

/* SP shine sweep */
.gw-sp-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 30%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(245,99,42,0.04), rgba(255,255,255,0.06), rgba(139,58,173,0.04), transparent);
  transform: rotate(25deg) translateX(-100%);
  pointer-events: none;
  z-index: 1;
}
.gw-sp-card:hover::after {
  animation: gw-shine 0.8s ease-out forwards;
}

/* SP ticker */
.gw-sp-ticker-track {
  display: flex;
  width: max-content;
  animation: gw-ticker 25s linear infinite;
  padding: 6px 0;
}

/* Creator sidebar item active state */
.gw-creator-active {
  background: linear-gradient(90deg, rgba(245,99,42,0.1), transparent);
  border-left: 2px solid #f5632a;
}

/* SP digit styling for countdown */
.gw-sp-digit {
  background: linear-gradient(180deg, #1a1a1a 0%, #0e0e0e 100%);
  border: 1px solid rgba(245,99,42,0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.5);
}

/* SP float animation */
@keyframes gw-sp-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.gw-sp-float {
  animation: gw-sp-float 3s ease-in-out infinite;
}
```

- [ ] **Step 2: Commit**

```bash
scripts/committer "feat(css): SP-themed giveaway hub styles" src/app/globals.css
```

---

## Task 5: Sidebar Components

**Files:**
- Create: `src/app/giveaways/CreatorsSidebar.tsx`
- Create: `src/app/giveaways/BrandsSidebar.tsx`

- [ ] **Step 1: Create CreatorsSidebar**

```tsx
// src/app/giveaways/CreatorsSidebar.tsx
'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { Talent } from '@/types';

type CreatorsSidebarProps = {
  creators: (Talent & { giveawayCount: number })[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CreatorsSidebar({ creators, selected, onSelect }: CreatorsSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] text-white/50 mb-4 px-2">
        Creadores
      </h2>
      <div className="space-y-1">
        {/* All filter */}
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-semibold ${
            selected === null
              ? 'gw-creator-active text-white'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-sp-grad flex items-center justify-center text-white text-[10px] font-black">
            ALL
          </div>
          <span>Todos</span>
        </button>

        {creators.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              selected === c.id
                ? 'gw-creator-active text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
            }`}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
              {c.photoUrl ? (
                <Image src={c.photoUrl} alt={c.name} fill sizes="32px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/60" style={{ background: `linear-gradient(135deg, ${c.gradientC1}, ${c.gradientC2})` }}>
                  {c.initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide truncate">{c.name}</p>
              <p className="text-[10px] text-white/30">{c.giveawayCount} sorteos</p>
            </div>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create BrandsSidebar**

```tsx
// src/app/giveaways/BrandsSidebar.tsx
'use client';

import Image from 'next/image';

type BrandsSidebarProps = {
  brands: { name: string; logo: string | null }[];
}

export function BrandsSidebar({ brands }: BrandsSidebarProps) {
  return (
    <aside className="w-full lg:w-48 shrink-0">
      <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] text-white/50 mb-4 px-2">
        Patrocinadores
      </h2>
      <div className="space-y-2">
        {brands.map((b) => (
          <div key={b.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            {b.logo ? (
              <Image src={b.logo} alt={b.name} width={24} height={24} className="rounded-sm object-contain opacity-70" />
            ) : (
              <div className="w-6 h-6 rounded-sm bg-sp-orange/20 flex items-center justify-center text-[9px] font-black text-sp-orange">
                {b.name.charAt(0)}
              </div>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">{b.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(giveaways): creators and brands sidebar components" src/app/giveaways/CreatorsSidebar.tsx src/app/giveaways/BrandsSidebar.tsx
```

---

## Task 6: Hub Card + Code Card + Stats Bar

**Files:**
- Create: `src/app/giveaways/GiveawayHubCard.tsx`
- Create: `src/app/giveaways/CodeCard.tsx`
- Create: `src/app/giveaways/StatsBar.tsx`

- [ ] **Step 1: Create GiveawayHubCard** — same structure as existing GiveawayCard but SP-themed (sp-orange/sp-pink accent colors, `gw-sp-card` class, `gw-sp-value` for prices, `gw-sp-digit` for countdown, `gw-sp-btn-glow` for button, SP gradient button instead of neon green). Reuses `CountdownTimer` and `UnboxReveal` from `../creadores/[slug]/`.

Key color swaps: `#C3FC00` → `sp-orange`/`sp-grad`, `gw-value-shimmer` → `gw-sp-value`, `gw-card-glow` → `gw-sp-card`, `giveaway-btn-glow` → `gw-sp-btn-glow`, button bg from `#C3FC00` → `bg-sp-grad`.

- [ ] **Step 2: Create CodeCard** — displays a referral code with creator name, brand, code text with copy-to-clipboard button, and redirect link.

- [ ] **Step 3: Create StatsBar** — same concept as the current one but SP-themed.

- [ ] **Step 4: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(giveaways): hub card, code card, and stats bar components" src/app/giveaways/GiveawayHubCard.tsx src/app/giveaways/CodeCard.tsx src/app/giveaways/StatsBar.tsx
```

---

## Task 7: GiveawaysHub Client Component (3-column layout + filters)

**Files:**
- Create: `src/app/giveaways/GiveawaysHub.tsx`

- [ ] **Step 1: Create the main hub component**

Client component that receives all data as props from the server page. Manages state for:
- `selectedCreator: number | null` — filter by creator (left sidebar click)
- `selectedBrand: string | null` — filter by brand
- `tab: 'giveaways' | 'codes'` — toggle between giveaways and codes view

Layout: 3-column on desktop (`lg:`), stacked on mobile.
- Left: `CreatorsSidebar`
- Center: tabs (Giveaways | Codes) + filter chips + card grid + finished section
- Right: `BrandsSidebar`

Filters are applied client-side (small dataset). When a creator is selected, both giveaways and codes filter to that creator.

- [ ] **Step 2: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(giveaways): 3-column hub with filters and tabs" src/app/giveaways/GiveawaysHub.tsx
```

---

## Task 8: Server Page + SEO

**Files:**
- Create: `src/app/giveaways/page.tsx`

- [ ] **Step 1: Create the server page**

Fetches all data in parallel:
- `getAllActiveGiveaways()`
- `getAllFinishedGiveaways()`
- `getAllCodes()`
- `getTalents()` (with giveaway counts)

Extracts unique brands. Passes everything as props to `GiveawaysHub`.

Includes: ticker marquee, sticky header with SP gradient, stats bar, SEO metadata.

- [ ] **Step 2: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(giveaways): hub server page with data fetching and SEO" src/app/giveaways/page.tsx
```

---

## Task 9: Admin — Codes CRUD

**Files:**
- Create: `src/app/admin/(dashboard)/giveaways/codes-actions.ts`
- Modify: `src/app/admin/(dashboard)/giveaways/page.tsx`

- [ ] **Step 1: Create server actions for codes**

`createCodeAction`, `deleteCodeAction` — same pattern as giveaway actions.

- [ ] **Step 2: Add codes section to admin page**

Below the giveaways table, add a "Códigos de Creadores" section with create form and list table.

- [ ] **Step 3: Type-check + Commit**

```bash
npx tsc --noEmit
scripts/committer "feat(admin): creator codes CRUD in giveaways admin" src/app/admin/\(dashboard\)/giveaways/codes-actions.ts src/app/admin/\(dashboard\)/giveaways/page.tsx
```

---

## Task 10: Demo Data — Seed Codes + Verify

- [ ] **Step 1: Insert demo codes via Neon MCP**

Add 5-6 referral codes for existing creators with different brands (CSGOEmpire, Gamdom, Clash.gg, etc.)

- [ ] **Step 2: Verify hub page**

Navigate to `http://localhost:3000/giveaways` — should show:
- Left: creators with giveaway counts
- Center: giveaway cards (SP themed), tabs for codes
- Right: brand logos
- Filtering works
- Stats bar shows totals

- [ ] **Step 3: Build + Lint check**

```bash
npm run build
npm run lint
```

- [ ] **Step 4: Commit any fixes**
