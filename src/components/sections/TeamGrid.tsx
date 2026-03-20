import Image from 'next/image';
import type { TeamMember } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import { gradientStyle } from '@/lib/gradient';

type TeamGridProps = {
  team: TeamMember[];
}

export function TeamGrid({ team }: TeamGridProps) {
  return (
    <section id="equipo" className="py-24 bg-sp-off">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>El equipo</SectionTag>
            <SectionHeading>
              Las personas <GradientText>detrás</GradientText>
            </SectionHeading>
          </div>
        </FadeInOnScroll>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => {
            const grad = gradientStyle(member.gradientC1, member.gradientC2);
            return (
              <FadeInOnScroll key={member.id} delay={i * 0.1}>
                <div
                  className="rounded-2xl bg-white border border-sp-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40" style={{ background: grad }}>
                    {member.photoUrl ? (
                      <Image src={member.photoUrl} alt={member.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl font-black text-white/80">{member.initials}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-black uppercase text-sp-dark leading-tight">{member.name}</h3>
                    <p className="text-xs text-sp-orange font-semibold mt-0.5 mb-2">{member.role}</p>
                    <p className="text-xs text-sp-muted leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
