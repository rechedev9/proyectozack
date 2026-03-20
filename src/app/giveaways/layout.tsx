import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giveaways — SocialPro',
  description: 'Sorteos activos de los creadores de SocialPro',
  robots: { index: true, follow: true },
};

export default function GiveawaysLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sp-black text-white font-sans gw-grid-bg gw-scanlines gw-noise">
      <div className="gw-orb-top" style={{ background: 'radial-gradient(ellipse, rgba(245,99,42,0.06) 0%, transparent 70%)' }} />
      <div className="gw-orb-bottom" style={{ background: 'radial-gradient(ellipse, rgba(139,58,173,0.04) 0%, transparent 70%)' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
