'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import {
  createCrmBrandSchema,
  updateCrmBrandSchema,
  createBrandContactSchema,
  updateBrandContactSchema,
} from '@/lib/schemas/crmBrand';
import {
  createCrmBrand,
  updateCrmBrand,
  deleteCrmBrand,
  createBrandContact,
  updateBrandContact,
  deleteBrandContact,
} from '@/lib/queries/crmBrands';

type ActionState = {
  readonly error?: string;
  readonly success?: boolean;
  readonly id?: number;
};

function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    obj[key] = value;
  }
  return obj;
}

/** Convert `undefined` to `null` for optional NOT NULL → nullable mapping. */
function nullify<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === undefined ? null : v;
  return out;
}

/** Drop `undefined` entries entirely (for partial updates). */
function compact<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

export async function createBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = createCrmBrandSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    const row = await createCrmBrand(nullify(parsed.data) as Parameters<typeof createCrmBrand>[0]);
    revalidatePath('/admin/brands');
    return { success: true, id: row.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] createBrand error:', msg);
    return { error: 'Error al crear la marca' };
  }
}

export async function updateBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = updateCrmBrandSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const { id, ...rest } = parsed.data;
  try {
    await updateCrmBrand(id, compact(rest) as Partial<Parameters<typeof updateCrmBrand>[1]>);
    revalidatePath('/admin/brands');
    revalidatePath(`/admin/brands/${id}`);
    return { success: true, id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] updateBrand error:', msg);
    return { error: 'Error al actualizar la marca' };
  }
}

export async function deleteBrandAction(id: number): Promise<ActionState> {
  await requireRole('admin', '/admin/login');
  try {
    await deleteCrmBrand(id);
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] deleteBrand error:', msg);
    return { error: 'Error al eliminar la marca' };
  }
}

export async function createContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = createBrandContactSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    const row = await createBrandContact(nullify(parsed.data) as Parameters<typeof createBrandContact>[0]);
    revalidatePath('/admin/brands');
    revalidatePath(`/admin/brands/${parsed.data.brandId}`);
    return { success: true, id: row.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] createContact error:', msg);
    return { error: 'Error al crear el contacto' };
  }
}

export async function updateContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = updateBrandContactSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const { id, ...rest } = parsed.data;
  try {
    await updateBrandContact(id, compact(rest) as Partial<Parameters<typeof updateBrandContact>[1]>);
    revalidatePath('/admin/brands');
    if (rest.brandId) revalidatePath(`/admin/brands/${rest.brandId}`);
    return { success: true, id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] updateContact error:', msg);
    return { error: 'Error al actualizar el contacto' };
  }
}

export async function deleteContactAction(id: number, brandId: number): Promise<ActionState> {
  await requireRole('admin', '/admin/login');
  try {
    await deleteBrandContact(id);
    revalidatePath('/admin/brands');
    revalidatePath(`/admin/brands/${brandId}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] deleteContact error:', msg);
    return { error: 'Error al eliminar el contacto' };
  }
}
