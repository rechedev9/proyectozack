import Image from 'next/image';
import type { Collaborator } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { gradientStyle } from '@/lib/gradient';

interface CollabsSectionProps {
  collaborators: Collaborator[];
}

export function CollabsSection({ collaborators }: CollabsSectionProps) {
  return (
    <section className="py-24 bg-sp-off">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Colaboraciones externas</SectionTag>
          <SectionHeading>
            Creadores <GradientText>colaboradores</GradientText>
          </SectionHeading>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {collaborators.map((c) => {
            const grad = gradientStyle(c.gradientC1, c.gradientC2);
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-sp-border bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40" style={{ background: grad }}>
                  {c.photoUrl ? (
                    <Image src={c.photoUrl} alt={c.name} fill className="object-cover object-top" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-5xl font-black text-white/80">{c.initials}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl font-black uppercase text-sp-dark">{c.name}</h3>
                  <p className="text-sm text-sp-muted mt-1">{c.description}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-sp-orange bg-sp-orange/10 px-3 py-1 rounded-full">
                    {c.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
