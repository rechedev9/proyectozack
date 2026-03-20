type StatsBarProps = {
  activeCount: number;
  totalValue: string;
  finishedCount: number;
}

export function StatsBar({ activeCount, totalValue, finishedCount }: StatsBarProps) {
  return (
    <div className="border-y border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-8 md:gap-16">
        <div className="text-center">
          <p className="text-2xl font-black gw-sp-value">{activeCount}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">Activos</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-2xl font-black gw-sp-value">{totalValue}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">En premios</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-2xl font-black gw-sp-value">{finishedCount}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">Entregados</p>
        </div>
      </div>
    </div>
  );
}
