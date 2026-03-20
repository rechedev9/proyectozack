import type { Metadata } from 'next';
import { getTeam } from '@/lib/queries/content';
import { AboutSection } from '@/components/sections/AboutSection';
import { TeamGrid } from '@/components/sections/TeamGrid';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Sobre SocialPro: la agencia gaming del mercado hispano. Fundada por ex-profesionales de esports con más de una década de experiencia.',
  alternates: {
    canonical: '/nosotros',
  },
};

export default async function NosotrosPage() {
  const team = await getTeam();

  return (
    <main>
      <AboutSection />
      <TeamGrid team={team} />
    </main>
  );
}
