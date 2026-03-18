'use client';

import * as m from 'motion/react-client';

export function Hero() {
  return (
    <section className="relative bg-sp-black text-white overflow-hidden h-dvh flex flex-col">

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #f5632a, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #c42880, transparent 70%)' }}
        />
      </div>

      {/* Main content — centered vertically with slight downward offset */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full flex-1 flex flex-col justify-center pb-20">

        {/* Geographic sub-label */}
        <m.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-orange mb-6"
        >
          Gaming &amp; Esports Talent Agency · Europa · LatAm · Turquía
        </m.span>

        {/* Headline — staggered word entrance */}
        <h1 className="font-display text-[4.5rem] sm:text-[6rem] md:text-[7.5rem] lg:text-[9rem] font-black uppercase leading-[0.9] mb-8">
          <m.span
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="block text-white"
          >
            CONECTAMOS
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="block"
            style={{
              background: 'linear-gradient(90deg, #f5632a 0%, #e03070 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CREADORES
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="block text-white"
          >
            CON MARCAS
          </m.span>
        </h1>

        {/* Bottom row: paragraph + CTAs on left, stats on right */}
        <div className="flex items-end justify-between gap-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
          >
            <p className="text-sm text-sp-muted2 max-w-sm mb-5 leading-relaxed">
              13+ años dentro del ecosistema gaming &amp; esports.
              Representamos a los mejores streamers y ejecutamos
              campañas de iGaming que convierten.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
              >
                ¿Eres una marca? Hablemos.
              </a>
              <a
                href="#talentos"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-bold text-white text-sm border border-white/20 hover:border-white/40 transition-colors"
              >
                Ver nuestros talentos
              </a>
            </div>
          </m.div>

          {/* Stats — horizontal row, bottom-right */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.85 }}
            className="hidden md:flex items-end gap-8 flex-shrink-0"
          >
            {[
              { value: '13+', label: 'AÑOS' },
              { value: '15M', label: 'VIEWS/MES' },
              { value: '15', label: 'CAMPAÑAS' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-5xl font-black text-white leading-none">{value}</div>
                <div className="text-[10px] font-semibold text-sp-muted2 tracking-widest mt-1.5">{label}</div>
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}
