import { requireRole } from '@/lib/auth-guard';
import { getStatsRollup, getActiveStatsShares } from '@/lib/queries/stats';
import { env } from '@/lib/env';
import { StatsTable } from '@/components/admin/stats/StatsTable';
import { ShareLinkPanel } from '@/components/admin/stats/ShareLinkPanel';
import { StatsExportPanel } from '@/components/admin/stats/StatsExportPanel';
import { StatsImportPanel } from '@/components/admin/stats/StatsImportPanel';
import { KpiCards } from '@/components/stats/KpiCards';
import type { ReactElement } from 'react';
import type { CurrentTalent } from '@/lib/statsImport';

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

  const importerRoster: CurrentTalent[] = rollup.rows.map((r) => ({
    id: r.id,
    name: r.name,
    socials: r.socials.map((s) => ({
      id: s.id,
      talentId: r.id,
      platform: s.platform,
      handle: s.handle,
      followersDisplay: s.followersDisplay,
      profileUrl: s.profileUrl,
      avgViewers: s.avgViewers,
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Stats</h1>
        <p className="text-sm text-sp-admin-muted mt-1">{rollup.channelCount} canales en el roster</p>
      </div>

      <KpiCards data={rollup} />

      <StatsImportPanel roster={importerRoster} />

      <StatsExportPanel rows={rollup.rows} />

      <ShareLinkPanel shares={shareRows} siteUrl={env.NEXT_PUBLIC_SITE_URL} />

      <StatsTable rows={rollup.rows} />
    </div>
  );
}
