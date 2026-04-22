/**
 * Demo seed for /giveaways page visual validation.
 * Idempotent: inserts only when a giveaway with the same title is missing.
 * Run: npx tsx scripts/seed-giveaways-demo.ts
 * Delete: npx tsx scripts/seed-giveaways-demo.ts --delete
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { and, eq, inArray } from 'drizzle-orm';
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

const SKINPLACE_LOGO = 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://skin.place&size=64';
const HELLCASE_LOGO = 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://hellcase.com&size=64';
const SKINSMONKEY_LOGO = 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://skinsmonkey.com&size=64';

const DEMO_TITLES = ['[DEMO] AK-47 Vulcan FT', '[DEMO] Case bundle premium', '[DEMO] Gift card €50'];

async function resolveTalentIds(): Promise<Record<string, number>> {
  const rows = await db.select({ id: schema.talents.id, slug: schema.talents.slug })
    .from(schema.talents)
    .where(inArray(schema.talents.slug, ['deqiuv', 'martinez', 'naow']));
  const map: Record<string, number> = {};
  for (const r of rows) map[r.slug] = r.id;
  return map;
}

async function main(): Promise<void> {
  const deleteMode = process.argv.includes('--delete');

  if (deleteMode) {
    const res = await db.delete(schema.giveaways).where(inArray(schema.giveaways.title, DEMO_TITLES));
    console.log('Deleted demo giveaways:', res);
    return;
  }

  const talentIds = await resolveTalentIds();
  if (!talentIds.deqiuv || !talentIds.martinez || !talentIds.naow) {
    console.error('Missing talents. Got:', talentIds);
    process.exit(1);
  }

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
  const in72h = new Date(now.getTime() + 72 * 3600 * 1000);
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000);

  const rows: Array<typeof schema.giveaways.$inferInsert> = [
    {
      talentId: talentIds.deqiuv!,
      title: DEMO_TITLES[0]!,
      description: 'Participa y llévate una AK-47 Vulcan Factory New valorada en más de 3.500€',
      imageUrl: null,
      brandName: 'Skinplace',
      brandLogo: SKINPLACE_LOGO,
      value: '3.500€',
      redirectUrl: 'https://p.skin.place/THEREALFER',
      startsAt: now,
      endsAt: in48h,
      sortOrder: 0,
    },
    {
      talentId: talentIds.martinez!,
      title: DEMO_TITLES[1]!,
      description: 'Bundle de cajas premium Hellcase exclusivo para comunidad de MARTINEZ',
      imageUrl: null,
      brandName: 'Hellcase',
      brandLogo: HELLCASE_LOGO,
      value: '1.500€',
      redirectUrl: 'https://hellcase.com/?promocode=andreachini',
      startsAt: now,
      endsAt: in72h,
      sortOrder: 1,
    },
    {
      talentId: talentIds.naow!,
      title: DEMO_TITLES[2]!,
      description: 'Gift card de 50€ para SkinsMonkey, tradea tus skins al mejor valor',
      imageUrl: null,
      brandName: 'SkinsMonkey',
      brandLogo: SKINSMONKEY_LOGO,
      value: '500€',
      redirectUrl: 'https://skinsmonkey.com/es/r/MARTINEZ',
      startsAt: now,
      endsAt: in24h,
      sortOrder: 2,
    },
  ];

  for (const r of rows) {
    const exists = await db.select({ id: schema.giveaways.id })
      .from(schema.giveaways)
      .where(and(eq(schema.giveaways.title, r.title), eq(schema.giveaways.talentId, r.talentId)));
    if (exists.length > 0) {
      console.log(`skip: "${r.title}" already exists (id=${exists[0]!.id})`);
      continue;
    }
    const [inserted] = await db.insert(schema.giveaways).values(r).returning({ id: schema.giveaways.id });
    console.log(`insert: "${r.title}" → id=${inserted!.id}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
