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
    slug: 'therealfer',
    name: 'The Real Fer',
    description: 'Streamer & Content Creator',
    badge: 'Twitch · X · YouTube',
    photoUrl: null,
    gradientC1: '#5b9bd5',
    gradientC2: '#8b3aad',
    initials: 'RF',
    sortOrder: 4,
  }).onConflictDoNothing();
  console.log('The Real Fer insertado correctamente.');
}

main().catch((e) => { console.error(e); process.exit(1); });
