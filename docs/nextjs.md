---
summary: 'Next.js 16 App Router — routing, Server/Client components, data fetching, ISR, metadata, layouts, middleware.'
read_when:
  - Writing or modifying App Router pages, layouts, or API routes
  - Setting up data fetching or caching strategy
  - Configuring metadata or middleware
---

# Next.js 16 App Router Reference

## File Conventions

```
app/
  layout.tsx          # Shared UI wrapping child segments; root layout must have <html><body>
  page.tsx            # Unique UI for a route segment; makes route publicly accessible
  loading.tsx         # Suspense boundary for route segment
  error.tsx           # Error boundary for route segment
  not-found.tsx       # 404 UI
  route.ts            # API endpoint (no UI)
  middleware.ts       # Edge middleware (project root, not app/)
```

Dynamic segments: `app/blog/[slug]/page.tsx` → `params: Promise<{ slug: string }>`

Catch-all: `app/api/auth/[...all]/route.ts`

## Server vs Client Components

**Server Component** (default — no directive needed):
- Renders on server; can be async; can access DB, env vars, fs
- No `useState`, `useEffect`, `onClick`, browser APIs
- Cannot be imported by Client Components (only passed as props/children)

**Client Component** (`'use client'` at top of file):
- Runs in browser; has hooks, event handlers, browser APIs
- All imports become part of client bundle
- Can receive Server Components as `children` prop

**Rule:** Add `'use client'` only at the boundary. All components below inherit client behavior.

## Data Fetching in Server Components

```typescript
// Async Server Component — direct DB/ORM call
export default async function Page() {
  const data = await db.select().from(posts)
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

// Parallel fetching with Promise.all
export default async function Page() {
  const [talents, brands] = await Promise.all([getTalents(), getBrands()])
  return <main>...</main>
}

// Deduplication with React cache (for ORM queries)
import { cache } from 'react'
export const getTalent = cache(async (slug: string) => {
  return db.query.talents.findFirst({ where: eq(talents.slug, slug) })
})
```

## ISR / Caching

```typescript
// Static with time-based revalidation (ISR)
export const revalidate = 3600 // seconds; 0 = dynamic, false = never revalidate

// Per-fetch revalidation
await fetch(url, { next: { revalidate: 3600 } })

// Force dynamic rendering
export const dynamic = 'force-dynamic'
// or
await fetch(url, { cache: 'no-store' })
```

## Metadata API

```typescript
import type { Metadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'SocialPro',
  description: 'Gaming talent agency',
  openGraph: { images: ['/og.jpg'] },
}

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const talent = await getTalentBySlug(slug)
  return { title: talent.name }
}
```

## Root Layout

```typescript
// app/layout.tsx — required; must have <html> and <body>
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = { title: 'SocialPro' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## next/font

```typescript
import { Inter, Barlow_Condensed } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow'
})

// Use in layout: className={`${inter.variable} ${barlow.variable}`}
// Access in CSS: font-family: var(--font-inter);
```

## next/image

```typescript
import Image from 'next/image'

// Static local image
<Image src="/images/talents/key.jpg" alt="..." width={400} height={400} />

// With fill (parent must have position: relative + dimensions)
<Image src={url} alt="..." fill className="object-cover" />

// Priority for LCP images
<Image src="..." alt="..." width={800} height={600} priority />
```

## API Routes (route.ts)

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  // ... process
  return NextResponse.json({ success: true }, { status: 200 })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ data: [] })
}
```

## Middleware

```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const session = await getSession(request.headers)
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

## Server Actions

```typescript
// In Server Component or separate file
'use server'

export async function updateTalent(id: number, data: FormData): Promise<void> {
  const name = data.get('name') as string
  await db.update(talents).set({ name }).where(eq(talents.id, id))
  revalidatePath('/admin/talents')
}

// In Client Component
<form action={updateTalent}>...</form>
// or
const result = await updateTalent(id, formData)
```

## useRouter / Link

```typescript
// Client Component navigation
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const router = useRouter()
router.push('/admin')
router.refresh() // Re-fetch Server Component data

// Server/Client Component link
import Link from 'next/link'
<Link href="/talents/streamer-1">View</Link>
```

## Params in Next.js 16

```typescript
// params is now a Promise in Next.js 15+
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // ...
}
```
