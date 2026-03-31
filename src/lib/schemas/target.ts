import { z } from 'zod';

// CSV booleans arrive as the string "true"/"false" from instascout's Go CSV encoder
const csvBool = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'string' ? v === 'true' : v))
  .optional();

// ─── CSV row from instascout export ─────────────────────────────────────────
// Matches the 15 columns emitted by internal/export/export.go:18-23

export const csvTargetRowSchema = z.object({
  username: z.string().min(1).max(200),
  full_name: z.string().max(300).optional(),
  biography: z.string().optional(),
  followers: z.coerce.number().int().nonnegative().default(0),
  following: z.coerce.number().int().nonnegative().optional(),
  posts: z.coerce.number().int().nonnegative().optional(),
  is_private: csvBool,
  is_verified: csvBool,
  is_business: csvBool,
  is_creator: csvBool,
  business_category: z.string().max(200).optional(),
  external_url: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  profile_pic_url: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  discovered_via: z.string().max(200).optional(),
  enriched_at: z.coerce.date().optional(),
});

export type CsvTargetRow = z.infer<typeof csvTargetRowSchema>;

// ─── Manual create ───────────────────────────────────────────────────────────

const targetFields = z.object({
  username: z.string().min(1).max(200),
  fullName: z.string().max(300).optional(),
  platform: z.enum(['instagram', 'youtube']),
  profileUrl: z.url(),
  profilePicUrl: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  followers: z.coerce.number().int().nonnegative().default(0),
  following: z.coerce.number().int().nonnegative().optional(),
  posts: z.coerce.number().int().nonnegative().optional(),
  bio: z.string().optional(),
  externalUrl: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  isPrivate: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isBusiness: z.boolean().optional(),
  isCreator: z.boolean().optional(),
  businessCategory: z.string().max(200).optional(),
  notes: z.string().optional(),
  discoveredVia: z.string().max(200).optional(),
  enrichedAt: z.coerce.date().optional(),
});

export const createTargetSchema = targetFields;
export const updateTargetSchema = targetFields.partial();

export const updateTargetStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['pendiente', 'contactado', 'finalizado']),
});

export const updateTargetNotesSchema = z.object({
  id: z.coerce.number().int().positive(),
  notes: z.string(),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  status: z.enum(['pendiente', 'contactado', 'finalizado']),
});

export type CreateTargetInput = z.infer<typeof createTargetSchema>;
export type UpdateTargetInput = z.infer<typeof updateTargetSchema>;
export type UpdateTargetStatusInput = z.infer<typeof updateTargetStatusSchema>;
export type UpdateTargetNotesInput = z.infer<typeof updateTargetNotesSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
