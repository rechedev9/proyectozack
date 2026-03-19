---
summary: "Session handoff template. Dump state so the next session can resume fast."
read_when:
  - Ending a work session
  - Switching context
  - Handing off to another agent
---

# Handoff — 2026-03-19 (session 5)

## 1. Scope / Status

- **Task:** SEO + GEO (Generative Engine Optimization) improvement
- **Phase:** Brainstorming — design not yet written
- **Done this session:**
  - Full SEO/GEO audit of the codebase (see findings below)
  - Brainstorming started — 3 of ~6 clarifying questions answered
- **Decisions locked:**
  - Goal: Both SEO + GEO (traditional search + AI engine citations)
  - Entity priority: Agency (A) > Talents (B) > Blog (D) > Cases (C)
  - Geographic scope: Spain + LATAM equally (broad Spanish-speaking)
- **Pending decision:** Does user have domain live + GSC? (question was asked, not answered)
- **Blockers:** None

## 2. Working Tree

- `## master...origin/master` — appears in sync now (prev session had 2 ahead)
- Modified: `docs/handoff.md` (this file)
- Untracked:
  - `docs/superpowers/plans/2026-03-19-dark-light-theme.md`
  - `docs/superpowers/specs/`

## 3. Branch / PR

- Branch: `master`
- No PR abierto
- CI: N/A

## 4. Dev Server

- Unknown — may need restart: `cd socialpro && npm run dev`

## 5. Tests

- No tests run this session (brainstorming only, no code changes)
- Last known: tsc, lint, build all passing

## 6. Database

- No migrations pending
- No schema changes

## 7. SEO/GEO Audit Summary (key findings)

**What exists (7/10 baseline):**
- Root metadata + OG/Twitter in layout.tsx
- Dynamic generateMetadata on /talentos/[slug], /casos/[slug], /blog/[slug]
- Dynamic sitemap.ts with DB-driven slugs
- robots.ts (allow /, disallow /admin/, /api/)
- JSON-LD: Organization, WebSite, LocalBusiness (root), Person (talents), Article (cases), BlogPosting (blog)
- RSS feed at /blog/feed.xml
- next/image with alt text throughout

**Bugs found:**
- Case studies have hardcoded `datePublished: '2025-01-01'` in JSON-LD (casos/[slug]/page.tsx:67)
- Sitemap includes anchor links (/#talentos, /#servicios) — engines won't crawl these
- Sitemap lastModified always `new Date()` instead of actual DB timestamps

**Missing for SEO:**
- No breadcrumb JSON-LD on dynamic pages
- No FAQ schema (FaqSection component exists, no structured data)
- Empty next.config.ts (no security headers, no redirects, no image config)
- No canonical URLs explicit (metadataBase handles implicitly)
- /marcas/ not disallowed in robots (auth-gated portal)
- No metadata on /admin/login or /marcas/login

**Missing for GEO:**
- No GEO strategy at all — no entity-defining content, no authoritative Q&A, no citation-friendly structure
- No "About" or "Methodology" page with clear entity statements for AI engines
- Blog lacks topical clustering / internal linking strategy
- No FAQ content optimized for AI snippet extraction

## 8. Next Steps

1. **Resume brainstorming** — pick up from GSC question, then ~2-3 more questions
2. **Remaining questions to explore:**
   - Domain/GSC status
   - Keyword targets (what queries should SocialPro rank for?)
   - Content strategy (new pages vs optimize existing?)
   - Technical SEO budget (how much refactoring is acceptable?)
3. **After brainstorming:** write spec → plan → implement
4. **Still pending from prior sessions:**
   - Change admin password from `admin12345`
   - Add KEVO/LUNA photos
   - Dark/light theme plan exists but unexecuted

## 9. Risks / Gotchas

- Admin password still `admin12345` — change before production
- `docs/superpowers/plans/2026-03-19-dark-light-theme.md` untracked — prior plan, not executed
- Migration 0003 SQL has CREATE TABLE for auth tables that already exist — don't re-run without editing
- Comparison page loads all talents client-side — ok at 15, watch at scale
