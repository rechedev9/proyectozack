import { GradientText } from '@/components/ui/GradientText';

export function Hero() {
  return (
    <section className="relative bg-sp-black text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #f5632a, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b3aad, transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sp-orange mb-6">
          Agencia Gaming & Esports
        </span>
        <h1 className="font-display text-6xl md:text-8xl font-black uppercase leading-none mb-6">
          <GradientText>Conectamos</GradientText>
          <br />
          <span className="text-white">Talentos</span>
          <br />
          <span className="text-sp-muted2">con Marcas</span>
        </h1>
        <p className="text-lg md:text-xl text-sp-muted2 max-w-2xl mb-10 leading-relaxed">
          Somos la agencia líder en gestión de talentos gaming para el mercado hispano.
          Conectamos streamers y creadores con las mejores marcas de iGaming, periféricos y entretenimiento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
          >
            Empezar colaboración
          </a>
          <a
            href="#talentos"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white text-sm border border-white/20 hover:border-white/40 transition-colors"
          >
            Ver talentos
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
          {[
            { value: '13+', label: 'Talentos activos' },
            { value: '100+', label: 'Marcas conectadas' },
            { value: '200K€+', label: 'Revenue generado' },
            { value: '10M+', label: 'Alcance mensual' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-display text-4xl font-black gradient-text">{value}</div>
              <div className="text-sm text-sp-muted2 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
