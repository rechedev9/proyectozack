# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Protocol
- Docs: run `scripts/docs-list` before deep work; honor `read_when` hints.
- Commit helper: `scripts/committer "type(scope): message" file1 file2`.
- Keep files <500 LOC; split when exceeded.

## Session Continuity
- `/handoff`: read `docs/handoff.md` — dump state for next session.
- `/pickup`: read `docs/pickup.md` — rehydrate context when starting.

## Running the Project

This is a standalone HTML file — no build process or dependencies needed.

```bash
# Serve locally
python3 -m http.server 8000
# Then open http://localhost:8000
```

The main file is `socialpro-final (10) (1).html` (note the spaces in the filename — quote it or escape when using shell commands).

## Architecture

**Single-file SPA** (~1,231 lines) for a gaming/esports talent agency (SocialPro). All CSS, JavaScript, HTML, and data (including base64-encoded images) live in one file.

**File layout (by line range):**
- `1–35`: HTML head, font imports, CSS custom properties (design tokens)
- `36–500`: Complete CSS (all components, animations, responsive layout)
- `501–913`: HTML markup — sections and modal dialogs
- `914–1231`: JavaScript — embedded data arrays + all UI functions

## Data Structures (in JavaScript section)

All data is hardcoded as JS variables:
- `TALENTS` — 13 creator profiles (name, metrics, social handles, bio, Base64 photo)
- `BRAND_LOGOS`, `COLLAB_PHOTOS`, `TEAM_PHOTOS`, `TALENT_PHOTOS` — Base64-encoded images
- `TESTIMONIALS`, `COLLABS`, `TEAM`, `PF_ITEMS`, `CASE_DATA` — supporting content

## Key JavaScript Functions

| Function | Purpose |
|---|---|
| `renderTalents(filter)` | Renders talent grid; accepts category string |
| `filterT(f, el)` | Sets active filter and re-renders talent grid |
| `openModal(idx)` | Opens talent detail modal by index into TALENTS |
| `openCaseModal(key)` | Opens case study modal by key into CASE_DATA |
| `renderPortfolio(filter)` | Renders portfolio items with tab filtering |
| `setAud(id, el)` | Switches between service tabs |
| `gs(c1, c2)` | Returns CSS gradient string |
| `getSVG(type, color)` | Returns SVG icon markup string |

## CSS Design System

Colors are defined as CSS variables at `:root`. Primary palette: orange `#f5632a` → pink `#e03070` → purple `#8b3aad` → blue `#5b9bd5`.

Component class naming: `.tc` (talent card), `.sc` (service card), `.cc` (case card), `.tst` (testimonial), `.mq` (marquee), `.btn-*` (button variants), `.modal-*` (modal parts).

Layout uses CSS Grid with `auto-fill`/`minmax` and `clamp()` for fluid type — no explicit media queries.
