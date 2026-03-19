'use client';

import { useRef, useEffect } from 'react';
import * as m from 'motion/react-client';
import { useMotionValue, useInView, animate } from 'motion/react';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

interface Metric {
  target: number;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
}

const METRICS: Metric[] = [
  { target: 13, prefix: '', suffix: '+', decimals: 0, label: 'AÑOS' },
  { target: 15, prefix: '', suffix: 'M', decimals: 0, label: 'VIEWS/MES' },
  { target: 15, prefix: '', suffix: '', decimals: 0, label: 'CAMPAÑAS' },
  { target: 340, prefix: '+', suffix: '', decimals: 0, label: 'FTDS' },
  { target: 3, prefix: '', suffix: '', decimals: 0, label: 'MERCADOS' },
  { target: 8.4, prefix: '', suffix: '%', decimals: 1, label: 'CTR' },
];

function AnimatedMetric({ metric, index }: { metric: Metric; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  const { target, decimals, prefix, suffix } = metric;

  // Animate the number when in view — writes directly to DOM, no re-renders
  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionVal, target, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1], // ease-out expo
    });

    const unsubscribe = motionVal.on('change', (v) => {
      if (displayRef.current) {
        const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
        displayRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, motionVal, target, decimals, prefix, suffix]);

  return (
    <m.div
      ref={ref}
      className="px-4 py-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <span
        ref={displayRef}
        className="font-display text-4xl md:text-5xl font-black mb-1 block gradient-text"
      >
        {metric.prefix}0{metric.suffix}
      </span>
      <div className="text-xs font-semibold text-sp-muted uppercase tracking-widest">
        {metric.label}
      </div>
    </m.div>
  );
}

export function MetricsSection() {
  return (
    <section className="py-20 bg-sp-off">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>Resultados</SectionTag>
            <SectionHeading>
              <GradientText>Números</GradientText> que hablan
            </SectionHeading>
          </div>
        </FadeInOnScroll>
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-sp-border">
          {METRICS.map((metric, i) => (
            <AnimatedMetric key={metric.label} metric={metric} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
