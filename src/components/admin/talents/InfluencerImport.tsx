'use client';

import { useActionState } from 'react';
import { previewImportAction, confirmImportAction, type PreviewState, type ImportState } from '@/app/admin/(dashboard)/talents/import-actions';
import { TALENT_VERTICAL_LABELS } from '@/lib/schemas/talentBusiness';

const EMPTY_PREVIEW: PreviewState = { rows: [] };
const EMPTY_IMPORT: ImportState = {};

export function InfluencerImport(): React.ReactElement {
  const [preview, previewAction, previewPending] = useActionState(previewImportAction, EMPTY_PREVIEW);
  const [importResult, importAction, importPending] = useActionState(confirmImportAction, EMPTY_IMPORT);

  const validRows = preview.rows.filter((r) => !r.error);
  const invalidRows = preview.rows.filter((r) => r.error);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5 space-y-3">
        <h3 className="font-bold text-sp-admin-text">Formato CSV esperado</h3>
        <p className="text-xs text-sp-admin-muted">
          Columnas: <code className="font-mono bg-sp-admin-bg px-1 py-0.5 rounded">name, primary_platform, handle</code> (obligatorias) · <code className="font-mono bg-sp-admin-bg px-1 py-0.5 rounded">country, verticals, followers, profile_url</code> (opcionales)
        </p>
        <p className="text-xs text-sp-admin-muted">
          <strong>primary_platform</strong>: <code className="font-mono">twitch</code> o <code className="font-mono">youtube</code>.
          <strong className="ml-2">verticals</strong>: separados con <code className="font-mono">|</code> usando los identificadores: {Object.keys(TALENT_VERTICAL_LABELS).map((v) => <code key={v} className="font-mono mx-0.5">{v}</code>)}.
        </p>
        <pre className="text-[10px] bg-sp-admin-bg border border-sp-admin-border rounded p-3 overflow-x-auto text-sp-admin-muted">
{`name,primary_platform,handle,country,verticals,followers,profile_url
John Doe,twitch,johndoe_tv,ES,casino|cs2_cases,180000,https://twitch.tv/johndoe_tv
Jane Smith,youtube,@janesmith,MX,sports_betting,1200000,https://youtube.com/@janesmith`}
        </pre>
      </div>

      {/* Upload */}
      <form action={previewAction} className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5">
        <label className="block text-xs uppercase tracking-wider font-semibold text-sp-admin-muted mb-2">
          Archivo CSV (máx 2MB)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="flex-1 text-sm text-sp-admin-text file:mr-3 file:rounded-full file:border-0 file:bg-sp-admin-accent file:text-sp-admin-bg file:px-4 file:py-2 file:text-xs file:font-bold file:cursor-pointer"
          />
          <button
            type="submit"
            disabled={previewPending}
            className="px-4 py-2 rounded-full text-sm font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {previewPending ? 'Leyendo…' : 'Previsualizar'}
          </button>
        </div>
        {preview.error && <p className="text-xs text-red-400 mt-3">{preview.error}</p>}
      </form>

      {/* Preview */}
      {preview.rows.length > 0 && (
        <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-sp-admin-border p-4">
            <div>
              <h3 className="font-bold text-sp-admin-text text-sm">Previsualización</h3>
              <p className="text-xs text-sp-admin-muted">
                {validRows.length} válidas · {invalidRows.length} con error
              </p>
            </div>
            <form action={importAction}>
              <input type="hidden" name="rows" value={JSON.stringify(preview.rows)} />
              <button
                type="submit"
                disabled={importPending || validRows.length === 0}
                className="px-5 py-2 rounded-full text-sm font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {importPending ? 'Importando…' : `Importar ${validRows.length} filas válidas`}
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-sp-admin-bg/50 border-b border-sp-admin-border">
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Nombre</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Plataforma</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Handle</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">País</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Seguidores</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Sectores</th>
                  <th className="text-left px-3 py-2 font-semibold text-sp-admin-muted">Estado</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.rowNumber} className={`border-b border-sp-admin-border/50 last:border-0 ${r.error ? 'bg-red-500/5' : ''}`}>
                    <td className="px-3 py-2 text-sp-admin-muted font-mono">{r.rowNumber}</td>
                    <td className="px-3 py-2 font-medium text-sp-admin-text">{r.name || <em className="text-red-400">vacío</em>}</td>
                    <td className="px-3 py-2 text-sp-admin-muted">{r.primaryPlatform}</td>
                    <td className="px-3 py-2 text-sp-admin-muted font-mono">{r.handle || '—'}</td>
                    <td className="px-3 py-2 text-sp-admin-muted">{r.country ?? '—'}</td>
                    <td className="px-3 py-2 text-sp-admin-muted tabular-nums">{r.followersDisplay}</td>
                    <td className="px-3 py-2 text-sp-admin-muted">
                      {r.verticals.length > 0 ? r.verticals.join(', ') : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {r.error ? (
                        <span className="text-red-400 font-semibold">✕ {r.error}</span>
                      ) : r.warnings.length > 0 ? (
                        <span className="text-amber-400">⚠ {r.warnings.join('; ')}</span>
                      ) : (
                        <span className="text-emerald-400">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {importResult.success && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5">
          <p className="font-bold text-emerald-400 text-sm">
            ✓ {importResult.created} influencers creados · {importResult.skipped ?? 0} omitidos
          </p>
          {importResult.errors && importResult.errors.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-sp-admin-muted cursor-pointer font-semibold">
                Ver errores ({importResult.errors.length})
              </summary>
              <ul className="text-xs text-red-400 mt-2 space-y-1 font-mono">
                {importResult.errors.map((e, i) => <li key={i}>· {e}</li>)}
              </ul>
            </details>
          )}
          <p className="text-xs text-sp-admin-muted mt-2">
            Los influencers importados aparecen como <strong>inactive</strong> e <strong>internal</strong>. Revisa y activa desde la pestaña Tarjetas.
          </p>
        </div>
      )}
    </div>
  );
}
