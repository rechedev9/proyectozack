'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import {
  getTargetsDiagnosticsAction,
} from './diagnostics-actions';

import type {
  TargetsDiagnostics as TargetsDiagnosticsState,
} from './diagnostics-actions';

type Tone = 'ok' | 'warn' | 'error';

function toneClasses(tone: Tone): string {
  if (tone === 'ok') return 'bg-emerald-900/30 text-emerald-400';
  if (tone === 'warn') return 'bg-amber-900/30 text-amber-400';
  return 'bg-red-900/30 text-red-400';
}

type ItemProps = {
  readonly label: string;
  readonly status: string;
  readonly message: string;
  readonly tone: Tone;
  readonly href?: string;
};

function DiagnosticsItem({
  label,
  status,
  message,
  tone,
  href,
}: ItemProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-sp-admin-border bg-sp-admin-bg/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-sp-admin-text">{message}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${toneClasses(tone)}`}>
          {status}
        </span>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-[11px] text-sp-admin-muted hover:text-sp-admin-text transition-colors"
        >
          Abrir servicio
        </a>
      )}
    </div>
  );
}

export function TargetsDiagnostics(): React.ReactElement {
  const [diagnostics, setDiagnostics] = useState<TargetsDiagnosticsState | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback((): void => {
    startTransition(async () => {
      const next = await getTargetsDiagnosticsAction();
      setDiagnostics(next);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  const youtubeTone: Tone = diagnostics?.youtubeConfigured ? 'ok' : 'error';
  const instascoutServiceTone: Tone = !diagnostics
    ? 'warn'
    : diagnostics.instascoutConfigured && diagnostics.instascoutReachable
      ? 'ok'
      : diagnostics.instascoutConfigured
        ? 'warn'
        : 'error';
  const instascoutSessionTone: Tone = !diagnostics
    ? 'warn'
    : !diagnostics.instascoutConfigured || !diagnostics.instascoutReachable
      ? 'warn'
      : diagnostics.instascoutReadOnly
        ? 'error'
        : 'ok';

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-sp-admin-border px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-sp-admin-text">Diagnostico de servicios</p>
          <p className="text-xs text-sp-admin-muted">
            Estado en tiempo real de YouTube e Instascout
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="text-[11px] text-sp-admin-muted hover:text-sp-admin-text transition-colors disabled:opacity-40"
        >
          {isPending ? 'Comprobando...' : 'Actualizar'}
        </button>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-3">
        <DiagnosticsItem
          label="YouTube API"
          status={diagnostics?.youtubeConfigured ? 'OK' : 'FALTA CLAVE'}
          message={diagnostics?.youtubeMessage ?? 'Comprobando configuracion...'}
          tone={youtubeTone}
        />
        <DiagnosticsItem
          label="Instascout servicio"
          status={
            diagnostics
              ? diagnostics.instascoutConfigured && diagnostics.instascoutReachable
                ? 'ONLINE'
                : diagnostics.instascoutConfigured
                  ? 'SIN RESPUESTA'
                  : 'SIN CONFIG'
              : 'COMPROBANDO'
          }
          message={
            diagnostics?.instascoutServiceMessage ?? 'Comprobando conectividad con Instascout...'
          }
          tone={instascoutServiceTone}
          {...(diagnostics?.instascoutDashboardUrl
            ? { href: diagnostics.instascoutDashboardUrl }
            : {})}
        />
        <DiagnosticsItem
          label="Instascout sesion"
          status={
            diagnostics
              ? !diagnostics.instascoutConfigured || !diagnostics.instascoutReachable
                ? 'SIN DATOS'
                : diagnostics.instascoutReadOnly
                  ? 'READ-ONLY'
                  : 'LISTO'
              : 'COMPROBANDO'
          }
          message={
            diagnostics?.instascoutSessionMessage ?? 'Comprobando cookies y sesion...'
          }
          tone={instascoutSessionTone}
        />
      </div>
    </div>
  );
}
