import { neon } from '@neondatabase/serverless';
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

async function main() {
  // Add profile_url column and update known collaborators
  await sql`ALTER TABLE "collaborators" ADD COLUMN IF NOT EXISTS "profile_url" varchar(500)`;
  console.log('✓ Column profile_url added');

  // Set profile URLs for existing collaborators
  await sql`UPDATE collaborators SET profile_url = 'https://twitch.tv/andrechini' WHERE slug = 'andrechini'`;
  await sql`UPDATE collaborators SET profile_url = 'https://twitch.tv/imantado' WHERE slug = 'imantado'`;
  await sql`UPDATE collaborators SET profile_url = 'https://www.youtube.com/@imicaelax' WHERE slug = 'imicaelax'`;
  await sql`UPDATE collaborators SET profile_url = 'https://www.instagram.com/manolo_rojitas/' WHERE slug = 'manolito'`;
  await sql`UPDATE collaborators SET profile_url = 'https://x.com/The_real_feR' WHERE slug = 'therealfer'`;
  console.log('✓ Profile URLs updated');

  // Mark migration as applied in drizzle meta
  try {
    await sql`INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ('0013_goofy_jackal', ${Date.now()}) ON CONFLICT DO NOTHING`;
  } catch { /* table may not exist */ }
}

main().catch((e) => { console.error(e); process.exit(1); });
