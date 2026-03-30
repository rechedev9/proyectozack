'use client';

import { useRef } from 'react';
import { useCountUp } from 'react-countup';
import * as m from 'motion/react-client';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

type Metric = {
  end: number;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
}

const METRICS: Metric[] = [
  { end: 13,  prefix: '',  suffix: '+', decimals: 0, label: 'AÑOS' },
  { end: 15,  prefix: '',  suffix: 'M', decimals: 0, label: 'VIEWS/MES' },
  { end: 15,  prefix: '',  suffix: '',  decimals: 0, label: 'CAMPAÑAS' },
  { end: 340, prefix: '+', suffix: '',  decimals: 0, label: 'FTDS' },
  { end: 3,   prefix: '',  suffix: '',  decimals: 0, label: 'MERCADOS' },
  { end: 8.4, prefix: '',  suffix: '%', decimals: 1, label: 'CTR' },
];

function AnimatedMetric({ metric, index }: { metric: Metric; index: number }) {
  const countRef = useRef<HTMLElement>(null);

  useCountUp({
    ref: countRef as React.RefObject<HTMLElement>,
    start: 0,
    end: metric.end,
    duration: 1.8,
    decimals: metric.decimals,
    prefix: metric.prefix,
    suffix: metric.suffix,
    enableScrollSpy: true,
    scrollSpyOnce: true,
    easingFn: (t, b, c, d) => {
      // ease-out expo
      return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
  });

  return (
    <m.div
      className="px-4 py-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <span
        ref={countRef as React.RefObject<HTMLSpanElement>}
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
