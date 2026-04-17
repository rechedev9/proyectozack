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

const BATCH_ID = 'firecrawl-2026-04';
const DISCOVERED_VIA = 'firecrawl/twitchtracker+socialblade';

type TargetRow = typeof targets.$inferInsert;

// Twitch: scraped from TwitchTracker Spanish ranking, April 2026
// Follower counts are "Total Followers" column (not avg viewers)
const twitchTargets: TargetRow[] = [
  { username: 'elpelotasssss', fullName: 'ElPelotasssss',  platform: 'twitch', profileUrl: 'https://www.twitch.tv/elpelotasssss',  followers: 70100  },
  { username: 'sol1xd',        fullName: 'Sol1XD',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/sol1xd',          followers: 84400  },
  { username: 'oscarinin',     fullName: 'Oscarinin',       platform: 'twitch', profileUrl: 'https://www.twitch.tv/oscarinin',       followers: 25500  },
  { username: 'shinchan_oficial', fullName: 'shinchan_oficial', platform: 'twitch', profileUrl: 'https://www.twitch.tv/shinchan_oficial', followers: 39800 },
  { username: 'weariestbarrel', fullName: 'WeariestBarrel', platform: 'twitch', profileUrl: 'https://www.twitch.tv/weariestbarrel',  followers: 116000 },
  { username: 'mfreak00',      fullName: 'mfreak00',        platform: 'twitch', profileUrl: 'https://www.twitch.tv/mfreak00',        followers: 102000 },
  { username: 'pokealexvgc',   fullName: 'PokeAlexVGC',     platform: 'twitch', profileUrl: 'https://www.twitch.tv/pokealexvgc',    followers: 113000 },
  { username: 'angrodtralari', fullName: 'AngrodTralari',   platform: 'twitch', profileUrl: 'https://www.twitch.tv/angrodtralari',  followers: 105000 },
  { username: 'sesuko',        fullName: 'Sesuko',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/sesuko',          followers: 78700  },
  { username: 'juniorhealy',   fullName: 'JuniorHealy',     platform: 'twitch', profileUrl: 'https://www.twitch.tv/juniorhealy',    followers: 34600  },
  { username: 'x9nium',        fullName: 'x9nium',          platform: 'twitch', profileUrl: 'https://www.twitch.tv/x9nium',          followers: 44600  },
  { username: 'sadicaz',       fullName: 'sadicaz',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/sadicaz',         followers: 83600  },
  { username: 'jimrsng',       fullName: 'JimRsng',         platform: 'twitch', profileUrl: 'https://www.twitch.tv/jimrsng',         followers: 100000 },
  { username: 'eeveelinh',     fullName: 'EeveeLinh',       platform: 'twitch', profileUrl: 'https://www.twitch.tv/eeveelinh',       followers: 60300  },
  { username: 'cursedfiber78', fullName: 'CursedFiber78',   platform: 'twitch', profileUrl: 'https://www.twitch.tv/cursedfiber78',  followers: 129000 },
  { username: 'toadamarillo',  fullName: 'ToadAmarillo',    platform: 'twitch', profileUrl: 'https://www.twitch.tv/toadamarillo',   followers: 83600  },
  { username: 'facuuparejas',  fullName: 'facuuparejas',    platform: 'twitch', profileUrl: 'https://www.twitch.tv/facuuparejas',   followers: 60600  },
  { username: 'souzacarlostv', fullName: 'SouzaCarlosTV',   platform: 'twitch', profileUrl: 'https://www.twitch.tv/souzacarlostv', followers: 55800  },
  { username: 'vickypalami',   fullName: 'vickypalami',     platform: 'twitch', profileUrl: 'https://www.twitch.tv/vickypalami',   followers: 125000 },
  { username: 'whithblade',    fullName: 'whithblade',      platform: 'twitch', profileUrl: 'https://www.twitch.tv/whithblade',    followers: 88200  },
];

// YouTube: scraped from Social Blade Top 100 Gaming Chile, April 2026
// Subscribers (followers field) are from positions ~83-100 of the Chile gaming list
const youtubeTargets: TargetRow[] = [
  { username: 'markgamer03',       fullName: 'MarkGamer03',      platform: 'youtube', profileUrl: 'https://www.youtube.com/@markgamer03',       followers: 150000 },
  { username: 'cronosz',           fullName: 'Cronos',           platform: 'youtube', profileUrl: 'https://www.youtube.com/@cronosz',           followers: 148000 },
  { username: 'elnachonix',        fullName: 'El Nachonix',      platform: 'youtube', profileUrl: 'https://www.youtube.com/@elnachonix',        followers: 147000 },
  { username: 'asckot',            fullName: 'Asckot',           platform: 'youtube', profileUrl: 'https://www.youtube.com/@asckot',            followers: 147000 },
  { username: 'tirolocoo',         fullName: 'TiroLocoo',        platform: 'youtube', profileUrl: 'https://www.youtube.com/@tirolocoo',         followers: 147000 },
  { username: 'jisusthechannel',   fullName: 'JisusTHEchannel',  platform: 'youtube', profileUrl: 'https://www.youtube.com/@jisusthechannel',   followers: 144000 },
  { username: 'jeancgz',           fullName: 'Jean9GamerZ',      platform: 'youtube', profileUrl: 'https://www.youtube.com/@jeancgz',           followers: 142000 },
  { username: 'anthonygamesyt18',  fullName: 'Anthony Games',    platform: 'youtube', profileUrl: 'https://www.youtube.com/@anthonygamesyt18',  followers: 141000 },
  { username: 'matlumber2',        fullName: 'Mat Lumber V2',    platform: 'youtube', profileUrl: 'https://www.youtube.com/@matlumber2',        followers: 140000 },
  { username: 'soldierelu',        fullName: 'Soldier Elu',      platform: 'youtube', profileUrl: 'https://www.youtube.com/@soldierelu',        followers: 136000 },
  { username: 'xeonrade',          fullName: 'XeonRade',         platform: 'youtube', profileUrl: 'https://www.youtube.com/@xeonrade',          followers: 133000 },
  { username: 'luxogamesoficial',  fullName: 'Luxo Games',       platform: 'youtube', profileUrl: 'https://www.youtube.com/@luxogamesoficial',  followers: 126000 },
  { username: 'chetalonsoidh',     fullName: 'Chetalonso IDH',   platform: 'youtube', profileUrl: 'https://www.youtube.com/@chetalonsoidh',     followers: 125000 },
  { username: 'diegotayk',         fullName: 'Diegotayk',        platform: 'youtube', profileUrl: 'https://www.youtube.com/@diegotayk',         followers: 121000 },
  { username: 'aiess',             fullName: 'Aiess',            platform: 'youtube', profileUrl: 'https://www.youtube.com/@aiess',             followers: 120000 },
  { username: 'nachotaro',         fullName: 'Nachotaro',        platform: 'youtube', profileUrl: 'https://www.youtube.com/@nachotaro',         followers: 119000 },
  { username: 'compotahyperxd1846', fullName: 'CompotaHyperXD', platform: 'youtube', profileUrl: 'https://www.youtube.com/@compotahyperxd1846', followers: 119000 },
  { username: 'marcelocortesf1854', fullName: 'Marcelo Cortés F', platform: 'youtube', profileUrl: 'https://www.youtube.com/@marcelocortesf1854', followers: 119000 },
];

const allTargets: TargetRow[] = [
  ...twitchTargets.map((t) => ({ ...t, discoveredVia: DISCOVERED_VIA, importBatchId: BATCH_ID })),
  ...youtubeTargets.map((t) => ({ ...t, discoveredVia: DISCOVERED_VIA, importBatchId: BATCH_ID })),
];

async function main(): Promise<void> {
  console.log(`Inserting ${allTargets.length} targets (batch: ${BATCH_ID})...`);

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
