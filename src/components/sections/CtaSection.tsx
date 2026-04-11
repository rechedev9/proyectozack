'use client';

import * as m from 'motion/react-client';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

export function CtaSection() {
  return (
    <section className="py-24 bg-sp-black text-white text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <h2 className="font-display text-5xl md:text-6xl font-black uppercase mb-6">
            Diseñemos tu <GradientText>próxima campaña</GradientText>
          </h2>
          <p className="text-sp-muted2 text-lg mb-4">
            +340 FTDs en una activación · 15M views/mes · 13 años ejecutando en
            España, LatAm y Turquía.
          </p>
          <p className="text-sp-muted2/70 text-sm mb-10">
            Cuéntanos producto, mercado y objetivo. Te respondemos con una
            propuesta concreta.
          </p>
          <m.a
            href="/contacto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center px-10 py-4 rounded-full font-bold text-white text-base bg-sp-grad"
          >
            Iniciar Propuesta →
          </m.a>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-sp-muted2/80">
            Respuesta en 24h · Sin compromiso
          </p>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
