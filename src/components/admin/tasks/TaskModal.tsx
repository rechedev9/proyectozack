'use client';

import { useId, useState, useTransition } from 'react';
import type { CrmTask, CrmTaskPriority, CrmTaskStatus } from '@/types';
import { createTaskAction, updateTaskAction, type TaskFormInput } from '@/app/admin/(dashboard)/tareas/actions';

type UserOption = {
  readonly id: string;
  readonly name: string;
};

type Props = {
  readonly onClose: () => void;
  readonly task: CrmTask | null;
  readonly users: readonly UserOption[];
  readonly suggestedCategories: readonly string[];
  readonly defaultOwnerId: string;
};

const PRIORITIES: readonly CrmTaskPriority[] = ['alta', 'media', 'baja'];
const STATUSES: readonly CrmTaskStatus[] = ['pendiente', 'en_progreso', 'completada'];

export function TaskModal({ onClose, task, users, suggestedCategories, defaultOwnerId }: Props): React.ReactElement {
  const titleId = useId();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [ownerId, setOwnerId] = useState(task?.ownerId ?? defaultOwnerId);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [priority, setPriority] = useState<CrmTaskPriority>(task?.priority ?? 'media');
  const [status, setStatus] = useState<CrmTaskStatus>(task?.status ?? 'pendiente');
  const [category, setCategory] = useState(task?.category ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (): void => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!category.trim()) {
      setError('La categoría es obligatoria');
      return;
    }

    const input: TaskFormInput = {
      title: title.trim(),
      description: description.trim() || null,
      ownerId,
      dueDate: dueDate || null,
      priority,
      status,
      category: category.trim(),
    };

    startTransition(async () => {
      const result = task
        ? await updateTaskAction(task.id, input)
        : await createTaskAction(input);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="w-full max-w-lg rounded-2xl border border-sp-admin-border bg-sp-admin-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-xl font-black uppercase text-sp-admin-text">
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button type="button" onClick={onClose} className="text-sp-admin-muted hover:text-sp-admin-text" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <Field label="Título">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              autoFocus
              required
              maxLength={200}
            />
          </Field>

          <Field label="Descripción (opcional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Asignado">
              <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={inputCls}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Fecha límite">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Prioridad">
              <select value={priority} onChange={(e) => setPriority(e.target.value as CrmTaskPriority)} className={inputCls}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Estado">
              <select value={status} onChange={(e) => setStatus(e.target.value as CrmTaskStatus)} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </Field>

            <div className="col-span-2">
              <Field label="Categoría">
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="task-categories"
                  className={inputCls}
                  required
                  maxLength={40}
                  placeholder="ej. outreach, sales, ops…"
                />
                <datalist id="task-categories">
                  {suggestedCategories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-sp-admin-border px-4 py-2 text-sm text-sp-admin-muted hover:text-sp-admin-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-sp-admin-accent px-4 py-2 text-sm font-semibold text-sp-admin-bg disabled:opacity-60"
            >
              {isPending ? 'Guardando…' : task ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text placeholder:text-sp-admin-muted focus:border-sp-admin-accent focus:outline-none';

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }): React.ReactElement {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-sp-admin-muted">{label}</span>
      {children}
    </label>
  );
}
