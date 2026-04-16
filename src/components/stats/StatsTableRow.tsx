import type { StatsRow } from '@/lib/queries/stats';
import type { ReactElement, ReactNode } from 'react';

type Props = {
  readonly row: StatsRow;
  readonly index: number;
  readonly actions?: ReactNode;
};

export function StatsTableRow({ row, index, actions }: Props): ReactElement {
  const profileUrl = row.socials[0]?.profileUrl ?? null;
  return (
    <tr className="hover:bg-sp-admin-hover transition-colors">
      <td className="px-4 py-3 text-xs text-sp-admin-muted tabular-nums">{index + 1}</td>
      <td className="px-4 py-3">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sp-admin-text hover:text-sp-admin-accent transition-colors text-[13px]"
          >
            {row.name}
          </a>
        ) : (
          <span className="font-semibold text-sp-admin-text text-[13px]">{row.name}</span>
        )}
        <span className="ml-2 text-[10px] text-sp-admin-muted uppercase">{row.platform}</span>
      </td>
      <td className="px-4 py-3 text-xs text-sp-admin-muted">
        {row.topGeos && row.topGeos.length > 0 ? (
          row.topGeos.map((g) => `${g.country} ${g.pct}%`).join(' / ')
        ) : (
          <span className="text-sp-admin-muted/30">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-sp-admin-text">
        {row.audienceLanguage ?? <span className="text-sp-admin-muted/30">—</span>}
      </td>
      <td className="px-4 py-3 text-right font-display text-sm font-bold text-sp-admin-text tabular-nums">
        {row.totalFollowers > 0 ? row.totalFormatted : <span className="text-sp-admin-muted/30">—</span>}
      </td>
      {actions !== undefined && <td className="px-4 py-3 text-right">{actions}</td>}
    </tr>
  );
}
