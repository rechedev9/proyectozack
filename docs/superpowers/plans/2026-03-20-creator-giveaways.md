# Creator Giveaways Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public giveaway landing pages for SocialPro creators at `/creadores/[slug]` with a dark gaming aesthetic (zevocs2-inspired), plus admin CRUD at `/admin/giveaways`.

**Architecture:** New `giveaways` table linked to `talents` via FK. Server-rendered creator pages with isolated gaming layout (excluded from PublicChrome). Client components for countdown timers and card animations using `motion` v12. Admin CRUD follows existing patterns (server actions + revalidation).

**Tech Stack:** Next.js 16, Drizzle ORM, Neon Postgres, motion v12 (`motion/react`), Tailwind v4, Zod v4

**Spec:** `docs/superpowers/specs/2026-03-20-creator-giveaways-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/db/schema/giveaways.ts` | Table definition, relations (both directions) |
| Modify | `src/db/schema/index.ts` | Add giveaways export |
| Modify | `next.config.ts` | Add wildcard remotePatterns + CSP for external images |
| Create | `src/lib/schemas/giveaway.ts` | Zod validation |
| Create | `src/lib/queries/giveaways.ts` | All giveaway DB queries |
| Modify | `src/types/index.ts` | Giveaway + GiveawayWithTalent types |
| Modify | `src/components/layout/PublicChrome.tsx:6` | Add `/creadores` to PORTAL_PREFIXES |
| Create | `src/app/creadores/layout.tsx` | Isolated gaming layout |
| Create | `src/app/creadores/[slug]/page.tsx` | Server: fetch talent + giveaways, render page |
| Create | `src/app/creadores/[slug]/CreatorHero.tsx` | Client: hero with animations |
| Create | `src/app/creadores/[slug]/GiveawayGrid.tsx` | Client: stagger animation wrapper |
| Create | `src/app/creadores/[slug]/GiveawayCard.tsx` | Client: card with hover + glow |
| Create | `src/app/creadores/[slug]/CountdownTimer.tsx` | Client: flip-clock countdown |
| Modify | `src/components/admin/SidebarIcons.tsx` | Add GiveawayIcon |
| Modify | `src/app/admin/(dashboard)/layout.tsx` | Add Giveaways nav item |
| Create | `src/app/admin/(dashboard)/giveaways/page.tsx` | Admin list view |
| Create | `src/app/admin/(dashboard)/giveaways/actions.ts` | Server actions CRUD |

---

## Task 1: Database Schema + Migration

**Files:**
- Create: `src/db/schema/giveaways.ts`
- Modify: `src/db/schema/index.ts:10` — add `export * from './giveaways';`

- [ ] **Step 1: Create giveaways schema file**

```typescript
// src/db/schema/giveaways.ts
import { pgTable, serial, integer, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';

export const giveaways = pgTable('giveaways', {
  id: serial('id').primaryKey(),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  brandName: varchar('brand_name', { length: 150 }).notNull(),
  brandLogo: varchar('brand_logo', { length: 500 }),
  value: varchar('value', { length: 50 }),
  redirectUrl: text('redirect_url').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('giveaways_talent_id_idx').on(t.talentId),
  index('giveaways_ends_at_idx').on(t.endsAt),
]);

export const giveawaysRelations = relations(giveaways, ({ one }) => ({
  talent: one(talents, { fields: [giveaways.talentId], references: [talents.id] }),
}));
```

- [ ] **Step 2: Export from schema index**

Add to `src/db/schema/index.ts` after the last export:

```typescript
export * from './giveaways';
```

- [ ] **Step 3: Generate migration**

Run: `npx drizzle-kit generate`

Expected: new SQL file in `drizzle/` creating `giveaways` table with all columns and indexes.

- [ ] **Step 4: Apply migration**

Run: `npx drizzle-kit migrate`

Expected: migration applied successfully.

- [ ] **Step 5: Verify with type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
scripts/committer "feat(db): add giveaways table and relations" src/db/schema/giveaways.ts src/db/schema/index.ts drizzle/
```

---

## Task 2: Types + Zod Validation + Queries

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/lib/schemas/giveaway.ts`
- Create: `src/lib/queries/giveaways.ts`

