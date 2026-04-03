'use client';

type BrandsSidebarProps = {
  brands: { name: string; logo: string | null }[];
};

export function BrandsSidebar({ brands }: BrandsSidebarProps) {
  return (
    <aside className="w-full lg:w-48 shrink-0">
      <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] text-white/50 mb-4 px-2">
        Patrocinadores
      </h2>
      <div className="space-y-2">
        {brands.map((b) => (
          <div
            key={b.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            {b.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={b.logo}
                alt={b.name}
                width={24}
                height={24}
                className="rounded-sm object-contain opacity-70"
              />
            ) : (
              <div className="w-6 h-6 rounded-sm bg-sp-orange/20 flex items-center justify-center text-[9px] font-black text-sp-orange">
                {b.name.charAt(0)}
              </div>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              {b.name}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
