'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import { createWinner, deleteWinner } from '@/lib/queries/giveawayWinners';

export async function createWinnerAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const giveawayId = Number(formData.get('giveawayId'));
  const winnerName = formData.get('winnerName') as string;
  const winnerAvatar = (formData.get('winnerAvatar') as string) || undefined;

  if (!giveawayId || !winnerName) return;

  await createWinner({ giveawayId, winnerName, winnerAvatar });
  revalidatePath('/admin/giveaways');
  revalidatePath('/giveaways');
}

export async function deleteWinnerAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  if (!id) return;
  await deleteWinner(id);
  revalidatePath('/admin/giveaways');
  revalidatePath('/giveaways');
}
