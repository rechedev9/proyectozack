import type { CaseStudyWithRelations } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import { CaseCard } from './CaseCard';

type CasesSectionProps = {
  cases: CaseStudyWithRelations[];
}

export function CasesSection({ cases }: CasesSectionProps) {
  return (
    <section id="casos" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>Track Record</SectionTag>
            <SectionHeading>
              Casos de <GradientText>Éxito</GradientText>
            </SectionHeading>
          </div>
        </FadeInOnScroll>
        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <FadeInOnScroll key={c.id} delay={i * 0.1}>
              <CaseCard caseStudy={c} />
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
