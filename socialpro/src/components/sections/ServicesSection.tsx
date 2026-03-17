'use client';

import { useState } from 'react';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FilterTabs } from '@/components/ui/FilterTabs';

const SERVICES = [
  {
    id: 'brands',
    label: 'Marcas',
    title: 'Para marcas y anunciantes',
    items: [
      { icon: '🎯', title: 'Selección de talentos', desc: 'Identificamos el creador perfecto para tu audiencia y objetivos de campaña.' },
      { icon: '📊', title: 'Gestión de campañas', desc: 'Coordinamos todo el proceso: brief, producción, publicación y reporte.' },
      { icon: '📈', title: 'Tracking & analytics', desc: 'Medición de resultados reales: conversiones, alcance y ROI de cada acción.' },
      { icon: '⚡', title: 'Ejecución rápida', desc: 'De brief a activación en días, no semanas. Procesos optimizados para iGaming.' },
    ],
  },
  {
    id: 'talents',
    label: 'Talentos',
    title: 'Para creadores de contenido',
    items: [
      { icon: '💼', title: 'Gestión de marca personal', desc: 'Desarrollamos tu imagen y posicionamiento en el ecosistema gaming.' },
      { icon: '🤝', title: 'Negociación de contratos', desc: 'Conseguimos las mejores condiciones en tus colaboraciones con marcas.' },
      { icon: '🎬', title: 'Producción de contenido', desc: 'Edición profesional, thumbnails y estrategia de contenido.' },
      { icon: '🌐', title: 'Expansión de audiencia', desc: 'Estrategias para crecer en nuevas plataformas y mercados.' },
    ],
  },
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
            Servicios <GradientText>SocialPro</GradientText>
          </SectionHeading>
        </div>

        <FilterTabs
          tabs={SERVICES.map((s) => ({ key: s.id, label: s.label }))}
          active={active}
          onChange={setActive}
        />

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {current.items.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-sp-border bg-sp-off p-6 hover:border-sp-orange/30 transition-colors"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-sp-dark mb-2">{title}</h3>
              <p className="text-sm text-sp-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
