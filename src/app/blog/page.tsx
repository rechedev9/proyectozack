import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/queries/posts';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Marketing Gaming — Insights y Tendencias',
  description:
    'Artículos sobre marketing gaming, esports, estrategias para creadores y tendencias del sector iGaming en España y Latinoamérica.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <section className="bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="sr-only">Marketing Gaming — Insights y Tendencias</h1>
        <SectionTag>Blog</SectionTag>
        <SectionHeading>Insights & Tendencias</SectionHeading>
        <p className="text-sp-muted mt-3 mb-12 max-w-xl">
          Estrategias, análisis y guías sobre marketing gaming, esports y el ecosistema de creadores en español.
        </p>

        {posts.length === 0 ? (
          <p className="text-sp-muted text-center py-20">Próximamente nuevos artículos.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-sp-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.coverUrl && (
                  <div className="relative h-44 bg-sp-off">
                    <Image
                      src={post.coverUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.publishedAt && (
                    <time className="text-xs text-sp-muted">
                      {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  <h2 className="font-display text-lg font-black uppercase text-sp-dark leading-snug mt-1 mb-2 line-clamp-2 group-hover:text-sp-orange transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-sp-muted leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-block mt-3 text-xs font-semibold text-sp-orange">
                    Leer artículo &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
