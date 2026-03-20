type Status = 'active' | 'available';

const LABELS: Record<Status, string> = {
  active: 'Activo',
  available: 'Disponible',
};

type StatusBadgeProps = {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`badge-${status} inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
