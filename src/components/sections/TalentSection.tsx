import type { TalentWithRelations } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import { TalentGrid } from './TalentGrid';

type TalentSectionProps = {
  talents: TalentWithRelations[];
}

export function TalentSection({ talents }: TalentSectionProps) {
  return (
    <section id="talentos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>Nuestro portfolio</SectionTag>
            <SectionHeading>
              <GradientText>Talentos</GradientText> en activo
            </SectionHeading>
            <p className="mt-4 text-sp-muted max-w-xl mx-auto text-sm leading-relaxed">
              Streamers y creadores gaming con audiencias reales y alta fidelidad. Filtro por plataforma principal.
            </p>
          </div>
        </FadeInOnScroll>
        {/* Client component handles filters + modal */}
        <TalentGrid talents={talents} />
      </div>
    </section>
  );
}
