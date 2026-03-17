import { getTalents } from '@/lib/queries/talents';
import { getBrands, getCollaborators, getTeam, getTestimonials } from '@/lib/queries/content';
import { getCaseStudies } from '@/lib/queries/cases';
import { getPortfolioItems } from '@/lib/queries/portfolio';

import { Hero } from '@/components/sections/Hero';
import { Marquee } from '@/components/sections/Marquee';
import { BrandsCarousel } from '@/components/sections/BrandsCarousel';
import { TalentSection } from '@/components/sections/TalentSection';
import { CollabsSection } from '@/components/sections/CollabsSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { MetricsSection } from '@/components/sections/MetricsSection';
import { CasesSection } from '@/components/sections/CasesSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { TeamGrid } from '@/components/sections/TeamGrid';
import { ContactSection } from '@/components/sections/ContactSection';
import { CtaSection } from '@/components/sections/CtaSection';

// Revalidate every hour (ISR)
export const revalidate = 3600;

export default async function HomePage() {
  const [talents, brands, collaborators, team, testimonials, cases, portfolioItems] =
    await Promise.all([
      getTalents(),
      getBrands(),
      getCollaborators(),
      getTeam(),
      getTestimonials(),
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
      <TestimonialsSection testimonials={testimonials} />
      <AboutSection />
      <TeamGrid team={team} />
      <CtaSection />
      <ContactSection />
    </>
  );
}
