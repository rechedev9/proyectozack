'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import {
  updateBrandTargetNotes,
  updateBrandTargetStatus,
} from '@/lib/queries/targets';

const REVALIDATE = '/marcas/targets';

export async function updateBrandTargetStatusAction(formData: FormData): Promise<void> {
  const session = await requireRole('brand', '/marcas/login');

  const targetId = Number(formData.get('targetId'));
  const status = formData.get('status');
  if (!targetId || typeof status !== 'string') return;
  if (status !== 'pendiente' && status !== 'contactado' && status !== 'finalizado') return;

  await updateBrandTargetStatus(session.user.id, targetId, status);
  revalidatePath(REVALIDATE);
}

export async function updateBrandTargetNotesAction(formData: FormData): Promise<void> {
  const session = await requireRole('brand', '/marcas/login');

  const targetId = Number(formData.get('targetId'));
  const notes = formData.get('notes');
  if (!targetId || typeof notes !== 'string') return;

  await updateBrandTargetNotes(session.user.id, targetId, notes);
  revalidatePath(REVALIDATE);
}
