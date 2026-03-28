# Giveaway Winners — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add winner tracking with leaderboard and recent winners sidebars on `/giveaways` hub, plus admin CRUD for entering winners manually.

**Architecture:** New `giveaway_winners` table → queries → two sidebar components (TopWinners, RecentWinners) → integrate into GiveawaysHub right column → admin form for entering winners.

**Tech Stack:** Drizzle ORM, Next.js 16, motion v12, Tailwind v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/db/schema/giveawayWinners.ts` | Table + relations |
| Modify | `src/db/schema/index.ts` | Add export |
| Modify | `src/types/index.ts` | Add GiveawayWinner types |
| Create | `src/lib/queries/giveawayWinners.ts` | Queries: top winners, recent, create, delete |
| Create | `src/app/giveaways/TopWinners.tsx` | Leaderboard sidebar with medals |
| Create | `src/app/giveaways/RecentWinners.tsx` | Chronological recent winners list |
| Modify | `src/app/giveaways/GiveawaysHub.tsx` | Add winners sidebars to right column |
| Modify | `src/app/giveaways/page.tsx` | Fetch winners, pass as props |
| Create | `src/app/admin/(dashboard)/giveaways/winners-actions.ts` | Admin CRUD server actions |
| Modify | `src/app/admin/(dashboard)/giveaways/page.tsx` | Add winners management section |

---

## Task 1: DB Schema + Migration

**Files:**
- Create: `src/db/schema/giveawayWinners.ts`
- Modify: `src/db/schema/index.ts`
- Modify: `src/types/index.ts`

```typescript
// src/db/schema/giveawayWinners.ts
import { pgTable, serial, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { giveaways } from './giveaways';

export const giveawayWinners = pgTable('giveaway_winners', {
  id: serial('id').primaryKey(),
  giveawayId: integer('giveaway_id').notNull().references(() => giveaways.id, { onDelete: 'cascade' }),
  winnerName: varchar('winner_name', { length: 100 }).notNull(),
  winnerAvatar: varchar('winner_avatar', { length: 500 }),
  wonAt: timestamp('won_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('giveaway_winners_giveaway_id_idx').on(t.giveawayId),
  index('giveaway_winners_won_at_idx').on(t.wonAt),
]);

export const giveawayWinnersRelations = relations(giveawayWinners, ({ one }) => ({
  giveaway: one(giveaways, { fields: [giveawayWinners.giveawayId], references: [giveaways.id] }),
}));
```

Types to add:
```typescript
export type GiveawayWinner = InferSelectModel<typeof giveawayWinners>;
export type GiveawayWinnerWithGiveaway = GiveawayWinner & { giveaway: Giveaway };
```

---

## Task 2: Queries

**Files:**
- Create: `src/lib/queries/giveawayWinners.ts`

```typescript
import { desc, sql, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { giveawayWinners } from '@/db/schema';
import type { GiveawayWinnerWithGiveaway } from '@/types';

export async function getRecentWinners(limit = 10): Promise<GiveawayWinnerWithGiveaway[]> {
  const rows = await db.query.giveawayWinners.findMany({
    with: { giveaway: true },
    orderBy: (w, { desc }) => [desc(w.wonAt)],
    limit,
  });
  return rows as GiveawayWinnerWithGiveaway[];
}

export async function getTopWinners(limit = 10): Promise<{ winnerName: string; winnerAvatar: string | null; wins: number }[]> {
  return db
    .select({
      winnerName: giveawayWinners.winnerName,
      winnerAvatar: giveawayWinners.winnerAvatar,
      wins: sql<number>`count(*)::int`.as('wins'),
    })
    .from(giveawayWinners)
    .groupBy(giveawayWinners.winnerName, giveawayWinners.winnerAvatar)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getAllWinners(): Promise<GiveawayWinnerWithGiveaway[]> {
  const rows = await db.query.giveawayWinners.findMany({
    with: { giveaway: true },
    orderBy: (w, { desc }) => [desc(w.wonAt)],
  });
  return rows as GiveawayWinnerWithGiveaway[];
}

export async function createWinner(data: {
  giveawayId: number;
  winnerName: string;
  winnerAvatar?: string | null | undefined;
  wonAt?: Date;
}): Promise<void> {
  await db.insert(giveawayWinners).values(data);
}

export async function deleteWinner(id: number): Promise<void> {
  await db.delete(giveawayWinners).where(eq(giveawayWinners.id, id));
}
```

---

## Task 3: Sidebar Components

**Files:**
- Create: `src/app/giveaways/TopWinners.tsx`
- Create: `src/app/giveaways/RecentWinners.tsx`

TopWinners: medal icons (gold/silver/bronze), winner name, win count.
RecentWinners: avatar, name, skin name from giveaway title, time ago.

---

## Task 4: Integration — Hub + Page

**Files:**
- Modify: `src/app/giveaways/GiveawaysHub.tsx` — add winners props + render below BrandsSidebar in right column
- Modify: `src/app/giveaways/page.tsx` — fetch `getTopWinners()` + `getRecentWinners()`, pass to hub

---

## Task 5: Admin CRUD + Demo Data

**Files:**
- Create: `src/app/admin/(dashboard)/giveaways/winners-actions.ts`
- Modify: `src/app/admin/(dashboard)/giveaways/page.tsx` — add winners section
- Seed demo winners via Neon MCP

---

## Task 6: Build + Lint + Push
