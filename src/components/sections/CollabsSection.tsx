import Image from 'next/image';
import type { Collaborator } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';
import { gradientStyle } from '@/lib/gradient';

interface CollabsSectionProps {
  collaborators: Collaborator[];
}

export function CollabsSection({ collaborators }: CollabsSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>También han trabajado con nosotros</SectionTag>
            <SectionHeading>
              Colaboradores <GradientText>Destacados</GradientText>
            </SectionHeading>
          </div>
        </FadeInOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {collaborators.map((c, i) => {
            const grad = gradientStyle(c.gradientC1, c.gradientC2);
            return (
              <FadeInOnScroll key={c.id} delay={i * 0.1}>
                <div
                  className="rounded-2xl border border-sp-border bg-white overflow-hidden hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center"
                >
                  {/* Circular photo */}
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 mb-4 flex items-center justify-center"
                    style={{ background: grad }}
                  >
                    {c.photoUrl ? (
                      <Image src={c.photoUrl} alt={c.name} width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                      <span className="font-display text-3xl font-black text-white/80">{c.initials}</span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-black uppercase text-sp-dark">{c.name}</h3>
                  <p className="text-sm text-sp-muted mt-1 mb-3">{c.description}</p>

                  {/* Platform tags */}
                  <p className="text-xs font-semibold uppercase tracking-widest"
                    style={{
                      background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {c.badge}
                  </p>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
