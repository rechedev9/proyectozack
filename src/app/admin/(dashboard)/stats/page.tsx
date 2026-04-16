import { requireRole } from '@/lib/auth-guard';
import { getStatsRollup, getActiveStatsShares } from '@/lib/queries/stats';
import { env } from '@/lib/env';
import { StatsTable } from '@/components/admin/stats/StatsTable';
import { ShareLinkPanel } from '@/components/admin/stats/ShareLinkPanel';
import type { ReactElement } from 'react';

export default async function AdminStatsPage(): Promise<ReactElement> {
  await requireRole('admin', '/admin/login');

  const [rollup, shares] = await Promise.all([
    getStatsRollup(),
    getActiveStatsShares(),
  ]);

  const shareRows = shares.map((s) => ({
    id: s.id,
    token: s.token,
    createdAt: s.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Stats</h1>
        <p className="text-sm text-sp-admin-muted mt-1">{rollup.channelCount} canales en el roster</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Total Reach (seguidores)
          </p>
          <p className="font-display text-4xl font-black text-sp-admin-text tabular-nums">
            {rollup.totalReachFormatted}
          </p>
          <p className="text-xs text-sp-admin-muted mt-1">seguidores totales en todos los canales</p>
        </div>

        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Top GEOs
          </p>
          {rollup.topGeoAggregate.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {rollup.topGeoAggregate.map(({ country }) => (
                <span
                  key={country}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sp-admin-border text-sp-admin-text"
                >
                  {country}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sp-admin-muted/60 mt-2">Sin datos de geo — edita cada creador</p>
          )}
        </div>

        <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted mb-2">
            Canales
          </p>
          <p className="font-display text-4xl font-black text-sp-admin-text tabular-nums">
            {rollup.channelCount}
          </p>
          <p className="text-xs text-sp-admin-muted mt-1">
            promedio {rollup.avgReachFormatted} / canal
          </p>
        </div>
      </div>

      {/* Share links */}
      <ShareLinkPanel shares={shareRows} siteUrl={env.NEXT_PUBLIC_SITE_URL} />

      {/* Ranked table with edit */}
      <StatsTable rows={rollup.rows} />
    </div>
  );
}
