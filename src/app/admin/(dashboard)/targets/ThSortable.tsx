import type { SortField, SortState } from './targets-constants';

type ThProps = {
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  field?: SortField;
  sort?: SortState;
  onSort?: (field: SortField) => void;
  arrow?: (field: SortField) => string;
};

export function Th({ children, className = '', sortable, field, sort, onSort, arrow }: ThProps): React.ReactElement {
  const base = `px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted whitespace-nowrap ${className}`;

  if (!sortable || !field || !onSort) {
    return <th className={base}>{children}</th>;
  }

  const isActive = sort?.field === field;
  const indicator = arrow?.(field) ?? '';

  return (
    <th className={base}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-0.5 transition-colors ${isActive ? 'text-sp-admin-text' : 'hover:text-sp-admin-text'}`}
      >
        {children}
        {indicator && <span className="text-sp-admin-accent">{indicator}</span>}
      </button>
    </th>
  );
}
