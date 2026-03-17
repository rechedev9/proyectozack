---
summary: '@neondatabase/serverless — connection setup, singleton pattern for serverless/edge, Drizzle adapter.'
read_when:
  - Setting up the database connection
  - Writing the db.ts singleton
  - Debugging connection issues
---

# @neondatabase/serverless Reference

## Install

```bash
npm install @neondatabase/serverless
```

## Environment Variable

```bash
DATABASE_URL="postgres://username:password@host.neon.tech/neondb?sslmode=require"
```

## HTTP Transport — `neon()` (recommended for serverless/edge)

Single-query, HTTP fetch-based. No persistent connection. Safe from SQL injection via tagged template literals.

```typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
const [row] = await sql`SELECT * FROM posts WHERE id = ${id}`
```

Multiple queries in one round-trip:
```typescript
const [posts, tags] = await sql.transaction([
  sql`SELECT * FROM posts LIMIT ${limit}`,
  sql`SELECT * FROM tags`,
])
```

## Drizzle ORM Integration (recommended pattern)

```typescript
// src/lib/db.ts — singleton for serverless/edge
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

**Key:** Instantiate outside the request handler so the module is reused across warm invocations.

## WebSocket Transport — `Pool` / `Client`

Use when you need sessions, interactive transactions, or LISTEN/NOTIFY. Requires `ws` in Node.js < v22.

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Node.js < v22 only
neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
```

**Serverless constraint:** Create Pool/Client inside request handlers; close within the same handler. Connections cannot persist across serverless invocations.

## Drizzle with WebSocket (Pool adapter)

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
```

## Singleton Pattern for Next.js (recommended)

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/db/schema'

function createDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, { schema })
}

// Module-level singleton — reused across warm lambda invocations
export const db = createDb()
export type DB = typeof db
```

## Compatibility

Drop-in replacement for `node-postgres` (pg). Supports Kysely, Zapatos, and other pg-compatible query builders.
