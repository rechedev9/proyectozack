import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostSlugs, getPostBySlug } from '@/lib/queries/posts';
import { SectionTag } from '@/components/ui/SectionTag';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Blog SocialPro`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — Blog SocialPro`,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${slug}`,
      type: 'article',
      images: post.coverUrl
        ? [{ url: post.coverUrl, width: 1200, height: 630 }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Blog SocialPro`,
      description: post.excerpt,
      images: [post.coverUrl || '/og-image.jpg'],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'SocialPro' },
    publisher: { '@type': 'Organization', name: 'SocialPro' },
    datePublished: post.publishedAt?.toISOString() ?? '2025-01-01',
    image: post.coverUrl || undefined,
  };

  // Split markdown body into paragraphs for simple rendering
  const paragraphs = post.bodyMd.split('\n\n').filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero (dark) ── */}
      <section className="bg-sp-black pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-8"
          >
            <span aria-hidden="true">&larr;</span> Volver al blog
          </Link>

          <SectionTag>{post.author}</SectionTag>

          <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-4">
            {post.title}
          </h1>

          {post.publishedAt && (
            <time className="text-sm text-white/40">
              {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
      </section>

      {/* ── Body (light) ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-lg text-sp-dark font-medium leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="space-y-5 text-base text-sp-muted leading-relaxed">
            {paragraphs.map((p, i) => {
              // Simple heading detection (## Heading)
              if (p.startsWith('## ')) {
                return (
                  <h2
                    key={i}
                    className="font-display text-2xl font-black uppercase text-sp-dark mt-10 mb-2"
                  >
                    {p.slice(3)}
                  </h2>
                );
              }
              if (p.startsWith('### ')) {
                return (
                  <h3
                    key={i}
                    className="font-display text-xl font-bold uppercase text-sp-dark mt-8 mb-2"
                  >
                    {p.slice(4)}
                  </h3>
                );
              }
              return <p key={i}>{p}</p>;
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/#contacto"
              className="inline-block bg-sp-grad text-white font-display font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Hablemos de tu campaña
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
