import type { CrmTaskStatus } from '@/types';

const STYLES: Record<CrmTaskStatus, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  en_progreso: { label: 'En progreso', cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  completada: { label: 'Completada', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

export function TaskStatusBadge({ status }: { readonly status: CrmTaskStatus }): React.ReactElement {
  const { label, cls } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
