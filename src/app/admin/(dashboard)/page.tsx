import Link from 'next/link';
import {
  getAdminDashboardStats,
  getTopCreatorsByFollowers,
  getRecentContacts,
} from '@/lib/queries/dashboard';
import { formatCompact } from '@/lib/format';
import {
  TalentIcon,
  BrandIcon,
  GiveawayIcon,
  CaseIcon,
  ContactIcon,
  AgencyIcon,
  ChartIcon,
  UsersIcon,
  StarIcon,
} from '@/components/admin/SidebarIcons';

import type { ReactElement, ReactNode } from 'react';

const PLATFORM_ORDER = [
  { key: 'yt', label: 'YT', color: '#FF0000' },
  { key: 'twitch', label: 'TW', color: '#9146FF' },
  { key: 'x', label: 'X', color: '#1DA1F2' },
  { key: 'ig', label: 'IG', color: '#E1306C' },
  { key: 'tt', label: 'TT', color: '#e8e8f0' },
  { key: 'kick', label: 'Kick', color: '#53FC18' },
] as const;

// ── Stat card config ─────────────────────────────────────────────────

type StatCard = {
  readonly label: string;
  readonly value: number;
  readonly href: string;
  readonly icon: ReactNode;
  readonly accent: string;
};

function buildStatCards(stats: Awaited<ReturnType<typeof getAdminDashboardStats>>): StatCard[] {
  return [
    { label: 'Creadores', value: stats.talentCount, href: '/admin/talents', icon: <TalentIcon />, accent: '#53fc18' },
    { label: 'Publico', value: stats.publicCount, href: '/admin/talents', icon: <UsersIcon />, accent: '#53fc18' },
    { label: 'Interno', value: stats.internalCount, href: '/admin/talents', icon: <UsersIcon />, accent: '#7a7a9a' },
    { label: 'Agencia', value: stats.agencyCount, href: '/admin/talents', icon: <AgencyIcon />, accent: '#9146FF' },
    { label: 'Marcas', value: stats.activeBrandCount, href: '/admin/brands', icon: <BrandIcon />, accent: '#1DA1F2' },
    { label: 'Casos', value: stats.caseCount, href: '/admin/cases', icon: <CaseIcon />, accent: '#f5632a' },
    { label: 'Contactos', value: stats.contactCount, href: '#contactos', icon: <ContactIcon />, accent: '#E1306C' },
    { label: 'Sorteos activos', value: stats.activeGiveawayCount, href: '/admin/giveaways', icon: <GiveawayIcon />, accent: '#FFD700' },
  ];
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function AdminDashboardPage(): Promise<ReactElement> {
  const [stats, topCreators, recentContacts] = await Promise.all([
    getAdminDashboardStats(),
    getTopCreatorsByFollowers(5),
    getRecentContacts(5),
  ]);

  const statCards = buildStatCards(stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Dashboard</h1>
        <p className="text-sm text-sp-admin-muted mt-1">Panel de inicio</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {statCards.map(({ label, value, href, icon, accent }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-4 py-3 hover:bg-sp-admin-hover transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-4 h-4 shrink-0" style={{ color: accent }}>{icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sp-admin-muted group-hover:text-sp-admin-text transition-colors truncate">
                {label}
              </span>
            </div>
            <div className="font-display text-2xl font-black text-sp-admin-text tabular-nums">{value}</div>
          </Link>
        ))}
      </div>

      {/* ── Followers por plataforma — full width ───────────────────── */}
      <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border">
        <div className="px-5 py-3 border-b border-sp-admin-border flex items-center gap-2">
          <span className="w-4 h-4 shrink-0 text-sp-admin-muted"><ChartIcon /></span>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
            Followers por plataforma
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-sp-admin-border">
          {PLATFORM_ORDER.map((p) => {
            const count = stats.followersByPlatform[p.key] ?? 0;
            return (
              <div key={p.key} className="px-4 py-4 text-center">
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: p.color }}
                >
                  {p.label}
                </div>
                <div className="font-display text-xl font-black text-sp-admin-text tabular-nums">
                  {count > 0 ? formatCompact(count) : '--'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Two-column widget row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 creadores */}
        <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
          <div className="px-5 py-3 border-b border-sp-admin-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 shrink-0 text-sp-admin-muted"><StarIcon /></span>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
                Top 5 creadores
              </h2>
            </div>
            <Link
              href="/admin/talents"
              className="text-[11px] font-semibold text-sp-admin-accent hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {topCreators.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-sp-admin-muted">Sin creadores</div>
          ) : (
            <div className="divide-y divide-sp-admin-border/60">
              {topCreators.map((creator, i) => (
                <div key={creator.slug} className="px-5 py-2.5 flex items-center justify-between hover:bg-sp-admin-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-sp-admin-muted tabular-nums w-4 text-center">{i + 1}</span>
                    <span className="font-semibold text-sp-admin-text text-[13px]">{creator.name}</span>
                  </div>
                  <span className="font-display text-sm font-bold text-sp-admin-text tabular-nums">
                    {creator.totalFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contactos recientes */}
        <section id="contactos" className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
          <div className="px-5 py-3 border-b border-sp-admin-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 shrink-0 text-sp-admin-muted"><ContactIcon /></span>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
                Contactos recientes
              </h2>
            </div>
            {recentContacts.length > 0 && (
              <span className="text-[11px] font-semibold text-sp-admin-accent">
                {stats.contactCount} total
              </span>
            )}
          </div>
          {recentContacts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-sp-admin-border/30 flex items-center justify-center">
                <span className="w-5 h-5 text-sp-admin-muted"><ContactIcon /></span>
              </div>
              <p className="text-sm font-medium text-sp-admin-muted">Sin contactos todavia</p>
              <p className="text-[11px] text-sp-admin-muted/60 mt-1">Los nuevos contactos del formulario apareceran aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-sp-admin-border">
              {recentContacts.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-sp-admin-hover transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-sp-admin-text truncate">{c.name}</div>
                    <div className="text-[11px] text-sp-admin-muted truncate">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sp-admin-border text-sp-admin-text">
                      {c.type}
                    </span>
                    <span className="text-[11px] text-sp-admin-muted tabular-nums">
                      {c.createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Full-width breakdown table ──────────────────────────────── */}
      <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
        <div className="px-5 py-3 border-b border-sp-admin-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 shrink-0 text-sp-admin-muted"><ChartIcon /></span>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
              Top 5 creadores — desglose por plataforma
            </h2>
          </div>
          <Link
            href="/admin/talents"
            className="text-[11px] font-semibold text-sp-admin-accent hover:underline"
          >
            Ver roster completo
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted w-8">#</th>
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">Creador</th>
                {PLATFORM_ORDER.map((p) => (
                  <th
                    key={p.key}
                    className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-center w-16"
                    style={{ color: p.color }}
                  >
                    {p.label}
                  </th>
                ))}
                <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-admin-border/60">
              {topCreators.map((creator, i) => (
                <tr key={creator.slug} className="hover:bg-sp-admin-hover transition-colors">
                  <td className="px-5 py-2.5 text-xs text-sp-admin-muted tabular-nums">{i + 1}</td>
                  <td className="px-5 py-2.5 font-semibold text-sp-admin-text text-[13px]">{creator.name}</td>
                  {PLATFORM_ORDER.map((p) => {
                    const social = creator.socials.find((s) => s.platform === p.key);
                    return (
                      <td key={p.key} className="px-3 py-2.5 text-center text-xs tabular-nums text-sp-admin-text">
                        {social ? social.followersDisplay : <span className="text-sp-admin-muted/30">--</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-sp-admin-text tabular-nums">
                    {creator.totalFormatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
