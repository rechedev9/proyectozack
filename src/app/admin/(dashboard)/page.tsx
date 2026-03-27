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

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const [stats, topCreators, recentContacts] = await Promise.all([
    getAdminDashboardStats(),
    getTopCreatorsByFollowers(5),
    getRecentContacts(5),
  ]);

  const statCards = [
    { label: 'Creadores', value: stats.talentCount, href: '/admin/talents' },
    { label: 'Publico', value: stats.publicCount, href: '/admin/talents' },
    { label: 'Interno', value: stats.internalCount, href: '/admin/talents' },
    { label: 'Marcas', value: stats.activeBrandCount, href: '/admin/brands' },
    { label: 'Sorteos activos', value: stats.activeGiveawayCount, href: '/admin/giveaways' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Dashboard</h1>
        <p className="text-sm text-sp-admin-muted mt-1">Panel de inicio</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl bg-sp-admin-card border border-sp-admin-border px-4 py-3 hover:bg-sp-admin-hover transition-colors group"
          >
            <div className="font-display text-2xl font-black text-sp-admin-text tabular-nums">{value}</div>
            <div className="text-[11px] text-sp-admin-muted font-medium mt-0.5 group-hover:text-sp-admin-text transition-colors">{label}</div>
          </Link>
        ))}
      </div>

      {/* Widget grid -- 2 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Followers por plataforma */}
        <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border">
          <div className="px-5 py-3 border-b border-sp-admin-border">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
              Followers por plataforma
            </h2>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-3 divide-x divide-sp-admin-border">
            {PLATFORM_ORDER.map((p) => {
              const count = stats.followersByPlatform[p.key] ?? 0;
              return (
                <div key={p.key} className="px-4 py-4 text-center">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: p.color === '#000000' ? '#e8e8f0' : p.color }}
                  >
                    {p.label}
                  </div>
                  <div className="font-display text-lg font-black text-sp-admin-text tabular-nums">
                    {count > 0 ? formatCompact(count) : '--'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contactos recientes */}
        <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border">
          <div className="px-5 py-3 border-b border-sp-admin-border flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
              Contactos recientes
            </h2>
          </div>
          {recentContacts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-sp-admin-muted">Sin contactos</div>
          ) : (
            <div className="divide-y divide-sp-admin-border">
              {recentContacts.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-sp-admin-hover transition-colors">
                  <div>
                    <div className="text-[13px] font-medium text-sp-admin-text">{c.name}</div>
                    <div className="text-[11px] text-sp-admin-muted">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
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

      {/* Top 5 creadores — full width */}
      <section className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
        <div className="px-5 py-3 border-b border-sp-admin-border flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">
            Top 5 creadores por followers
          </h2>
          <Link
            href="/admin/talents"
            className="text-[11px] font-semibold text-sp-admin-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
              <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted w-8">#</th>
              <th className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-admin-muted">Creador</th>
              {PLATFORM_ORDER.map((p) => (
                <th
                  key={p.key}
                  className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-center w-16"
                  style={{ color: p.color === '#000000' ? '#e8e8f0' : p.color }}
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
      </section>
    </div>
  );
}
