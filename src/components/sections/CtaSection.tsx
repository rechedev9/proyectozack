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
            ¿Listo para <GradientText>empezar</GradientText>?
          </h2>
          <p className="text-sp-muted2 text-lg mb-10">
            Cuéntanos tu proyecto y te conectamos con el talento perfecto para tu marca.
          </p>
          <m.a
            href="#contacto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center px-10 py-4 rounded-full font-bold text-white text-base bg-sp-grad"
          >
            Contactar ahora →
          </m.a>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
