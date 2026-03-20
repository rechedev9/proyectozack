# Creator Giveaways — Design Spec

## Summary

Public giveaway landing pages for SocialPro creators at `/creadores/[slug]`. Each creator gets a gaming-aesthetic page (inspired by zevocs2.com) showing their profile and active/finished giveaways. Giveaways are brand-sponsored — each card links out to the brand's external raffle URL. Admin manages all giveaways via `/admin/giveaways`.

## Requirements

- Every talent in the `talents` table gets a creator page at `/creadores/[slug]`
- Page shows mini-profile (photo, name, socials) + giveaway grid
- When no active giveaways → empty state with gaming aesthetic
- Giveaways managed exclusively by admin (no creator self-service)
- "PARTICIPAR" button redirects to external brand URL (new tab)
- Visual identity: dark/gaming (black + neon green `#C3FC00`), fully separate from SocialPro brand

## Routes

| Route | Type | Description |
|---|---|---|
| `/creadores/[slug]` | Public, SSG (revalidate 3600) | Creator landing + giveaways |
| `/admin/giveaways` | Protected | CRUD for giveaways |

Single page per creator — no separate `/giveaways` sub-route. Content doesn't justify the split.

## Database

### New table: `giveaways`

```
giveaways
  id            serial PK
  talent_id     integer FK → talents.id (ON DELETE CASCADE)
  title         varchar(200)        — prize name
  image_url     varchar(500)        — prize image (@vercel/blob)
  brand_name    varchar(150)        — sponsor name
  brand_logo    varchar(500)        — sponsor logo (@vercel/blob)
  value         varchar(50)         — display price ("1.250€")
  redirect_url  text NOT NULL       — external raffle link
  starts_at     timestamp NOT NULL  — giveaway start
  ends_at       timestamp NOT NULL  — giveaway end (countdown target)
  status        enum(active|finished) DEFAULT 'active'
  sort_order    integer DEFAULT 0
  created_at    timestamp DEFAULT now()
```

### New enum: `giveaway_status`

Values: `active`, `finished`

### Indexes

- `giveaways_talent_id_idx` on `talent_id`
- `giveaways_status_idx` on `status`

### Relations

- `talents` → `giveaways` (one-to-many)
- `giveaways` → `talents` (many-to-one)

### No participation/winner tables

SocialPro doesn't manage the raffle — only redirects. No need for user registration, entries, or winner tracking.

## Queries (`lib/queries/giveaways.ts`)

- `getActiveGiveaways(talentId)` — `WHERE talent_id = ? AND status = 'active' AND ends_at > NOW()` ordered by `ends_at ASC`
- `getFinishedGiveaways(talentId)` — `WHERE talent_id = ? AND (status = 'finished' OR ends_at <= NOW())` ordered by `ends_at DESC`
- `getAllGiveaways()` — admin list with talent name join
- `createGiveaway(data)` — admin insert
- `updateGiveaway(id, data)` — admin update
- `deleteGiveaway(id)` — admin delete

Status derived from query logic: a giveaway with `ends_at` in the past is treated as finished regardless of the `status` column. No cron needed.

## UI — Public Pages

### Layout (`/creadores/layout.tsx`)

Completely isolated from SocialPro's main layout. No shared Nav/Footer.

- Background: `#000000` with subtle noise/grain texture
- Accent: neon green `#C3FC00` with glow effects (text-shadow, box-shadow)
- Typography: system UI stack, bold/black weights, uppercase headings
- No SocialPro gradient, no Barlow Condensed, no brand colors

### Creator Landing (`/creadores/[slug]/page.tsx`)

**Server Component** with `revalidate = 3600`. Fetches talent + giveaways in `Promise.all`.

Static params from `getTalentSlugs()`.

**Sections (top to bottom):**

