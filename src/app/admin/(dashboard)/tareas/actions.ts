'use server';

import { revalidatePath } from 'next/cache';
import { requireAnyRole } from '@/lib/auth-guard';
import { completeTask, createTask, deleteTask, updateTask } from '@/lib/queries/crmTasks';
import { taskFormSchema } from '@/lib/schemas/task';
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
  const noonUtc = new Date(Date.UTC(y!, m! - 1, d!, 10, 0, 0)); // 10 UTC = ~noon Madrid
  return getIsoWeekLabel(noonUtc);
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');

  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const data = parsed.data;
  await createTask({
    title: data.title,
    description: data.description,
    ownerId: data.ownerId,
    dueDate: data.dueDate,
    priority: data.priority,
    status: data.status,
    category: data.category,
    weekLabel: weekLabelForDueDate(data.dueDate),
  });

  revalidateAll();
  return {};
}

export async function updateTaskAction(id: number, input: unknown): Promise<ActionResult> {
  await requireAnyRole(['admin', 'staff'], '/admin/login');

  const parsed = taskFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  await updateTask(id, parsed.data);
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
