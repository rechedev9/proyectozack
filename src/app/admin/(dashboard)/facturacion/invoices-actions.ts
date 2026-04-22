'use server';

import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { requireRole } from '@/lib/auth-guard';
import { createInvoiceSchema, updateInvoiceSchema } from '@/lib/schemas/invoice';
import { createInvoice, updateInvoice, deleteInvoice, getInvoice } from '@/lib/queries/invoices';

type ActionState = {
  readonly error?: string;
  readonly success?: boolean;
  readonly id?: number;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    obj[key] = value;
  }
  return obj;
}

function compact<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

function nullify<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === undefined ? null : v;
  return out;
}

async function uploadAttachment(file: File, kind: 'income' | 'expense'): Promise<{ url: string; path: string }> {
  const year = new Date().getFullYear();
  const safeName = file.name.replace(/[^\w.\-]/g, '_');
  const path = `invoices/${kind}/${year}/${Date.now()}-${safeName}`;
  const blob = await put(path, file, { access: 'public', contentType: file.type });
  return { url: blob.url, path };
}

export async function createInvoiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = createInvoiceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const file = formData.get('file');
  let attachment: { url: string; path: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_MIME.includes(file.type)) return { error: 'Tipo de archivo no permitido (PDF, JPG, PNG, WebP)' };
    if (file.size > MAX_FILE_BYTES) return { error: 'El archivo no puede superar 10 MB' };
    try {
      attachment = await uploadAttachment(file, parsed.data.kind);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      console.error('[admin] invoice upload error:', msg);
      return { error: 'Error al subir el archivo' };
    }
  }

  try {
    const values = nullify({
      ...parsed.data,
      fileUrl: attachment?.url,
      filePath: attachment?.path,
    });
    const row = await createInvoice(values as Parameters<typeof createInvoice>[0]);
    revalidatePath('/admin/facturacion');
    return { success: true, id: row.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] createInvoice error:', msg);
    return { error: 'Error al crear la factura' };
  }
}

export async function updateInvoiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole('admin', '/admin/login');

  const parsed = updateInvoiceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const { id, ...rest } = parsed.data;

  const file = formData.get('file');
  let attachment: { url: string; path: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_MIME.includes(file.type)) return { error: 'Tipo de archivo no permitido' };
    if (file.size > MAX_FILE_BYTES) return { error: 'El archivo no puede superar 10 MB' };
    try {
      const existing = await getInvoice(id);
      if (existing?.filePath) {
        try { await del(existing.filePath); } catch { /* ignore */ }
      }
      attachment = await uploadAttachment(file, (rest.kind ?? existing?.kind ?? 'income'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      console.error('[admin] invoice upload error:', msg);
      return { error: 'Error al subir el archivo' };
    }
  }

  try {
    const patch = compact({
      ...rest,
      ...(attachment ? { fileUrl: attachment.url, filePath: attachment.path } : {}),
    });
    await updateInvoice(id, patch as Partial<Parameters<typeof updateInvoice>[1]>);
    revalidatePath('/admin/facturacion');
    return { success: true, id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] updateInvoice error:', msg);
    return { error: 'Error al actualizar la factura' };
  }
}

export async function deleteInvoiceAction(id: number): Promise<ActionState> {
  await requireRole('admin', '/admin/login');
  try {
    const existing = await getInvoice(id);
    if (existing?.filePath) {
      try { await del(existing.filePath); } catch { /* ignore */ }
    }
    await deleteInvoice(id);
    revalidatePath('/admin/facturacion');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] deleteInvoice error:', msg);
    return { error: 'Error al eliminar la factura' };
  }
}

export async function markInvoicePaidAction(id: number): Promise<ActionState> {
  await requireRole('admin', '/admin/login');
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  try {
    await updateInvoice(id, { status: 'cobrada', paidDate: today });
    revalidatePath('/admin/facturacion');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] markPaid error:', msg);
    return { error: 'Error al marcar como cobrada' };
  }
}
