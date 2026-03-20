type BreadcrumbItem = {
  name: string;
  url: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  const all = [{ name: 'Inicio', url: SITE_URL }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
