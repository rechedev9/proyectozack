import { desc, eq } from 'drizzle-orm';

import { user } from '@/db/schema';
import { db } from '@/lib/db';

export type BrandUserRow = {
  id: string;
  name: string;
  email: string;
};

export async function getAllBrandUsers(): Promise<BrandUserRow[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.role, 'brand'))
    .orderBy(desc(user.createdAt));
}
