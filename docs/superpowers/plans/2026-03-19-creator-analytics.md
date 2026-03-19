# Creator Analytics Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Looker-style admin dashboard that tracks YouTube subscriber and Twitch follower counts daily via API, stores historical snapshots, and enables exportable growth reports for brand pitches.

**Architecture:** Vercel Cron daily job → calls YouTube Data API v3 + Twitch Helix API → stores snapshots in `talent_metric_snapshots` table in Neon Postgres → admin dashboard at `/admin/analytics` with Recharts charts, KPI cards, filters, and a printable growth report page.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon Postgres, Recharts, Vercel Cron, YouTube Data API v3, Twitch Helix API.

**Spec:** `docs/superpowers/specs/2026-03-19-creator-analytics-design.md`

---

## Task 1: Database Schema — `talent_metric_snapshots` table + `platformId` column

**Files:**
- Create: `src/db/schema/analytics.ts`
- Modify: `src/db/schema/talents.ts` (add `platformId` column to `talentSocials`)
- Modify: `src/db/schema/index.ts` (add `export * from './analytics'`)
- Modify: `src/types/index.ts` (add `TalentMetricSnapshot` type)

- [ ] **Step 1: Create `src/db/schema/analytics.ts`**

```typescript
import { pgTable, serial, integer, text, date, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';

export const talentMetricSnapshots = pgTable('talent_metric_snapshots', {
  id: serial('id').primaryKey(),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // 'youtube' | 'twitch'
  metricType: text('metric_type').notNull(), // 'subscribers' | 'followers'
  value: integer('value').notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  index('tms_talent_date_idx').on(t.talentId, t.snapshotDate),
  index('tms_platform_idx').on(t.platform),
  unique('tms_unique_snapshot').on(t.talentId, t.platform, t.metricType, t.snapshotDate),
]);

export const talentMetricSnapshotsRelations = relations(talentMetricSnapshots, ({ one }) => ({
  talent: one(talents, { fields: [talentMetricSnapshots.talentId], references: [talents.id] }),
}));
```

- [ ] **Step 2: Add `platformId` column to `talentSocials` in `src/db/schema/talents.ts`**

Add after the `hexColor` column definition:

```typescript
platformId: varchar('platform_id', { length: 200 }),
```

- [ ] **Step 3: Add barrel export in `src/db/schema/index.ts`**

Add at the end of the file:

```typescript
export * from './analytics';
```

- [ ] **Step 4: Add type export in `src/types/index.ts`**

Add import:
```typescript
import type { talentMetricSnapshots } from '@/db/schema';
```

Add type:
```typescript
export type TalentMetricSnapshot = InferSelectModel<typeof talentMetricSnapshots>;
```

- [ ] **Step 5: Generate and run migration**

```bash
cd /home/reche/projects/ProyectoZack
npx drizzle-kit generate
npx drizzle-kit migrate
```

Expected: Migration SQL creates `talent_metric_snapshots` table and adds `platform_id` column to `talent_socials`.

- [ ] **Step 6: Verify migration applied**

```bash
npx drizzle-kit migrate
```

Expected: "Nothing to migrate" (already applied).

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
scripts/committer "feat(analytics): add talent_metric_snapshots schema and platformId column" \
  src/db/schema/analytics.ts \
  src/db/schema/talents.ts \
  src/db/schema/index.ts \
  src/types/index.ts \
  drizzle/
```

---

## Task 2: YouTube API Service

**Files:**
- Create: `src/lib/services/youtube.ts`

- [ ] **Step 1: Create `src/lib/services/youtube.ts`**

```typescript
interface YouTubeChannelStats {
  channelId: string;
  subscriberCount: number;
}

interface YouTubeAPIResponse {
  items?: Array<{
    id: string;
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
  }>;
}

/**
 * Fetch subscriber counts for multiple YouTube channel IDs.
 * Batches up to 50 IDs per request (YouTube API limit).
 */
export async function fetchYouTubeSubscriberCounts(
  channelIds: string[],
): Promise<YouTubeChannelStats[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  const results: YouTubeChannelStats[] = [];
  const batchSize = 50;

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const ids = batch.join(',');
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ids}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube API error (${res.status}): ${text}`);
    }

    const data: YouTubeAPIResponse = await res.json();
    if (data.items) {
      for (const item of data.items) {
        results.push({
          channelId: item.id,
          subscriberCount: parseInt(item.statistics.subscriberCount, 10) || 0,
        });
      }
    }
  }

  return results;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
scripts/committer "feat(analytics): add YouTube API service for subscriber counts" \
  src/lib/services/youtube.ts
```

---

## Task 3: Twitch API Service

**Files:**
- Create: `src/lib/services/twitch.ts`

- [ ] **Step 1: Create `src/lib/services/twitch.ts`**

```typescript
interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchFollowerResponse {
  total: number;
}

interface TwitchFollowerResult {
  broadcasterId: string;
  followerCount: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get an app access token via client credentials grant.
 * Caches the token until expiry.
 */
async function getAppAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET is not set');
  }

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch token error (${res.status}): ${text}`);
  }

  const data: TwitchTokenResponse = await res.json();
  cachedToken = data.access_token;
  // Expire 5 minutes early to avoid edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

/**
 * Fetch follower counts for multiple Twitch broadcaster IDs.
 */