- [ ] **Step 1: Add types**

Add to `src/types/index.ts`:

```typescript
// After existing imports, add:
import type { giveaways } from '@/db/schema';

// After existing base types:
export type Giveaway = InferSelectModel<typeof giveaways>;

// After existing with-relations types:
export type GiveawayWithTalent = Giveaway & {
  talent: Talent;
};
```

- [ ] **Step 2: Create Zod schema**

```typescript
// src/lib/schemas/giveaway.ts
import { z } from 'zod';

const giveawayFields = z.object({
  talentId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().max(500).optional(),
  brandName: z.string().min(1).max(150),
  brandLogo: z.string().url().max(500).optional(),
  value: z.string().max(50).optional(),
  redirectUrl: z.string().url(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  sortOrder: z.number().int().default(0),
});

export const createGiveawaySchema = giveawayFields.refine((d) => d.startsAt < d.endsAt, {
  message: 'starts_at must be before ends_at',
  path: ['endsAt'],
});

export const updateGiveawaySchema = giveawayFields.partial();

export type CreateGiveawayInput = z.infer<typeof createGiveawaySchema>;
export type UpdateGiveawayInput = z.infer<typeof updateGiveawaySchema>;
```

- [ ] **Step 3: Create queries**

```typescript
// src/lib/queries/giveaways.ts
import { eq, gt, lte, desc, asc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveaways, talents } from '@/db/schema';
import type { Giveaway, GiveawayWithTalent } from '@/types';

export async function getActiveGiveaways(talentId: number): Promise<Giveaway[]> {
  return db
    .select()
    .from(giveaways)
    .where(
      and(
        eq(giveaways.talentId, talentId),
        gt(giveaways.endsAt, new Date()),
      ),
    )
    .orderBy(asc(giveaways.endsAt));
}

export async function getFinishedGiveaways(talentId: number): Promise<Giveaway[]> {
  return db
    .select()
    .from(giveaways)
    .where(
      and(
        eq(giveaways.talentId, talentId),
        lte(giveaways.endsAt, new Date()),
      ),
    )
    .orderBy(desc(giveaways.endsAt));
}

export async function getAllGiveaways(): Promise<GiveawayWithTalent[]> {
  const rows = await db.query.giveaways.findMany({
    with: { talent: true },
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });
  return rows as GiveawayWithTalent[];
}

export async function getGiveawayById(id: number): Promise<GiveawayWithTalent | undefined> {
  const row = await db.query.giveaways.findFirst({
    where: eq(giveaways.id, id),
    with: { talent: true },
  });
  return row as GiveawayWithTalent | undefined;
}

export async function createGiveaway(data: {
  talentId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  brandName: string;
  brandLogo?: string | null;
  value?: string | null;
  redirectUrl: string;
  startsAt: Date;
  endsAt: Date;
  sortOrder?: number;
}): Promise<Giveaway> {
  const [row] = await db.insert(giveaways).values(data).returning();
  return row;
}

export async function updateGiveaway(
  id: number,
  data: Partial<typeof giveaways.$inferInsert>,
): Promise<void> {
  await db.update(giveaways).set({ ...data, updatedAt: new Date() }).where(eq(giveaways.id, id));
}

export async function deleteGiveaway(id: number): Promise<void> {
  await db.delete(giveaways).where(eq(giveaways.id, id));
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
scripts/committer "feat(giveaways): types, zod validation, and query layer" src/types/index.ts src/lib/schemas/giveaway.ts src/lib/queries/giveaways.ts
```

---

## Task 3: Layout Isolation (PublicChrome + Gaming Layout)

**Files:**
- Modify: `src/components/layout/PublicChrome.tsx:6`
- Create: `src/app/creadores/layout.tsx`

- [ ] **Step 1: Add `/creadores` to PORTAL_PREFIXES**

In `src/components/layout/PublicChrome.tsx`, line 6:

```typescript
// Before:
const PORTAL_PREFIXES = ['/admin', '/marcas'];
// After:
const PORTAL_PREFIXES = ['/admin', '/marcas', '/creadores'];
```

