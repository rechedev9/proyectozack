import type { InferSelectModel } from 'drizzle-orm';
import type { giveaways, giveawayWinners, creatorCodes } from '@/db/schema';
import type { Talent } from './talent';

export type Giveaway = InferSelectModel<typeof giveaways>;
export type GiveawayWinner = InferSelectModel<typeof giveawayWinners>;
export type CreatorCode = InferSelectModel<typeof creatorCodes>;

export type GiveawayWithTalent = Giveaway & {
  talent: Talent;
};

export type CreatorCodeWithTalent = CreatorCode & {
  talent: Talent;
};

export type GiveawayWinnerWithGiveaway = GiveawayWinner & {
  giveaway: Giveaway;
};
