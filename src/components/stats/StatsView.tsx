import type { StatsRollup } from '@/lib/queries/stats';
import type { ReactElement } from 'react';

type Props = {
  readonly data: StatsRollup;
  readonly title?: string;
};

export function StatsView({ data, title = 'Stats' }: Props): ReactElement {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">{title}</h1>
        <p className="text-sm text-sp-admin-muted mt-1">{data.channelCount} canales</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Reach */}
        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Total Reach (seguidores)
          </p>
          <p className="font-display text-4xl font-black text-sp-admin-text tabular-nums">
            {data.totalReachFormatted}
          </p>
          <p className="text-xs text-sp-admin-muted mt-1">seguidores totales en todos los canales</p>
        </div>

        {/* Top GEOs */}
        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Top GEOs
          </p>
          {data.topGeoAggregate.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.topGeoAggregate.map(({ country }) => (
                <span
                  key={country}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sp-admin-border text-sp-admin-text"
                >
                  {country}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sp-admin-muted/60 mt-1">Sin datos de geo</p>
          )}
        </div>

        {/* Channels */}
        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Canales
          </p>
          <p className="font-display text-4xl font-black text-sp-admin-text tabular-nums">
            {data.channelCount}
          </p>
          <p className="text-xs text-sp-admin-muted mt-1">
            promedio {data.avgReachFormatted} / canal
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted w-10">#</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted">Canal</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted">Top GEO</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted w-24">Idioma</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted text-right w-28">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-admin-border/60">
              {data.rows.map((row, i) => {
                const primarySocial = row.socials[0];
                const profileUrl = primarySocial?.profileUrl ?? null;
                return (
                  <tr key={row.id} className="hover:bg-sp-admin-hover transition-colors">
                    <td className="px-4 py-3 text-xs text-sp-admin-muted tabular-nums">{i + 1}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
