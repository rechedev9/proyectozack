const MARQUEE_ITEMS = [
  'CS2', 'Valorant', 'Twitch', 'YouTube', 'iGaming', 'Esports',
  'Streaming', 'Periféricos', 'LatAm', 'España', 'Gaming', 'Skins',
];

// Duplicated at module scope — allocated once, not on every render
const MARQUEE_DISPLAY = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export function Marquee() {
  const items = MARQUEE_DISPLAY;

  return (
    <div className="overflow-hidden bg-sp-off py-4 border-y border-sp-border">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span
            key={i}
            className="mx-6 text-sm font-bold uppercase tracking-widest text-sp-muted shrink-0 inline-flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sp-orange inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
