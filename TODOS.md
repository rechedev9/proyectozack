# TODOS

## P1 — Security

### Change admin password before production launch
- **What:** Change `admin@socialpro.es` password from `admin12345` to a strong password.
- **Why:** Admin panel has full CRUD access to all data. Weak password is a trivial attack vector.
- **Context:** Account created via `scripts/create-admin.ts`. Better Auth stores bcrypt hash in the `account` table. Use Better Auth's password reset flow or update directly via script.
- **Effort:** S
- **Depends on:** Nothing
- **Added:** 2026-03-19

---

## P3 — Growth F (LATAM) Deferred Items

### LATAM gaming blog content
- **What:** Write/publish blog content about the LATAM gaming ecosystem.
- **Why:** Supports LATAM expansion strategy. Blog infrastructure (Growth C) is complete.
- **Context:** roadmap.md line 373. Blog at `/blog` with 3 seed articles. Need LATAM-focused content.
- **Effort:** S (CC can draft articles)
- **Depends on:** Nothing (blog infra complete)
- **Added:** 2026-03-19

### Evaluate lightweight i18n
- **What:** Evaluate if Spanish neutral default + regional currency/date localization is needed.
- **Why:** KEVO (Argentina) and LUNA (Mexico) are in the roster. Regional formatting may matter for brand proposals.
- **Context:** roadmap.md line 374. Only relevant if regional URL variants are created.
- **Effort:** S (research only)
- **Depends on:** Nothing
- **Added:** 2026-03-19

### Add hreflang meta tags
- **What:** Add `hreflang` meta tags if regional URL variants are created.
- **Why:** SEO signal for Spanish content targeting different regions.
- **Context:** roadmap.md line 375. Only needed if i18n evaluation (above) leads to regional URLs.
- **Effort:** S
- **Depends on:** i18n evaluation above
- **Added:** 2026-03-19
