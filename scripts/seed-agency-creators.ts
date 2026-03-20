import { config } from 'dotenv';
config({ path: '.env.local' });
import * as XLSX from 'xlsx';
import { db } from '../src/lib/db';
import { agencyCreators } from '../src/db/schema';

const EXCEL_PATH = '/mnt/c/Users/reche/Downloads/Copia de SOCIAL x AGENCIA 2026.xlsx';

function cleanUrl(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (s === '' || s === '-') return null;
  return s;
}

function firstUrl(raw: string | null): string | null {
  if (!raw) return null;
  const parts = raw.split('+').map((p) => p.trim()).filter(Boolean);
  return parts[0] ?? null;
}

function findUrlByDomain(raw: string | null, domain: string): string | null {
  if (!raw) return null;
  const parts = raw.split('+').map((p) => p.trim()).filter(Boolean);
  return parts.find((p) => p.includes(domain)) ?? null;
}

interface RawRow {
  Name?: unknown;
  YouTube?: unknown;
  Twitter?: unknown;
  'Instagram/TikTok'?: unknown;
  'Twitch/Kick'?: unknown;
  GEOSTATS?: unknown;
  'STATS WEBS'?: unknown;
  'Twitchtracker/Streamcharts'?: unknown;
  Country?: unknown;
}

async function main() {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: undefined });

  const seen = new Set<string>();
  const records: (typeof agencyCreators.$inferInsert)[] = [];

  for (const row of rows) {
    const name = row.Name !== undefined ? String(row.Name).trim() : '';
    if (!name) continue;
    if (seen.has(name)) continue;
    seen.add(name);

    const youtubeRaw = cleanUrl(row.YouTube);
    const twitterRaw = cleanUrl(row.Twitter);
    const igTikRaw = cleanUrl(row['Instagram/TikTok']);
    const twitchKickRaw = cleanUrl(row['Twitch/Kick']);
    const geostatsRaw = cleanUrl(row.GEOSTATS);
    const statsRaw = cleanUrl(row['STATS WEBS']);
    const trackerRaw = cleanUrl(row['Twitchtracker/Streamcharts']);
    const country = cleanUrl(row.Country);

    records.push({
      name,
      country,
      youtubeUrl: firstUrl(youtubeRaw),
      twitterUrl: twitterRaw,
      instagramUrl: findUrlByDomain(igTikRaw, 'instagram.com'),
      tiktokUrl: findUrlByDomain(igTikRaw, 'tiktok.com'),
      twitchUrl: findUrlByDomain(twitchKickRaw, 'twitch.tv'),
      kickUrl: findUrlByDomain(twitchKickRaw, 'kick.com'),
      geostatsUrl: geostatsRaw,
      statsUrl: statsRaw,
      trackerUrl: trackerRaw,
    });
  }

  await db.delete(agencyCreators);
  if (records.length > 0) {
    await db.insert(agencyCreators).values(records);
  }

  console.log(`Inserted ${records.length} agency creators`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
