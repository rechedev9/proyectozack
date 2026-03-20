'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { TalentWithRelations } from '@/types';

interface CreatorHeroProps {
  talent: TalentWithRelations;
}

const socialIcons: Record<string, string> = {
  twitch: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  youtube: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  kick: 'M4 2h4v6l4-6h5l-5.5 7L17 20h-5l-4-6v6H4V2z',
};

function SocialButton({ platform, url, color }: { platform: string; url: string; color: string }) {
  const path = socialIcons[platform.toLowerCase()];
  if (!path) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ backgroundColor: `${color}20` }}
    >
      <svg viewBox="0 0 24 24" fill={color} className="w-4.5 h-4.5">
        <path d={path} />
      </svg>
    </a>
  );
}

export function CreatorHero({ talent }: CreatorHeroProps) {
  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#C3FC00]/5 via-transparent to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-6"
        >
          {/* Photo */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-[#C3FC00]/20 shadow-[0_0_30px_rgba(195,252,0,0.1)]">
            {talent.photoUrl ? (
              <Image
                src={talent.photoUrl}
                alt={talent.name}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover object-top"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-black text-white/80"
                style={{ background: `linear-gradient(135deg, ${talent.gradientC1}, ${talent.gradientC2})` }}
              >
                {talent.initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left">
            <h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none"
              style={{ textShadow: '0 0 30px rgba(195,252,0,0.15)' }}
            >
              {talent.name}
            </h1>
            <p className="text-sm text-white/50 mt-2 uppercase tracking-wider font-bold">
              {talent.role} · {talent.game}
            </p>

            {/* Social links */}
            {talent.socials.length > 0 && (
              <div className="flex gap-2 mt-4 justify-center md:justify-start">
                {talent.socials.map((s) => (
                  s.profileUrl && (
                    <SocialButton
                      key={s.id}
                      platform={s.platform}
                      url={s.profileUrl}
                      color={s.hexColor}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
