import type { PortfolioItem } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { PortfolioGrid } from './PortfolioGrid';

interface PortfolioSectionProps {
  items: PortfolioItem[];
}

export function PortfolioSection({ items }: PortfolioSectionProps) {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Nuestro trabajo</SectionTag>
          <SectionHeading>
            <GradientText>Portfolio</GradientText>
          </SectionHeading>
        </div>
        <PortfolioGrid items={items} />
      </div>
    </section>
  );
}