export async function fetchTwitchFollowerCounts(
  broadcasterIds: string[],
): Promise<TwitchFollowerResult[]> {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const token = await getAppAccessToken();
  const results: TwitchFollowerResult[] = [];

  for (const broadcasterId of broadcasterIds) {
    const url = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}`;

    const res = await fetch(url, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Twitch followers API error for ${broadcasterId} (${res.status}): ${text}`);
      continue; // Skip this creator, don't fail the batch
    }

    const data: TwitchFollowerResponse = await res.json();
    results.push({ broadcasterId, followerCount: data.total });
  }

  return results;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
scripts/committer "feat(analytics): add Twitch API service for follower counts" \
  src/lib/services/twitch.ts
```

---

## Task 4: Analytics Queries (Drizzle)

**Files:**
- Create: `src/lib/queries/analytics.ts`

- [ ] **Step 1: Create `src/lib/queries/analytics.ts`**

```typescript
import { eq, and, gte, lte, inArray, desc, asc, sql, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { talentMetricSnapshots, talentSocials, talents } from '@/db/schema';
import type { TalentMetricSnapshot } from '@/types';

/** Fetch all talent_socials rows that have a platformId for YouTube or Twitch */
export async function getTrackableSocials() {
  const rows = await db
    .select({
      talentId: talentSocials.talentId,
      platform: talentSocials.platform,
      platformId: talentSocials.platformId,
    })
    .from(talentSocials)
    .where(
      and(
        sql`${talentSocials.platformId} IS NOT NULL`,
        or(
          eq(talentSocials.platform, 'yt'),
          eq(talentSocials.platform, 'youtube'),
          eq(talentSocials.platform, 'twitch'),
        ),
      ),
    );

  return rows.map((r) => ({
    talentId: r.talentId,
    platform: r.platform === 'yt' || r.platform === 'youtube' ? 'youtube' as const : 'twitch' as const,
    platformId: r.platformId!,
  }));
}

/** Insert a snapshot, ignoring duplicates */
export async function insertSnapshot(data: {
  talentId: number;
  platform: string;
  metricType: string;
  value: number;
  snapshotDate: string; // YYYY-MM-DD
}) {
  await db
    .insert(talentMetricSnapshots)
    .values({
      talentId: data.talentId,
      platform: data.platform,
      metricType: data.metricType,
      value: data.value,
      snapshotDate: data.snapshotDate,
    })
    .onConflictDoNothing({
      target: [
        talentMetricSnapshots.talentId,
        talentMetricSnapshots.platform,
        talentMetricSnapshots.metricType,
        talentMetricSnapshots.snapshotDate,
      ],
    });
}

/** Get snapshots for a date range, optionally filtered by talent/platform */
export async function getSnapshots(opts: {
  from: string;
  to: string;
  talentIds?: number[];
  platform?: 'youtube' | 'twitch';
}): Promise<TalentMetricSnapshot[]> {
  const conditions = [
    gte(talentMetricSnapshots.snapshotDate, opts.from),
    lte(talentMetricSnapshots.snapshotDate, opts.to),
  ];

  if (opts.talentIds && opts.talentIds.length > 0) {
    conditions.push(inArray(talentMetricSnapshots.talentId, opts.talentIds));
  }
  if (opts.platform) {
    conditions.push(eq(talentMetricSnapshots.platform, opts.platform));
  }

  return db
    .select()
    .from(talentMetricSnapshots)
    .where(and(...conditions))
    .orderBy(asc(talentMetricSnapshots.snapshotDate));
}

/** Get the latest snapshot per talent per platform */
export async function getLatestSnapshots(): Promise<TalentMetricSnapshot[]> {
  // Subquery: max snapshotDate per talent+platform+metricType
  const latestDates = db
    .select({
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      maxDate: sql<string>`max(${talentMetricSnapshots.snapshotDate})`.as('max_date'),
    })
    .from(talentMetricSnapshots)
    .groupBy(
      talentMetricSnapshots.talentId,
      talentMetricSnapshots.platform,
      talentMetricSnapshots.metricType,
    )
    .as('latest');

  return db
    .select({
      id: talentMetricSnapshots.id,
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      value: talentMetricSnapshots.value,
      snapshotDate: talentMetricSnapshots.snapshotDate,
      createdAt: talentMetricSnapshots.createdAt,
    })
    .from(talentMetricSnapshots)
    .innerJoin(
      latestDates,
      and(
        eq(talentMetricSnapshots.talentId, latestDates.talentId),
        eq(talentMetricSnapshots.platform, latestDates.platform),
        eq(talentMetricSnapshots.metricType, latestDates.metricType),
        eq(talentMetricSnapshots.snapshotDate, latestDates.maxDate),
      ),
    );
}

/** Get the earliest snapshot per talent per platform within a date range */
export async function getEarliestSnapshots(from: string): Promise<TalentMetricSnapshot[]> {
  const earliestDates = db
    .select({
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      minDate: sql<string>`min(${talentMetricSnapshots.snapshotDate})`.as('min_date'),
    })
    .from(talentMetricSnapshots)
    .where(gte(talentMetricSnapshots.snapshotDate, from))
    .groupBy(
      talentMetricSnapshots.talentId,
      talentMetricSnapshots.platform,
      talentMetricSnapshots.metricType,
    )
    .as('earliest');

  return db
    .select({
      id: talentMetricSnapshots.id,
      talentId: talentMetricSnapshots.talentId,
      platform: talentMetricSnapshots.platform,
      metricType: talentMetricSnapshots.metricType,
      value: talentMetricSnapshots.value,
      snapshotDate: talentMetricSnapshots.snapshotDate,
      createdAt: talentMetricSnapshots.createdAt,
    })
    .from(talentMetricSnapshots)
    .innerJoin(
      earliestDates,
      and(
        eq(talentMetricSnapshots.talentId, earliestDates.talentId),
        eq(talentMetricSnapshots.platform, earliestDates.platform),
        eq(talentMetricSnapshots.metricType, earliestDates.metricType),
        eq(talentMetricSnapshots.snapshotDate, earliestDates.minDate),
      ),
    );
}

/** Count talents that have at least one platformId configured */
export async function countTrackedTalents(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(distinct ${talentSocials.talentId})` })
    .from(talentSocials)
    .where(
      and(
        sql`${talentSocials.platformId} IS NOT NULL`,
        or(
          eq(talentSocials.platform, 'yt'),
          eq(talentSocials.platform, 'youtube'),
          eq(talentSocials.platform, 'twitch'),
        ),
      ),
    );
  return rows[0]?.count ?? 0;
}

/** Get snapshots for a single talent */
export async function getTalentSnapshots(
  talentId: number,
  from: string,
  to: string,
): Promise<TalentMetricSnapshot[]> {
  return db
    .select()
    .from(talentMetricSnapshots)
    .where(
      and(
        eq(talentMetricSnapshots.talentId, talentId),
        gte(talentMetricSnapshots.snapshotDate, from),
        lte(talentMetricSnapshots.snapshotDate, to),
      ),
    )
    .orderBy(asc(talentMetricSnapshots.snapshotDate));
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
scripts/committer "feat(analytics): add Drizzle queries for metric snapshots" \
  src/lib/queries/analytics.ts
```

---

## Task 5: Cron Job Route

**Files:**
- Create: `src/app/api/cron/snapshot-metrics/route.ts`
- Create: `vercel.json` (project root)

- [ ] **Step 1: Create `src/app/api/cron/snapshot-metrics/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchYouTubeSubscriberCounts } from '@/lib/services/youtube';
import { fetchTwitchFollowerCounts } from '@/lib/services/twitch';
import { getTrackableSocials, insertSnapshot } from '@/lib/queries/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check required env vars
  const hasYouTube = !!process.env.YOUTUBE_API_KEY;
  const hasTwitch = !!process.env.TWITCH_CLIENT_ID && !!process.env.TWITCH_CLIENT_SECRET;

  if (!hasYouTube && !hasTwitch) {
    return NextResponse.json(
      { error: 'No API keys configured. Set YOUTUBE_API_KEY and/or TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET.' },
      { status: 500 },
    );
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const socials = await getTrackableSocials();
  const errors: string[] = [];
  let youtubeCount = 0;
  let twitchCount = 0;

  // YouTube batch
  if (hasYouTube) {
    const ytSocials = socials.filter((s) => s.platform === 'youtube');
    if (ytSocials.length > 0) {
      try {
        const channelIds = ytSocials.map((s) => s.platformId);
        const stats = await fetchYouTubeSubscriberCounts(channelIds);

        // Map channelId back to talentId
        const channelToTalent = new Map(ytSocials.map((s) => [s.platformId, s.talentId]));

        for (const stat of stats) {
          const talentId = channelToTalent.get(stat.channelId);
          if (talentId !== undefined) {
            await insertSnapshot({
              talentId,
              platform: 'youtube',
              metricType: 'subscribers',
              value: stat.subscriberCount,
              snapshotDate: today,
            });
            youtubeCount++;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown YouTube error';
        errors.push(`YouTube: ${msg}`);
        console.error('YouTube API error:', msg);
      }
    }
  }

  // Twitch batch
  if (hasTwitch) {
    const twitchSocials = socials.filter((s) => s.platform === 'twitch');
    if (twitchSocials.length > 0) {
      try {
        const broadcasterIds = twitchSocials.map((s) => s.platformId);
        const stats = await fetchTwitchFollowerCounts(broadcasterIds);

        // Map broadcasterId back to talentId
        const idToTalent = new Map(twitchSocials.map((s) => [s.platformId, s.talentId]));

        for (const stat of stats) {
          const talentId = idToTalent.get(stat.broadcasterId);
          if (talentId !== undefined) {
            await insertSnapshot({
              talentId,
              platform: 'twitch',
              metricType: 'followers',
              value: stat.followerCount,
              snapshotDate: today,
            });
            twitchCount++;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown Twitch error';
        errors.push(`Twitch: ${msg}`);
        console.error('Twitch API error:', msg);
      }
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    youtube: youtubeCount,
    twitch: twitchCount,
    errors,
    date: today,
  });
}
```

- [ ] **Step 2: Create `vercel.json` at project root**

```json
{
  "crons": [
    {
      "path": "/api/cron/snapshot-metrics",
      "schedule": "0 6 * * *"
    }
  ]
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(analytics): add daily cron job for metric snapshots" \
  src/app/api/cron/snapshot-metrics/route.ts \
  vercel.json
```

---

## Task 6: Install Recharts + Configure Next.js

**Files:**
- Modify: `next.config.ts` (add recharts to `optimizePackageImports`)

- [ ] **Step 1: Install recharts**

```bash
cd /home/reche/projects/ProyectoZack && npm install recharts
```

- [ ] **Step 2: Add recharts to `optimizePackageImports` in `next.config.ts`**

Inside the `experimental` object, change:
```typescript
  experimental: {
    optimizePackageImports: ['motion'],
  },
```
To:
```typescript
  experimental: {
    optimizePackageImports: ['motion', 'recharts'],
  },
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "chore(analytics): install recharts and configure tree-shaking" \
  package.json \
  package-lock.json \
  next.config.ts
```

---

## Task 7: Admin UI Components

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/components/admin/KpiCard.tsx`
- Create: `src/components/admin/MetricsChart.tsx`
- Create: `src/components/admin/GrowthTable.tsx`
- Create: `src/components/admin/DateRangePicker.tsx`
- Create: `src/components/admin/PlatformFilter.tsx`
- Create: `src/components/admin/CreatorFilter.tsx`

- [ ] **Step 0: Create shared `src/lib/format.ts`**

Used by MetricsChart, GrowthTable, AnalyticsDashboard, and GrowthReport.

```typescript
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}
```

- [ ] **Step 1: Create `src/components/admin/KpiCard.tsx`**

```tsx
interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export function KpiCard({ label, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6">
      <div className="font-display text-4xl font-black gradient-text">{value}</div>
      <div className="text-sm text-sp-muted mt-1">{label}</div>
      {subtitle && <div className="text-xs text-sp-muted mt-0.5">{subtitle}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/admin/DateRangePicker.tsx`**

```tsx
'use client';

interface DateRangePickerProps {
  value: string; // '7d' | '30d' | '90d' | 'custom'
  onChange: (value: string) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}

const presets = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

export function DateRangePicker({ value, onChange, customFrom, customTo, onCustomChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === p.value
              ? 'bg-sp-dark text-white'
              : 'bg-white border border-sp-border text-sp-muted hover:text-sp-dark'
          }`}
        >
          {p.label}
        </button>
      ))}
      {value === 'custom' && onCustomChange && (
        <div className="flex items-center gap-1 ml-2">
          <input
            type="date"
            value={customFrom ?? ''}
            onChange={(e) => onCustomChange(e.target.value, customTo ?? '')}
            className="px-2 py-1 rounded-lg border border-sp-border text-sm"
          />
          <span className="text-sp-muted text-sm">→</span>
          <input
            type="date"
            value={customTo ?? ''}
            onChange={(e) => onCustomChange(customFrom ?? '', e.target.value)}
            className="px-2 py-1 rounded-lg border border-sp-border text-sm"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/admin/PlatformFilter.tsx`**

```tsx
'use client';

interface PlatformFilterProps {
  value: 'all' | 'youtube' | 'twitch';
  onChange: (value: 'all' | 'youtube' | 'twitch') => void;
}

const options: Array<{ label: string; value: PlatformFilterProps['value'] }> = [
  { label: 'All', value: 'all' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitch', value: 'twitch' },
];

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === o.value
              ? 'bg-sp-dark text-white'
              : 'bg-white border border-sp-border text-sp-muted hover:text-sp-dark'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/admin/CreatorFilter.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface CreatorOption {
  id: number;
  name: string;
}

interface CreatorFilterProps {
  creators: CreatorOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function CreatorFilter({ creators, selected, onChange }: CreatorFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const label = selected.length === 0
    ? 'All Creators'
    : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-sp-border text-sp-muted hover:text-sp-dark transition-colors"
      >
        {label}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-sp-border rounded-xl shadow-lg p-2 w-56 max-h-64 overflow-y-auto">
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-xs text-sp-muted hover:text-sp-dark"
            >
              Clear all
            </button>
          )}
          {creators.map((c) => (
            <label key={c.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-sp-off rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="rounded border-sp-border"
              />
              <span className="text-sm text-sp-dark">{c.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/admin/MetricsChart.tsx`**

```tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCompact } from '@/lib/format';

interface ChartDataPoint {
  date: string;
  [creatorOrPlatform: string]: string | number;
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  lines: Array<{ key: string; color: string; name: string }>;
  height?: number;
  yAxisLabel?: string;
}

export function MetricsChart({ data, lines, height = 400, yAxisLabel }: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sp-muted text-sm">
        No data available for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          tickFormatter={formatCompact}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip
          formatter={(value: number) => formatCompact(value)}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 6: Create `src/components/admin/GrowthTable.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { formatCompact } from '@/lib/format';

export interface GrowthRow {
  talentId: number;
  talentName: string;
  platform: string;
  currentValue: number;
  startValue: number;
  absoluteChange: number;
  percentChange: number | null; // null when startValue is 0
}

interface GrowthTableProps {
  rows: GrowthRow[];
  onCreatorClick?: (talentId: number) => void;
}

type SortKey = 'talentName' | 'platform' | 'currentValue' | 'startValue' | 'absoluteChange' | 'percentChange';

export function GrowthTable({ rows, onCreatorClick }: GrowthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('percentChange');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey] ?? -Infinity;
    const bVal = b[sortKey] ?? -Infinity;
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: 'talentName', label: 'Creator' },
    { key: 'platform', label: 'Platform' },
    { key: 'currentValue', label: 'Current' },
    { key: 'startValue', label: 'Start' },
    { key: 'absoluteChange', label: 'Change' },
    { key: 'percentChange', label: '% Growth' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sp-border">
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="text-left px-4 py-3 text-sp-muted font-medium cursor-pointer hover:text-sp-dark transition-colors"
              >
                {h.label}
                {sortKey === h.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={`${row.talentId}-${row.platform}`}
              onClick={() => onCreatorClick?.(row.talentId)}
              className="border-b border-sp-border/50 hover:bg-sp-off cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-sp-dark">{row.talentName}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  row.platform === 'youtube'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {row.platform === 'youtube' ? 'YouTube' : 'Twitch'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono">{formatCompact(row.currentValue)}</td>
              <td className="px-4 py-3 font-mono">{formatCompact(row.startValue)}</td>
              <td className="px-4 py-3 font-mono">
                <span className={row.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {row.absoluteChange >= 0 ? '+' : ''}{formatCompact(row.absoluteChange)}
                </span>
              </td>
              <td className="px-4 py-3 font-mono">
                {row.percentChange !== null ? (
                  <span className={row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {row.percentChange >= 0 ? '+' : ''}{row.percentChange.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-sp-muted">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
scripts/committer "feat(analytics): add admin UI components (KPI, charts, table, filters)" \
  src/lib/format.ts \
  src/components/admin/KpiCard.tsx \
  src/components/admin/MetricsChart.tsx \
  src/components/admin/GrowthTable.tsx \
  src/components/admin/DateRangePicker.tsx \
  src/components/admin/PlatformFilter.tsx \
  src/components/admin/CreatorFilter.tsx
```

---

## Task 8: Analytics Dashboard Page

**Files:**
- Create: `src/app/admin/(dashboard)/analytics/page.tsx` (Server Component)
- Create: `src/app/admin/(dashboard)/analytics/AnalyticsDashboard.tsx` (Client Component)
- Modify: `src/app/admin/(dashboard)/layout.tsx` (add nav item)

- [ ] **Step 1: Create `src/app/admin/(dashboard)/analytics/AnalyticsDashboard.tsx`**

```tsx
'use client';

import { useState, useMemo } from 'react';
import { KpiCard } from '@/components/admin/KpiCard';
import { MetricsChart } from '@/components/admin/MetricsChart';
import { GrowthTable, type GrowthRow } from '@/components/admin/GrowthTable';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { PlatformFilter } from '@/components/admin/PlatformFilter';
import { CreatorFilter } from '@/components/admin/CreatorFilter';
import { formatCompact } from '@/lib/format';
import type { TalentMetricSnapshot, Talent } from '@/types';

interface AnalyticsDashboardProps {
  snapshots: TalentMetricSnapshot[];
  talents: Array<Pick<Talent, 'id' | 'name' | 'slug'>>;
  trackedCount: number;
}

// Brand colors for chart lines
const CHART_COLORS = [
  '#f5632a', '#e03070', '#8b3aad', '#5b9bd5',
  '#c42880', '#2563eb', '#059669', '#d97706',
  '#7c3aed', '#dc2626',
];

function getDateRange(preset: string, customFrom: string, customTo: string): { from: string; to: string } {
  const to = customTo || new Date().toISOString().split('T')[0];
  if (preset === 'custom' && customFrom) return { from: customFrom, to };
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return { from: fromDate.toISOString().split('T')[0], to };
}

export function AnalyticsDashboard({ snapshots, talents, trackedCount }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'twitch'>('all');
  const [selectedCreators, setSelectedCreators] = useState<number[]>([]);
  const [drillDownTalentId, setDrillDownTalentId] = useState<number | null>(null);

  const { from, to } = getDateRange(dateRange, customFrom, customTo);

  // Filter snapshots by date range, platform, and selected creators
  const filtered = useMemo(() => {
    return snapshots.filter((s) => {
      if (s.snapshotDate < from || s.snapshotDate > to) return false;
      if (platformFilter !== 'all' && s.platform !== platformFilter) return false;
      if (selectedCreators.length > 0 && !selectedCreators.includes(s.talentId)) return false;
      return true;
    });
  }, [snapshots, from, to, platformFilter, selectedCreators]);

  // Build talent name lookup
  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // KPI calculations
  const kpis = useMemo(() => {
    // Latest value per talent+platform
    const latestByKey = new Map<string, TalentMetricSnapshot>();
    const earliestByKey = new Map<string, TalentMetricSnapshot>();

    for (const s of filtered) {
      const key = `${s.talentId}-${s.platform}`;
      const current = latestByKey.get(key);
      if (!current || s.snapshotDate > current.snapshotDate) latestByKey.set(key, s);
      const earliest = earliestByKey.get(key);
      if (!earliest || s.snapshotDate < earliest.snapshotDate) earliestByKey.set(key, s);
    }

    let totalFollowers = 0;
    let totalGrowthPct = 0;
    let growthEntries = 0;
    let topGrower = { name: '-', pct: 0, platform: '' };

    for (const [key, latest] of latestByKey) {
      totalFollowers += latest.value;
      const earliest = earliestByKey.get(key);
      if (earliest && earliest.value > 0) {
        const pct = ((latest.value - earliest.value) / earliest.value) * 100;
        totalGrowthPct += pct;
        growthEntries++;
        if (pct > topGrower.pct) {
          const talent = talentMap.get(latest.talentId);
          topGrower = { name: talent?.name ?? 'Unknown', pct, platform: latest.platform };
        }
      }
    }

    return {
      totalFollowers: formatCompact(totalFollowers),
      avgGrowth: growthEntries > 0 ? `${(totalGrowthPct / growthEntries).toFixed(1)}%` : 'N/A',
      topGrower: topGrower.name !== '-'
        ? `${topGrower.name} (+${topGrower.pct.toFixed(1)}%)`
        : 'No data yet',
      topGrowerPlatform: topGrower.platform,
      trackedCount: trackedCount.toString(),
    };
  }, [filtered, talentMap, trackedCount]);

  // Chart data (grouped by date)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();

    for (const s of filtered) {
      const talent = talentMap.get(s.talentId);
      if (!talent) continue;
      const lineKey = `${talent.name} (${s.platform === 'youtube' ? 'YT' : 'TW'})`;

      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      const entry = dateMap.get(s.snapshotDate)!;
      entry[lineKey] = s.value;
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }, [filtered, talentMap]);

  // Chart lines config
  const chartLines = useMemo(() => {
    const keys = new Set<string>();
    for (const point of chartData) {
      for (const key of Object.keys(point)) {
        if (key !== 'date') keys.add(key);
      }
    }
    return Array.from(keys).map((key, i) => ({
      key,
      color: CHART_COLORS[i % CHART_COLORS.length],
      name: key,
    }));
  }, [chartData]);

  // Growth table rows
  const growthRows = useMemo((): GrowthRow[] => {
    const latestByKey = new Map<string, TalentMetricSnapshot>();
    const earliestByKey = new Map<string, TalentMetricSnapshot>();

    for (const s of filtered) {
      const key = `${s.talentId}-${s.platform}`;
      const current = latestByKey.get(key);
      if (!current || s.snapshotDate > current.snapshotDate) latestByKey.set(key, s);
      const earliest = earliestByKey.get(key);
      if (!earliest || s.snapshotDate < earliest.snapshotDate) earliestByKey.set(key, s);
    }

    const rows: GrowthRow[] = [];
    for (const [key, latest] of latestByKey) {
      const earliest = earliestByKey.get(key);
      const talent = talentMap.get(latest.talentId);
      const startValue = earliest?.value ?? latest.value;
      const absoluteChange = latest.value - startValue;
      const percentChange = startValue > 0 ? ((latest.value - startValue) / startValue) * 100 : null;

      rows.push({
        talentId: latest.talentId,
        talentName: talent?.name ?? 'Unknown',
        platform: latest.platform,
        currentValue: latest.value,
        startValue,
        absoluteChange,
        percentChange,
      });
    }

    return rows;
  }, [filtered, talentMap]);

  // Drill-down data for a single talent
  const drillDownTalent = drillDownTalentId ? talentMap.get(drillDownTalentId) : null;
  const drillDownData = useMemo(() => {
    if (!drillDownTalentId) return { chartData: [], lines: [], summaries: [] as Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> };

    const talentSnapshots = filtered.filter((s) => s.talentId === drillDownTalentId);
    const dateMap = new Map<string, Record<string, number>>();
    const byPlatform = new Map<string, TalentMetricSnapshot[]>();

    for (const s of talentSnapshots) {
      const lineKey = s.platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers';
      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      dateMap.get(s.snapshotDate)![lineKey] = s.value;

      if (!byPlatform.has(s.platform)) byPlatform.set(s.platform, []);
      byPlatform.get(s.platform)!.push(s);
    }

    const chartData = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    const lines = [];
    if (chartData.some((d) => 'YouTube Subscribers' in d)) {
      lines.push({ key: 'YouTube Subscribers', color: '#FF0000', name: 'YouTube Subscribers' });
    }
    if (chartData.some((d) => 'Twitch Followers' in d)) {
      lines.push({ key: 'Twitch Followers', color: '#9146FF', name: 'Twitch Followers' });
    }

    const summaries: Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> = [];
    for (const [platform, snaps] of byPlatform) {
      const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
      if (sorted.length >= 1) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const days = Math.ceil((new Date(last.snapshotDate).getTime() - new Date(first.snapshotDate).getTime()) / (1000 * 60 * 60 * 24));
        summaries.push({
          platform,
          from: first.value,
          to: last.value,
          pct: first.value > 0 ? ((last.value - first.value) / first.value) * 100 : null,
          days: Math.max(days, 1),
        });
      }
    }

    return { chartData, lines, summaries };
  }, [drillDownTalentId, filtered]);

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Followers" value={kpis.totalFollowers} />
        <KpiCard label="Avg Growth Rate" value={kpis.avgGrowth} subtitle="this period" />
        <KpiCard label="Top Grower" value={kpis.topGrower} subtitle={kpis.topGrowerPlatform} />
        <KpiCard label="Creators Tracked" value={kpis.trackedCount} />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
        />
        <PlatformFilter value={platformFilter} onChange={setPlatformFilter} />
        <CreatorFilter
          creators={talents.map((t) => ({ id: t.id, name: t.name }))}
          selected={selectedCreators}
          onChange={setSelectedCreators}
        />
      </div>

      {/* Drill-down or Overview */}
      {drillDownTalent ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setDrillDownTalentId(null)}
              className="text-sm text-sp-muted hover:text-sp-dark transition-colors"
            >
              ← Back to Overview
            </button>
            <h2 className="font-display text-2xl font-black uppercase text-sp-dark">
              {drillDownTalent.name}
            </h2>
          </div>

          {/* Growth summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {drillDownData.summaries.map((s) => (
              <div key={s.platform} className="rounded-2xl bg-white border border-sp-border p-6">
                <div className="text-sm font-medium text-sp-muted mb-1">
                  {s.platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers'}
                </div>
                <div className="font-display text-2xl font-black text-sp-dark">
                  {formatCompact(s.from)} → {formatCompact(s.to)}
                </div>
                <div className={`text-sm font-semibold mt-1 ${
                  (s.pct ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {s.pct !== null ? `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(1)}% in ${s.days} days` : `+${formatCompact(s.to - s.from)} (new)`}
                </div>
              </div>
            ))}
          </div>

          {/* Drill-down chart */}
          <div className="rounded-2xl bg-white border border-sp-border p-6 mb-6">
            <MetricsChart data={drillDownData.chartData} lines={drillDownData.lines} height={450} />
          </div>

          {/* Export Report link */}
          <a
            href={`/admin/analytics/report/${drillDownTalent.slug}?from=${from}&to=${to}`}
            className="inline-block px-6 py-3 rounded-xl bg-sp-dark text-white font-medium text-sm hover:bg-sp-black transition-colors"
          >
            Export Growth Report
          </a>
        </div>
      ) : (
        <div>
          {/* Overview Chart */}
          <div className="rounded-2xl bg-white border border-sp-border p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-sp-dark mb-4">Growth Trends</h2>
            <MetricsChart data={chartData} lines={chartLines} />
          </div>

          {/* Growth Table */}
          <div className="rounded-2xl bg-white border border-sp-border p-4">
            <h2 className="font-display text-lg font-bold text-sp-dark mb-4 px-2">Creator Growth</h2>
            <GrowthTable rows={growthRows} onCreatorClick={setDrillDownTalentId} />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/(dashboard)/analytics/page.tsx`**

```tsx
import { getSnapshots, countTrackedTalents } from '@/lib/queries/analytics';
import { getTalents } from '@/lib/queries/talents';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export default async function AdminAnalyticsPage() {
  // Fetch last 90 days of data (client can filter further)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const from = ninetyDaysAgo.toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];

  const [snapshots, allTalents, trackedCount] = await Promise.all([
    getSnapshots({ from, to }),
    getTalents(),
    countTrackedTalents(),
  ]);

  const talentList = allTalents.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  return (
    <AnalyticsDashboard
      snapshots={snapshots}
      talents={talentList}
      trackedCount={trackedCount}
    />
  );
}
```

- [ ] **Step 3: Add "Analytics" nav item to `src/app/admin/(dashboard)/layout.tsx`**

Add to the `navItems` array:
```typescript
{ href: '/admin/analytics', label: 'Analytics' },
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
scripts/committer "feat(analytics): add admin analytics dashboard page" \
  src/app/admin/\(dashboard\)/analytics/page.tsx \
  src/app/admin/\(dashboard\)/analytics/AnalyticsDashboard.tsx \
  src/app/admin/\(dashboard\)/layout.tsx
```

---

## Task 9: Growth Report Page

**Files:**
- Create: `src/app/admin/(dashboard)/analytics/report/[talentSlug]/page.tsx` (Server Component)
- Create: `src/app/admin/(dashboard)/analytics/report/[talentSlug]/GrowthReport.tsx` (Client Component)

- [ ] **Step 1: Create `src/app/admin/(dashboard)/analytics/report/[talentSlug]/GrowthReport.tsx`**

```tsx
'use client';

import { MetricsChart } from '@/components/admin/MetricsChart';
import { formatCompact } from '@/lib/format';
import type { TalentMetricSnapshot } from '@/types';

interface GrowthReportProps {
  talentName: string;
  talentPhoto: string | null;
  from: string;
  to: string;
  snapshots: TalentMetricSnapshot[];
}

export function GrowthReport({ talentName, talentPhoto, from, to, snapshots }: GrowthReportProps) {
  // Group by platform
  const byPlatform = new Map<string, TalentMetricSnapshot[]>();
  for (const s of snapshots) {
    if (!byPlatform.has(s.platform)) byPlatform.set(s.platform, []);
    byPlatform.get(s.platform)!.push(s);
  }

  // Build chart data per platform
  const platforms = Array.from(byPlatform.entries()).map(([platform, snaps]) => {
    const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const days = Math.max(
      Math.ceil((new Date(last.snapshotDate).getTime() - new Date(first.snapshotDate).getTime()) / (1000 * 60 * 60 * 24)),
      1,
    );
    const pct = first.value > 0 ? ((last.value - first.value) / first.value) * 100 : null;
    const label = platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers';

    const chartData = sorted.map((s) => ({
      date: s.snapshotDate,
      [label]: s.value,
    }));

    return { platform, label, first, last, days, pct, chartData };
  });

  const fromFormatted = new Date(from).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const toFormatted = new Date(to).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto print:max-w-none">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8 print:mb-6">
        <div>
          <div className="font-display text-sm font-bold uppercase gradient-text mb-1">SocialPro</div>
          <div className="font-display text-3xl font-black uppercase text-sp-dark">{talentName}</div>
          <div className="text-sm text-sp-muted mt-1">
            Growth Report: {fromFormatted} — {toFormatted}
          </div>
        </div>
        {talentPhoto && (
          <img
            src={talentPhoto}
            alt={talentName}
            className="w-16 h-16 rounded-full object-cover border-2 border-sp-border"
          />
        )}
      </div>

      {/* Per-platform sections */}
      {platforms.map(({ platform, label, first, last, days, pct, chartData }) => (
        <div key={platform} className="mb-10 print:mb-8">
          <h2 className="font-display text-xl font-bold uppercase text-sp-dark mb-4">{label}</h2>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-sp-off p-4">
              <div className="text-xs text-sp-muted">Start</div>
              <div className="font-display text-2xl font-black text-sp-dark">{formatCompact(first.value)}</div>
            </div>
            <div className="rounded-xl bg-sp-off p-4">
              <div className="text-xs text-sp-muted">Current</div>
              <div className="font-display text-2xl font-black text-sp-dark">{formatCompact(last.value)}</div>
            </div>
            <div className="rounded-xl bg-sp-off p-4">
              <div className="text-xs text-sp-muted">Growth</div>
              <div className={`font-display text-2xl font-black ${
                (pct ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {pct !== null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : `+${formatCompact(last.value - first.value)}`}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-sp-border p-4 bg-white print:border-0">
            <MetricsChart
              data={chartData}
              lines={[{
                key: label,
                color: platform === 'youtube' ? '#FF0000' : '#9146FF',
                name: label,
              }]}
              height={300}
            />
          </div>

          {/* Summary sentence */}
          <p className="text-sm text-sp-muted mt-3">
            {label} grew from {formatCompact(first.value)} to {formatCompact(last.value)}
            {pct !== null ? ` (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)` : ''} in {days} days.
          </p>
        </div>
      ))}

      {/* Footer */}
      <div className="border-t border-sp-border pt-4 mt-8 text-xs text-sp-muted print:mt-4">
        Generated by SocialPro on {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/(dashboard)/analytics/report/[talentSlug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { getTalentBySlug } from '@/lib/queries/talents';
import { getTalentSnapshots } from '@/lib/queries/analytics';
import { GrowthReport } from './GrowthReport';

interface ReportPageProps {
  params: Promise<{ talentSlug: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function GrowthReportPage({ params, searchParams }: ReportPageProps) {
  const { talentSlug } = await params;
  const { from, to } = await searchParams;

  const talent = await getTalentBySlug(talentSlug);
  if (!talent) return notFound();

  const toDate = to ?? new Date().toISOString().split('T')[0];
  const fromDate = from ?? (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  })();

  const snapshots = await getTalentSnapshots(talent.id, fromDate, toDate);

  return (
    <div className="print:p-0">
      <style>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>
      <GrowthReport
        talentName={talent.name}
        talentPhoto={talent.photoUrl}
        from={fromDate}
        to={toDate}
        snapshots={snapshots}
      />
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
scripts/committer "feat(analytics): add growth report page for brand pitches" \
  src/app/admin/\(dashboard\)/analytics/report/\[talentSlug\]/page.tsx \
  src/app/admin/\(dashboard\)/analytics/report/\[talentSlug\]/GrowthReport.tsx
```

---

## Task 10: Build Verification + Lint

- [ ] **Step 1: Run linter**

```bash
cd /home/reche/projects/ProyectoZack && npm run lint
```

Expected: No errors. Fix any that appear.

- [ ] **Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds. Fix any errors.

- [ ] **Step 4: Fix and commit any issues found**

If fixes were needed:
```bash
scripts/committer "fix(analytics): resolve build/lint issues" <changed-files>
```

---

## Task 11: Manual Testing — Populate Platform IDs + Trigger Cron

This task requires the user to have set up their API keys in `.env.local`.

- [ ] **Step 1: Add platformId values to talent_socials**

Run SQL via Neon console or Drizzle to populate `platform_id` for at least 2-3 test creators. Example:

```sql
-- Set YouTube channel IDs (find these from the creator's YouTube channel URL)
UPDATE talent_socials SET platform_id = 'CHANNEL_ID_HERE'
WHERE handle = 'TODOCS2' AND platform = 'yt';

-- Set Twitch broadcaster IDs (find via Twitch API or twitch.tv)
UPDATE talent_socials SET platform_id = 'BROADCASTER_ID_HERE'
WHERE handle = 'todocs2' AND platform = 'twitch';
```

- [ ] **Step 2: Test the cron endpoint locally**

```bash
curl -X GET http://localhost:3000/api/cron/snapshot-metrics
```

Expected: JSON response with `{ success: true, youtube: N, twitch: M, errors: [] }`.

- [ ] **Step 3: Verify data in database**

Check that `talent_metric_snapshots` has rows:
```sql
SELECT * FROM talent_metric_snapshots ORDER BY created_at DESC LIMIT 10;
```

- [ ] **Step 4: Visit `/admin/analytics` in the browser**

Verify: KPI cards show data, chart renders, table shows growth rows. Click a creator to see drill-down. Click "Export Growth Report" to verify the report page renders and is printable.
