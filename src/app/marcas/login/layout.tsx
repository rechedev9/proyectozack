import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal de Marcas — Login | SocialPro',
  robots: { index: false, follow: false },
};

export default function BrandLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
