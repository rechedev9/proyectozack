import Image from 'next/image';
import type { Brand } from '@/types';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

type BrandsCarouselProps = {
  brands: Brand[];
}

export function BrandsCarousel({ brands }: BrandsCarouselProps) {
  // Duplicate for seamless marquee loop — computed once per prop change (server component)
  const items = brands.concat(brands);

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
              className="mx-4 shrink-0 transition-opacity opacity-80 hover:opacity-100"
            >
              <div className="bg-white rounded-xl border border-sp-border shadow-sm flex items-center justify-center"
                   style={{ width: 160, height: 64 }}>
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.displayName}
                    width={120}
                    height={30}
                    style={{ width: 120, height: 30, objectFit: 'contain' }}
                  />
                ) : (
                  <span className="text-xs font-bold text-sp-dark uppercase tracking-wide">{brand.displayName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
