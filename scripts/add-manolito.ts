/**
 * add-manolito.ts — inserta Manolito en collaborators
 * Run: npx tsx scripts/add-manolito.ts
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema/index';
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && val && !process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local in CI */ }

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL no definida'); process.exit(1); }

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  await db.insert(schema.collaborators).values({
    slug: 'manolito',
    name: 'Manolito',
    description: 'La Casa de los Gemelos',
    badge: 'Twitch · YouTube · TikTok',
    photoUrl: '/images/collabs/manolito.jpg',
    gradientC1: '#f5632a',
    gradientC2: '#c42880',
    initials: 'MA',
    sortOrder: 3,
  }).onConflictDoNothing();
  console.log('Manolito insertado correctamente.');
}

main().catch((e) => { console.error(e); process.exit(1); });
