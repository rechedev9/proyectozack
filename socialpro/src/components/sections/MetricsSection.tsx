import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';

const METRICS = [
  { value: '10M+', label: 'Alcance mensual agregado', desc: 'Suma de audiencias de todos nuestros talentos activos' },
  { value: '200K€+', label: 'Revenue generado', desc: 'Rastreado directamente vía códigos de afiliado y conversiones' },
  { value: '13', label: 'Talentos gestionados', desc: 'Streamers y creadores en activo bajo gestión SocialPro' },
  { value: '100+', label: 'Campañas ejecutadas', desc: 'Con marcas de iGaming, periféricos, skins y más' },
  { value: '8.9%', label: 'Engagement medio', desc: 'Media de engagement rate del portfolio de talentos' },
  { value: '3', label: 'Mercados', desc: 'España, LatAm y presencia internacional creciente' },
];

export function MetricsSection() {
  return (
    <section className="py-24 bg-sp-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionTag>Resultados</SectionTag>
          <SectionHeading className="text-white">
            <GradientText>Números</GradientText> que hablan
          </SectionHeading>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {METRICS.map(({ value, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-sp-orange/30 transition-colors"
            >
              <div className="font-display text-5xl font-black gradient-text mb-2">{value}</div>
              <div className="font-bold text-white text-sm mb-1">{label}</div>
              <div className="text-xs text-sp-muted2 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
