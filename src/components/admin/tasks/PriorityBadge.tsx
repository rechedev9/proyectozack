import type { CrmTaskPriority } from '@/types';

const STYLES: Record<CrmTaskPriority, { label: string; cls: string }> = {
  alta: { label: 'Alta', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  media: { label: 'Media', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  baja: { label: 'Baja', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function PriorityBadge({ priority }: { readonly priority: CrmTaskPriority }): React.ReactElement {
  const { label, cls } = STYLES[priority];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
