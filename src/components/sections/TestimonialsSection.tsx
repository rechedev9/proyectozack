'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as m from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import type { Testimonial } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import { gradientStyle } from '@/lib/gradient';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const AUTO_ADVANCE_MS = 5000;

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const total = testimonials.length;
  const pageCount = Math.ceil(total / 3);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % pageCount) + pageCount) % pageCount);
  }, [pageCount]);

  // Auto-advance
  useEffect(() => {
    if (paused || pageCount <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % pageCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, pageCount]);

  const visibleTestimonials = testimonials.slice(current * 3, current * 3 + 3);

  return (
    <section className="py-24 bg-sp-off">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>Lo que dicen de nosotros</SectionTag>
            <SectionHeading>
              <GradientText>Testimonios</GradientText>
            </SectionHeading>
          </div>
        </FadeInOnScroll>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 min-h-[260px]">
            <AnimatePresence mode="popLayout">
              {visibleTestimonials.map((t, i) => {
                const grad = gradientStyle(t.gradientC1, t.gradientC2);
                return (
                  <m.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-2xl border border-sp-border bg-white p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4 text-2xl" style={{ color: t.gradientC1 }}>
                      &#x275D;
                    </div>
                    <p className="text-sm text-sp-dark leading-relaxed mb-6 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 border-t border-sp-border pt-4">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ background: grad }}
                      >
                        {t.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-sp-dark">{t.authorName}</div>
                        <div className="text-xs text-sp-muted">{t.authorRole}</div>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a testimonios ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-sp-orange scale-125'
                      : 'bg-sp-border hover:bg-sp-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
