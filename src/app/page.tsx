import dynamic from 'next/dynamic';
import { getTalents } from '@/lib/queries/talents';
import { getBrands, getCollaborators, getTeam } from '@/lib/queries/content';
import { getCaseStudies } from '@/lib/queries/cases';
import { getPortfolioItems } from '@/lib/queries/portfolio';

// Above-fold + Server Components: loaded eagerly
import { Hero } from '@/components/sections/Hero';
import { Marquee } from '@/components/sections/Marquee';
import { BrandsCarousel } from '@/components/sections/BrandsCarousel';
import { TalentSection } from '@/components/sections/TalentSection';
import { CollabsSection } from '@/components/sections/CollabsSection';
import { CasesSection } from '@/components/sections/CasesSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { TeamGrid } from '@/components/sections/TeamGrid';

// Client components below-fold: lazy-load JS, SSR preserved
const MetricsSection  = dynamic(() => import('@/components/sections/MetricsSection').then(m => ({ default: m.MetricsSection })));
const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection').then(m => ({ default: m.ServicesSection })));
const CtaSection      = dynamic(() => import('@/components/sections/CtaSection').then(m => ({ default: m.CtaSection })));
const FaqSection      = dynamic(() => import('@/components/sections/FaqSection').then(m => ({ default: m.FaqSection })));
const ContactSection  = dynamic(() => import('@/components/sections/ContactSection').then(m => ({ default: m.ContactSection })));

// Revalidate every hour (ISR)
export const revalidate = 3600;

export default async function HomePage() {
  const [talents, brands, collaborators, team, cases, portfolioItems] =
    await Promise.all([
      getTalents(),
      getBrands(),
      getCollaborators(),
      getTeam(),
      getCaseStudies(),
      getPortfolioItems(),
    ]);

  return (
    <>
      <Hero />
      <Marquee />
      <BrandsCarousel brands={brands} />
      <TalentSection talents={talents} />
      <MetricsSection />
      <CollabsSection collaborators={collaborators} />
      <ServicesSection />
      <CasesSection cases={cases} />
      <PortfolioSection items={portfolioItems} />
      <AboutSection />
      <TeamGrid team={team} />
      <CtaSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
