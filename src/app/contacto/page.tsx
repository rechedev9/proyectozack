import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacta con SocialPro. ¿Eres una marca o un creador? Cuéntanos tu proyecto y te respondemos en menos de 24h.',
  alternates: {
    canonical: '/contacto',
  },
};

export default function ContactoPage() {
  return (
    <main>
      <ContactSection />
    </main>
  );
}
