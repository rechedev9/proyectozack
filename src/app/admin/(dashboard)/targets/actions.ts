'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';
import {
  upsertTargetsFromCSV,
  updateTargetStatus,
  updateTargetNotes,
  createTarget,
  deleteTargets,
  bulkUpdateStatus,
  assignTargetsToBrand,
} from '@/lib/queries/targets';
import {
  csvTargetRowSchema,
  createTargetSchema,
  updateTargetStatusSchema,
  updateTargetNotesSchema,
  bulkStatusSchema,
} from '@/lib/schemas/target';
import { randomUUID } from 'crypto';

const REVALIDATE = '/admin/targets';

// ─── CSV import ───────────────────────────────────────────────────────────────

export async function importCSVAction(
  formData: FormData,
): Promise<{ total: number; inserted: number; updated: number; errors: number; assigned: number }> {
  await requireRole('admin', '/admin/login');

  const file = formData.get('file') as File | null;
  const brandUserId = (formData.get('brandUserId') as string | null)?.trim() ?? '';
  if (!file) return { total: 0, inserted: 0, updated: 0, errors: 0, assigned: 0 };

  const text = await file.text();
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return { total: 0, inserted: 0, updated: 0, errors: 0, assigned: 0 };

  const headers = parseCsvLine(lines[0]!).map((h) => h.trim());
  const batchId = randomUUID().slice(0, 8);

  const validRows = [];
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cols[idx] ?? '';
    });

    const parsed = csvTargetRowSchema.safeParse(raw);
    if (parsed.success) {
      validRows.push(parsed.data);
    } else {
      errors++;
    }
  }

  const { inserted, updated, ids } = await upsertTargetsFromCSV(validRows, batchId);
  let assigned = 0;

  if (brandUserId && ids.length > 0) {
    const result = await assignTargetsToBrand(brandUserId, ids);
    assigned = result.assigned;
  }

  revalidatePath(REVALIDATE);
  revalidatePath('/marcas');

  return { total: validRows.length + errors, inserted, updated, errors, assigned };
}

// ─── Status update ────────────────────────────────────────────────────────────

export async function updateStatusAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const parsed = updateTargetStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  });
  if (!parsed.success) return;

  await updateTargetStatus(parsed.data.id, parsed.data.status);
  revalidatePath(REVALIDATE);
}

// ─── Notes update ─────────────────────────────────────────────────────────────

export async function updateNotesAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const parsed = updateTargetNotesSchema.safeParse({
    id: formData.get('id'),
    notes: formData.get('notes') ?? '',
  });
  if (!parsed.success) return;

  await updateTargetNotes(parsed.data.id, parsed.data.notes);
  revalidatePath(REVALIDATE);
}

// ─── Manual create ────────────────────────────────────────────────────────────

export async function createTargetAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const raw = {
    username: formData.get('username') as string,
    fullName: (formData.get('fullName') as string) || undefined,
    platform: formData.get('platform') as string,
    profileUrl: formData.get('profileUrl') as string,
    followers: Number(formData.get('followers') ?? 0),
    bio: (formData.get('bio') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    discoveredVia: 'manual',
  };

  const parsed = createTargetSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('createTarget validation failed:', parsed.error.issues.map((e) => e.message).join(', '));
    return;
  }

  await createTarget(parsed.data);
  revalidatePath(REVALIDATE);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTargetsAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const raw = formData.get('ids') as string | null;
  if (!raw) return;

  const ids = raw
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  await deleteTargets(ids);
  revalidatePath(REVALIDATE);
}

// ─── Bulk status ──────────────────────────────────────────────────────────────

export async function bulkStatusAction(formData: FormData): Promise<void> {
  await requireRole('admin', '/admin/login');

  const raw = formData.get('ids') as string | null;
  const status = formData.get('status') as string | null;
  if (!raw || !status) return;

  const ids = raw
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  const parsed = bulkStatusSchema.safeParse({ ids, status });
  if (!parsed.success) return;

  await bulkUpdateStatus(parsed.data.ids, parsed.data.status);
  revalidatePath(REVALIDATE);
}

export async function assignTargetsToBrandAction(
  formData: FormData,
): Promise<{ assigned: number; updated: number }> {
  await requireRole('admin', '/admin/login');

  const rawIds = formData.get('ids') as string | null;
  const brandUserId = formData.get('brandUserId') as string | null;
  if (!rawIds || !brandUserId) return { assigned: 0, updated: 0 };

  const ids = rawIds
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  const result = await assignTargetsToBrand(brandUserId, ids);
  revalidatePath(REVALIDATE);
  revalidatePath('/marcas');
  return { assigned: result.assigned, updated: 0 };
}

// ─── CSV line parser (handles quoted fields) ──────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
