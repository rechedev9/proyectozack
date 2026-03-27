'use client';

import * as m from 'motion/react-client';
import Image from 'next/image';

import type { JSX } from 'react';

const HERO_STATS = [
  { value: '13+', label: 'ANOS' },
  { value: '15M', label: 'VIEWS/MES' },
  { value: '15', label: 'CAMPANAS' },
] as const;

export function Hero(): JSX.Element {
  return (
    <section className="relative bg-sp-black text-white overflow-hidden min-h-dvh flex flex-col pt-16">

      {/* Deep Background Aura — slow pulsing animation */}
      <div className="absolute inset-0 pointer-events-none" style={{ contain: 'paint' }}>
        <m.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, #e03070 0%, transparent 60%)',
            filter: 'blur(80px)',
            transform: 'translateZ(0)',
          }}
        />
        <m.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, #f5632a 0%, transparent 70%)',
            filter: 'blur(100px)',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center text-center pb-20">
        
        {/* Animated Butterfly Mark */}
        <m.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <m.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <Image
              src="/images/logos/2.png"
              alt="SocialPro Mark"
              width={100}
              height={100}
              priority
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_25px_rgba(224,48,112,0.4)]"
            />
          </m.div>
          {/* Subtle glow behind the mark */}
          <div className="absolute inset-0 bg-sp-pink/20 blur-2xl rounded-full animate-pulse" />
        </m.div>

        {/* Geographic Label */}
        <m.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-sp-muted2 mb-6"
        >
          Gaming &amp; Esports · Europa · LatAm · Turquía
        </m.span>

        {/* Headline — Sharp & High Contrast */}
        <h1 className="font-display text-[4rem] sm:text-[6.5rem] md:text-[8rem] lg:text-[10rem] font-black uppercase leading-[0.85] tracking-tight mb-10">
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="block text-white will-change-[transform,opacity]"
          >
            CONECTAMOS
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="block will-change-[transform,opacity]"
            style={{
              background: 'linear-gradient(90deg, #f5632a 0%, #e03070 50%, #8b3aad 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CREADORES
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="block text-white will-change-[transform,opacity]"
          >
            CON MARCAS
          </m.span>
        </h1>

        {/* Sub-content */}
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg text-sp-muted2 mb-8 leading-relaxed font-medium"
          >
            13+ años operando en la élite del ecosistema. Representamos a los mejores talentos 
            y ejecutamos campañas de iGaming con resultados exponenciales.
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <m.a
              href="/contacto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-widest uppercase bg-sp-grad focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sp-black"
            >
              Iniciar Propuesta
            </m.a>
            <m.a
              href="/talentos"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-widest uppercase border border-white/14 bg-white/[0.04] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.02)] transition-all hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_rgba(245,99,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sp-black"
            >
              Explorar Talentos
            </m.a>
          </m.div>
        </div>

        <div className="mt-18 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {HERO_STATS.map(({ value, label }, index) => (
            <m.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.25 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all duration-500 hover:border-white/18 hover:bg-white/[0.05]"
            >
              <div className="font-display text-4xl font-black text-white leading-none">{value}</div>
              <div className="mt-2 text-[10px] font-bold text-sp-muted2 tracking-[0.24em]">{label}</div>
            </m.div>
          ))}
        </div>

        <m.a
          href="#brands"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/45 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sp-black"
          aria-label="Ir a la siguiente seccion"
        >
          <span>Scroll</span>
          <m.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1"
          >
            <span className="h-2 w-1.5 rounded-full bg-white/70" />
          </m.span>
        </m.a>
      </div>
    </section>
  );
}
