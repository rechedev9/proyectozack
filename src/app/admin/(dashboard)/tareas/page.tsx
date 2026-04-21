import type { ReactElement } from 'react';
import { requireAnyRole } from '@/lib/auth-guard';
import { getTasksForWeek, getUsedCategories } from '@/lib/queries/crmTasks';
import { getAllStaffUsers } from '@/lib/queries/staffUsers';
import { getIsoWeekLabel } from '@/lib/week';
import { TaskList } from '@/components/admin/tasks/TaskList';

export const metadata = { title: 'Tareas | Admin' };

export default async function TareasPage(): Promise<ReactElement> {
  const session = await requireAnyRole(['admin', 'staff'], '/admin/login');
  const weekLabel = getIsoWeekLabel(new Date());

  const [tasks, users, suggestedCategories] = await Promise.all([
    getTasksForWeek(weekLabel),
    getAllStaffUsers(),
    getUsedCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Tareas</h1>
        <p className="text-sm text-sp-admin-muted mt-1">Semana actual del equipo</p>
      </div>

      <TaskList
        tasks={tasks}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
        currentUserId={session.user.id}
        suggestedCategories={suggestedCategories}
        weekLabel={weekLabel}
      />
    </div>
  );
}
