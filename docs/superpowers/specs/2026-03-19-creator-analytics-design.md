# Creator Analytics Dashboard — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Admin-only Looker-style analytics dashboard tracking YouTube subscriber and Twitch follower growth over time per creator.

---

## 1. Goals

- Track YouTube subscriber counts and Twitch follower counts daily for all managed creators
- Store historical snapshots to show growth trends over time
- Provide a rich admin dashboard (Looker-style) with KPI cards, interactive charts, filters, and drill-downs
- Enable exportable growth reports for brand pitches ("started at X, now at Y, Z% growth in N days")

## 2. Non-Goals

- No brand portal access (admin only for now)
- No backfill of historical data — forward from first snapshot only
- No other platforms (Instagram, TikTok, X, Kick, Discord) — YouTube + Twitch only
- No real-time data — daily snapshots are sufficient
- No server-side PDF generation — browser print/screenshot for reports

## 3. Data Model

### 3.1 New Table: `talent_metric_snapshots`

| Column         | Type          | Description                                    |
|----------------|---------------|------------------------------------------------|
| `id`           | serial PK     | Auto-increment primary key                     |
| `talentId`     | integer FK    | References `talents.id`                        |
| `platform`     | text          | `youtube` or `twitch`                          |
| `metricType`   | text          | `subscribers` (YT) or `followers` (Twitch)     |
| `value`        | integer       | Raw numeric count (e.g., 2500000)              |
| `snapshotDate` | date          | The calendar day this was recorded             |
| `createdAt`    | timestamp     | When the row was inserted                      |

**Unique constraint:** `(talentId, platform, metricType, snapshotDate)` — prevents duplicate snapshots if the cron fires twice.

**Index:** `(talentId, snapshotDate)` for efficient range queries per creator.

### 3.2 Schema Change: `talent_socials`

Add nullable column `platformId` (text) to `talent_socials`:
- For YouTube: the channel ID (e.g., `UCxxxxxxxxxxxxx`)
- For Twitch: the Twitch numeric broadcaster ID (resolved once when admin enters the username, stored permanently to avoid repeated `/users?login=` lookups)

This column is used by the cron job to know which API endpoint to call. Talents without a `platformId` for a given platform are skipped.

### 3.3 Platform Value Mapping

**Important:** `talent_socials.platform` uses abbreviated values from the seed data (`yt`, `twitch`, `x`, `ig`, `tt`), while `talents.platform` uses the enum `youtube` | `twitch`. The cron job must filter on the actual values in `talent_socials`:
- YouTube rows use `platform = 'yt'` (some legacy rows use `'youtube'`)
- Twitch rows use `platform = 'twitch'`

The cron query must match on `IN ('yt', 'youtube')` for YouTube and `= 'twitch'` for Twitch.

The `talent_metric_snapshots.platform` column stores normalized values (`youtube` | `twitch`) regardless of the source abbreviation.

## 4. API Integrations

### 4.1 YouTube Data API v3

- **Endpoint:** `GET https://www.googleapis.com/youtube/v3/channels?part=statistics&id={channelId}&key={API_KEY}`
- **Auth:** API key via `YOUTUBE_API_KEY` env var
- **Response field:** `items[0].statistics.subscriberCount` (integer as string)
- **Rate limit:** 10,000 quota units/day; each call costs 1 unit
- **Note:** Subscriber counts are rounded for channels >1,000 subs (YouTube policy since 2019)

### 4.2 Twitch Helix API

- **Endpoint:** `GET https://api.twitch.tv/helix/channels/followers?broadcaster_id={userId}`
- **Auth:** App access token via client credentials grant
  - `POST https://id.twitch.tv/oauth2/token` with `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET`
  - Token cached in memory, refreshed on 401
- **Response field:** `total` (integer)
- **Rate limit:** 800 requests/minute
- **Note:** Need to resolve Twitch login → broadcaster ID first via `GET /users?login={username}`

### 4.3 Twitch User ID Resolution

