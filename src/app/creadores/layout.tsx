import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function CreadoresLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {children}
    </div>
  );
}
