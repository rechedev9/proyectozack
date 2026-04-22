import { z } from 'zod';

const optStr = (max: number) =>
  z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(max).optional());

const optUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.url().optional(),
);

const optEmail = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.email().max(180).optional(),
);

export const CRM_BRAND_STATUSES = ['lead', 'activa', 'pausada', 'archivada'] as const;
export type CrmBrandStatus = (typeof CRM_BRAND_STATUSES)[number];

const brandFields = z.object({
  name: z.string().min(1).max(200),
  legalName: optStr(250),
  website: optUrl,
  sector: optStr(80),
  country: optStr(2),
  status: z.enum(CRM_BRAND_STATUSES).default('lead'),
  ownerUserId: optStr(100),
  portalUserId: optStr(100),
  notes: z.string().optional(),
});

export const createCrmBrandSchema = brandFields;
export const updateCrmBrandSchema = brandFields.partial().extend({
  id: z.coerce.number().int().positive(),
});

export type CreateCrmBrandInput = z.infer<typeof createCrmBrandSchema>;
export type UpdateCrmBrandInput = z.infer<typeof updateCrmBrandSchema>;

const contactFields = z.object({
  brandId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(150),
  role: optStr(100),
  email: optEmail,
  phone: optStr(40),
  telegram: optStr(80),
  whatsapp: optStr(40),
  isPrimary: z.coerce.boolean().optional().default(false),
});

export const createBrandContactSchema = contactFields;
export const updateBrandContactSchema = contactFields.partial().extend({
  id: z.coerce.number().int().positive(),
});

export type CreateBrandContactInput = z.infer<typeof createBrandContactSchema>;
export type UpdateBrandContactInput = z.infer<typeof updateBrandContactSchema>;
