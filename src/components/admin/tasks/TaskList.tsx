'use client';

import { useMemo, useState, useTransition } from 'react';
import type { CrmTask, CrmTaskStatus } from '@/types';
import { Avatar } from '@/components/admin/Avatar';
import { PriorityBadge } from './PriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskModal } from './TaskModal';
import { completeTaskAction, deleteTaskAction } from '@/app/admin/(dashboard)/tareas/actions';

type UserOption = {
  readonly id: string;
  readonly name: string;
};

type Props = {
  readonly tasks: readonly CrmTask[];
  readonly users: readonly UserOption[];
  readonly currentUserId: string;
  readonly suggestedCategories: readonly string[];
  readonly weekLabel: string;
};

type StatusFilter = 'todos' | CrmTaskStatus;

const STATUS_TABS: readonly { readonly key: StatusFilter; readonly label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'en_progreso', label: 'En progreso' },
  { key: 'completada', label: 'Completadas' },
];

export function TaskList({ tasks, users, currentUserId, suggestedCategories, weekLabel }: Props): React.ReactElement {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [ownerFilter, setOwnerFilter] = useState<string>('todos');
  const [editing, setEditing] = useState<CrmTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const usersById = useMemo(() => {
    const map = new Map<string, UserOption>();
    for (const u of users) map.set(u.id, u);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'todos' && t.status !== statusFilter) return false;
      if (ownerFilter !== 'todos' && t.ownerId !== ownerFilter) return false;
      if (needle && !t.title.toLowerCase().includes(needle) && !t.category.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [tasks, statusFilter, ownerFilter, search]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { todos: tasks.length, pendiente: 0, en_progreso: 0, completada: 0 };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  const openCreate = (): void => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: CrmTask): void => {
    setEditing(task);
    setModalOpen(true);
  };

  const toggleComplete = (task: CrmTask): void => {
    if (task.status === 'completada') return; // re-open flow not in Fase 1
    startTransition(async () => {
      await completeTaskAction(task.id);
    });
  };

  const remove = (task: CrmTask): void => {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    startTransition(async () => {
      await deleteTaskAction(task.id);
    });
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-sp-admin-accent bg-sp-admin-accent/10 text-sp-admin-accent'
                    : 'border-sp-admin-border text-sp-admin-muted hover:text-sp-admin-text'
                }`}
              >
                {tab.label} <span className="ml-1 opacity-60">{counts[tab.key]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="rounded-lg border border-sp-admin-border bg-sp-admin-card px-3 py-1.5 text-sm text-sp-admin-text placeholder:text-sp-admin-muted focus:border-sp-admin-accent focus:outline-none"
          />
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="rounded-lg border border-sp-admin-border bg-sp-admin-card px-3 py-1.5 text-sm text-sp-admin-text"
          >
            <option value="todos">Todos</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-sp-admin-accent px-3 py-1.5 text-xs font-bold text-sp-admin-bg"
          >
            + Añadir
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-sp-admin-border bg-sp-admin-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-admin-border/60 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
              <th className="px-3 py-3 w-10"></th>
              <th className="px-3 py-3">Título</th>
              <th className="px-3 py-3">Prioridad</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Categoría</th>
              <th className="px-3 py-3">Límite</th>
              <th className="px-3 py-3">Asignado</th>
              <th className="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-admin-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sp-admin-muted">
                  No hay tareas que cumplan los filtros.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const owner = usersById.get(t.ownerId);
                const mine = t.ownerId === currentUserId;
                const isDone = t.status === 'completada';
                return (
                  <tr
                    key={t.id}
                    className={`${mine ? 'bg-sp-admin-accent/5' : ''} hover:bg-sp-admin-hover`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleComplete(t)}
                        disabled={isDone}
                        aria-label={`Completar ${t.title}`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => openEdit(t)} className="text-left">
                        <span className={`font-medium ${isDone ? 'text-sp-admin-muted line-through' : 'text-sp-admin-text'}`}>
                          {t.title}
                        </span>
                        {t.rolledOver && (
                          <span className="ml-2 text-[10px] text-amber-400" title={`Arrastrada de ${t.rolledFromWeek}`}>↻</span>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2.5"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-3 py-2.5"><TaskStatusBadge status={t.status} /></td>
                    <td className="px-3 py-2.5 text-sp-admin-muted">{t.category}</td>
                    <td className="px-3 py-2.5 text-sp-admin-muted">{t.dueDate ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar userId={owner.id} name={owner.name} size="sm" highlight={mine} />
                          <span className="text-xs text-sp-admin-muted">{owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-sp-admin-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => remove(t)}
                        className="text-sp-admin-muted hover:text-red-400"
                        aria-label="Eliminar"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-sp-admin-muted">Semana actual: <span className="font-semibold text-sp-admin-text">{weekLabel}</span></p>

      {modalOpen && (
        <TaskModal
          key={editing?.id ?? 'new'}
          onClose={() => setModalOpen(false)}
          task={editing}
          users={users}
          suggestedCategories={suggestedCategories}
          defaultOwnerId={currentUserId}
        />
      )}
    </>
  );
}
