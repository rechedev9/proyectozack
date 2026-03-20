import { db } from '../src/lib/db';
import { talents, talentSocials, agencyCreators } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

// ── Slug helpers ──

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string, existing: Set<string>): Promise<string> {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  existing.add(slug);
  return slug;
}

// ── URL extraction helpers ──

function extractYouTubePlatformId(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname;
    // youtube.com/@handle
    const atMatch = path.match(/^\/@([^/]+)/);
    if (atMatch) return `@${atMatch[1]}`;
    // youtube.com/channel/UCXXX
    const channelMatch = path.match(/^\/channel\/([^/]+)/);
    if (channelMatch) return channelMatch[1];
    // youtube.com/c/name
    const cMatch = path.match(/^\/c\/([^/]+)/);
    if (cMatch) return cMatch[1];
    // youtube.com/username (legacy)
    const userMatch = path.match(/^\/user\/([^/]+)/);
    if (userMatch) return userMatch[1];
    // fallback: first path segment
    const seg = path.split('/').filter(Boolean)[0];
    return seg || null;
  } catch {
    return null;
  }
}

function extractYouTubeHandle(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const atMatch = path.match(/^\/@([^/]+)/);
    if (atMatch) return `@${atMatch[1]}`;
    const channelMatch = path.match(/^\/channel\/([^/]+)/);
    if (channelMatch) return channelMatch[1];
    const cMatch = path.match(/^\/c\/([^/]+)/);
    if (cMatch) return cMatch[1];
    const userMatch = path.match(/^\/user\/([^/]+)/);
    if (userMatch) return userMatch[1];
    const seg = path.split('/').filter(Boolean)[0];
    return seg || 'unknown';
  } catch {
    return 'unknown';
  }
}

function extractHandleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'unknown';
    return last.startsWith('@') ? last : `@${last}`;
  } catch {
    return 'unknown';
  }
}

function extractUsername(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ── Social platform config ──

interface SocialEntry {
  platform: string;
  handle: string;
  hexColor: string;
  profileUrl: string;
  platformId: string | null;
}

function buildSocials(creator: typeof agencyCreators.$inferSelect): SocialEntry[] {
  const socials: SocialEntry[] = [];

  if (creator.youtubeUrl) {
    socials.push({
      platform: 'yt',
      handle: extractYouTubeHandle(creator.youtubeUrl),
      hexColor: '#FF0000',
      profileUrl: creator.youtubeUrl,
      platformId: extractYouTubePlatformId(creator.youtubeUrl),
    });
  }

  if (creator.twitterUrl) {
    socials.push({
      platform: 'x',
      handle: extractHandleFromUrl(creator.twitterUrl),
      hexColor: '#000000',
      profileUrl: creator.twitterUrl,
      platformId: null,
    });
  }

  if (creator.instagramUrl) {
    socials.push({
      platform: 'ig',
      handle: extractHandleFromUrl(creator.instagramUrl),
      hexColor: '#E1306C',
      profileUrl: creator.instagramUrl,
      platformId: null,
    });
  }

  if (creator.tiktokUrl) {
    socials.push({
      platform: 'tt',
      handle: extractHandleFromUrl(creator.tiktokUrl),
      hexColor: '#010101',
      profileUrl: creator.tiktokUrl,
      platformId: null,
    });
  }

  if (creator.twitchUrl) {
    socials.push({
      platform: 'twitch',
      handle: extractUsername(creator.twitchUrl),
      hexColor: '#9146FF',
      profileUrl: creator.twitchUrl,
      platformId: extractUsername(creator.twitchUrl),
    });
  }

  if (creator.kickUrl) {
    socials.push({
      platform: 'kick',
      handle: extractUsername(creator.kickUrl),
      hexColor: '#53FC18',
      profileUrl: creator.kickUrl,
      platformId: null,
    });
  }

  return socials;
}

// ── Main migration ──

async function main() {
  // 1. Load existing talent names (case-insensitive) and slugs
  const existingTalents = await db.select({ name: talents.name, slug: talents.slug }).from(talents);
  const existingNames = new Set(existingTalents.map((t) => t.name.toLowerCase()));
  const existingSlugs = new Set(existingTalents.map((t) => t.slug));

  // 2. Load all agency creators
  const creators = await db.select().from(agencyCreators);
  console.log(`Found ${creators.length} agency creators`);

  let migratedCount = 0;
  let socialCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < creators.length; i++) {
    const creator = creators[i];

    // Skip if name already exists in talents
    if (existingNames.has(creator.name.toLowerCase())) {
      console.log(`  SKIP: "${creator.name}" already exists in talents`);
      skippedCount++;
      continue;
    }

    // Generate unique slug
    const baseSlug = toSlug(creator.name);
    const slug = await uniqueSlug(baseSlug, existingSlugs);

    // Initials: first 2 letters uppercase
    const initials = creator.name.slice(0, 2).toUpperCase();

    // Insert talent
    const [inserted] = await db
      .insert(talents)
      .values({
        slug,
        name: creator.name,
        role: 'Creador de contenido',
        game: 'CS2',
        platform: 'twitch',
        status: 'active',
        bio: 'Creador de contenido gaming representado por SocialPro.',
        gradientC1: '#f5632a',
        gradientC2: '#8b3aad',
        initials,
        photoUrl: null,
        sortOrder: 1000 + i,
        visibility: 'internal',
      })
      .returning({ id: talents.id });

    // Build and insert socials
    const socials = buildSocials(creator);
    if (socials.length > 0) {
      await db.insert(talentSocials).values(
        socials.map((s, idx) => ({
          talentId: inserted.id,
          platform: s.platform,
          handle: s.handle,
          followersDisplay: '-',
          profileUrl: s.profileUrl,
          hexColor: s.hexColor,
          platformId: s.platformId,
          sortOrder: idx,
        })),
      );
      socialCount += socials.length;
    }

    migratedCount++;
  }

  console.log(`\nMigrated ${migratedCount} creators, created ${socialCount} social entries`);
  console.log(`Skipped ${skippedCount} (already in talents)`);

  // Verify
  const [internalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(talents)
    .where(eq(talents.visibility, 'internal'));
  console.log(`\nVerification: ${internalCount.count} internal talents in DB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
