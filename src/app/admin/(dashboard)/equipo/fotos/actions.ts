'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { teamMembers } from '@/db/schema';
import { requireRole } from '@/lib/auth-guard';

export async function uploadTeamPhotoAction(formData: FormData): Promise<{ error?: string }> {
  await requireRole('admin', '/admin/login');

  const id = Number(formData.get('id'));
  const file = formData.get('photo') as File | null;

  if (!id || !file || file.size === 0) return { error: 'Datos incompletos' };
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' };
  if (file.size > 5 * 1024 * 1024) return { error: 'La imagen no puede superar 5 MB' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const blob = await put(`team/${id}-${Date.now()}.${ext}`, file, { access: 'public' });

  await db.update(teamMembers).set({ photoUrl: blob.url }).where(eq(teamMembers.id, id));

  revalidatePath('/admin/equipo/fotos');
  revalidatePath('/nosotros');
  revalidatePath('/');
  return {};
}
