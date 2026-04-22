/**
 * Populate demo descriptions on a handful of creator codes for visual validation.
 * Run: npx tsx scripts/seed-code-descriptions-demo.ts
 * Revert: npx tsx scripts/seed-code-descriptions-demo.ts --revert
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, inArray, isNull } from 'drizzle-orm';
import * as schema from '../src/db/schema/index';
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
  for (const line of envFile.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (key && !process.env[key]) process.env[key] = v;
  }
} catch {}

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const OFFERS: Record<string, string> = {
  Skinplace: 'Depósito doble: 100% extra en tu primera recarga de skins',
  Hellcase: '5 Case Battles gratis al usar el código al registrarte',
  SkinsMonkey: '+10% de bono al primer trade usando el código',
};

async function main(): Promise<void> {
  if (process.argv.includes('--revert')) {
    await db.update(schema.creatorCodes)
      .set({ description: null })
      .where(inArray(schema.creatorCodes.description, Object.values(OFFERS)));
    console.log('Reverted demo descriptions');
    return;
  }

  const rows = await db.select({ id: schema.creatorCodes.id, brandName: schema.creatorCodes.brandName, description: schema.creatorCodes.description })
    .from(schema.creatorCodes)
    .where(isNull(schema.creatorCodes.description));

  const takenPerBrand = new Set<string>();
  for (const r of rows) {
    if (takenPerBrand.has(r.brandName)) continue;
    const offer = OFFERS[r.brandName];
    if (!offer) continue;
    await db.update(schema.creatorCodes).set({ description: offer }).where(eq(schema.creatorCodes.id, r.id));
    console.log(`updated #${r.id} (${r.brandName}) → "${offer}"`);
    takenPerBrand.add(r.brandName);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
