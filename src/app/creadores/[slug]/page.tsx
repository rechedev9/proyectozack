import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTalentSlugs, getTalentBySlug } from '@/lib/queries/talents';
import { getActiveGiveaways, getFinishedGiveaways } from '@/lib/queries/giveaways';
import { CreatorHero } from './CreatorHero';
import { GiveawayGrid } from './GiveawayGrid';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getTalentSlugs();
  return slugs.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  if (!talent) return {};

  const title = `${talent.name} — Giveaways | SocialPro`;
  const description = `Sorteos activos de ${talent.name}`;

  const active = await getActiveGiveaways(talent.id);
  const ogImage = active[0]?.imageUrl ?? talent.photoUrl;

  return {
    title,
    description,
    alternates: { canonical: `/creadores/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/creadores/${slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CreadorPage({ params }: PageProps) {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  if (!talent) notFound();

  const [active, finished] = await Promise.all([
    getActiveGiveaways(talent.id),
    getFinishedGiveaways(talent.id),
  ]);

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-sm uppercase tracking-wider text-white">
            {talent.name}
          </span>
          {active.length > 0 && (
            <a
              href="#giveaways"
              className="px-4 py-1.5 rounded-full bg-[#C3FC00] text-black text-xs font-black uppercase tracking-wider hover:shadow-[0_0_12px_rgba(195,252,0,0.4)] transition-shadow"
            >
              Giveaways
            </a>
          )}
        </div>
      </header>

      <CreatorHero talent={talent} />

      {/* Giveaways content */}
      <div id="giveaways" className="max-w-5xl mx-auto px-6 pb-20 space-y-12">
        {active.length === 0 && finished.length === 0 ? (
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 mx-auto mb-4 text-white/10">
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="15" cy="10" r="1" />
              <circle cx="15" cy="14" r="1" />
              <circle cx="17" cy="12" r="1" />
              <circle cx="13" cy="12" r="1" />
            </svg>
            <p className="text-lg font-bold uppercase tracking-wider text-white/30">
              No hay sorteos activos
            </p>
            <p className="text-sm text-white/20 mt-2">Vuelve pronto</p>
          </div>
        ) : (
          <>
            <GiveawayGrid giveaways={active} title="Sorteos Activos" />
            <GiveawayGrid giveaways={finished} title="Finalizados" />
          </>
        )}
      </div>
    </>
  );
}
