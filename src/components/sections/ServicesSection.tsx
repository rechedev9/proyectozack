'use client';

import { useState } from 'react';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FilterTabs } from '@/components/ui/FilterTabs';

const SERVICES = [
  {
    id: 'brands',
    label: '🎯 Soy una Marca',
    title: 'Para marcas y anunciantes',
    steps: [
      'Selección del talento ideal para tu audiencia y objetivos.',
      'Briefing y estrategia de campaña conjunta.',
      'Coordinación de producción y publicación.',
      'Tracking de resultados: conversiones, alcance y ROI.',
      'Reporting final con insights accionables.',
    ],
  },
  {
    id: 'talents',
    label: '🎮 Soy Creador',
    title: 'Para creadores de contenido',
    steps: [
      'Gestión de tu marca personal y posicionamiento.',
      'Negociación de contratos con marcas premium.',
      'Producción profesional: edición, thumbnails, estrategia.',
      'Acceso a campañas exclusivas en iGaming y periféricos.',
      'Expansión a nuevas plataformas y mercados.',
    ],
  },
  {
    id: 'youtube',
    label: '▶️ Gestión YouTube',
    title: 'Gestión integral de canal YouTube',
    steps: [
      'Auditoría y optimización SEO del canal.',
      'Estrategia de contenido y calendario editorial.',
      'Producción de vídeos: edición, miniaturas y copywriting.',
      'Gestión de monetización y partnerships.',
      'Analytics mensuales y reporting de crecimiento.',
    ],
  },
];

const PROCESS_STEPS = [
  { num: '01', label: 'BRIEFING' },
  { num: '02', label: 'SELECCIÓN' },
  { num: '03', label: 'ESTRATEGIA' },
  { num: '04', label: 'EJECUCIÓN' },
  { num: '05', label: 'REPORTING' },
];

const COMPARISON = [
  { feature: 'Especialización gaming/esports', us: true, generic: false },
  { feature: 'Conocimiento normativo iGaming', us: true, generic: false },
  { feature: 'Red de talentos cualificados', us: true, generic: 'parcial' },
  { feature: 'Activación en < 72h', us: true, generic: false },
  { feature: 'Tracking de conversiones reales', us: true, generic: false },
  { feature: 'Presencia en España, LatAm y Turquía', us: true, generic: false },
];

export function ServicesSection() {
  const [active, setActive] = useState('brands');
  const current = SERVICES.find((s) => s.id === active) ?? SERVICES[0];

  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Qué hacemos</SectionTag>
          <SectionHeading>
            Lo que <GradientText>Ofrecemos</GradientText>
          </SectionHeading>
        </div>

        <FilterTabs
          tabs={SERVICES.map((s) => ({ key: s.id, label: s.label }))}
          active={active}
          onChange={setActive}
        />

        {/* Gradient feature card */}
        <div
          className="rounded-3xl p-8 md:p-10 mb-10 text-white"
          style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
        >
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase mb-6">{current.title}</h3>
          <ol className="space-y-3">
            {current.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="font-display text-lg font-black opacity-60 w-6 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Process row */}
        <div className="flex flex-wrap justify-center gap-0 mb-14">
          {PROCESS_STEPS.map(({ num, label }, i) => (
            <div key={num} className="flex items-center">
              <div className="flex flex-col items-center px-6 py-4">
                <span
                  className="font-display text-2xl font-black"
                  style={{
                    background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {num}
                </span>
                <span className="text-xs font-bold text-sp-dark uppercase tracking-widest mt-1">{label}</span>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <div className="w-8 h-px bg-sp-border hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="max-w-2xl mx-auto">
          <h4 className="font-display text-lg font-black uppercase text-sp-dark text-center mb-6">
            SocialPro vs Agencia Genérica
          </h4>
          <div className="rounded-2xl border border-sp-border overflow-hidden">
            <div className="grid grid-cols-3 bg-sp-off px-5 py-3">
              <span className="text-xs font-bold text-sp-muted uppercase tracking-widest">Característica</span>
              <span className="text-xs font-bold text-center uppercase tracking-widest gradient-text">SocialPro</span>
              <span className="text-xs font-bold text-center text-sp-muted uppercase tracking-widest">Genérica</span>
            </div>
            {COMPARISON.map(({ feature, us, generic }) => (
              <div key={feature} className="grid grid-cols-3 px-5 py-3 border-t border-sp-border">
                <span className="text-sm text-sp-dark">{feature}</span>
                <span className="text-center">{us ? '✅' : '❌'}</span>
                <span className="text-center">{generic === 'parcial' ? '⚠️' : generic ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
