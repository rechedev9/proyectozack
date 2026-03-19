# SocialPro — Next.js 16 Migration Roadmap

## Stack (March 2026 latest)

| Package | Version |
|---|---|
| `next` | 16.1.x |
| `drizzle-orm` | 0.45.1 |
| `drizzle-kit` | 0.31.9 |
| `@neondatabase/serverless` | 1.0.2 |
| `zod` | 4.3.6 |
| `react-hook-form` | 7.71.2 |
| `@hookform/resolvers` | 5.2.2 |
| `resend` | 6.9.4 |
| `@t3-oss/env-nextjs` | 0.13.10 |
| `shadcn/ui` | CLI v4 |
| `@vercel/blob` | 2.3.1 |
| `better-auth` | latest |

TypeScript strict mode. No `any`. Explicit return types on all exported functions.

---

## Key Decisions

- **CSS:** Tailwind + globals.css. Brand tokens in `tailwind.config.ts`; complex CSS (marquee, gradient text, modals) stays in `globals.css`.
- **Contact form:** POST `/api/contact` → save to DB + Resend email to `marketing@socialpro.es`.
- **Images:** Extract base64 → `/public/images/{category}/{key}.jpg|png`.
- **Admin panel:** Password-protected `/admin` with CRUD for talents, cases, testimonials. Auth via Better Auth.
- **tsconfig.json:** Must be configured correctly so LSP activates.

---

## Phase 0 — Docs ✅

Fetch and store in `docs/`:

- [x] `docs/drizzle.md` — copied from TrackerRSN
- [x] `docs/zod.md` — copied from TrackerRSN
- [x] `docs/nextjs.md` — Next.js 16 App Router
- [x] `docs/neon.md` — @neondatabase/serverless
- [x] `docs/better-auth.md` — Better Auth Next.js integration
- [x] `docs/shadcn.md` — shadcn/ui CLI v4
- [x] `docs/resend.md` — Resend Node SDK

---

## Phase 1 — Project Bootstrap

```bash
npx create-next-app@latest socialpro --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd socialpro
npx shadcn@latest init
```

- `drizzle.config.ts` — dialect: postgresql, schema: `src/db/schema/index.ts`, out: `drizzle/`
- `src/lib/env.ts` — @t3-oss/env-nextjs schema
- `.env.local` — DATABASE_URL, RESEND_API_KEY, BETTER_AUTH_SECRET, NEXT_PUBLIC_SITE_URL
- `src/lib/db.ts` — Neon + Drizzle singleton (edge-safe)
- Verify `tsconfig.json` covers `src/` paths and `@/*` alias → LSP activates

---

## Phase 2 — Database Schema

Files in `src/db/schema/`, re-exported from `src/db/schema/index.ts`.

### `talents.ts`
```
talents          id(serial PK), slug(varchar unique), name, role, game, platform(enum: twitch|youtube|cs2), status(enum: active|available|inactive), bio(text), gradient_c1, gradient_c2, initials(varchar 4), photo_url, sort_order(int)
talent_tags      id, talent_id(FK→talents), tag(varchar)
talent_stats     id, talent_id(FK), icon(varchar), value(varchar), label(varchar), sort_order(int)
talent_socials   id, talent_id(FK), platform(varchar), handle(varchar), followers_display(varchar), profile_url(text), hex_color(varchar 7), sort_order(int)
```

### `content.ts`
```
testimonials     id, quote(text), author_name, author_role, gradient_c1, gradient_c2, sort_order
collaborators    id, slug, name, description, badge, photo_url, gradient_c1, gradient_c2, initials, sort_order
team_members     id, slug, name, role, bio(text), photo_url, gradient_c1, gradient_c2, initials, sort_order
brands           id, slug(varchar unique), display_name, logo_url, sort_order
portfolio_items  id, type(enum: thumb|video|campaign), creator_name, title, image_url, sort_order
```

### `cases.ts`
```
case_studies     id, slug(varchar unique), brand_name, title(text), logo_url, sort_order
case_body        id, case_id(FK), paragraph(text), sort_order
case_tags        id, case_id(FK), tag(varchar)
case_creators    id, case_id(FK), creator_name(varchar)
```

### `submissions.ts`
```
contact_submissions  id(serial PK), name, email, type(varchar), company(varchar nullable), message(text), created_at(timestamp default now()), ip_hash(varchar nullable)
```

