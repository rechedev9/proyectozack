import type { Metadata } from 'next';
import { ServicesSection } from '@/components/sections/ServicesSection';

export const metadata: Metadata = {
  title: 'Agencia Marketing Gaming e iGaming',
  description:
    'Campañas de influencer marketing gaming, gestión de talentos streamers y canales YouTube. Especialistas en iGaming y esports para el mercado hispano.',
  alternates: {
    canonical: '/servicios',
  },
};

export default function ServiciosPage() {
  return (
    <main>
      <ServicesSection />
    </main>
  );
}
