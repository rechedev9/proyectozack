import type { Metadata } from 'next';
import { getTalents } from '@/lib/queries/talents';
import { TalentSection } from '@/components/sections/TalentSection';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Talentos',
  description:
    'Descubre el roster de talentos gaming de SocialPro. Streamers, youtubers y creadores de contenido especializados en gaming, esports e iGaming.',
  alternates: {
    canonical: '/talentos',
  },
};

export default async function TalentosPage() {
  const talents = await getTalents();

  return (
    <main>
      <TalentSection talents={talents} />
    </main>
  );
}
