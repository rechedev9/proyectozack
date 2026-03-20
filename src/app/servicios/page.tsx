import type { Metadata } from 'next';
import { ServicesSection } from '@/components/sections/ServicesSection';

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Servicios de SocialPro: gestión de talentos gaming, campañas para marcas iGaming, gestión integral de canales YouTube. Activación en menos de 72h.',
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