- [ ] **Step 2: Create gaming layout**

```tsx
// src/app/creadores/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function CreadoresLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {children}
    </div>
  );
}
```

This is intentionally minimal — the page components handle all visual complexity. The layout just sets the dark base.

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | head -30` (or `npx tsc --noEmit`)

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(creadores): isolate layout from PublicChrome, add gaming shell" src/components/layout/PublicChrome.tsx src/app/creadores/layout.tsx
```

---

## Task 4: Next.js Config — External Images

**Files:**
- Modify: `next.config.ts:16,45-49`

- [ ] **Step 1: Update CSP to allow external images**

In `next.config.ts`, update the `img-src` line:

```typescript
// Before:
"img-src 'self' data: https://*.vercel-storage.com https://www.googletagmanager.com",
// After:
"img-src 'self' data: https://*.vercel-storage.com https://www.googletagmanager.com https:",
```

Adding `https:` allows any HTTPS image source. This is necessary because giveaway prize images and brand logos come from arbitrary external URLs.

- [ ] **Step 2: Add wildcard remotePatterns for next/image**

In `next.config.ts`, update the `images` config:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: '**.vercel-storage.com' },
    { protocol: 'https', hostname: '**' },
  ],
},
```

The second pattern allows `next/image` to optimize any HTTPS image. This is safe because `next/image` only acts as a proxy — it doesn't execute content.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(config): allow external HTTPS images for giveaways" next.config.ts
```

---

## Task 5: CountdownTimer Client Component

**Files:**
- Create: `src/app/creadores/[slug]/CountdownTimer.tsx`

- [ ] **Step 1: Create CountdownTimer**

```tsx
// src/app/creadores/[slug]/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface CountdownTimerProps {
  endsAt: string; // ISO string from server
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endsAt: string): TimeLeft | null {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-12 bg-[#0b0c0e] border border-[#1a1b1e] rounded-lg flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-xl font-black text-[#C3FC00] tabular-nums"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ endsAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => {
      const tl = calcTimeLeft(endsAt);
      setTimeLeft(tl);
      if (!tl) {
        clearInterval(id);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, onExpired]);

  if (!timeLeft) {
    return (
      <div className="inline-flex px-4 py-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-sm font-bold uppercase tracking-wider text-white/50">Finalizado</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <FlipDigit value={timeLeft.days} label="Días" />
      <FlipDigit value={timeLeft.hours} label="Hrs" />
      <FlipDigit value={timeLeft.minutes} label="Min" />
      <FlipDigit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
scripts/committer "feat(creadores): flip-clock countdown timer component" src/app/creadores/[slug]/CountdownTimer.tsx
```

---

## Task 6: GiveawayCard Client Component

**Files:**
- Create: `src/app/creadores/[slug]/GiveawayCard.tsx`

- [ ] **Step 1: Create GiveawayCard**