Run: `drizzle-kit generate` → `drizzle-kit migrate`

---

## Phase 3 — Image Extraction

`scripts/extract-images.mjs` — reads HTML, regex-matches base64 blobs, writes decoded files:
- `public/images/talents/{key}.jpg` (13 files)
- `public/images/team/{key}.jpg` (4 files)
- `public/images/collabs/{key}.jpg` (3 files)
- `public/images/brands/{key}.png` (14 files)
- `public/images/cases/{slug}.jpg` (3 files)
- `public/images/portfolio/{index}.jpg` (up to 6 files)

---

## Phase 4 — Seed Script

`scripts/seed.ts` (run with `npx tsx scripts/seed.ts`)

Insert order (respects FK):
1. brands (14)
2. talents (13) → talent_tags, talent_stats, talent_socials
3. collaborators (3)
4. team_members (4)
5. testimonials (3)
6. case_studies (3) → case_body, case_tags, case_creators
7. portfolio_items (6)

Wrap in `db.transaction()`. Idempotent: truncate or `onConflictDoNothing`.

---

## Phase 5 — Query Functions

`src/lib/queries/`:
- `talents.ts` — `getTalents(platform?)`, `getTalentBySlug(slug)`
- `content.ts` — `getBrands()`, `getCollaborators()`, `getTeam()`, `getTestimonials()`
- `cases.ts` — `getCaseStudies()`, `getCaseBySlug(slug)`
- `portfolio.ts` — `getPortfolioItems(type?)`

Return types use `InferSelectModel` from Drizzle; exported from `src/types/index.ts`.

---

## Phase 6 — Component Tree

```
src/
  app/
    layout.tsx                   # Root: fonts, metadata, Nav, globals
    page.tsx                     # Home: Server Component, Promise.all, revalidate=3600
    globals.css
    admin/
      layout.tsx                 # Better Auth session guard
      page.tsx
      talents/page.tsx
      cases/page.tsx
      testimonials/page.tsx
    api/
      contact/route.ts
      auth/[...all]/route.ts
  components/
    layout/Nav.tsx (CLIENT), Footer.tsx (SERVER)
    sections/
      Hero.tsx (SERVER)
      Marquee.tsx (SERVER)
      BrandsCarousel.tsx (SERVER)
      TalentSection.tsx (SERVER shell) → TalentGrid.tsx (CLIENT) → TalentCard.tsx (CLIENT) → TalentModal.tsx (CLIENT)
      CollabsSection.tsx (SERVER)
      ServicesSection.tsx (CLIENT — tabs)
      MetricsSection.tsx (SERVER)
      CasesSection.tsx (SERVER shell) → CaseCard.tsx (CLIENT) → CaseModal.tsx (CLIENT)
      PortfolioSection.tsx (SERVER shell) → PortfolioGrid.tsx (CLIENT)
      TestimonialsSection.tsx (SERVER)
      AboutSection.tsx (SERVER)
      TeamGrid.tsx (SERVER)
      ContactSection.tsx (CLIENT — react-hook-form)
      CtaSection.tsx (SERVER)
    ui/
      GradientText.tsx, SectionTag.tsx, SectionHeading.tsx, StatusBadge.tsx, SocialIcon.tsx (all SERVER)
  db/index.ts, schema/
  lib/queries/, env.ts, email.ts, auth.ts
  types/index.ts
```

**Server vs Client rule:** Server = no onClick/useState/useEffect/scroll. Client = Nav, TalentGrid, TalentCard/Modal, ServicesSection, CaseCard/Modal, PortfolioGrid, ContactSection.

**Data flow:** Server shell fetches all data → passes full array as prop to Client child → Client filters locally. No client-side DB calls.

---

## Phase 7 — API Routes

### POST /api/contact
1. Zod validate body
2. `db.insert(contactSubmissions).values({...})`
3. `resend.emails.send({ to: 'marketing@socialpro.es', ... })`
4. Return `{ success: true }` — Resend failure → still 200, log error

### GET+POST /api/auth/[...all]
Better Auth catch-all handler.

---

## Phase 8 — Admin Panel

Route `/admin` — Better Auth protected (redirect to `/admin/login` if no session).

Pages: dashboard, talents CRUD, cases CRUD, testimonials CRUD.
shadcn components: Table, Dialog, Form, Button, Input, Textarea, Select.
Server Actions for mutations.

---

## Phase 9 — Tailwind Config

