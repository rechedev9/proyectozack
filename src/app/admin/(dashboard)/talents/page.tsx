import { getAllTalents } from '@/lib/queries/talents';
import { AgencyRoster } from './AgencyRoster';

export default async function AdminTalentsPage() {
  const creators = await getAllTalents();

  /* Unique platforms across all creators */
  const platformSet = new Set<string>();
  for (const c of creators) {
    for (const s of c.socials) platformSet.add(s.platform);
  }

  return (
    <div className="space-y-10">
      {/* ── Hero header ──────────────────────────────────────────────── */}
      <section>
        <p className="font-display text-sm font-black uppercase tracking-[0.3em] gradient-text mb-2">
          SocialPro
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-black uppercase text-sp-dark leading-none">
          Roster de Creadores
        </h1>
        <p className="mt-3 text-sp-muted text-lg max-w-xl">
          Nuestro roster completo de creadores gaming &amp; esports
        </p>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-sp-orange to-sp-pink" />
      </section>

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard value={creators.length} label="Total Creadores" />
        <KpiCard value={platformSet.size} label="Plataformas" />
        <KpiCard
          value={creators.reduce((sum, c) => sum + c.socials.length, 0)}
          label="Perfiles Sociales"
        />
      </section>

      {/* ── Interactive roster table ──────────────────────────────────── */}
      <AgencyRoster creators={creators} />
    </div>
  );
}

/* ── KPI card sub-component ──────────────────────────────────────────── */
function KpiCard({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6">
      <div className="font-display text-4xl lg:text-5xl font-black gradient-text leading-none">
        {value}
      </div>
      <div className="text-sm text-sp-muted mt-2">{label}</div>
    </div>
  );
}
