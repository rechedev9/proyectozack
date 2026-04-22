import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { crmBrands, crmBrandContacts, user } from '@/db/schema';
import type {
  CrmBrand,
  CrmBrandContact,
  CrmBrandRow,
  CrmBrandWithContacts,
  NewCrmBrand,
  NewCrmBrandContact,
} from '@/types';

export async function listCrmBrands(): Promise<readonly CrmBrandRow[]> {
  const rows = await db
    .select({
      id: crmBrands.id,
      name: crmBrands.name,
      legalName: crmBrands.legalName,
      website: crmBrands.website,
      sector: crmBrands.sector,
      country: crmBrands.country,
      status: crmBrands.status,
      ownerUserId: crmBrands.ownerUserId,
      portalUserId: crmBrands.portalUserId,
      notes: crmBrands.notes,
      createdAt: crmBrands.createdAt,
      updatedAt: crmBrands.updatedAt,
      contactCount: sql<number>`(SELECT COUNT(*)::int FROM ${crmBrandContacts} WHERE ${crmBrandContacts.brandId} = ${crmBrands.id})`,
      ownerName: user.name,
    })
    .from(crmBrands)
    .leftJoin(user, eq(user.id, crmBrands.ownerUserId))
    .orderBy(desc(crmBrands.createdAt));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const primaryByBrand = new Map<number, CrmBrandContact>();
  const primaries = await db
    .select()
    .from(crmBrandContacts)
    .where(eq(crmBrandContacts.isPrimary, true));
  for (const c of primaries) {
    if (ids.includes(c.brandId)) primaryByBrand.set(c.brandId, c);
  }

  return rows.map((r) => ({
    ...r,
    primaryContact: primaryByBrand.get(r.id) ?? null,
  }));
}

export async function getCrmBrand(id: number): Promise<CrmBrandWithContacts | null> {
  const [brand] = await db.select().from(crmBrands).where(eq(crmBrands.id, id)).limit(1);
  if (!brand) return null;

  const contacts = await db
    .select()
    .from(crmBrandContacts)
    .where(eq(crmBrandContacts.brandId, id))
    .orderBy(desc(crmBrandContacts.isPrimary), asc(crmBrandContacts.name));

  return { ...brand, contacts };
}

export async function getBrandContacts(brandId: number): Promise<readonly CrmBrandContact[]> {
  return db
    .select()
    .from(crmBrandContacts)
    .where(eq(crmBrandContacts.brandId, brandId))
    .orderBy(desc(crmBrandContacts.isPrimary), asc(crmBrandContacts.name));
}

export async function createCrmBrand(values: NewCrmBrand): Promise<CrmBrand> {
  const [row] = await db.insert(crmBrands).values(values).returning();
  if (!row) throw new Error('Failed to insert crm brand');
  return row;
}

export async function updateCrmBrand(
  id: number,
  patch: Partial<NewCrmBrand>,
): Promise<CrmBrand | null> {
  const [row] = await db
    .update(crmBrands)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(crmBrands.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCrmBrand(id: number): Promise<void> {
  await db.delete(crmBrands).where(eq(crmBrands.id, id));
}

export async function createBrandContact(values: NewCrmBrandContact): Promise<CrmBrandContact> {
  if (values.isPrimary) {
    await db
      .update(crmBrandContacts)
      .set({ isPrimary: false })
      .where(eq(crmBrandContacts.brandId, values.brandId));
  }
  const [row] = await db.insert(crmBrandContacts).values(values).returning();
  if (!row) throw new Error('Failed to insert brand contact');
  return row;
}

export async function updateBrandContact(
  id: number,
  patch: Partial<NewCrmBrandContact>,
): Promise<CrmBrandContact | null> {
  if (patch.isPrimary) {
    const [contact] = await db.select({ brandId: crmBrandContacts.brandId }).from(crmBrandContacts).where(eq(crmBrandContacts.id, id));
    if (contact) {
      await db
        .update(crmBrandContacts)
        .set({ isPrimary: false })
        .where(and(eq(crmBrandContacts.brandId, contact.brandId)));
    }
  }
  const [row] = await db
    .update(crmBrandContacts)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(crmBrandContacts.id, id))
    .returning();
  return row ?? null;
}

export async function deleteBrandContact(id: number): Promise<void> {
  await db.delete(crmBrandContacts).where(eq(crmBrandContacts.id, id));
}
