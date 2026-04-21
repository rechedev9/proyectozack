import { Suspense, type ReactElement } from 'react';
import type { Metadata } from 'next';
import { requireAnyRole } from '@/lib/auth-guard';
import { getTasksForWeek, getUsedCategories } from '@/lib/queries/crmTasks';
import { getAllStaffUsers } from '@/lib/queries/staffUsers';
import { getIsoWeekLabel } from '@/lib/week';
import { TaskList } from '@/components/admin/tasks/TaskList';

export const metadata: Metadata = { title: 'Tareas | Admin' };

export default async function TareasPage(): Promise<ReactElement> {
  const session = await requireAnyRole(['admin', 'staff'], '/admin/login');
  const weekLabel = getIsoWeekLabel(new Date());

  const [tasks, users, suggestedCategories] = await Promise.all([
    getTasksForWeek(weekLabel),
    getAllStaffUsers(),
    getUsedCategories(),
  ]);

  const userOptions: readonly { readonly id: string; readonly name: string }[] = users.map((u) => ({
    id: u.id,
    name: u.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Tareas</h1>
        <p className="text-sm text-sp-admin-muted mt-1">Semana actual del equipo</p>
      </div>

      <Suspense fallback={<div className="text-sm text-sp-admin-muted">Cargando tareas…</div>}>
        <TaskList
          tasks={tasks}
          users={userOptions}
          currentUserId={session.user.id}
          suggestedCategories={suggestedCategories}
          weekLabel={weekLabel}
        />
      </Suspense>
    </div>
  );
}
