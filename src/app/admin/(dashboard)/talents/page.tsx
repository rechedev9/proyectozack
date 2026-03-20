import { getAllTalents } from '@/lib/queries/talents';
import { AgencyRoster } from './AgencyRoster';

export default async function AdminTalentsPage() {
  const creators = await getAllTalents();

  const platformSet = new Set<string>();
  let totalSocials = 0;
  for (const c of creators) {
    for (const s of c.socials) platformSet.add(s.platform);
    totalSocials += c.socials.length;
  }

  return (
    <div className="-m-4 -mt-18 md:-m-8 md:-mt-8">
      {/* ── Dark hero block ───────────────────────────────────────────── */}
      <section className="bg-sp-black px-6 md:px-10 pt-10 pb-12">
        <div className="max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sp-orange mb-3">
            SocialPro Agency
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black uppercase text-white leading-[0.9] mb-3">
            Roster
          </h1>
          <p className="text-white/40 text-sm max-w-md leading-relaxed">
            Creadores gaming & esports representados por la agencia.
            Datos internos — no visible en la web pública.
          </p>

          {/* ── KPI strip ───────────────────────────────────────────── */}
          <div className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            <Stat value={creators.length} label="Creadores" />
            <Stat value={platformSet.size} label="Plataformas" />
            <Stat value={totalSocials} label="Perfiles" />
          </div>
        </div>
      </section>

      {/* ── Roster body ───────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-8">
        <AgencyRoster creators={creators} />
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-[clamp(2rem,4vw,3.5rem)] font-black text-white leading-none">
        {value}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mt-1">
        {label}
      </div>
    </div>
  );
}
