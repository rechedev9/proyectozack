import Image from 'next/image';
import type { Brand } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

interface BrandsCarouselProps {
  brands: Brand[];
}

export function BrandsCarousel({ brands }: BrandsCarouselProps) {
  const items = [...brands, ...brands]; // duplicate for marquee

  return (
    <section className="py-20 bg-sp-off">
      <FadeInOnScroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <SectionTag>Marcas que confían en nosotros</SectionTag>
          <SectionHeading>Partners & Brands</SectionHeading>
        </div>
      </FadeInOnScroll>

      <div className="overflow-hidden">
        <div className="marquee-track">
          {items.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="mx-8 w-28 h-16 flex items-center justify-center shrink-0 transition-all opacity-80 hover:opacity-100"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.displayName}
                  width={112}
                  height={48}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto', maxHeight: '48px' }}
                />
              ) : (
                <span className="text-xs font-bold text-sp-muted uppercase">{brand.displayName}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
