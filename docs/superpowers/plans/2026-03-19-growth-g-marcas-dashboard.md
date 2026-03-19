# Growth G: Marcas Dashboard MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a brand portal at `/marcas` where gaming brands can browse talent, view campaign history, compare talents side-by-side, and submit proposals — plus an admin page for managing brand accounts via invite-only flow.

**Architecture:** Extends existing Better Auth with simple text `role` column ('admin' | 'brand'). New `brand_campaigns` join table links brands to talents via case studies. Shared `requireRole()` guard protects both admin and brand portals. Brand portal reuses existing `TalentCard` component and extends `getTalents()` query with multi-dimension filters.

**Tech Stack:** Next.js 16, Better Auth, Drizzle ORM, Neon Postgres, Resend, Zod v4, shadcn/ui, Tailwind v4

---

## File Structure

### New files
```
src/lib/auth-guard.ts              — Shared requireRole() util
src/db/schema/brands.ts            — brand_campaigns + talent_proposals tables
src/lib/queries/brands.ts          — Brand portal queries (filtered talents, campaigns, proposals)
src/lib/schemas/proposal.ts        — Zod schema for proposal form
src/app/marcas/login/page.tsx      — Brand login page
src/app/marcas/(portal)/layout.tsx — Brand portal layout with sidebar + role guard
src/app/marcas/(portal)/page.tsx   — Brand dashboard
src/app/marcas/(portal)/talentos/page.tsx        — Talent catalog with filters
src/app/marcas/(portal)/talentos/[slug]/page.tsx — Talent ficha detail
src/app/marcas/(portal)/comparar/page.tsx        — Talent comparison view
src/app/marcas/(portal)/propuestas/page.tsx      — My proposals list
src/app/api/marcas/proposals/route.ts            — POST proposal API
src/app/admin/(dashboard)/brands/page.tsx        — Admin brand management
src/app/admin/(dashboard)/brands/actions.ts      — Admin brand server actions
src/app/admin/(dashboard)/brands/invite-form.tsx — Client form with useActionState
src/components/brand/FilterChips.tsx             — Multi-dimension filter chips
src/components/brand/BrandTalentCard.tsx         — Link-based talent card for brand catalog
src/components/brand/ProposalModal.tsx           — Proposal form modal
src/components/brand/ComparisonView.tsx          — Side-by-side talent comparison
src/components/brand/EmptyState.tsx              — Reusable empty state component
src/components/layout/PortalSidebar.tsx          — Shared sidebar (admin + brand)
src/app/marcas/(portal)/talentos/[slug]/client.tsx — Client wrapper for proposal CTA
scripts/backfill-case-creators.ts               — One-time FK backfill script
```

### Modified files
```
src/db/schema/index.ts             — Add brands.ts exports
src/db/schema/cases.ts             — Add talentId FK to caseCreators
src/lib/queries/talents.ts         — Extend getTalents() with filters object
src/lib/email.ts                   — Add sendBrandInviteEmail()
src/types/index.ts                 — Add brand-related types
src/app/admin/(dashboard)/layout.tsx — Refactor to use PortalSidebar + requireRole
```

---

## Task 1: Database Schema — New Tables + FK Fix

