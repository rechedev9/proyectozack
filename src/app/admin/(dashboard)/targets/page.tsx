import { getAllTargets, getTargetStats } from '@/lib/queries/targets';
import { TargetsSpreadsheet } from './TargetsSpreadsheet';

export default async function AdminTargetsPage(): Promise<React.ReactElement> {
  const [targets, stats] = await Promise.all([getAllTargets(), getTargetStats()]);

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="font-display text-3xl font-black uppercase text-sp-admin-text">Targets</h1>
        <span className="text-xs text-sp-admin-muted tabular-nums">
          {targets.length} prospectos
        </span>
      </div>

      <TargetsSpreadsheet targets={targets} stats={stats} />
    </div>
  );
}