1. **Sticky header** — Creator name (styled logo) + green "GIVEAWAYS" anchor button
2. **Hero** — Large creator photo, name, social links (icon buttons linking to profiles). Dark gradient background.
3. **Active giveaways grid** — Giveaway cards. If empty → gaming-styled empty state ("No hay sorteos activos").
4. **Finished giveaways** — Desaturated cards, no countdown, horizontal scroll or collapsed grid.

### Giveaway Card

```
┌──────────────────────────┐
│  ▓▓▓▓ brand logo+name ▓▓ │  ← top bar with sponsor
│                          │
│      [PRIZE IMAGE]       │  ← hover: scale + brightness + glow
│                          │
│  AWP Dragon Lore FN      │  ← title
│  1.250€                  │  ← value in green with glow
│                          │
│  02d 14h 32m 18s         │  ← countdown (4 boxes)
│                          │
│  [ ▶ PARTICIPAR ]        │  ← green button → redirect_url (new tab)
└──────────────────────────┘
```

**Finished state:** Same card but desaturated, countdown replaced with "FINALIZADO" badge, button disabled or hidden.

### Animations (Framer Motion)

- **Card entrance:** `staggerChildren` with fade-up animation
- **Card hover:** lift with spring physics (`useSpring`), glow intensifies
- **Countdown:** flip-clock style digit transitions with `AnimatePresence`
- **Button glow:** pulsating CSS keyframe animation
- **Prize image parallax:** subtle scroll-driven parallax via `useScroll` + `useTransform`
- **Hero background:** subtle particle/grain effect (CSS or lightweight canvas)

### Responsive

- Desktop: 3-column card grid
- Tablet: 2-column
- Mobile: 1-column, compact hero

## UI — Admin

### `/admin/giveaways` (page.tsx)

Follows existing admin aesthetic (not gaming).

**List view:**
- Table with columns: prize image (thumb), title, creator name, brand, value, status, ends_at
- Filters: by creator (dropdown), by status
- Actions: edit, delete

**Create/Edit form:**
- Creator selector (dropdown from talents)
- Title, value (text inputs)
- Prize image upload (@vercel/blob)
- Brand name + brand logo upload (@vercel/blob)
- Redirect URL (text input, validated as URL)
- Starts at / Ends at (date-time pickers)
- Status toggle (active/finished)

### Admin actions (`/admin/giveaways/actions.ts`)

Server actions for create, update, delete. Revalidate `/creadores/[slug]` on mutation.

## File Structure

```
src/
  db/schema/
    giveaways.ts              — table + enum + relations
    index.ts                  — add export
  lib/queries/
    giveaways.ts              — all giveaway queries
  app/
    creadores/
      layout.tsx              — isolated dark/gaming layout
      [slug]/
        page.tsx              — Server: hero + giveaway grid
        GiveawayCard.tsx      — Client: card with hover animations
        CountdownTimer.tsx    — Client: flip-clock countdown
        CreatorHero.tsx       — Client: hero with particle effect
        GiveawayGrid.tsx      — Client: stagger animation wrapper
    admin/(dashboard)/
      giveaways/
        page.tsx              — admin list
        actions.ts            — server actions (CRUD)
```

## Dependencies

- `framer-motion` — card animations, countdown, parallax (likely already installed or easy add)
- `@vercel/blob` — already in stack for image uploads
- No new major dependencies

## Open Graph / SEO

Each creator page gets proper OG tags:
- Title: `{name} — Giveaways | SocialPro`
- Description: bio or generic "Sorteos activos de {name}"
- Image: creator photo
- Twitter card: `summary_large_image`

## Edge Cases

- **Giveaway expires mid-session:** Countdown hits 0 → card transitions to "FINALIZADO" state client-side (no reload needed)
- **No photo for creator:** Fallback to initials on gradient (same pattern as `/talentos/[slug]`)
- **No giveaways at all:** Gaming-styled empty state, creator profile still shows
- **Multiple giveaways same brand:** Each is independent, brand info duplicated per giveaway (no brand normalization table — YAGNI)