**Files:**
- Create: `src/db/schema/brands.ts`
- Modify: `src/db/schema/cases.ts`
- Modify: `src/db/schema/index.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create `src/db/schema/brands.ts`**

```typescript
import { pgTable, serial, integer, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';
import { caseStudies } from './cases';
import { user } from './auth';

export const proposalStatusEnum = pgEnum('proposal_status', [
  'pendiente',
  'en_revision',
  'aceptada',
  'rechazada',
]);

export const brandCampaigns = pgTable('brand_campaigns', {
  id: serial('id').primaryKey(),
  brandUserId: text('brand_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  caseId: integer('case_id').references(() => caseStudies.id, { onDelete: 'set null' }),
  role: varchar('role', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const talentProposals = pgTable('talent_proposals', {
  id: serial('id').primaryKey(),
  brandUserId: text('brand_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  campaignType: varchar('campaign_type', { length: 50 }).notNull(),
  budgetRange: varchar('budget_range', { length: 50 }).notNull(),
  timeline: varchar('timeline', { length: 50 }).notNull(),
  message: text('message').notNull(),
  status: proposalStatusEnum('status').notNull().default('pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const brandCampaignsRelations = relations(brandCampaigns, ({ one }) => ({
  brandUser: one(user, { fields: [brandCampaigns.brandUserId], references: [user.id] }),
  talent: one(talents, { fields: [brandCampaigns.talentId], references: [talents.id] }),
  caseStudy: one(caseStudies, { fields: [brandCampaigns.caseId], references: [caseStudies.id] }),
}));

export const talentProposalsRelations = relations(talentProposals, ({ one }) => ({
  brandUser: one(user, { fields: [talentProposals.brandUserId], references: [user.id] }),
  talent: one(talents, { fields: [talentProposals.talentId], references: [talents.id] }),
}));
```

- [ ] **Step 2: Add `talentId` FK to `case_creators` in `src/db/schema/cases.ts`**

First, add the import at the top of the file:
```typescript
import { talents } from './talents';
```

Then add after `creatorName` field in the `caseCreators` table:
```typescript
talentId: integer('talent_id').references(() => talents.id, { onDelete: 'set null' }),
```
(Nullable — existing rows don't have it yet.)

- [ ] **Step 3: Export from `src/db/schema/index.ts`**

Add line:
```typescript
export * from './brands';
```

- [ ] **Step 4: Add types to `src/types/index.ts`**

Add to the **existing** import from `@/db/schema` (merge, don't create a second import):
```typescript
// Add these to the existing import block at the top:
  brandCampaigns,
  talentProposals,
```

Then add the type exports after the existing ones:
```typescript
export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
export type TalentProposal = InferSelectModel<typeof talentProposals>;

export type BrandCampaignWithRelations = BrandCampaign & {
  talent: Talent;
  caseStudy: CaseStudy | null;
};

export type TalentProposalWithTalent = TalentProposal & {
  talent: Talent;
};
```

- [ ] **Step 5: Generate and apply migration**

Run: `npx drizzle-kit generate` then `npx drizzle-kit migrate`

- [ ] **Step 6: Verify with `npx tsc --noEmit`**

- [ ] **Step 7: Commit**

`scripts/committer "feat(schema): add brand_campaigns and talent_proposals tables" src/db/schema/brands.ts src/db/schema/cases.ts src/db/schema/index.ts src/types/index.ts drizzle/`

---

## Task 2: Backfill `case_creators.talent_id`

**Files:**
- Create: `scripts/backfill-case-creators.ts`

- [ ] **Step 1: Create backfill script**

```typescript
import { db } from '../src/lib/db';
import { caseCreators, talents } from '../src/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function backfill(): Promise<void> {
  const allCreators = await db.select().from(caseCreators).where(isNull(caseCreators.talentId));
  const allTalents = await db.select({ id: talents.id, name: talents.name }).from(talents);

  const nameToId = new Map(allTalents.map((t) => [t.name.toUpperCase(), t.id]));

  let updated = 0;
  for (const creator of allCreators) {
    const talentId = nameToId.get(creator.creatorName.toUpperCase());
    if (talentId) {
      await db.update(caseCreators).set({ talentId }).where(eq(caseCreators.id, creator.id));
      updated++;
      console.log(`  Linked "${creator.creatorName}" → talent_id=${talentId}`);
    } else {
      console.log(`  No match for "${creator.creatorName}"`);
    }
  }
  console.log(`Done. Updated ${updated}/${allCreators.length} rows.`);
  process.exit(0);
}

backfill();
```

- [ ] **Step 2: Run backfill**

Run: `npx tsx scripts/backfill-case-creators.ts`

- [ ] **Step 3: Verify via Neon MCP**

SQL: `SELECT id, creator_name, talent_id FROM case_creators;`

- [ ] **Step 4: Commit**

`scripts/committer "fix(data): backfill case_creators.talent_id FK" scripts/backfill-case-creators.ts`

---

## Task 3: Auth Guard + Role System

**Files:**
- Create: `src/lib/auth-guard.ts`
- Modify: `src/app/admin/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `src/lib/auth-guard.ts`**

```typescript
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

type Role = 'admin' | 'brand';

interface SessionWithRole {
  user: {
    id: string;
    email: string;
    name: string;
    role: string | null;
  };
}

export async function requireRole(role: Role, loginPath: string): Promise<SessionWithRole> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(loginPath);
  }

  const userRole = (session.user as { role?: string | null }).role;

  if (!userRole || userRole !== role) {
    // Wrong role or null role — redirect to their correct portal or login
    if (userRole === 'admin') redirect('/admin');
    if (userRole === 'brand') redirect('/marcas');
    redirect(loginPath);
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole,
    },
  };
}
```

- [ ] **Step 2: Refactor admin layout to use `requireRole`**

Replace the session check in `src/app/admin/(dashboard)/layout.tsx`:
```typescript
// Before:
const session = await auth.api.getSession({ headers: await headers() });
if (!session) { redirect('/admin/login'); }

// After:
const session = await requireRole('admin', '/admin/login');
```

Remove the direct `auth` and `headers` imports (they come via `requireRole` now).

- [ ] **Step 3: Verify admin still works**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

`scripts/committer "refactor(auth): extract shared requireRole guard" src/lib/auth-guard.ts src/app/admin/(dashboard)/layout.tsx`

---

## Task 4: Shared Portal Sidebar

**Files:**
- Create: `src/components/layout/PortalSidebar.tsx`
- Modify: `src/app/admin/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `src/components/layout/PortalSidebar.tsx`**

```typescript
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
}

interface PortalSidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  userEmail: string;
  logoutHref: string;
}

export function PortalSidebar({ title, subtitle, navItems, userEmail, logoutHref }: PortalSidebarProps) {
  return (
    <nav className="w-56 bg-sp-black text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <span className="font-display text-xl font-black uppercase gradient-text">{title}</span>
        <p className="text-xs text-sp-muted2 mt-1">{subtitle}</p>
      </div>
      <div className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-sp-muted2 hover:text-white hover:bg-white/10 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-sp-muted truncate">{userEmail}</p>
        <Link
          href={logoutHref}
          className="mt-2 block text-xs text-sp-muted2 hover:text-white transition-colors"
        >
          Cerrar sesion
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Refactor admin layout to use `PortalSidebar`**

Replace the inline `<nav>` in admin layout with:
```typescript
<PortalSidebar
  title="SocialPro"
  subtitle="Admin Panel"
  navItems={[
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/talents', label: 'Talentos' },
    { href: '/admin/cases', label: 'Casos' },
    { href: '/admin/testimonials', label: 'Testimonios' },
    { href: '/admin/brands', label: 'Marcas' },
  ]}
  userEmail={session.user.email}
  logoutHref="/api/auth/sign-out"
/>
```

- [ ] **Step 3: Verify `npx tsc --noEmit` and `npm run build`**

- [ ] **Step 4: Commit**

`scripts/committer "refactor(ui): extract shared PortalSidebar component" src/components/layout/PortalSidebar.tsx src/app/admin/(dashboard)/layout.tsx`

---

## Task 5: Extend `getTalents()` with Multi-Dimension Filters

**Files:**
- Modify: `src/lib/queries/talents.ts`

- [ ] **Step 1: Add filter interface and extend `getTalents()`**

Replace the existing function signature:
```typescript
import { eq, and, type SQL } from 'drizzle-orm';

export interface TalentFilters {
  platform?: 'twitch' | 'youtube';
  tags?: string[];
  followersMin?: number;
  followersMax?: number;
  region?: string;
  status?: 'active' | 'available';
}

export async function getTalents(filters?: TalentFilters): Promise<TalentWithRelations[]> {
  const conditions: SQL[] = [];

  if (filters?.platform) {
    conditions.push(eq(talents.platform, filters.platform));
  }
  if (filters?.status) {
    conditions.push(eq(talents.status, filters.status));
  }

  const rows = await db.query.talents.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      tags: true,
      stats: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      socials: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });

  // Client-side filter for tags (requires join that Drizzle relational queries don't support inline)
  let filtered = rows;
  if (filters?.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((talent) =>
      talent.tags.some((t) => lowerTags.includes(t.tag.toLowerCase())),
    );
  }

  return filtered;
}
```

- [ ] **Step 2: Update call sites**

The existing call `getTalents()` in `src/app/page.tsx` passes no args — still works. Verify with `npx tsc --noEmit`.

- [ ] **Step 3: Commit**

`scripts/committer "feat(queries): extend getTalents with multi-dimension filters" src/lib/queries/talents.ts`

---

## Task 6: Brand Portal Queries

**Files:**
- Create: `src/lib/queries/brands.ts`

- [ ] **Step 1: Create brand portal query functions**

```typescript
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brandCampaigns, talentProposals } from '@/db/schema';
import type { BrandCampaignWithRelations, TalentProposalWithTalent } from '@/types';

export async function getBrandCampaigns(brandUserId: string): Promise<BrandCampaignWithRelations[]> {
  const rows = await db.query.brandCampaigns.findMany({
    where: eq(brandCampaigns.brandUserId, brandUserId),
    with: {
      talent: true,
      caseStudy: true,
    },
    orderBy: [desc(brandCampaigns.createdAt)],
  });
  return rows as BrandCampaignWithRelations[];
}

export async function getBrandProposals(brandUserId: string): Promise<TalentProposalWithTalent[]> {
  const rows = await db.query.talentProposals.findMany({
    where: eq(talentProposals.brandUserId, brandUserId),
    with: {
      talent: true,
    },
    orderBy: [desc(talentProposals.createdAt)],
  });
  return rows as TalentProposalWithTalent[];
}

export async function getTalentCampaignsForBrand(
  brandUserId: string,
  talentId: number,
): Promise<BrandCampaignWithRelations[]> {
  const rows = await db.query.brandCampaigns.findMany({
    where: eq(brandCampaigns.brandUserId, brandUserId),
    with: {
      talent: true,
      caseStudy: true,
    },
    orderBy: [desc(brandCampaigns.createdAt)],
  });
  return (rows as BrandCampaignWithRelations[]).filter((c) => c.talentId === talentId);
}
```

- [ ] **Step 2: Verify `npx tsc --noEmit`**

- [ ] **Step 3: Commit**

`scripts/committer "feat(queries): add brand portal query functions" src/lib/queries/brands.ts`

---

## Task 7: Email — Brand Invite

**Files:**
- Modify: `src/lib/email.ts`

- [ ] **Step 1: Add `sendBrandInviteEmail()` function**

```typescript
export async function sendBrandInviteEmail(payload: {
  brandEmail: string;
  brandName: string;
  resetUrl: string;
}): Promise<void> {
  await resend.emails.send({
    from: 'SocialPro <noreply@socialpro.es>',
    to: payload.brandEmail,
    subject: 'Bienvenido al Portal de Marcas — SocialPro',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;">
          Portal de Marcas
        </h2>
        <p>Hola <strong>${payload.brandName}</strong>,</p>
        <p>Has sido invitado al Portal de Marcas de SocialPro. Accede a nuestro roster de talentos, revisa metricas de campanas y envia propuestas directamente.</p>
        <p>
          <a href="${payload.resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%);color:#fff;text-decoration:none;border-radius:9999px;font-weight:bold;">
            Establecer contrasena
          </a>
        </p>
        <p style="color: #6b6864; font-size: 13px;">Si no esperabas este email, puedes ignorarlo.</p>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Verify `npx tsc --noEmit`**

- [ ] **Step 3: Commit**

`scripts/committer "feat(email): add brand invite email template" src/lib/email.ts`

---

## Task 8: Brand Login Page

**Files:**
- Create: `src/app/marcas/login/page.tsx`

- [ ] **Step 1: Create brand login page**

Copy admin login page pattern but with brand-specific copy:
```typescript
'use client';

import { useState } from 'react';

export default function BrandLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = '/marcas';
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message ?? 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sp-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-black uppercase gradient-text">SocialPro</span>
          <p className="text-sm text-sp-muted mt-1">Portal de Marcas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sp-dark mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm outline-none focus:border-sp-orange transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-sp-dark mb-1.5">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm outline-none focus:border-sp-orange transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-white text-sm bg-sp-grad disabled:opacity-60"
          >
            {loading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify `npx tsc --noEmit`**

- [ ] **Step 3: Commit**

`scripts/committer "feat(marcas): add brand login page" src/app/marcas/login/page.tsx`

---

## Task 9: Brand Portal Layout + Dashboard

**Files:**
- Create: `src/app/marcas/(portal)/layout.tsx`
- Create: `src/app/marcas/(portal)/page.tsx`
- Create: `src/components/brand/EmptyState.tsx`

- [ ] **Step 1: Create `EmptyState` component**

```typescript
import Link from 'next/link';

interface EmptyStateProps {
  message: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-sp-grad opacity-20 mb-4" />
      <p className="text-sp-muted text-sm mb-4">{message}</p>
      <Link
        href={actionHref}
        className="inline-block px-6 py-2.5 rounded-full text-sm font-bold text-white bg-sp-grad hover:opacity-90 transition-opacity"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create brand portal layout**

```typescript
import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth-guard';
import { PortalSidebar } from '@/components/layout/PortalSidebar';

interface BrandPortalLayoutProps {
  children: ReactNode;
}

export default async function BrandPortalLayout({ children }: BrandPortalLayoutProps) {
  const session = await requireRole('brand', '/marcas/login');

  return (
    <div className="min-h-screen bg-sp-off flex">
      <PortalSidebar
        title="SocialPro"
        subtitle="Portal de Marcas"
        navItems={[
          { href: '/marcas', label: 'Dashboard' },
          { href: '/marcas/talentos', label: 'Talentos' },
          { href: '/marcas/propuestas', label: 'Propuestas' },
        ]}
        userEmail={session.user.email}
        logoutHref="/api/auth/sign-out"
      />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create brand dashboard page**

```typescript
import { requireRole } from '@/lib/auth-guard';
import { getBrandCampaigns, getBrandProposals } from '@/lib/queries/brands';
import { EmptyState } from '@/components/brand/EmptyState';
import Link from 'next/link';

export default async function BrandDashboardPage() {
  const session = await requireRole('brand', '/marcas/login');
  const [campaigns, proposals] = await Promise.all([
    getBrandCampaigns(session.user.id),
    getBrandProposals(session.user.id),
  ]);

  const pendingProposals = proposals.filter((p) => p.status === 'pendiente');

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-2">
        Hola, {session.user.name}
      </h1>
      <p className="text-sm text-sp-muted mb-8">Bienvenido al Portal de Marcas de SocialPro</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Campanas', value: campaigns.length },
          { label: 'Talentos', value: new Set(campaigns.map((c) => c.talentId)).size },
          { label: 'Propuestas pendientes', value: pendingProposals.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-white border border-sp-border p-6">
            <div className="font-display text-4xl font-black gradient-text">{value}</div>
            <div className="text-sm text-sp-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent campaigns */}
      <h2 className="font-display text-xl font-black uppercase text-sp-dark mb-4">Campanas recientes</h2>
      {campaigns.length === 0 ? (
        <EmptyState
          message="Aun no tienes campanas. Explora nuestro roster de talentos."
          actionLabel="Explorar talentos"
          actionHref="/marcas/talentos"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.slice(0, 4).map((campaign) => (
            <div key={campaign.id} className="rounded-2xl bg-white border border-sp-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-display text-lg font-black uppercase text-sp-dark">
                  {campaign.talent.name}
                </div>
              </div>
              {campaign.caseStudy && (
                <p className="text-sm text-sp-muted">{campaign.caseStudy.title}</p>
              )}
              <p className="text-xs text-sp-muted2 mt-2">
                {new Date(campaign.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick action */}
      <div className="mt-8">
        <Link
          href="/marcas/talentos"
          className="inline-block px-8 py-3 rounded-full text-sm font-bold text-white bg-sp-grad hover:opacity-90 transition-opacity"
        >
          Explorar talentos
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify `npx tsc --noEmit`**

- [ ] **Step 5: Commit**

`scripts/committer "feat(marcas): add brand portal layout and dashboard" src/components/brand/EmptyState.tsx src/app/marcas/(portal)/layout.tsx src/app/marcas/(portal)/page.tsx`

---

## Task 10: Talent Catalog with Filters

**Files:**
- Create: `src/components/brand/FilterChips.tsx`
- Create: `src/components/brand/BrandTalentCard.tsx`
- Create: `src/app/marcas/(portal)/talentos/page.tsx`

- [ ] **Step 1: Create FilterChips component**

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  paramName: string;
  options: FilterOption[];
}

export function FilterChips({ paramName, options }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName);

  const toggle = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (current === value) {
        params.delete(paramName);
      } else {
        params.set(paramName, value);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, paramName, current],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            current === value
              ? 'bg-sp-grad text-white'
              : 'bg-white border border-sp-border text-sp-dark hover:bg-sp-off'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create BrandTalentCard** (wraps TalentCard as a link, no nested interactive elements)

```typescript
import Link from 'next/link';
import Image from 'next/image';
import type { TalentWithRelations } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { gradientStyle } from '@/lib/gradient';

interface BrandTalentCardProps {
  talent: TalentWithRelations;
}

export function BrandTalentCard({ talent }: BrandTalentCardProps) {
  const grad = gradientStyle(talent.gradientC1, talent.gradientC2);

  return (
    <Link
      href={`/marcas/talentos/${talent.slug}`}
      className="group block rounded-2xl overflow-hidden border border-sp-border bg-white hover:shadow-xl transition-all hover:-translate-y-0.5"
    >
      <div className="relative h-52 overflow-hidden" style={{ background: grad }}>
        {talent.photoUrl ? (
          <Image
            src={talent.photoUrl}
            alt={talent.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl font-black text-white/80">{talent.initials}</span>
          </div>
        )}
        <StatusBadge status={talent.status} className="absolute top-3 right-3" />
      </div>
      <div className="p-4">
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-sp-dark leading-none">
          {talent.name}
        </h3>
        <p className="text-xs text-sp-muted mt-1 mb-3">{talent.role}</p>
        <div className="grid grid-cols-3 gap-1 mb-3">
          {talent.stats.slice(0, 3).map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-xs font-bold text-sp-dark">{stat.value}</div>
              <div className="text-[10px] text-sp-muted leading-tight">{stat.label.split(' ')[0]}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {talent.socials.slice(0, 4).map((s) => (
            <span
              key={s.id}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${s.hexColor}20` }}
            >
              <SocialIcon type={s.platform} color={s.hexColor} size={12} />
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create talent catalog page**

```typescript
import { getTalents } from '@/lib/queries/talents';
import type { TalentFilters } from '@/lib/queries/talents';
import { FilterChips } from '@/components/brand/FilterChips';
import { EmptyState } from '@/components/brand/EmptyState';
import { BrandTalentCard } from '@/components/brand/BrandTalentCard';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{ platform?: string; tag?: string }>;
}

export default async function BrandTalentCatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: TalentFilters = {};
  if (params.platform === 'twitch' || params.platform === 'youtube') {
    filters.platform = params.platform;
  }
  if (params.tag) {
    filters.tags = [params.tag];
  }

  const talents = await getTalents(filters);

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-6">Talentos</h1>

      {/* Filters */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-sp-muted uppercase tracking-wider">Plataforma</span>
          <Suspense>
            <FilterChips
              paramName="platform"
              options={[
                { label: 'Twitch', value: 'twitch' },
                { label: 'YouTube', value: 'youtube' },
              ]}
            />
          </Suspense>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-sp-muted uppercase tracking-wider">Nicho</span>
          <Suspense>
            <FilterChips
              paramName="tag"
              options={[
                { label: 'CS2', value: 'CS2' },
                { label: 'Valorant', value: 'Valorant' },
                { label: 'LatAm', value: 'LatAm' },
                { label: 'Lifestyle', value: 'Lifestyle' },
              ]}
            />
          </Suspense>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-sp-muted mb-4">{talents.length} talentos encontrados</p>

      {talents.length === 0 ? (
        <EmptyState
          message="Ningun talento coincide con tus filtros."
          actionLabel="Limpiar filtros"
          actionHref="/marcas/talentos"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {talents.map((talent) => (
            <BrandTalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify `npx tsc --noEmit`**

- [ ] **Step 4: Commit**

`scripts/committer "feat(marcas): add talent catalog with filter chips" src/components/brand/FilterChips.tsx src/components/brand/BrandTalentCard.tsx src/app/marcas/(portal)/talentos/page.tsx`

---

## Task 11: Talent Ficha + Proposal Modal

**Files:**
- Create: `src/lib/schemas/proposal.ts`
- Create: `src/components/brand/ProposalModal.tsx`
- Create: `src/app/marcas/(portal)/talentos/[slug]/page.tsx`
- Create: `src/app/api/marcas/proposals/route.ts`

- [ ] **Step 1: Create Zod schema for proposals**

```typescript
import { z } from 'zod';

export const proposalSchema = z.object({
  talentId: z.number().int().positive(),
  campaignType: z.enum(['Streaming', 'YouTube', 'Social', 'Evento', 'Otro']),
  budgetRange: z.enum(['<5K', '5-10K', '10-25K', '25K+', 'A definir']),
  timeline: z.enum(['1 semana', '2 semanas', '1 mes', '2+ meses', 'Flexible']),
  message: z.string().min(10).max(1000),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
```

- [ ] **Step 2: Create API route `src/app/api/marcas/proposals/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { talentProposals, talents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { proposalSchema } from '@/lib/schemas/proposal';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string | null }).role;
  if (userRole !== 'brand') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = proposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  // Verify talent exists
  const talent = await db.select({ id: talents.id }).from(talents).where(eq(talents.id, data.talentId));
  if (talent.length === 0) {
    return NextResponse.json({ error: 'Talent not found' }, { status: 400 });
  }

  // Check for duplicate proposal
  const existing = await db
    .select({ id: talentProposals.id })
    .from(talentProposals)
    .where(
      and(
        eq(talentProposals.brandUserId, session.user.id),
        eq(talentProposals.talentId, data.talentId),
        eq(talentProposals.status, 'pendiente'),
      ),
    );
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Ya tienes una propuesta pendiente para este talento' }, { status: 409 });
  }

  await db.insert(talentProposals).values({
    brandUserId: session.user.id,
    talentId: data.talentId,
    campaignType: data.campaignType,
    budgetRange: data.budgetRange,
    timeline: data.timeline,
    message: data.message,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 3: Create ProposalModal component**

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ProposalInput } from '@/lib/schemas/proposal';

interface ProposalModalProps {
  talentId: number;
  talentName: string;
  onClose: () => void;
}

export function ProposalModal({ talentId, talentName, onClose }: ProposalModalProps) {
  const [form, setForm] = useState({
    campaignType: '',
    budgetRange: '',
    timeline: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/marcas/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talentId,
          campaignType: form.campaignType,
          budgetRange: form.budgetRange,
          timeline: form.timeline,
          message: form.message,
        } satisfies Omit<ProposalInput, never>),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onCloseRef.current(), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Error al enviar propuesta');
      }
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = 'w-full rounded-xl border border-sp-border px-4 py-3 text-sm outline-none focus:border-sp-orange transition-colors bg-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Propuesta para ${talentName}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-black uppercase text-sp-dark">Enviar propuesta</h2>
            <p className="text-sm text-sp-muted">Para {talentName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-sp-off flex items-center justify-center text-sp-muted hover:text-sp-dark" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="font-display text-2xl font-black gradient-text mb-2">Propuesta enviada!</div>
            <p className="text-sm text-sp-muted">Te contactaremos pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Tipo de campana</label>
              <select value={form.campaignType} onChange={(e) => setForm({ ...form, campaignType: e.target.value })} required className={selectClass}>
                <option value="">Seleccionar...</option>
                {['Streaming', 'YouTube', 'Social', 'Evento', 'Otro'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Presupuesto</label>
              <select value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} required className={selectClass}>
                <option value="">Seleccionar...</option>
                {['<5K', '5-10K', '10-25K', '25K+', 'A definir'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Timeline</label>
              <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} required className={selectClass}>
                <option value="">Seleccionar...</option>
                {['1 semana', '2 semanas', '1 mes', '2+ meses', 'Flexible'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Mensaje</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                className={selectClass}
                placeholder="Describe tu campana, objetivos y que buscas en el talento..."
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-bold text-white text-sm bg-sp-grad disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar propuesta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create talent ficha page**

```typescript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { requireRole } from '@/lib/auth-guard';
import { getTalentBySlug } from '@/lib/queries/talents';
import { getTalentCampaignsForBrand } from '@/lib/queries/brands';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { gradientStyle } from '@/lib/gradient';
import { EmptyState } from '@/components/brand/EmptyState';
import { BrandTalentFichaClient } from './client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandTalentFichaPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await requireRole('brand', '/marcas/login');
  const talent = await getTalentBySlug(slug);
  if (!talent) notFound();

  const campaigns = await getTalentCampaignsForBrand(session.user.id, talent.id);
  const grad = gradientStyle(talent.gradientC1, talent.gradientC2);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 rounded-2xl overflow-hidden mb-8" style={{ background: grad }}>
        {talent.photoUrl ? (
          <Image src={talent.photoUrl} alt={talent.name} fill className="object-cover object-top" sizes="100vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-8xl font-black text-white/80">{talent.initials}</span>
          </div>
        )}
        <StatusBadge status={talent.status} className="absolute top-4 right-4" />
      </div>

      {/* Name + role */}
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark">{talent.name}</h1>
      <p className="text-sm text-sp-muted mb-6">{talent.role}</p>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        {talent.stats.map((stat) => (
          <div key={stat.id}>
            <div className="font-display text-2xl font-black gradient-text">{stat.value}</div>
            <div className="text-xs text-sp-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bio + tags */}
      <p className="text-sm text-sp-dark/80 leading-relaxed mb-4">{talent.bio}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {talent.tags.map((t) => (
          <span key={t.id} className="text-xs px-3 py-1 rounded-full bg-sp-off text-sp-muted border border-sp-border">
            {t.tag}
          </span>
        ))}
      </div>

      {/* Campaign history with this brand */}
      <h2 className="font-display text-xl font-black uppercase text-sp-dark mb-4">Historial de campanas</h2>
      {campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
          <p className="text-sm text-sp-muted">Aun no has trabajado con este talento.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-sp-border p-5">
              <p className="font-bold text-sp-dark">{c.caseStudy?.title ?? 'Campana'}</p>
              <p className="text-xs text-sp-muted2">{new Date(c.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Socials */}
      <div className="flex items-center gap-3 mb-8">
        {talent.socials.map((s) => (
          <a
            key={s.id}
            href={s.profileUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: `${s.hexColor}20` }}
            aria-label={s.platform}
          >
            <SocialIcon type={s.platform} color={s.hexColor} size={14} />
          </a>
        ))}
      </div>

      {/* CTA — Client component for modal */}
      <BrandTalentFichaClient talentId={talent.id} talentName={talent.name} />
    </div>
  );
}
```

- [ ] **Step 5: Create client wrapper for proposal CTA**

Create `src/app/marcas/(portal)/talentos/[slug]/client.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { ProposalModal } from '@/components/brand/ProposalModal';

interface Props {
  talentId: number;
  talentName: string;
}

export function BrandTalentFichaClient({ talentId, talentName }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-8 py-3 rounded-full font-bold text-white text-sm bg-sp-grad hover:opacity-90 transition-opacity"
      >
        Enviar propuesta
      </button>
      {showModal && (
        <ProposalModal talentId={talentId} talentName={talentName} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
```

- [ ] **Step 6: Verify `npx tsc --noEmit`**

- [ ] **Step 7: Commit**

`scripts/committer "feat(marcas): add talent ficha with proposal modal and API" src/lib/schemas/proposal.ts src/app/api/marcas/proposals/route.ts src/components/brand/ProposalModal.tsx src/app/marcas/(portal)/talentos/[slug]/page.tsx src/app/marcas/(portal)/talentos/[slug]/client.tsx`

---

## Task 12: Proposals List Page

**Files:**
- Create: `src/app/marcas/(portal)/propuestas/page.tsx`

- [ ] **Step 1: Create proposals list page**

```typescript
import { requireRole } from '@/lib/auth-guard';
import { getBrandProposals } from '@/lib/queries/brands';
import { EmptyState } from '@/components/brand/EmptyState';
import Image from 'next/image';
import { gradientStyle } from '@/lib/gradient';

const statusColors: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  en_revision: 'bg-blue-100 text-blue-700',
  aceptada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-600',
};

export default async function BrandProposalsPage() {
  const session = await requireRole('brand', '/marcas/login');
  const proposals = await getBrandProposals(session.user.id);

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-6">Mis propuestas</h1>

      {proposals.length === 0 ? (
        <EmptyState
          message="No has enviado propuestas aun. Explora talentos y envia tu primera propuesta."
          actionLabel="Explorar talentos"
          actionHref="/marcas/talentos"
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const grad = gradientStyle(proposal.talent.gradientC1, proposal.talent.gradientC2);
            return (
              <div key={proposal.id} className="rounded-2xl bg-white border border-sp-border p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden" style={{ background: grad }}>
                  {proposal.talent.photoUrl ? (
                    <Image src={proposal.talent.photoUrl} alt={proposal.talent.name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-sm font-black text-white">{proposal.talent.initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg font-black uppercase text-sp-dark">{proposal.talent.name}</div>
                  <p className="text-xs text-sp-muted truncate">{proposal.campaignType} · {proposal.budgetRange} · {proposal.timeline}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[proposal.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {proposal.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-sp-muted2">{new Date(proposal.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

`scripts/committer "feat(marcas): add proposals list page" src/app/marcas/(portal)/propuestas/page.tsx`

---

## Task 13: Talent Comparison View

**Files:**
- Create: `src/app/marcas/(portal)/comparar/page.tsx`

- [ ] **Step 1: Create comparison page** (reads talent IDs from searchParams)

```typescript
import { requireRole } from '@/lib/auth-guard';
import { getTalents } from '@/lib/queries/talents';
import Image from 'next/image';
import { gradientStyle } from '@/lib/gradient';
import Link from 'next/link';
import { EmptyState } from '@/components/brand/EmptyState';

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function BrandComparePage({ searchParams }: PageProps) {
  await requireRole('brand', '/marcas/login');
  const params = await searchParams;
  const idStrings = params.ids?.split(',').map(Number).filter(Boolean) ?? [];

  if (idStrings.length < 2) {
    return (
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-6">Comparar talentos</h1>
        <EmptyState
          message="Selecciona al menos 2 talentos para comparar."
          actionLabel="Ir al catalogo"
          actionHref="/marcas/talentos"
        />
      </div>
    );
  }

  // Fetch all talents by IDs with relations
  const allTalents = await getTalents();
  const selected = allTalents.filter((t) => idStrings.includes(t.id)).slice(0, 4);

  if (selected.length < 2) {
    return (
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-6">Comparar talentos</h1>
        <EmptyState
          message="Algunos talentos ya no estan disponibles."
          actionLabel="Ir al catalogo"
          actionHref="/marcas/talentos"
        />
      </div>
    );
  }

  // Collect all unique stat labels across selected talents
  const allLabels = [...new Set(selected.flatMap((t) => t.stats.map((s) => s.label)))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl font-black uppercase text-sp-dark">
          Comparar talentos ({selected.length})
        </h1>
        <Link href="/marcas/talentos" className="text-sm text-sp-muted hover:text-sp-dark transition-colors">
          Volver al catalogo
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(240px, 1fr))` }}>
          {selected.map((talent) => {
            const grad = gradientStyle(talent.gradientC1, talent.gradientC2);
            return (
              <div key={talent.id} className="rounded-2xl bg-white border border-sp-border overflow-hidden">
                {/* Photo */}
                <div className="relative h-40 overflow-hidden" style={{ background: grad }}>
                  {talent.photoUrl ? (
                    <Image src={talent.photoUrl} alt={talent.name} fill className="object-cover object-top" sizes="25vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-5xl font-black text-white/80">{talent.initials}</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display text-xl font-black uppercase text-sp-dark">{talent.name}</h3>
                  <p className="text-xs text-sp-muted mb-4">{talent.role}</p>
                  {/* Stats */}
                  {allLabels.map((label) => {
                    const stat = talent.stats.find((s) => s.label === label);
                    return (
                      <div key={label} className="flex justify-between py-1.5 border-b border-sp-border/50 last:border-0">
                        <span className="text-xs text-sp-muted">{label}</span>
                        <span className="text-xs font-bold text-sp-dark">{stat?.value ?? '—'}</span>
                      </div>
                    );
                  })}
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {talent.tags.map((t) => (
                      <span key={t.id} className="text-[10px] px-2 py-0.5 rounded-full bg-sp-off text-sp-muted">
                        {t.tag}
                      </span>
                    ))}
                  </div>
                  {/* CTA */}
                  <Link
                    href={`/marcas/talentos/${talent.slug}`}
                    className="block mt-4 text-center px-4 py-2 rounded-full text-xs font-bold text-white bg-sp-grad hover:opacity-90 transition-opacity"
                  >
                    Ver ficha completa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

`scripts/committer "feat(marcas): add talent comparison view" src/app/marcas/(portal)/comparar/page.tsx`

---

## Task 14: Admin Brand Management

**Files:**
- Create: `src/app/admin/(dashboard)/brands/page.tsx`
- Create: `src/app/admin/(dashboard)/brands/actions.ts`

- [ ] **Step 1: Create server actions**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendBrandInviteEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { auth } from '@/lib/auth';

interface InviteState {
  error?: string;
  success?: boolean;
}

export async function inviteBrandAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || !email) return { error: 'Nombre y email son obligatorios' };

  // Check if email already exists
  const existing = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
  if (existing.length > 0) return { error: 'Este email ya esta registrado' };

  // Generate a random temp password (brand will set their own via invite link)
  const tempPassword = crypto.randomUUID();

  try {
    // Create user via Better Auth sign-up API
    await auth.api.signUpEmail({
      body: { name, email, password: tempPassword },
    });

    // Set role to 'brand'
    await db.update(userTable).set({ role: 'brand' }).where(eq(userTable.email, email));

    // Send invite email — brand sets their own password by clicking "set password"
    // which links to the brand login page (they use "forgot password" from there)
    const portalUrl = `${env.NEXT_PUBLIC_SITE_URL}/marcas/login`;
    try {
      await sendBrandInviteEmail({ brandEmail: email, brandName: name, resetUrl: portalUrl });
    } catch (err) {
      console.error('[admin] Brand invite email error:', err);
      // Account created but email failed — admin can resend or share link manually
    }
  } catch (err) {
    console.error('[admin] Brand creation error:', err);
    return { error: 'Error al crear la cuenta' };
  }

  revalidatePath('/admin/brands');
  return { success: true };
}
```

- [ ] **Step 2: Create admin brands page (split into server + client parts)**

Create `src/app/admin/(dashboard)/brands/page.tsx`:
```typescript
import { db } from '@/lib/db';
import { user as userTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { InviteBrandForm } from './invite-form';

export default async function AdminBrandsPage() {
  const brands = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.role, 'brand'))
    .orderBy(desc(userTable.createdAt));

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Marcas</h1>

      {/* Invite form — client component for useActionState */}
      <InviteBrandForm />

      {/* Brands table */}
      {brands.length === 0 ? (
        <p className="text-sm text-sp-muted">No hay marcas registradas. Invita tu primera marca.</p>
      ) : (
        <div className="rounded-2xl bg-white border border-sp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sp-border bg-sp-off">
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Nombre</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Email</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Creado</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-sp-border/50 last:border-0">
                  <td className="px-6 py-4 font-medium text-sp-dark">{brand.name}</td>
                  <td className="px-6 py-4 text-sp-muted">{brand.email}</td>
                  <td className="px-6 py-4 text-sp-muted">{new Date(brand.createdAt).toLocaleDateString('es-ES')}</td>
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

Create `src/app/admin/(dashboard)/brands/invite-form.tsx`:
```typescript
'use client';

import { useActionState } from 'react';
import { inviteBrandAction } from './actions';

export function InviteBrandForm() {
  const [state, formAction, isPending] = useActionState(inviteBrandAction, {});

  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
      <h2 className="font-bold text-sp-dark mb-4">Invitar marca</h2>
      <form action={formAction} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-sp-dark mb-1.5">Nombre</label>
          <input name="name" required className="w-full rounded-xl border border-sp-border px-4 py-2.5 text-sm outline-none focus:border-sp-orange transition-colors" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-sp-dark mb-1.5">Email</label>
          <input name="email" type="email" required className="w-full rounded-xl border border-sp-border px-4 py-2.5 text-sm outline-none focus:border-sp-orange transition-colors" />
        </div>
        <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-sp-grad hover:opacity-90 shrink-0 disabled:opacity-60">
          {isPending ? 'Invitando...' : 'Invitar'}
        </button>
      </form>
      {state.error && <p className="text-xs text-red-500 mt-2">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600 mt-2">Invitacion enviada correctamente.</p>}
    </div>
  );
}
```

- [ ] **Step 3: Verify `npx tsc --noEmit`**

- [ ] **Step 4: Commit**

`scripts/committer "feat(admin): add brand management page with invite flow" src/app/admin/(dashboard)/brands/actions.ts src/app/admin/(dashboard)/brands/page.tsx src/app/admin/(dashboard)/brands/invite-form.tsx`

---

## Task 15: Set Admin Role + Final Build Verification

- [ ] **Step 1: Set existing admin user's role**

Via Neon MCP: `UPDATE "user" SET role = 'admin' WHERE email = 'admin@socialpro.es';`

- [ ] **Step 2: Run full build**

`npm run build`

- [ ] **Step 3: Run typecheck + lint**

`npx tsc --noEmit && npm run lint`

- [ ] **Step 4: Verify dev server**

`npm run dev` — test `/marcas/login`, `/admin/brands`

- [ ] **Step 5: Update roadmap.md — mark Growth G items**

- [ ] **Step 6: Final commit**

`scripts/committer "feat(growth-g): marcas dashboard MVP complete" roadmap.md`
