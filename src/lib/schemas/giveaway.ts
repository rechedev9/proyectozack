import { z } from 'zod';

const giveawayFields = z.object({
  talentId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().max(500).optional(),
  brandName: z.string().min(1).max(150),
  brandLogo: z.string().url().max(500).optional(),
  value: z.string().max(50).optional(),
  redirectUrl: z.string().url(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  sortOrder: z.number().int().default(0),
});

export const createGiveawaySchema = giveawayFields.refine((d) => d.startsAt < d.endsAt, {
  message: 'starts_at must be before ends_at',
  path: ['endsAt'],
});

export const updateGiveawaySchema = giveawayFields.partial();

export type CreateGiveawayInput = z.infer<typeof createGiveawaySchema>;
export type UpdateGiveawayInput = z.infer<typeof updateGiveawaySchema>;
