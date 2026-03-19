import type { MetadataRoute } from 'next';
import { getCaseSlugs } from '@/lib/queries/cases';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await getCaseSlugs();

  const caseEntries: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${SITE_URL}/casos/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/#talentos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#casos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...caseEntries,
  ];
}
