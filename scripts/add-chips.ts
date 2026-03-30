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
} catch {}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  await db.insert(schema.collaborators).values({
    slug: 'chips',
    name: 'Chips',
    description: 'Streamer · Kick',
    badge: 'Kick · Twitch',
    profileUrl: 'https://kick.com/chips',
    photoUrl: null,
    gradientC1: '#53fc18',
    gradientC2: '#1a8a00',
    initials: 'CH',
    sortOrder: 5,
  }).onConflictDoNothing();
  console.log('Chips insertado correctamente.');
}

main().catch((e) => { console.error(e); process.exit(1); });