```typescript
theme: {
  extend: {
    colors: {
      'sp-orange':'#f5632a', 'sp-pink':'#e03070', 'sp-dpink':'#c42880',
      'sp-purple':'#8b3aad', 'sp-blue':'#5b9bd5', 'sp-dark':'#1a1a1a',
      'sp-black':'#0e0e0e', 'sp-muted':'#6b6864', 'sp-muted2':'#a8a39d',
      'sp-border':'#e2ddd8', 'sp-off':'#f5f4f1', 'sp-bg2':'#eceae6',
    },
    fontFamily: { display: ['"Barlow Condensed"','sans-serif'], body:['Inter','sans-serif'] },
    backgroundImage: {
      'sp-grad': 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)',
    },
  },
}
```

Keep complex CSS in `globals.css` — do not force-migrate to Tailwind utilities.

---

## Phase 10 — Deployment

1. Push to GitHub
2. Connect to Vercel (auto-detects Next.js 16)
3. Set env vars: `DATABASE_URL`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
4. Neon: create prod DB, run `drizzle-kit migrate`, run seed
5. Verify ISR cache headers on `/`

---

## Execution Order (risk-minimized)

### Week 1 — Infra
1. Fetch + write all docs to `docs/` ← **CURRENT**
2. Bootstrap Next.js 16 project
3. DB schema → migrations → verify in Neon
4. Image extraction script → verify files
5. Seed script → verify row counts

### Week 2 — Static sections
6. Tailwind config + globals.css migration
7. `layout.tsx` (fonts, metadata, Nav, Footer)
8. All SERVER sections

### Week 3 — Interactive sections
9. TalentGrid + TalentModal
10. ServicesSection (tabs)
11. CasesSection + CaseModal
12. PortfolioGrid (filter)
13. Wire up `app/page.tsx` with `Promise.all`

### Week 4 — Backend + Admin
14. `/api/contact` + ContactSection form
15. Better Auth + `/admin` layout guard
16. Admin CRUD pages
17. End-to-end test
18. Deploy to Vercel + smoke test

---

## Verification Checklist

- [ ] `tsc --noEmit` zero errors
- [ ] `next build` no warnings
- [ ] 13 talent cards render with photos from `/public/images/`
- [ ] Talent filter (twitch/youtube/cs2) works client-side
- [ ] Talent modal opens with correct data
- [ ] Case modal opens with correct content
- [ ] Contact form → DB row → email received
- [ ] `/admin` redirects to login when unauthenticated
- [ ] Admin can edit talent bio → visible within 1hr (ISR)
- [ ] Vercel: `Cache-Control: s-maxage=3600, stale-while-revalidate` on `/`

---

## Critical Source Files

- `src/db/schema/talents.ts` — most complex schema; enums must match exact strings from original prototype
- `src/app/page.tsx` — integration point for all data fetching
- `src/app/api/contact/route.ts` — only dynamic API endpoint
- `scripts/extract-images.mjs` — one-time image extraction; must run before seed

---

## Growth Phases (Post-Launch) — Competitive Analysis Insights

> Source: `research_report_20260319_socialpro_competitive.html` (52 fuentes, 2026-03-19)

---

### Growth A — Case Studies con Métricas ✅

**Por qué:** 0/3 competidores tienen case studies funcionales. El 50% de marketers no puede demostrar ROI — documentar resultados es ventaja competitiva enorme.

- [x] Expandir schema `case_studies` con campos de métricas: `reach`, `engagement_rate`, `conversions`, `roi_multiplier`, `hero_image_url`, `excerpt`
- [x] Crear ruta dinámica `/casos/[slug]` con página completa (no solo modal)
- [x] Diseñar layout de case study: hero con logo marca, métricas destacadas, body con párrafos, tags
- [x] Poblar 3 case studies con datos cuantificables (RAZER, 1WIN, SKINSMONKEY)
- [x] Añadir JSON-LD `Article` schema a cada página de caso
- [x] Link desde CasesSection de home a las páginas individuales (CaseCard → Link)

---

### Growth B — Páginas Individuales de Talento ✅

**Por qué:** Vizz y L3tcraft tienen páginas por creador que Google indexa. SocialPro solo tiene modal — URLs no compartibles, no indexables.

