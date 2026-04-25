import Link from 'next/link';
import Image from 'next/image';
import type { PostWithTalents } from '@/lib/queries/posts';
import { gradientStyle } from '@/lib/gradient';

type BlogCardProps = {
  post: PostWithTalents;
}

export function BlogCard({ post }: BlogCardProps) {
  const avatars = post.talentAvatars.slice(0, 5);
  const extra = (post.talentAvatars.length ?? 0) - avatars.length;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-sp-border overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] bg-sp-black flex-shrink-0 sm:aspect-[16/9]">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sp-dark to-sp-black" />
        )}

        {/* Talent avatars — overlaid at bottom-left of cover */}
        {avatars.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center">
            {avatars.map((t, i) => (
              <div
                key={t.slug}
                className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden flex-shrink-0"
                style={{ marginLeft: i === 0 ? 0 : -10, zIndex: avatars.length - i, background: gradientStyle(t.gradientC1, t.gradientC2) }}
              >
                {t.photoUrl ? (
                  <Image src={t.photoUrl} alt={t.name} fill sizes="32px" className="object-cover object-top" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                    {t.initials}
                  </span>
                )}
              </div>
            ))}
            {extra > 0 && (
              <div
                className="relative w-8 h-8 rounded-full border-2 border-white bg-sp-dark flex items-center justify-center flex-shrink-0 text-[9px] font-black text-white"
                style={{ marginLeft: -10, zIndex: 0 }}
              >
                +{extra}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {post.publishedAt && (
          <time className="text-xs text-sp-muted">
            {new Date(post.publishedAt).toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
        )}
        <h2 className="font-display text-lg font-black uppercase text-sp-dark leading-snug mt-1 mb-2 line-clamp-2 group-hover:text-sp-orange transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-sp-muted leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <span className="inline-block mt-4 text-xs font-semibold text-sp-orange">
          Leer artículo →
        </span>
      </div>
    </Link>
  );
}
