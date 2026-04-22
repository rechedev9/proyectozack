'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAnyRole } from '@/lib/auth-guard';
import {
  completeTask,
  createTask,
  deleteTask,
  isStaffUser,
  updateTask,
} from '@/lib/queries/crmTasks';
import { taskFormSchema, taskPatchSchema } from '@/lib/schemas/task';
import { getIsoWeekLabel } from '@/lib/week';

export type { TaskFormInput } from '@/lib/schemas/task';

type ActionResult = { readonly error?: string };

function revalidateAll(): void {
  revalidatePath('/admin/tareas');
  revalidatePath('/admin/mi-semana');
  revalidatePath('/admin/equipo');
}

function weekLabelForDueDate(dueDate: string | null): string {
  if (!dueDate) return getIsoWeekLabel(new Date());
  // `dueDate` is YYYY-MM-DD civil in Madrid. Parse as Madrid noon to avoid TZ edges.
  const [y, m, d] = dueDate.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    return getIsoWeekLabel(new Date());
  }
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 10, 0, 0)); // 10 UTC = ~noon Madrid
  return getIsoWeekLabel(noonUtc);
}

async function assertStaffOwner(ownerId: string): Promise<string | null> {
  const ok = await isStaffUser(ownerId);
  return ok ? null : 'El usuario asignado debe ser admin o staff';
}

function compactPatch<T extends Record<string, unknown>>(
  patch: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) result[key] = value;
  }
  return result as { [K in keyof T]?: Exclude<T[K], undefined> };
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');

  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const data = parsed.data;
  const ownerErr = await assertStaffOwner(data.ownerId);
  if (ownerErr) return { error: ownerErr };

  await createTask({
    title: data.title,
    description: data.description,
    ownerId: data.ownerId,
    dueDate: data.dueDate,
    priority: data.priority,
    status: data.status,
    category: data.category,
    weekLabel: weekLabelForDueDate(data.dueDate),
    relatedType: data.relatedType ?? null,
    relatedId: data.relatedId ?? null,
  });

  revalidateAll();
  return {};
}

export async function updateTaskAction(id: number, input: unknown): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');

  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const ownerErr = await assertStaffOwner(parsed.data.ownerId);
  if (ownerErr) return { error: ownerErr };

  await updateTask(id, {
    ...parsed.data,
    relatedType: parsed.data.relatedType ?? null,
    relatedId: parsed.data.relatedId ?? null,
  });
  revalidateAll();
  return {};
}

export async function updateTaskPartialAction(
  id: unknown,
  input: unknown,
): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');

  const parsedId = z.number().int().positive().safeParse(id);
  if (!parsedId.success) return { error: 'ID inválido' };

  const parsed = taskPatchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  if (parsed.data.ownerId !== undefined) {
    const ownerErr = await assertStaffOwner(parsed.data.ownerId);
    if (ownerErr) return { error: ownerErr };
  }

  const updated = await updateTask(parsedId.data, compactPatch(parsed.data));
  if (updated === null) return { error: 'Tarea no encontrada' };

  revalidateAll();
  return {};
}

export async function completeTaskAction(id: number): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');
  await completeTask(id);
  revalidateAll();
  return {};
}

export async function deleteTaskAction(id: number): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');
  await deleteTask(id);
  revalidateAll();
  return {};
}
