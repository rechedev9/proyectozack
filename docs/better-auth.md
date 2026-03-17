---
summary: 'Better Auth — Next.js App Router integration, session middleware, protecting routes, admin-only guards.'
read_when:
  - Setting up authentication
  - Protecting /admin routes
  - Accessing session in Server/Client components
---

# Better Auth Reference

## Install

```bash
npm install better-auth
```

## Environment Variables

```bash
BETTER_AUTH_SECRET=<32+ char high-entropy value>   # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000               # NEXT_PUBLIC_SITE_URL in prod
```

## Server Config (`src/lib/auth.ts`)

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema, // pass your schema so Better Auth uses existing tables if possible
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
})
```

## Route Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { POST, GET } = toNextJsHandler(auth)
```

Handles all `/api/auth/*` requests (sign-in, sign-up, sign-out, session).

## Client Setup (`src/lib/auth-client.ts`)

```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
})

export const { signIn, signUp, signOut, useSession } = authClient
```

## Session in Server Components

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/admin/login')

  return <div>Welcome {session.user.email}</div>
}
```

## Session in Client Components

```typescript
'use client'
import { useSession } from '@/lib/auth-client'

export function AdminNav() {
  const { data: session, isPending } = useSession()
  if (isPending) return null
  if (!session) return <Link href="/admin/login">Login</Link>
  return <span>{session.user.email}</span>
}
```

## Middleware (route protection)

```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

## Admin Layout Guard (alternative — Server Component)

```typescript
// src/app/admin/layout.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/admin/login')
  return <>{children}</>
}
```

## Sign In / Sign Up (Client Component)

```typescript
'use client'
import { signIn, signUp } from '@/lib/auth-client'

// Sign in with email + password
await signIn.email({ email, password })

// Sign up
await signUp.email({ email, password, name })

// Sign out
import { signOut } from '@/lib/auth-client'
await signOut()
```

## Database Migration

Better Auth creates its own tables (user, session, account, verification). Run:

```bash
npx @better-auth/cli generate  # generates schema additions
npx @better-auth/cli migrate   # applies migrations
# or just run drizzle-kit migrate after adding Better Auth schema
```

## Seed Admin User

```typescript
// scripts/seed-admin.ts
import { auth } from '@/lib/auth'

await auth.api.signUpEmail({
  body: {
    email: 'admin@socialpro.es',
    password: process.env.ADMIN_PASSWORD!,
    name: 'Admin',
  },
})
```
