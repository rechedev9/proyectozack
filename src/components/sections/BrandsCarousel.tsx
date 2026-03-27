import Image from 'next/image';
import type { Brand } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

import type { JSX } from 'react';

type BrandsCarouselProps = {
  brands: Brand[];
}

export function BrandsCarousel({ brands }: BrandsCarouselProps): JSX.Element {
  // Duplicate for seamless marquee loop — computed once per prop change (server component)
  const items = brands.concat(brands);

  return (
    <section id="brands" className="py-20 bg-sp-off scroll-mt-24">
      <FadeInOnScroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <SectionTag>Marcas que confían en nosotros</SectionTag>
          <SectionHeading>Partners & Brands</SectionHeading>
        </div>
      </FadeInOnScroll>

      <div className="overflow-hidden">
        <div className="marquee-track--slow">
          {items.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="mx-8 flex h-16 w-28 shrink-0 items-center justify-center transition-all opacity-70 grayscale hover:opacity-100 hover:grayscale-0"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.displayName}
                  width={112}
                  height={48}
                  className="object-contain max-h-12 w-auto h-auto"
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
