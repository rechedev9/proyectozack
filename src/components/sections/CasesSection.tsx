import type { CaseStudyWithRelations } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { CaseCard } from './CaseCard';

interface CasesSectionProps {
  cases: CaseStudyWithRelations[];
}

export function CasesSection({ cases }: CasesSectionProps) {
  return (
    <section id="casos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Track Record</SectionTag>
          <SectionHeading>
            Casos de <GradientText>Éxito</GradientText>
          </SectionHeading>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <CaseCard key={c.id} caseStudy={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
