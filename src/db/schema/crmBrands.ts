import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const crmBrandStatusEnum = pgEnum('crm_brand_status', [
  'lead',
  'activa',
  'pausada',
  'archivada',
]);

export const crmBrands = pgTable(
  'crm_brands',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 200 }).notNull(),
    legalName: varchar('legal_name', { length: 250 }),
    website: text('website'),
    sector: varchar('sector', { length: 80 }),
    country: varchar('country', { length: 2 }),

    status: crmBrandStatusEnum('status').notNull().default('lead'),
    ownerUserId: text('owner_user_id').references(() => user.id, { onDelete: 'set null' }),

    portalUserId: text('portal_user_id').references(() => user.id, { onDelete: 'set null' }),

    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('crm_brands_status_idx').on(t.status),
    index('crm_brands_owner_idx').on(t.ownerUserId),
    index('crm_brands_portal_user_idx').on(t.portalUserId),
    index('crm_brands_name_idx').on(t.name),
  ],
);

export const crmBrandContacts = pgTable(
  'crm_brand_contacts',
  {
    id: serial('id').primaryKey(),
    brandId: integer('brand_id').notNull().references(() => crmBrands.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 150 }).notNull(),
    role: varchar('role', { length: 100 }),
    email: varchar('email', { length: 180 }),
    phone: varchar('phone', { length: 40 }),
    telegram: varchar('telegram', { length: 80 }),
    whatsapp: varchar('whatsapp', { length: 40 }),
    isPrimary: boolean('is_primary').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('crm_brand_contacts_brand_idx').on(t.brandId),
    index('crm_brand_contacts_email_idx').on(t.email),
  ],
);

export const crmBrandsRelations = relations(crmBrands, ({ one, many }) => ({
  owner: one(user, { fields: [crmBrands.ownerUserId], references: [user.id], relationName: 'crmBrandOwner' }),
  portalUser: one(user, { fields: [crmBrands.portalUserId], references: [user.id], relationName: 'crmBrandPortalUser' }),
  contacts: many(crmBrandContacts),
}));

export const crmBrandContactsRelations = relations(crmBrandContacts, ({ one }) => ({
  brand: one(crmBrands, { fields: [crmBrandContacts.brandId], references: [crmBrands.id] }),
}));
