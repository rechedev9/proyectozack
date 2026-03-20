import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

export const agencyCreators = pgTable('agency_creators', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  country: varchar('country', { length: 50 }),
  youtubeUrl: text('youtube_url'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  tiktokUrl: text('tiktok_url'),
  twitchUrl: text('twitch_url'),
  kickUrl: text('kick_url'),
  geostatsUrl: text('geostats_url'),
  statsUrl: text('stats_url'),
  trackerUrl: text('tracker_url'),
});
