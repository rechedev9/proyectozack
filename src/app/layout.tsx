import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PublicChrome } from '@/components/layout/PublicChrome';
import { CookieConsent } from '@/components/layout/CookieConsent';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export const metadata: Metadata = {
  title: 'SocialPro — Agencia Gaming & Esports',
  description:
    'Agencia de talentos gaming y esports. Conectamos streamers y creadores con las mejores marcas de iGaming, periféricos y entretenimiento.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'SocialPro — Agencia Gaming & Esports',
    description:
      'Conectamos streamers y creadores con las mejores marcas de iGaming. +13 años, +15M views/mes, +340 FTDs.',
    url: SITE_URL,
    siteName: 'SocialPro',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SocialPro — Agencia Gaming & Esports',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialPro — Agencia Gaming & Esports',
    description:
      'Conectamos streamers y creadores con las mejores marcas de iGaming. +13 años, +15M views/mes.',
    images: ['/og-image.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'SocialPro',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        'Agencia de talentos gaming y esports. Conectamos streamers y creadores con las mejores marcas de iGaming.',
      foundingDate: '2012',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+34-604-868-426',
        email: 'marketing@socialpro.es',
        contactType: 'sales',
        availableLanguage: 'Spanish',
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'SocialPro',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'es',
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#localbusiness`,
      name: 'SocialPro',
      url: SITE_URL,
      telephone: '+34-604-868-426',
      email: 'marketing@socialpro.es',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ES',
      },
      makesOffer: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Gestión de Talentos Gaming' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Campañas para Marcas iGaming' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Gestión de Canales YouTube' } },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${barlowCondensed.variable} antialiased`}>
        <PublicChrome nav={<Nav />} footer={<Footer />}>
          {children}
        </PublicChrome>
        <CookieConsent />
      </body>
    </html>
  );
}
