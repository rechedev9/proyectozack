import { asc, inArray } from 'drizzle-orm';
import { user } from '@/db/schema';
import { db } from '@/lib/db';

export type StaffUserRow = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string | null;
};

/** Admins and staff — the internal team that can own CRM tasks. */
export async function getAllStaffUsers(): Promise<readonly StaffUserRow[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .where(inArray(user.role, ['admin', 'staff']))
    .orderBy(asc(user.name));
}
