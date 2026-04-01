import { getAllTargets } from '@/lib/queries/targets';
import { getAllBrandUsers } from '@/lib/queries/brandUsers';
import { TargetsSpreadsheet } from './TargetsSpreadsheet';
import { TargetsDiagnostics } from './TargetsDiagnostics';
import { InstascoutCrawl } from './InstascoutCrawl';

export default async function AdminTargetsPage(): Promise<React.ReactElement> {
  const [targets, brands] = await Promise.all([
    getAllTargets(),
    getAllBrandUsers(),
  ]);

  const instascoutUrl = process.env.INSTASCOUT_URL ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="font-display text-3xl font-black uppercase text-sp-admin-text">Targets</h1>
        <span className="text-xs text-sp-admin-muted tabular-nums">
          {targets.length} targets
        </span>
        {instascoutUrl && (
          <a
            href={instascoutUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs font-semibold text-sp-admin-muted hover:text-sp-admin-text transition-colors"
          >
            Abrir instascout
          </a>
        )}
      </div>

      <p className="text-sm text-sp-admin-muted -mt-3">
        Todo vive en targets: descubre perfiles, importalos y asigna cada fila a la marca que corresponda.
      </p>

      <TargetsDiagnostics />
      <InstascoutCrawl />
      <TargetsSpreadsheet targets={targets} brands={brands} />
    </div>
  );
}
