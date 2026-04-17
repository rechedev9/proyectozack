import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { targets } from '../src/db/schema/targets';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const conn = neon(process.env.DATABASE_URL);
const db = drizzle(conn);

const BATCH_ID = 'firecrawl-cs2-2026-04';
const DISCOVERED_VIA = 'firecrawl/twitchmetrics-cs2-es';

type TargetRow = typeof targets.$inferInsert;

// CS2 Twitch streamers: scraped from TwitchMetrics "Most Followed Counter-Strike Español" April 2026
// EXCLUDED (already contracted by SocialPro): gordoreally, nikozfps, nikomfps, fedeadz,
//   imicaelax, mechaalvarez, branuel, annabiue, eruby
// EXCLUDED (duplicate from firecrawl-2026-04 batch): x9nium
const twitchCs2Targets: TargetRow[] = [
  { username: 'its_zanos',         fullName: 'its_zanos',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/its_zanos',         followers: 114077, bio: 'CS2 streamer en español' },
  { username: 'elmorocho7',        fullName: 'ElmoRocho7',        platform: 'twitch', profileUrl: 'https://www.twitch.tv/elmorocho7',        followers: 112006, bio: 'CS2 streamer en español' },
  { username: 'dareh77',           fullName: 'DAREH77',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/dareh77',           followers: 70333,  bio: 'CS2 streamer en español' },
  { username: 'santiargibayy',     fullName: 'santiargibayy',     platform: 'twitch', profileUrl: 'https://www.twitch.tv/santiargibayy',     followers: 69985,  bio: 'CS2 streamer en español' },
  { username: 'danibiondi',        fullName: 'DaniBiondi',        platform: 'twitch', profileUrl: 'https://www.twitch.tv/danibiondi',        followers: 58798,  bio: 'CS2 streamer en español' },
  { username: 'martinrgb',         fullName: 'MartinRGB',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/martinrgb',         followers: 56792,  bio: 'CS2 streamer en español' },
  { username: 'gyann23',           fullName: 'Gyann23',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/gyann23',           followers: 51649,  bio: 'CS2 streamer en español' },
  { username: 'tierwulf',          fullName: 'tierwulf',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/tierwulf',          followers: 50253,  bio: 'CS2 streamer en español' },
  { username: 'v1nchenso7',        fullName: 'v1NCHENSO7',        platform: 'twitch', profileUrl: 'https://www.twitch.tv/v1nchenso7',        followers: 45493,  bio: 'CS2 streamer en español' },
  { username: 'martiinezsa',       fullName: 'MartiinezSa',       platform: 'twitch', profileUrl: 'https://www.twitch.tv/martiinezsa',       followers: 45258,  bio: 'CS2 streamer en español' },
  { username: 'fakzwall',          fullName: 'fakzwall',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/fakzwall',          followers: 44882,  bio: 'CS2 streamer en español' },
  { username: 'triple',            fullName: 'triple',            platform: 'twitch', profileUrl: 'https://www.twitch.tv/triple',            followers: 43783,  bio: 'CS2 streamer en español' },
  { username: 'mills_rp',          fullName: 'Mills_RP',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/mills_rp',          followers: 43661,  bio: 'CS2 streamer en español' },
  { username: 'keus',              fullName: 'keus',              platform: 'twitch', profileUrl: 'https://www.twitch.tv/keus',              followers: 43418,  bio: 'CS2 streamer en español' },
  { username: 'chjna4q',           fullName: 'chjna4q',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/chjna4q',           followers: 42937,  bio: 'CS2 streamer en español' },
  { username: 'kaeryka',           fullName: 'kaeryka',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/kaeryka',           followers: 41535,  bio: 'CS2 streamer en español' },
  { username: 'chilltv',           fullName: 'chilltv',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/chilltv',           followers: 40502,  bio: 'CS2 streamer en español' },
  { username: '1962cs',            fullName: '1962cs',            platform: 'twitch', profileUrl: 'https://www.twitch.tv/1962cs',            followers: 40159,  bio: 'CS2 streamer en español' },
  { username: 'doubleornothing__', fullName: 'doubleornothing__', platform: 'twitch', profileUrl: 'https://www.twitch.tv/doubleornothing__', followers: 39874,  bio: 'CS2 streamer en español' },
  { username: 'zolderrz',          fullName: 'zolderrz',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/zolderrz',          followers: 36033,  bio: 'CS2 streamer en español' },
  { username: 'rewisho',           fullName: 'Rewisho',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/rewisho',           followers: 35235,  bio: 'CS2 streamer en español' },
  { username: 'logicalcs',         fullName: 'logicalcs',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/logicalcs',         followers: 35082,  bio: 'CS2 streamer en español' },
  { username: 'g1g0cs',            fullName: 'G1G0cs',            platform: 'twitch', profileUrl: 'https://www.twitch.tv/g1g0cs',            followers: 33347,  bio: 'CS2 streamer en español' },
  { username: 'sett1ngcs',         fullName: 'sett1ngcs',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/sett1ngcs',         followers: 32783,  bio: 'CS2 streamer en español' },
  { username: 'candehvh',          fullName: 'candehvh',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/candehvh',          followers: 29054,  bio: 'CS2 streamer en español' },
  { username: 'lotterr7',          fullName: 'lotterr7',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/lotterr7',          followers: 28681,  bio: 'CS2 streamer en español' },
  { username: 'pibaldi',           fullName: 'pibaldi',           platform: 'twitch', profileUrl: 'https://www.twitch.tv/pibaldi',           followers: 27915,  bio: 'CS2 streamer en español' },
  { username: 'misslaia',          fullName: 'MissLaia',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/misslaia',          followers: 27256,  bio: 'CS2 streamer en español' },
  { username: 'xjjime',            fullName: 'xjjime',            platform: 'twitch', profileUrl: 'https://www.twitch.tv/xjjime',            followers: 26157,  bio: 'CS2 streamer en español' },
];

// YouTube CS2 skin/gambling creators in Spanish — verified via Social Blade
const youtubeCs2Targets: TargetRow[] = [
  {
    username: 'HaaankCS2',
    fullName: 'Haaank | CS2',
    platform: 'youtube',
    profileUrl: 'https://www.youtube.com/@HaaankCS2',
    followers: 47400,
    bio: 'Análisis de mercado de skins CS2, inversión y trading en español',
    discoveredVia: 'firecrawl/youtube-cs2-skins-es',
    importBatchId: BATCH_ID,
  },
  {
    username: 'lucasmdqYT',
    fullName: 'lucasmdq',
    platform: 'youtube',
    profileUrl: 'https://www.youtube.com/@lucasmdqYT',
    followers: 25000,
    bio: 'CS2 skins, casos y gambling en español',
    discoveredVia: 'firecrawl/youtube-cs2-skins-es',
    importBatchId: BATCH_ID,
  },
];

const allTargets: TargetRow[] = [
  ...twitchCs2Targets.map((t) => ({ ...t, discoveredVia: DISCOVERED_VIA, importBatchId: BATCH_ID })),
  ...youtubeCs2Targets,
];

async function main(): Promise<void> {
  console.log(`Inserting ${allTargets.length} CS2 targets (batch: ${BATCH_ID})...`);

  const result = await db
    .insert(targets)
    .values(allTargets)
    .onConflictDoNothing()
    .returning({ id: targets.id, platform: targets.platform, username: targets.username });

  console.log(`Inserted ${result.length} new targets (skipped ${allTargets.length - result.length} duplicates).`);
  const byPlatform = result.reduce<Record<string, number>>((acc, r) => {
    acc[r.platform] = (acc[r.platform] ?? 0) + 1;
    return acc;
  }, {});
  for (const [platform, count] of Object.entries(byPlatform)) {
    console.log(`  ${platform}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
