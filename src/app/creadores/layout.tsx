import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { CursorTrail } from './[slug]/CursorTrail';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function CreadoresLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans gw-grid-bg gw-scanlines gw-noise">
      {/* Ambient orbs */}
      <div className="gw-orb-top" />
      <div className="gw-orb-bottom" />
      {/* Neon cursor trail */}
      <CursorTrail />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
