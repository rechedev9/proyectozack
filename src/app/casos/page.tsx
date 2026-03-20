import type { Metadata } from 'next';
import { getCaseStudies } from '@/lib/queries/cases';
import { CasesSection } from '@/components/sections/CasesSection';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Casos de Éxito',
  description:
    'Casos de éxito de campañas gaming y esports. Resultados medibles con marcas de iGaming, periféricos y entretenimiento.',
  alternates: {
    canonical: '/casos',
  },
};

export default async function CasosPage() {
  const cases = await getCaseStudies();

  return (
    <main>
      <CasesSection cases={cases} />
    </main>
  );
}
