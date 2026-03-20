import { db } from '@/lib/db';
import { agencyCreators } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function getAgencyCreators() {
  return db.select().from(agencyCreators).orderBy(agencyCreators.name);
}

export async function countAgencyCreators(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(agencyCreators);
  return result[0]?.count ?? 0;
}

export async function getAgencyCreatorCountries(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ country: agencyCreators.country })
    .from(agencyCreators)
    .where(sql`${agencyCreators.country} IS NOT NULL AND ${agencyCreators.country} != ''`)
    .orderBy(agencyCreators.country);
  return rows.map(r => r.country!);
}
