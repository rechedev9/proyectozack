'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { testimonials } from '@/db/schema';

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}
