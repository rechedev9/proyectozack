import type { Testimonial } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { gradientStyle } from '@/lib/gradient';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-24 bg-sp-off">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Lo que dicen de nosotros</SectionTag>
          <SectionHeading>
            <GradientText>Testimonios</GradientText>
          </SectionHeading>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const grad = gradientStyle(t.gradientC1, t.gradientC2);
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-sp-border bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 text-2xl" style={{ color: t.gradientC1 }}>❝</div>
                <p className="text-sm text-sp-dark leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-sp-border pt-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ background: grad }}
                  >
                    {t.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-sp-dark">{t.authorName}</div>
                    <div className="text-xs text-sp-muted">{t.authorRole}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