The `platformId` for Twitch stores the numeric broadcaster ID directly. When an admin enters a Twitch username in the admin UI, the system resolves it once via `GET /users?login={username}` and stores the numeric ID. This avoids repeated lookups on every cron run.

## 5. Cron Job

### 5.1 Route

`GET /api/cron/snapshot-metrics`

### 5.2 Trigger

Vercel Cron via `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/snapshot-metrics",
    "schedule": "0 6 * * *"
  }]
}
```
Runs daily at 06:00 UTC.

### 5.3 Security

Vercel automatically sends an `Authorization: Bearer <CRON_SECRET>` header. The route validates this before proceeding. `CRON_SECRET` is auto-set by Vercel on deployment.

### 5.4 Flow

1. Verify `CRON_SECRET` header
2. Fetch all `talent_socials` rows where `platform` IN `('yt', 'youtube', 'twitch')` AND `platformId` is not null
3. Group by platform (normalize `yt`/`youtube` → `youtube`)
4. **YouTube batch:** Call YouTube API with comma-separated channel IDs (up to 50 per request)
5. **Twitch batch:** Use stored broadcaster IDs to fetch follower counts directly (no login resolution needed)
6. Insert snapshots using `ON CONFLICT DO NOTHING` on the unique constraint (idempotent)
7. Return summary JSON: `{ success: true, youtube: N, twitch: M, errors: [...] }`

### 5.5 Error Handling

- If a single creator's API call fails, log the error and continue with the rest
- If the YouTube/Twitch API is entirely down, the cron returns an error response (Vercel logs this)
- Missing `platformId` → skip silently
- Missing env vars → return 500 with descriptive message

## 6. Environment Variables

| Variable              | Required | Description                              |
|-----------------------|----------|------------------------------------------|
| `YOUTUBE_API_KEY`     | Yes      | Google Cloud API key for YouTube Data v3 |
| `TWITCH_CLIENT_ID`    | Yes      | Twitch developer app Client ID           |
| `TWITCH_CLIENT_SECRET`| Yes      | Twitch developer app Client Secret       |
| `CRON_SECRET`         | Auto     | Set by Vercel automatically              |

**Env validation:** These new vars must NOT be added to `src/lib/env.ts` (t3-env eager validation) — they would crash the app on startup if missing. Instead, validate lazily inside the service files (`youtube.ts`, `twitch.ts`) and the cron route. This way the rest of the app works fine without analytics keys configured.

## 7. Admin Dashboard UI

### 7.1 Route: `/admin/analytics`

**File location:** `src/app/admin/(dashboard)/analytics/page.tsx` — inside the `(dashboard)` route group to inherit the admin layout (sidebar + `requireRole('admin')` guard).

### 7.2 Layout

**Top — KPI Cards Row (4 cards):**
- **Total Roster Followers** — sum of latest snapshot values across all creators and platforms
- **Avg Growth Rate** — average % change over selected period across all creators
- **Top Grower** — creator with highest % growth in selected period (name + % + platform)
- **Creators Tracked** — count of creators with at least one platform ID configured

**Middle — Controls Bar:**
- **Date range picker:** 7d / 30d / 90d / custom date range
- **Platform filter:** All / YouTube / Twitch
- **Creator filter:** multi-select dropdown

**Bottom — Tabbed Views:**

#### Overview Tab
- **Line chart** (Recharts `<LineChart>`) showing aggregated or per-creator follower trends over the selected period. Top 5 creators by default; toggle to show all.
- **Data table** with columns: Creator | Platform | Current Count | Start of Period | Absolute Change | % Growth. Sortable by any column.

#### Creator Drill-Down Tab
Activated by clicking a creator in the overview table or selecting one from the filter.
- **Large line chart** with YouTube + Twitch as separate lines (dual Y-axis if scales differ significantly)
- **Growth summary card:** "YouTube subscribers grew from X to Y (+Z%) in N days"
- **Export Report button** → navigates to the report page

