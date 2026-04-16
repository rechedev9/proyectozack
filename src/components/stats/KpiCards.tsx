import type { StatsRollup } from '@/lib/queries/stats';
import type { ReactElement } from 'react';

type Props = {
  readonly data: StatsRollup;
  readonly emptyGeoHint?: string;
};

export function KpiCards({ data, emptyGeoHint }: Props): ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
          Total Reach (seguidores)
        </p>
        <p className="font-display text-4xl font-black text-sp-admin-text tabular-nums">
          {data.totalReachFormatted}
        </p>
        <p className="text-xs text-sp-admin-muted mt-1">seguidores totales en todos los canales</p>
      </div>

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
          <p className="text-sm text-sp-admin-muted/60 mt-1">
            Sin datos de geo{emptyGeoHint ? ` — ${emptyGeoHint}` : ''}
          </p>
        )}
      </div>

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
  );
}
