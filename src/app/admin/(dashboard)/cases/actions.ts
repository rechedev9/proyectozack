'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { caseStudies } from '@/db/schema';
import { requireRole } from '@/lib/auth-guard';

export async function deleteCaseAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  if (!id) return;
  await db.delete(caseStudies).where(eq(caseStudies.id, id));
  revalidatePath('/admin/cases');
  revalidatePath('/');
}
