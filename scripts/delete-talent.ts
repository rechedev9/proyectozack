/**
 * delete-talent.ts — elimina un talent por slug
 * Run: npx tsx scripts/delete-talent.ts annablue
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
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

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: npx tsx scripts/delete-talent.ts <slug>');
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL no está definida en .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  const talent = await db.query.talents.findFirst({
    where: eq(schema.talents.slug, slug),
  });

  if (!talent) {
    console.log(`No se encontró ningún talent con slug "${slug}"`);
    process.exit(0);
  }

  console.log(`Eliminando: ${talent.name} (id=${talent.id})`);

  await db.delete(schema.talentSocials).where(eq(schema.talentSocials.talentId, talent.id));
  await db.delete(schema.talentStats).where(eq(schema.talentStats.talentId, talent.id));
  await db.delete(schema.talentTags).where(eq(schema.talentTags.talentId, talent.id));
  await db.delete(schema.talents).where(eq(schema.talents.id, talent.id));

  console.log(`Talent "${talent.name}" eliminado correctamente.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
