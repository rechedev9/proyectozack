import { getAllTargets } from '@/lib/queries/targets';
import { getAllBrandUsers } from '@/lib/queries/brandUsers';
import { TargetsSpreadsheet } from './TargetsSpreadsheet';
import { TargetsDiagnostics } from './TargetsDiagnostics';

export default async function AdminTargetsPage(): Promise<React.ReactElement> {
  const [targets, brands] = await Promise.all([
    getAllTargets(),
    getAllBrandUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="font-display text-3xl font-black uppercase text-sp-admin-text">Targets</h1>
        <span className="text-xs text-sp-admin-muted tabular-nums">
          {targets.length} targets
        </span>
      </div>

      <p className="text-sm text-sp-admin-muted -mt-3">
        Todo vive en targets: descubre perfiles, importalos y asigna cada fila a la marca que corresponda.
      </p>

      <TargetsDiagnostics />
      <TargetsSpreadsheet targets={targets} brands={brands} />
    </div>
  );
}
