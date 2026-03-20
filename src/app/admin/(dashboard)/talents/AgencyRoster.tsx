'use client';

import { useState, useMemo } from 'react';
import type { TalentWithRelations } from '@/types';

const PLATFORM_LABELS: Record<string, string> = {
  yt: 'YT',
  x: 'X',
  ig: 'IG',
  tt: 'TT',
  twitch: 'TW',
  kick: 'K',
};

export function AgencyRoster({
  creators,
}: {
  creators: TalentWithRelations[];
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return creators;
    return creators.filter((c) => c.name.toLowerCase().includes(q));
  }, [creators, search]);

  return (
    <section>
      <h2 className="font-display text-lg font-black uppercase text-sp-dark mb-4">
        Creadores
      </h2>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-lg border border-sp-border bg-white px-4 py-2 text-sm text-sp-dark placeholder:text-sp-muted focus:outline-none focus:ring-2 focus:ring-sp-orange/40"
        />
      </div>

      <p className="text-sm text-sp-muted mb-3">
        Mostrando {filtered.length} de {creators.length} creadores
      </p>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-sp-border bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-border bg-sp-off">
              <th className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted">
                Nombre
              </th>
              <th className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted">
                Plataformas
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-5 py-12 text-center text-sp-muted"
                >
                  No se encontraron creadores
                </td>
              </tr>
            ) : (
              filtered.map((creator, idx) => (
                <tr
                  key={creator.id}
                  className={`border-b border-sp-border/50 transition-colors hover:bg-sp-off/60 ${
                    idx % 2 === 1 ? 'bg-sp-off/30' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-bold text-sp-dark">
                    {creator.name}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {creator.socials.map((social) => {
                        const abbr =
                          PLATFORM_LABELS[social.platform] ??
                          social.platform.toUpperCase();
                        return social.profileUrl ? (
                          <a
                            key={social.id}
                            href={social.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: social.hexColor }}
                            title={abbr}
                          >
                            {abbr}
                          </a>
                        ) : (
                          <span
                            key={social.id}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold"
                            style={{ backgroundColor: social.hexColor }}
                            title={abbr}
                          >
                            {abbr}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
