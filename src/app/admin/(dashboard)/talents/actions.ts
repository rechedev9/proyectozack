'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { talents, talentSocials } from '@/db/schema';
import { requireRole } from '@/lib/auth-guard';

export async function deleteTalentAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  if (!id) return;
  await db.delete(talents).where(eq(talents.id, id));
  revalidatePath('/admin/talents');
  revalidatePath('/');
}

export async function updateTalentBioAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');
  const id = Number(formData.get('id'));
  const bio = String(formData.get('bio') ?? '');
  if (!id || !bio) return;
  await db.update(talents).set({ bio }).where(eq(talents.id, id));
  revalidatePath('/admin/talents');
  revalidatePath('/');
}

const STATUS_VALUES = ['active', 'available', 'inactive'] as const;
type TalentStatus = (typeof STATUS_VALUES)[number];

export async function setTalentStatusAction(talentId: number, status: TalentStatus): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin', '/admin/login');
  if (!STATUS_VALUES.includes(status)) return { success: false, error: 'Estado inválido' };
  if (!talentId) return { success: false, error: 'ID inválido' };
  try {
    await db.update(talents).set({ status }).where(eq(talents.id, talentId));
    revalidatePath('/admin/talents');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('[admin] setTalentStatus error:', err);
    return { success: false, error: 'Error al actualizar estado' };
  }
}

type GeoEntry = { country: string; pct: number };

export async function updateSocialGeoAction(socialId: number, topGeos: readonly GeoEntry[]): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin', '/admin/login');
  if (!socialId) return { success: false, error: 'ID inválido' };

  const cleaned: GeoEntry[] = [];
  for (const entry of topGeos) {
    if (typeof entry?.country !== 'string' || typeof entry?.pct !== 'number') continue;
    const country = entry.country.trim().toUpperCase().slice(0, 3);
    if (!country) continue;
    const pct = Math.max(0, Math.min(100, Math.round(entry.pct * 10) / 10));
    cleaned.push({ country, pct });
  }

  try {
    await db
      .update(talentSocials)
      .set({ topGeos: cleaned.length > 0 ? cleaned : null })
      .where(eq(talentSocials.id, socialId));
    revalidatePath('/admin/talents');
    return { success: true };
  } catch (err) {
    console.error('[admin] updateSocialGeo error:', err);
    return { success: false, error: 'Error al guardar geo' };
  }
}
