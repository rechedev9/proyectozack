import Link from 'next/link';
import {
  getAdminDashboardStats,
  getTopCreatorsByFollowers,
  getRecentContacts,
} from '@/lib/queries/dashboard';
import { formatCompact } from '@/lib/format';

const PLATFORM_ORDER = [
  { key: 'yt', label: 'YT', color: '#FF0000' },
  { key: 'twitch', label: 'TW', color: '#9146FF' },
  { key: 'x', label: 'X', color: '#1DA1F2' },
  { key: 'ig', label: 'IG', color: '#E1306C' },
  { key: 'tt', label: 'TT', color: '#000000' },
  { key: 'kick', label: 'Kick', color: '#53FC18' },
] as const;

export default async function AdminDashboardPage() {
  const [stats, topCreators, recentContacts] = await Promise.all([
    getAdminDashboardStats(),
    getTopCreatorsByFollowers(5),
    getRecentContacts(5),
  ]);

  const statCards = [
    { label: 'Creadores', value: stats.talentCount, href: '/admin/talents' },
    { label: 'Público', value: stats.publicCount, href: '/admin/talents' },
    { label: 'Interno', value: stats.internalCount, href: '/admin/talents' },
    { label: 'Marcas', value: stats.activeBrandCount, href: '/admin/brands' },
    { label: 'Sorteos activos', value: stats.activeGiveawayCount, href: '/admin/giveaways' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-dark">Dashboard</h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-sp-orange to-sp-pink" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl bg-white border border-sp-border px-4 py-3 hover:shadow-sm transition-shadow"
          >
            <div className="font-display text-2xl font-black text-sp-dark tabular-nums">{value}</div>
            <div className="text-[11px] text-sp-muted font-medium mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Followers por plataforma */}
      <section className="rounded-xl bg-white border border-sp-border">
        <div className="px-5 py-3 border-b border-sp-border/60">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-muted">
            Followers por plataforma
          </h2>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 divide-x divide-sp-border/40">
          {PLATFORM_ORDER.map((p) => {
            const count = stats.followersByPlatform[p.key] ?? 0;
            return (
              <div key={p.key} className="px-5 py-4 text-center">
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: p.color }}
                >
                  {p.label}
                </div>
                <div className="font-display text-xl font-black text-sp-dark tabular-nums">
                  {count > 0 ? formatCompact(count) : '--'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 5 creadores */}
      <section className="rounded-xl bg-white border border-sp-border overflow-hidden">
        <div className="px-5 py-3 border-b border-sp-border/60 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-muted">
            Top 5 creadores por followers
          </h2>
          <Link
            href="/admin/talents"
            className="text-[11px] font-semibold text-sp-orange hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-border/60 bg-sp-off/50">
              <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted w-8">#</th>
              <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">Creador</th>
              {PLATFORM_ORDER.map((p) => (
                <th
                  key={p.key}
                  className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-center w-16"
                  style={{ color: p.color }}
                >
                  {p.label}
                </th>
              ))}
              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-border/40">
            {topCreators.map((creator, i) => (
              <tr key={creator.slug} className="hover:bg-sp-orange/[0.03] transition-colors">
                <td className="px-5 py-2.5 text-xs text-sp-muted tabular-nums">{i + 1}</td>
                <td className="px-5 py-2.5 font-semibold text-sp-dark text-[13px]">{creator.name}</td>
                {PLATFORM_ORDER.map((p) => {
                  const social = creator.socials.find((s) => s.platform === p.key);
                  return (
                    <td key={p.key} className="px-3 py-2.5 text-center text-xs tabular-nums text-sp-dark">
                      {social ? social.followersDisplay : <span className="text-sp-muted/30">--</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-right text-xs font-bold text-sp-dark tabular-nums">
                  {creator.totalFormatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Contactos recientes */}
      <section className="rounded-xl bg-white border border-sp-border overflow-hidden">
        <div className="px-5 py-3 border-b border-sp-border/60">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-muted">
            Contactos recientes
          </h2>
        </div>
        {recentContacts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-sp-muted">Sin contactos</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sp-border/60 bg-sp-off/50">
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">Nombre</th>
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">Email</th>
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">Tipo</th>
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">Empresa</th>
                <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-border/40">
              {recentContacts.map((c) => (
                <tr key={c.id} className="hover:bg-sp-orange/[0.03] transition-colors">
                  <td className="px-5 py-2.5 font-medium text-sp-dark text-[13px]">{c.name}</td>
                  <td className="px-5 py-2.5 text-xs text-sp-muted">{c.email}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sp-off text-sp-dark">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-sp-muted">{c.company ?? '--'}</td>
                  <td className="px-5 py-2.5 text-xs text-sp-muted text-right tabular-nums">
                    {c.createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
