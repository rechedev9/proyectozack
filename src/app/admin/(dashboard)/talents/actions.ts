'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { talents } from '@/db/schema';

export async function deleteTalentAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  await db.delete(talents).where(eq(talents.id, id));
  revalidatePath('/admin/talents');
  revalidatePath('/');
}

export async function updateTalentBioAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const bio = String(formData.get('bio') ?? '');
  if (!id || !bio) return;
  await db.update(talents).set({ bio }).where(eq(talents.id, id));
  revalidatePath('/admin/talents');
  revalidatePath('/');
}