```tsx
// src/app/creadores/[slug]/GiveawayCard.tsx
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { CountdownTimer } from './CountdownTimer';
import type { Giveaway } from '@/types';

interface GiveawayCardProps {
  giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
  const [expired, setExpired] = useState(false);
  const isFinished = expired || new Date(giveaway.endsAt) <= new Date();

  const handleExpired = useCallback(() => setExpired(true), []);

  return (
    <motion.a
      href={isFinished ? undefined : giveaway.redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border overflow-hidden transition-colors ${
        isFinished
          ? 'border-white/5 bg-[#0b0c0e]/50 grayscale pointer-events-none'
          : 'border-[#1a1b1e] bg-[#0b0c0e] hover:border-[#C3FC00]/40'
      }`}
      whileHover={isFinished ? undefined : { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      {/* Brand bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#050607] border-b border-[#1a1b1e]">
        {giveaway.brandLogo && (
          <Image
            src={giveaway.brandLogo}
            alt={giveaway.brandName}
            width={20}
            height={20}
            className="rounded-sm object-contain"
          />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
          {giveaway.brandName}
        </span>
      </div>

      {/* Prize image */}
      <div className="relative aspect-[4/3] bg-[#050607] overflow-hidden">
        {giveaway.imageUrl ? (
          <Image
            src={giveaway.imageUrl}
            alt={giveaway.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black">
            ?
          </div>
        )}
        {!isFinished && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#C3FC00]/5" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-black text-sm uppercase tracking-wide text-white leading-tight">
            {giveaway.title}
          </h3>
          {giveaway.value && (
            <p className="text-lg font-black text-[#C3FC00] mt-1" style={{ textShadow: '0 0 12px rgba(195,252,0,0.4)' }}>
              {giveaway.value}
            </p>
          )}
        </div>

        {/* Countdown or Finished badge */}
        <div className="flex justify-center">
          {isFinished ? (
            <div className="inline-flex px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm font-bold uppercase tracking-wider text-white/50">Finalizado</span>
            </div>
          ) : (
            <CountdownTimer endsAt={giveaway.endsAt.toISOString()} onExpired={handleExpired} />
          )}
        </div>

        {/* CTA Button */}
        {!isFinished && (
          <div className="pt-1">
            <div className="w-full py-2.5 rounded-lg bg-[#C3FC00] text-black text-center text-sm font-black uppercase tracking-wider transition-shadow group-hover:shadow-[0_0_20px_rgba(195,252,0,0.3)] giveaway-btn-glow">
              ▶ Participar
            </div>
          </div>
        )}
      </div>
    </motion.a>
  );
}
```

- [ ] **Step 2: Add glow keyframe to globals.css**

Add at the end of `src/app/globals.css`:

```css
/* ── Giveaway button glow ─────────────────────────────────────────────── */
@keyframes giveaway-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(195,252,0,0.2); }
  50% { box-shadow: 0 0 20px rgba(195,252,0,0.4); }
}
.giveaway-btn-glow {
  animation: giveaway-glow 2s ease-in-out infinite;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(creadores): giveaway card with hover animations and glow" src/app/creadores/[slug]/GiveawayCard.tsx src/app/globals.css
```

---

## Task 7: GiveawayGrid + CreatorHero Client Components

**Files:**
- Create: `src/app/creadores/[slug]/GiveawayGrid.tsx`
- Create: `src/app/creadores/[slug]/CreatorHero.tsx`

- [ ] **Step 1: Create GiveawayGrid**

```tsx
// src/app/creadores/[slug]/GiveawayGrid.tsx
'use client';

import { motion } from 'motion/react';
import { GiveawayCard } from './GiveawayCard';
import type { Giveaway } from '@/types';

interface GiveawayGridProps {
  giveaways: Giveaway[];
  title: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function GiveawayGrid({ giveaways, title }: GiveawayGridProps) {
  if (giveaways.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-black uppercase tracking-wider text-white/80">
        {title}
      </h2>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {giveaways.map((g) => (
          <motion.div key={g.id} variants={item}>
            <GiveawayCard giveaway={g} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Create CreatorHero**

```tsx
// src/app/creadores/[slug]/CreatorHero.tsx
'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { TalentWithRelations } from '@/types';

interface CreatorHeroProps {
  talent: TalentWithRelations;
}

const socialIcons: Record<string, string> = {
  twitch: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  youtube: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  kick: 'M4 2h4v6l4-6h5l-5.5 7L17 20h-5l-4-6v6H4V2z',
};

function SocialButton({ platform, url, color }: { platform: string; url: string; color: string }) {
  const path = socialIcons[platform.toLowerCase()];
  if (!path) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ backgroundColor: `${color}20` }}
    >
      <svg viewBox="0 0 24 24" fill={color} className="w-4.5 h-4.5">
        <path d={path} />
      </svg>
    </a>
  );
}

export function CreatorHero({ talent }: CreatorHeroProps) {
  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#C3FC00]/5 via-transparent to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-6"
        >
          {/* Photo */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-[#C3FC00]/20 shadow-[0_0_30px_rgba(195,252,0,0.1)]">
            {talent.photoUrl ? (
              <Image
                src={talent.photoUrl}
                alt={talent.name}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover object-top"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-black text-white/80"
                style={{ background: `linear-gradient(135deg, ${talent.gradientC1}, ${talent.gradientC2})` }}
              >
                {talent.initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left">
            <h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none"
              style={{ textShadow: '0 0 30px rgba(195,252,0,0.15)' }}
            >
              {talent.name}
            </h1>
            <p className="text-sm text-white/50 mt-2 uppercase tracking-wider font-bold">
              {talent.role} · {talent.game}
            </p>

            {/* Social links */}
            {talent.socials.length > 0 && (
              <div className="flex gap-2 mt-4 justify-center md:justify-start">
                {talent.socials.map((s) => (
                  s.profileUrl && (
                    <SocialButton
                      key={s.id}
                      platform={s.platform}
                      url={s.profileUrl}
                      color={s.hexColor}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(creadores): GiveawayGrid and CreatorHero client components" src/app/creadores/[slug]/GiveawayGrid.tsx src/app/creadores/[slug]/CreatorHero.tsx
```

---

## Task 8: Creator Page (Server Component)

**Files:**
- Create: `src/app/creadores/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/app/creadores/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTalentSlugs, getTalentBySlug } from '@/lib/queries/talents';
import { getActiveGiveaways, getFinishedGiveaways } from '@/lib/queries/giveaways';
import { CreatorHero } from './CreatorHero';
import { GiveawayGrid } from './GiveawayGrid';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getTalentSlugs();
  return slugs.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  if (!talent) return {};

  const title = `${talent.name} — Giveaways | SocialPro`;
  const description = `Sorteos activos de ${talent.name}`;

  // Use first active giveaway image if available, else creator photo
  const active = await getActiveGiveaways(talent.id);
  const ogImage = active[0]?.imageUrl ?? talent.photoUrl;

  return {
    title,
    description,
    alternates: { canonical: `/creadores/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/creadores/${slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CreadorPage({ params }: PageProps) {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  if (!talent) notFound();

  const [active, finished] = await Promise.all([
    getActiveGiveaways(talent.id),
    getFinishedGiveaways(talent.id),
  ]);

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-sm uppercase tracking-wider text-white">
            {talent.name}
          </span>
          {active.length > 0 && (
            <a
              href="#giveaways"
              className="px-4 py-1.5 rounded-full bg-[#C3FC00] text-black text-xs font-black uppercase tracking-wider hover:shadow-[0_0_12px_rgba(195,252,0,0.4)] transition-shadow"
            >
              Giveaways
            </a>
          )}
        </div>
      </header>

      <CreatorHero talent={talent} />

      {/* Giveaways content */}
      <div id="giveaways" className="max-w-5xl mx-auto px-6 pb-20 space-y-12">
        {active.length === 0 && finished.length === 0 ? (
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 mx-auto mb-4 text-white/10">
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="15" cy="10" r="1" />
              <circle cx="15" cy="14" r="1" />
              <circle cx="17" cy="12" r="1" />
              <circle cx="13" cy="12" r="1" />
            </svg>
            <p className="text-lg font-bold uppercase tracking-wider text-white/30">
              No hay sorteos activos
            </p>
            <p className="text-sm text-white/20 mt-2">Vuelve pronto</p>
          </div>
        ) : (
          <>
            <GiveawayGrid giveaways={active} title="Sorteos Activos" />
            <GiveawayGrid giveaways={finished} title="Finalizados" />
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Verify dev server renders**

Run: `npm run dev` → navigate to `http://localhost:3000/creadores/{any-existing-talent-slug}`

Expected: dark page with creator hero, empty giveaway state. No SocialPro Nav/Footer visible.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(creadores): creator giveaway landing page" src/app/creadores/[slug]/page.tsx
```

---

## Task 9: Admin — Sidebar + Giveaways CRUD

**Files:**
- Modify: `src/components/admin/SidebarIcons.tsx` — add GiveawayIcon
- Modify: `src/app/admin/(dashboard)/layout.tsx` — add nav item
- Create: `src/app/admin/(dashboard)/giveaways/actions.ts`
- Create: `src/app/admin/(dashboard)/giveaways/page.tsx`

- [ ] **Step 1: Add GiveawayIcon**

Add to end of `src/components/admin/SidebarIcons.tsx`:

```tsx
export function GiveawayIcon() {
  return (
    <svg {...s}>
      <path d="M10 2a2 2 0 0 1 4 0v2h3a2 2 0 0 1 2 2v2H5V6a2 2 0 0 1 2-2h3V2z" />
      <rect x="4" y="8" width="16" height="10" rx="2" />
      <path d="M12 8v10" />
    </svg>
  );
}
```

- [ ] **Step 2: Add nav item to admin layout**

In `src/app/admin/(dashboard)/layout.tsx`:

Add import: `import { ..., GiveawayIcon } from '@/components/admin/SidebarIcons';`

Add to `navItems` array (after Analytics):

```typescript
{ href: '/admin/giveaways', label: 'Giveaways', icon: <GiveawayIcon /> },
```

- [ ] **Step 3: Create server actions**

```typescript
// src/app/admin/(dashboard)/giveaways/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { createGiveaway, updateGiveaway, deleteGiveaway } from '@/lib/queries/giveaways';
import { createGiveawaySchema, updateGiveawaySchema } from '@/lib/schemas/giveaway';
import { db } from '@/lib/db';
import { talents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createGiveawayAction(formData: FormData): Promise<{ error?: string }> {
  await requireRole('admin', '/admin/login');

  const raw = {
    talentId: Number(formData.get('talentId')),
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
    brandName: formData.get('brandName') as string,
    brandLogo: (formData.get('brandLogo') as string) || undefined,
    value: (formData.get('value') as string) || undefined,
    redirectUrl: formData.get('redirectUrl') as string,
    startsAt: formData.get('startsAt') as string,
    endsAt: formData.get('endsAt') as string,
    sortOrder: Number(formData.get('sortOrder') || 0),
  };

  const parsed = createGiveawaySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  await createGiveaway(parsed.data);

  // Revalidate the creator's page
  const talent = await db.select({ slug: talents.slug }).from(talents).where(eq(talents.id, parsed.data.talentId)).then((r) => r[0]);
  if (talent) revalidatePath(`/creadores/${talent.slug}`);
  revalidatePath('/admin/giveaways');

  return {};
}

export async function updateGiveawayAction(formData: FormData): Promise<{ error?: string }> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  if (!id) return { error: 'Missing id' };

  const raw: Record<string, unknown> = {};
  for (const [key, val] of formData.entries()) {
    if (key === 'id' || key === 'talentSlug' || !val) continue;
    raw[key] = key === 'talentId' || key === 'sortOrder' ? Number(val) : val;
  }

  const parsed = updateGiveawaySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  await updateGiveaway(id, parsed.data);

  const talentSlug = formData.get('talentSlug') as string;
  if (talentSlug) revalidatePath(`/creadores/${talentSlug}`);
  revalidatePath('/admin/giveaways');
  return {};
}

export async function deleteGiveawayAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  const talentSlug = formData.get('talentSlug') as string;
  if (!id) return;
  await deleteGiveaway(id);
  if (talentSlug) revalidatePath(`/creadores/${talentSlug}`);
  revalidatePath('/admin/giveaways');
}
```

- [ ] **Step 4: Create admin page**

```tsx
// src/app/admin/(dashboard)/giveaways/page.tsx
import Image from 'next/image';
import { getAllGiveaways } from '@/lib/queries/giveaways';
import { getAllTalents } from '@/lib/queries/talents';
import { createGiveawayAction, deleteGiveawayAction } from './actions';

function isActive(endsAt: Date): boolean {
  return new Date(endsAt) > new Date();
}

interface PageProps {
  searchParams: Promise<{ creator?: string; status?: string }>;
}

export default async function AdminGiveawaysPage({ searchParams }: PageProps) {
  const { creator, status } = await searchParams;
  const [allGiveaways, allTalents] = await Promise.all([
    getAllGiveaways(),
    getAllTalents(),
  ]);

  // Client-side filter (small dataset, no need for DB-level filtering)
  let giveaways = allGiveaways;
  if (creator) {
    giveaways = giveaways.filter((g) => g.talent.slug === creator);
  }
  if (status === 'active') {
    giveaways = giveaways.filter((g) => isActive(g.endsAt));
  } else if (status === 'finished') {
    giveaways = giveaways.filter((g) => !isActive(g.endsAt));
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Giveaways</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form className="flex gap-3">
          <select name="creator" defaultValue={creator ?? ''} className="rounded-lg border border-sp-border px-3 py-2 text-sm">
            <option value="">Todos los creadores</option>
            {allTalents.map((t) => (
              <option key={t.id} value={t.slug}>{t.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={status ?? ''} className="rounded-lg border border-sp-border px-3 py-2 text-sm">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="finished">Finalizado</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-sp-off text-sp-dark text-sm font-semibold hover:bg-sp-bg2 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* Create form */}
      <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold uppercase text-sp-dark mb-4">Crear Giveaway</h2>
        <form action={createGiveawayAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Creador</label>
            <select name="talentId" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm">
              <option value="">Seleccionar...</option>
              {allTalents.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Título del premio</label>
            <input name="title" required maxLength={200} className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Marca</label>
            <input name="brandName" required maxLength={150} className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Valor</label>
            <input name="value" maxLength={50} placeholder="1.250€" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">URL del sorteo</label>
            <input name="redirectUrl" type="url" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Imagen del premio (URL)</label>
            <input name="imageUrl" type="url" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Logo de marca (URL)</label>
            <input name="brandLogo" type="url" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Descripción</label>
            <input name="description" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Inicio</label>
            <input name="startsAt" type="datetime-local" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Fin</label>
            <input name="endsAt" type="datetime-local" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-sp-dark text-white text-sm font-bold hover:bg-sp-black transition-colors">
              Crear Giveaway
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {giveaways.length === 0 ? (
        <p className="text-sm text-sp-muted">No hay giveaways. Crea el primero.</p>
      ) : (
        <div className="rounded-2xl bg-white border border-sp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sp-border bg-sp-off">
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Imagen</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Premio</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Creador</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Marca</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Valor</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Fin</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {giveaways.map((g) => (
                <tr key={g.id} className="border-b border-sp-border/50 last:border-0">
                  <td className="px-6 py-4">
                    {g.imageUrl ? (
                      <Image src={g.imageUrl} alt={g.title} width={48} height={36} className="rounded object-contain bg-gray-100" />
                    ) : (
                      <div className="w-12 h-9 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">—</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-sp-dark">{g.title}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.talent.name}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.brandName}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.value || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive(g.endsAt) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isActive(g.endsAt) ? 'Activo' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sp-muted">
                    {new Date(g.endsAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <form action={deleteGiveawayAction}>
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="talentSlug" value={g.talent.slug} />
                      <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 6: Verify admin page**

Run: `npm run dev` → navigate to `http://localhost:3000/admin/giveaways`

Expected: admin page with create form and empty table. "Giveaways" visible in sidebar.

- [ ] **Step 7: Commit**

```bash
scripts/committer "feat(admin): giveaway CRUD page with create form and list" src/components/admin/SidebarIcons.tsx src/app/admin/(dashboard)/layout.tsx src/app/admin/(dashboard)/giveaways/actions.ts src/app/admin/(dashboard)/giveaways/page.tsx
```

---

## Task 10: End-to-End Verification

- [ ] **Step 1: Create a test giveaway via admin**

Navigate to `/admin/giveaways`, fill in the form for an existing talent with:
- Title: "Test Giveaway"
- Brand: "TestBrand"
- Value: "100€"
- Redirect URL: `https://example.com`
- Starts at: now
- Ends at: 1 hour from now

- [ ] **Step 2: Verify creator page**

Navigate to `/creadores/{talent-slug}` — should show:
- Dark gaming layout (no SocialPro chrome)
- Creator hero with photo and socials
- One active giveaway card with countdown ticking
- Green "PARTICIPAR" button that opens `https://example.com` in new tab

- [ ] **Step 3: Build check**

Run: `npm run build`

Expected: builds successfully with no errors.

- [ ] **Step 4: Lint check**

Run: `npm run lint`

Expected: no lint errors.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
scripts/committer "fix(creadores): address build/lint issues" <files>
```
