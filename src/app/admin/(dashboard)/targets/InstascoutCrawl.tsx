'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import type { JobStatus } from './instascout-crawl-actions';
import {
  getJobStatusAction,
  startCrawlHashtagAction,
  startEnrichAction,
  cancelJobAction,
} from './instascout-crawl-actions';

const IG_RED = '#E1306C';

const STATUS_COLORS: Record<string, string> = {
  running:   'text-amber-400',
  done:      'text-emerald-400',
  failed:    'text-red-400',
  cancelled: 'text-sp-admin-muted',
};

const JOB_LABELS: Record<string, string> = {
  'crawl-hashtag': 'Crawl hashtag',
  'crawl-seed':    'Crawl seed',
  'enrich':        'Enrich',
};

export function InstascoutCrawl(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [hashtagInput, setHashtagInput] = useState('');
  const [crawlLimit, setCrawlLimit] = useState('500');
  const [enrichLimit, setEnrichLimit] = useState('200');
  const [enrichMin, setEnrichMin] = useState('10000');

  const refreshStatus = useCallback((): void => {
    startTransition(async () => {
      try {
        const s = await getJobStatusAction();
        setStatus(s);
      } catch {
        // silently ignore polling errors
      }
    });
  }, []);

  const isRunning = status?.active ?? false;

  // Fetch once when panel opens
  useEffect(() => {
    if (!isOpen) return;
    refreshStatus();
  }, [isOpen, refreshStatus]);

  // Poll every 5s only while a job is running
  useEffect(() => {
    if (!isOpen || !isRunning) return;
    const interval = setInterval(() => {
      refreshStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isRunning, refreshStatus]);

  const handleCrawl = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await startCrawlHashtagAction(fd);
      if (!result.ok) { setError(result.error); return; }
      refreshStatus();
    });
  };

  const handleEnrich = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await startEnrichAction(fd);
      if (!result.ok) { setError(result.error); return; }
      refreshStatus();
    });
  };

  const handleCancel = (): void => {
    setError(null);
    startTransition(async () => {
      const result = await cancelJobAction();
      if (!result.ok) { setError(result.error); return; }
      refreshStatus();
    });
  };

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={IG_RED} strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Lanzar crawl de instascout
          {status?.active && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/30 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Activo
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-sp-admin-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-sp-admin-border divide-y divide-sp-admin-border/60">

          {/* ── Status bar ───────────────────────────────────────────────── */}
          <div className="px-5 py-3 flex items-center gap-4 bg-sp-admin-bg/40">
            {status === null ? (
              <span className="text-xs text-sp-admin-muted">Cargando estado...</span>
            ) : status.readOnly ? (
              <span className="text-xs text-red-400 font-semibold">Read-only — cookies no disponibles</span>
            ) : !status.id ? (
              <span className="text-xs text-sp-admin-muted">Sin job activo</span>
            ) : (
              <>
                <span className="text-xs font-semibold text-sp-admin-text">
                  {JOB_LABELS[status.type] ?? status.type}
                </span>
                <span className={`text-xs font-semibold ${STATUS_COLORS[status.status] ?? 'text-sp-admin-muted'}`}>
                  {status.status}
                </span>
                {status.elapsed && (
                  <span className="text-xs text-sp-admin-muted tabular-nums">{status.elapsed}</span>
                )}
                {status.id.includes('hashtag') && (
                  <span className="text-xs text-sp-admin-muted">
                    #{status.id.split('-')[2]}
                  </span>
                )}
                {status.error && (
                  <span className="text-xs text-red-400 truncate max-w-[240px]">{status.error}</span>
                )}
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={refreshStatus}
                disabled={isPending}
                className="text-[11px] text-sp-admin-muted hover:text-sp-admin-text transition-colors disabled:opacity-40"
              >
                Actualizar
              </button>
              {isRunning && (
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  className="px-3 py-1 rounded text-[11px] font-semibold text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40"
                >
                  Cancelar job
                </button>
              )}
            </div>
          </div>

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && (
            <p className="px-5 py-2 text-xs text-red-400 bg-red-900/10">{error}</p>
          )}

          {/* ── Crawl hashtag ─────────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-3">
              Crawl por hashtag
            </p>
            <form onSubmit={handleCrawl} className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] text-sp-admin-muted/70 mb-1">Hashtag (sin #)</label>
                <input
                  name="tag"
                  type="text"
                  required
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="gambling"
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
                />
              </div>
              <div className="w-24">
                <label className="block text-[10px] text-sp-admin-muted/70 mb-1">Límite</label>
                <input
                  name="limit"
                  type="number"
                  min="10"
                  max="10000"
                  value={crawlLimit}
                  onChange={(e) => setCrawlLimit(e.target.value)}
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isRunning}
                className="px-4 py-2 rounded-lg text-[12px] font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: IG_RED }}
              >
                {isPending ? 'Iniciando...' : 'Crawl'}
              </button>
            </form>
          </div>

          {/* ── Enrich ───────────────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-3">
              Enriquecer perfiles (obtener bio, foto, etc.)
            </p>
            <form onSubmit={handleEnrich} className="flex items-end gap-3 flex-wrap">
              <div className="w-28">
                <label className="block text-[10px] text-sp-admin-muted/70 mb-1">Límite</label>
                <input
                  name="limit"
                  type="number"
                  min="1"
                  max="5000"
                  value={enrichLimit}
                  onChange={(e) => setEnrichLimit(e.target.value)}
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                />
              </div>
              <div className="w-32">
                <label className="block text-[10px] text-sp-admin-muted/70 mb-1">Min. seguidores</label>
                <input
                  name="min_followers"
                  type="number"
                  min="0"
                  value={enrichMin}
                  onChange={(e) => setEnrichMin(e.target.value)}
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isRunning}
                className="px-4 py-2 rounded-lg text-[12px] font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {isPending ? 'Iniciando...' : 'Enriquecer'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