- [x] Crear ruta `/talentos/[slug]` con SSR + ISR (revalidate 3600)
- [x] Layout: hero con foto/gradiente, bio, stats, socials, tags
- [x] JSON-LD `Person` schema por talento
- [x] Mantener modal en home + link "Ver perfil completo" → `/talentos/[slug]`
- [x] Sitemap dinámico incluyendo todas las rutas de talento

---

### Growth C — Blog / Contenido SEO ✅

**Por qué:** Ninguna agencia gaming en España tiene estrategia SEO seria. Los términos long-tail tienen baja competencia y alta intención.

- [x] Schema DB: tabla `posts` (id, slug, title, excerpt, body_md, cover_url, author, status, published_at, sort_order)
- [x] Ruta `/blog` con grid de artículos
- [x] Ruta `/blog/[slug]` con body desde DB + JSON-LD `BlogPosting`
- [x] 3 artículos iniciales: tendencias gaming España, guía para creadores, análisis de campaña
- [x] RSS feed `/blog/feed.xml`
- [x] Meta tags OG dinámicos por post
- [x] Nav y Footer actualizados con link a `/blog`

---

### Growth D — Landing Para Creadores ✅

**Por qué:** Ningún competidor tiene funnel dedicado a captar talento. Diferenciar el formulario de contacto marca vs. creador.

- [x] Crear `/para-creadores` — landing con propuesta de valor, proceso visual (4 pasos), beneficios
- [x] Formulario dedicado (nombre, email, plataforma, handle, seguidores, mensaje)
- [x] Guardar en tabla `creator_applications` (nuevo schema) + API route POST `/api/creator-apply`
- [x] CTA desde Footer hacia esta página

---

### Growth E — Metodología / Resultados ✅

**Por qué:** Responde al pain point del 50% de marketers que no puede demostrar ROI. Ningún competidor explica su proceso.

- [x] Crear `/metodologia` — página con 4 fases (discovery, matching, ejecución, reporting)
- [x] Sección de KPIs medidos (alcance, engagement, conversiones, ROI, sentiment, retention)
- [x] Link desde Footer (Servicios → "Nuestra Metodología")
- [x] Sitemap actualizado

---

### Growth F — Internacionalización LATAM ✅ (parcial)

**Por qué:** 300M+ gamers, CAGR 9.12%, mismo idioma. No existe agencia hispanohablante premium con presencia España + LATAM.

- [x] Incluir talento LATAM en roster: KEVO (Argentina) y LUNA (México)
- [x] Hero y About ya mencionan LatAm, Footer tiene "Latinoamérica" en Mercados
- [ ] Contenido blog sobre ecosistema gaming latinoamericano
- [ ] Evaluar i18n ligero: español neutro como default, localización de moneda/región donde aplique
- [ ] Meta tags `hreflang` si se crean variantes regionales

---

### Growth G — Dashboard Marcas MVP ✅

**Por qué:** Diferenciador tecnológico que ninguna agencia española ofrece. La infra Next.js ya lo soporta.

- [x] Portal `/marcas` protegido con auth (Better Auth roles: `admin` | `brand`, shared `requireRole()` guard)
- [x] Browse de talento con filtros: plataforma, nicho (tags), con FilterChips URL-based
- [x] Ficha de talento con métricas, historial de campañas con la marca, socials, bio
- [x] Formulario de interés / solicitud de propuesta por talento (ProposalModal + API `POST /api/marcas/proposals`)
- [x] Admin: gestión de acceso de marcas (`/admin/brands` con invite-only via Resend)
- [x] Dashboard de marca con stats (campañas, talentos, propuestas pendientes)
- [x] Vista de comparación de talentos side-by-side (`/marcas/comparar?ids=...`)
- [x] Lista de propuestas con status badges (`/marcas/propuestas`)
- [x] Schema: `brand_campaigns`, `talent_proposals`, `proposal_status` enum, `case_creators.talent_id` FK

---

### Growth H — Contenido SEO Recurrente (continuo)

**Por qué:** El paisaje SEO español para agencias gaming está prácticamente vacío. First-mover advantage significativo y acumulativo.

- [ ] Calendario editorial: 2-3 artículos/mes
- [ ] Targeting long-tail: "cómo conseguir sponsor como streamer", "agencia gaming España", "marketing gaming LATAM"
- [ ] Reportes de mercado trimestrales (reutilizar datos del análisis competitivo)
- [ ] Guías para creadores (monetización, crecimiento, negociación)
- [ ] Presencia en eventos clave: GAMERGY, SBC Summit LATAM
