import {
  getAgencyCreators,
  countAgencyCreators,
  getAgencyCreatorCountries,
} from '@/lib/queries/agencyCreators';
import { AgencyRoster } from './AgencyRoster';

export default async function AdminTalentsPage() {
  const [creators, totalCount, countries] = await Promise.all([
    getAgencyCreators(),
    countAgencyCreators(),
    getAgencyCreatorCountries(),
  ]);

  /* Count creators per country for breakdown pills */
  const countryMap = new Map<string, number>();
  for (const c of creators) {
    const key = c.country?.trim();
    if (key) countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
  }
  const countryCounts = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1]);

  const topCountries = countryCounts.slice(0, 3).map(([name]) => name);

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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard value={totalCount} label="Total Creadores" />
        <KpiCard value={countries.length} label="Países" />
        <KpiCard value={6} label="Plataformas" />
        <KpiCard value={topCountries.join(', ')} label="Mercados" small />
      </section>

      {/* ── Country breakdown pills ──────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-black uppercase text-sp-dark mb-3">
          Distribución por País
        </h2>
        <div className="flex flex-wrap gap-2">
          {countryCounts.map(([country, count]) => (
            <span
              key={country}
              className="rounded-full bg-sp-off border border-sp-border px-3 py-1 text-sm text-sp-dark"
            >
              {country}{' '}
              <span className="font-semibold text-sp-muted">({count})</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── Interactive roster table ──────────────────────────────────── */}
      <AgencyRoster creators={creators} countries={countries} />
    </div>
  );
}

/* ── KPI card sub-component ──────────────────────────────────────────── */
function KpiCard({
  value,
  label,
  small,
}: {
  value: number | string;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6">
      <div
        className={`font-display font-black gradient-text leading-none ${
          small ? 'text-xl lg:text-2xl' : 'text-4xl lg:text-5xl'
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-sp-muted mt-2">{label}</div>
    </div>
  );
}
