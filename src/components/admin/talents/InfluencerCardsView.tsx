'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import type { AdminRosterRow } from '@/lib/queries/talents';
import type { TalentSocial, TalentVertical } from '@/types';
import { TALENT_VERTICAL_LABELS, TALENT_VERTICALS } from '@/lib/schemas/talentBusiness';
import { setTalentStatusAction, updateSocialGeoAction } from '@/app/admin/(dashboard)/talents/actions';

type TalentStatus = 'active' | 'available' | 'inactive';

const STATUS_LABELS: Record<TalentStatus, string> = {
  active: 'Activo',
  available: 'Disponible',
  inactive: 'Inactivo',
};

const STATUS_STYLES: Record<TalentStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  available: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const PLATFORM_EMOJI: Record<string, string> = {
  twitch: '📺',
  youtube: '📹',
  instagram: '📷',
  tiktok: '🎵',
  x: '𝕏',
  twitter: '𝕏',
  kick: '🦵',
};

type Props = {
  readonly creators: readonly AdminRosterRow[];
  readonly verticalsByTalent: Readonly<Record<number, readonly TalentVertical[]>>;
};

export function InfluencerCardsView({ creators, verticalsByTalent }: Props): React.ReactElement {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TalentStatus | 'all'>('all');
  const [verticalFilter, setVerticalFilter] = useState<TalentVertical | ''>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');

  const platforms = useMemo(() => {
    const set = new Set<string>();
    for (const c of creators) for (const s of c.socials) set.add(s.platform);
    return [...set].sort();
  }, [creators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creators.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (verticalFilter) {
        const vs = verticalsByTalent[c.id] ?? [];
        if (!vs.includes(verticalFilter)) return false;
      }
      if (platformFilter && !c.socials.some((s) => s.platform === platformFilter)) return false;
      return true;
    });
  }, [creators, search, statusFilter, verticalFilter, platformFilter, verticalsByTalent]);

  const counts = useMemo(() => {
    let active = 0, available = 0, inactive = 0;
    for (const c of creators) {
      if (c.status === 'active') active++;
      else if (c.status === 'available') available++;
      else if (c.status === 'inactive') inactive++;
    }
    return { active, available, inactive };
  }, [creators]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-sp-admin-card border border-sp-admin-border p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="min-w-[220px] flex-1 rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TalentStatus | 'all')}
          className="rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text"
        >
          <option value="all">Todos ({creators.length})</option>
          <option value="active">Activos ({counts.active})</option>
          <option value="available">Disponibles ({counts.available})</option>
          <option value="inactive">Inactivos ({counts.inactive})</option>
        </select>

        <select
          value={verticalFilter}
          onChange={(e) => setVerticalFilter(e.target.value as TalentVertical | '')}
          className="rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text"
        >
          <option value="">Todos los sectores</option>
          {TALENT_VERTICALS.map((v) => (
            <option key={v} value={v}>{TALENT_VERTICAL_LABELS[v]}</option>
          ))}
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text"
        >
          <option value="">Todas plataformas</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <span className="text-xs text-sp-admin-muted tabular-nums ml-auto">
          {filtered.length} / {creators.length}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sp-admin-border p-12 text-center">
          <p className="text-sm text-sp-admin-muted">Sin resultados con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <InfluencerCard
              key={c.id}
              creator={c}
              verticals={verticalsByTalent[c.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

type CardProps = {
  readonly creator: AdminRosterRow;
  readonly verticals: readonly TalentVertical[];
};

function InfluencerCard({ creator, verticals }: CardProps): React.ReactElement {
  const [status, setStatus] = useState<TalentStatus>(creator.status as TalentStatus);
  const [pending, startTransition] = useTransition();
  const [editingGeoId, setEditingGeoId] = useState<number | null>(null);

  const onChangeStatus = (next: TalentStatus): void => {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const r = await setTalentStatusAction(creator.id, next);
      if (!r.success) setStatus(prev);
    });
  };

  return (
    <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border overflow-hidden flex flex-col">
      {/* Photo */}
      <div
        className="relative aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(135deg, ${creator.gradientC1}, ${creator.gradientC2})`,
        }}
      >
        {creator.photoUrl ? (
          <Image
            src={creator.photoUrl}
            alt={creator.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl font-black text-white/90">{creator.initials}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/admin/talents/${creator.id}/negocio`} className="block">
              <h3 className="font-bold text-sp-admin-text truncate hover:underline">{creator.name}</h3>
            </Link>
            <p className="text-[11px] text-sp-admin-muted truncate">
              {creator.role}{creator.game ? ` · ${creator.game}` : ''}
            </p>
          </div>
          {creator.creatorCountry && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider font-mono font-semibold text-sp-admin-muted border border-sp-admin-border rounded px-1.5 py-0.5">
              {creator.creatorCountry}
            </span>
          )}
        </div>

        {/* Verticals */}
        {verticals.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {verticals.map((v) => (
              <span
                key={v}
                className="text-[10px] font-semibold text-sp-admin-muted bg-sp-admin-bg border border-sp-admin-border rounded-full px-2 py-0.5"
              >
                {TALENT_VERTICAL_LABELS[v]}
              </span>
            ))}
          </div>
        )}

        {/* Socials */}
        {creator.socials.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-sp-admin-border">
            {creator.socials.map((s) => (
              <SocialRow
                key={s.id}
                social={s}
                isEditingGeo={editingGeoId === s.id}
                onStartEditGeo={() => setEditingGeoId(s.id)}
                onStopEditGeo={() => setEditingGeoId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — status toggle */}
      <div className="border-t border-sp-admin-border p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] font-semibold">
          {(['active', 'available', 'inactive'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeStatus(s)}
              disabled={pending}
              className={`px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                status === s
                  ? STATUS_STYLES[s]
                  : 'border-sp-admin-border text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <Link
          href={`/admin/talents/${creator.id}/negocio`}
          className="text-[10px] font-semibold text-sp-admin-muted hover:text-sp-admin-text px-2 py-1 rounded hover:bg-sp-admin-hover"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

type SocialRowProps = {
  readonly social: TalentSocial;
  readonly isEditingGeo: boolean;
  readonly onStartEditGeo: () => void;
  readonly onStopEditGeo: () => void;
};

function SocialRow({ social, isEditingGeo, onStartEditGeo, onStopEditGeo }: SocialRowProps): React.ReactElement {
  const emoji = PLATFORM_EMOJI[social.platform.toLowerCase()] ?? '🔗';
  const geoSummary = formatGeos(social.topGeos);

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2">
        <span className="shrink-0">{emoji}</span>
        {social.profileUrl ? (
          <a href={social.profileUrl} target="_blank" rel="noreferrer" className="text-sp-admin-text hover:underline truncate">
            {social.handle}
          </a>
        ) : (
          <span className="text-sp-admin-text truncate">{social.handle}</span>
        )}
        <span className="shrink-0 text-sp-admin-muted tabular-nums">{social.followersDisplay}</span>
      </div>
      <div className="flex items-center gap-2 pl-5 mt-0.5">
        {geoSummary ? (
          <span className="text-[10px] text-sp-admin-muted truncate">{geoSummary}</span>
        ) : (
          <span className="text-[10px] italic text-sp-admin-muted">Sin geo stats</span>
        )}
        <button
          type="button"
          onClick={onStartEditGeo}
          className="text-[10px] font-semibold text-sp-admin-accent hover:underline cursor-pointer"
        >
          {geoSummary ? 'editar' : 'añadir'}
        </button>
      </div>
      {isEditingGeo && <GeoEditor social={social} onDone={onStopEditGeo} />}
    </div>
  );
}

function formatGeos(topGeos: TalentSocial['topGeos']): string | null {
  if (!topGeos || topGeos.length === 0) return null;
  return topGeos.map((g) => `${g.country} ${g.pct}%`).join(' · ');
}

// ────────────────────────────────────────────────────────────────────

type GeoEditorProps = {
  readonly social: TalentSocial;
  readonly onDone: () => void;
};

function GeoEditor({ social, onDone }: GeoEditorProps): React.ReactElement {
  const initial = social.topGeos ?? [];
  const [entries, setEntries] = useState<Array<{ country: string; pct: string }>>(
    initial.length > 0
      ? initial.map((g) => ({ country: g.country, pct: String(g.pct) }))
      : [{ country: '', pct: '' }],
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateEntry = (idx: number, field: 'country' | 'pct', value: string): void => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const addRow = (): void => {
    setEntries((prev) => [...prev, { country: '', pct: '' }]);
  };

  const removeRow = (idx: number): void => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = (): void => {
    const parsed: Array<{ country: string; pct: number }> = [];
    for (const e of entries) {
      const c = e.country.trim();
      const p = parseFloat(e.pct);
      if (!c || Number.isNaN(p)) continue;
      parsed.push({ country: c, pct: p });
    }
    setError(null);
    startTransition(async () => {
      const r = await updateSocialGeoAction(social.id, parsed);
      if (!r.success) {
        setError(r.error ?? 'Error');
      } else {
        onDone();
      }
    });
  };

  return (
    <div className="mt-2 rounded-lg bg-sp-admin-bg border border-sp-admin-border p-2 space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-sp-admin-muted">Geo stats · {social.platform}</p>
      {entries.map((e, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={e.country}
            onChange={(ev) => updateEntry(idx, 'country', ev.target.value)}
            placeholder="ES"
            maxLength={3}
            className="w-14 rounded border border-sp-admin-border bg-sp-admin-card px-2 py-1 text-xs uppercase font-mono"
          />
          <input
            value={e.pct}
            onChange={(ev) => updateEntry(idx, 'pct', ev.target.value)}
            placeholder="45"
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="w-16 rounded border border-sp-admin-border bg-sp-admin-card px-2 py-1 text-xs tabular-nums"
          />
          <span className="text-[10px] text-sp-admin-muted">%</span>
          <button
            type="button"
            onClick={() => removeRow(idx)}
            className="ml-auto text-[10px] font-semibold text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-[10px] font-semibold text-sp-admin-muted hover:text-sp-admin-text"
      >
        + país
      </button>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      <div className="flex items-center gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onDone}
          className="text-[10px] font-semibold text-sp-admin-muted hover:text-sp-admin-text px-2 py-1"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="text-[10px] font-bold bg-sp-admin-accent text-sp-admin-bg px-3 py-1 rounded-full hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