### 7.3 Data Fetching

Server Component fetches data via Drizzle queries → passes to Client Component for interactive charts/filters. Same pattern as the rest of the app.

**Key queries:**
- Latest snapshot per creator per platform (for KPI cards + current values)
- Snapshot range by date (for charts)
- Growth calculation: `(latest - earliest) / earliest * 100` for a given period. If `earliest` is 0, show absolute change only (avoid division by zero).

## 8. Growth Report Page

### 8.1 Route: `/admin/analytics/report/[talentSlug]`

### 8.2 Query Params
- `from` — start date (YYYY-MM-DD)
- `to` — end date (YYYY-MM-DD)

### 8.3 Content

A clean, branded, print-optimized page:
- SocialPro logo + gradient accent
- Creator name + photo
- Date range header
- Per-platform section:
  - Start value → End value → % growth
  - Line chart of the period
  - One-liner summary (e.g., "YouTube subscribers grew 34% in 90 days")
- Footer with generation date

### 8.4 Export Method

Browser-native: `Ctrl+P` / right-click → Print → Save as PDF. The page uses `@media print` CSS to hide nav, adjust layout for paper. No server-side PDF generation needed.

## 9. Charting Library

**Recharts** (`recharts` npm package):
- React-native, composable, good TypeScript support
- Lightweight (~45KB gzipped)
- Good default styling, easy to theme with brand colors
- Supports: LineChart, AreaChart, Tooltip, Legend, ResponsiveContainer, dual Y-axis

Add `'recharts'` to `optimizePackageImports` in `next.config.ts` for proper tree-shaking.

## 10. New Dependencies

| Package    | Purpose                        |
|------------|--------------------------------|
| `recharts` | Interactive charts             |

No other new dependencies. YouTube and Twitch APIs are called via `fetch()`.

## 11. File Structure (New Files)

```
src/
  db/schema/
    analytics.ts                          # talent_metric_snapshots table
  lib/
    queries/analytics.ts                  # Drizzle queries for snapshots
    services/
      youtube.ts                          # YouTube API client
      twitch.ts                           # Twitch API client (with token management)
  app/
    api/cron/
      snapshot-metrics/route.ts           # Daily cron endpoint
    admin/(dashboard)/
      analytics/
        page.tsx                          # Analytics dashboard (Server Component)
        AnalyticsDashboard.tsx            # Interactive dashboard (Client Component)
        report/
          [talentSlug]/
            page.tsx                      # Growth report page (Server Component)
            GrowthReport.tsx              # Report content (Client Component for charts)
  components/
    admin/
      KpiCard.tsx                         # Reusable KPI stat card
      MetricsChart.tsx                    # Recharts line chart wrapper
      GrowthTable.tsx                     # Sortable growth data table
      DateRangePicker.tsx                 # Date range selector
      PlatformFilter.tsx                  # Platform toggle
      CreatorFilter.tsx                   # Multi-select creator dropdown
vercel.json                               # Cron job configuration (project root)
```

## 12. Admin Navigation

Add "Analytics" link to the admin sidebar/nav by modifying `src/app/admin/(dashboard)/layout.tsx` — add `{ href: '/admin/analytics', label: 'Analytics' }` to the `navItems` array. The `PortalSidebar` component renders these as nav links.

## 13. Security

- Cron route: validates `CRON_SECRET` header (Vercel-managed)
- Analytics pages: protected by existing admin layout auth guard (`requireRole('admin')`)
- API keys: server-side only, never exposed to client
- No new public endpoints

## 14. Future Extensibility

The design supports future additions without schema changes:
- **New platforms:** Add rows with new `platform` values (e.g., `kick`, `instagram`)
- **New metrics:** Add rows with new `metricType` values (e.g., `views`, `watch_hours`)
- **Brand portal access:** Add a new route under `/marcas/` that queries the same data with brand-scoped filters
- **Alerts:** Query for growth anomalies (spikes or drops) and notify via email
