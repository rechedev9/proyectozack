import { getPosts } from '@/lib/queries/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socialpro.es';

export async function GET(): Promise<Response> {
  const posts = await getPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ''}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
    </item>`
    )
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SocialPro Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Insights sobre marketing gaming, esports y creadores de contenido</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>SocialPro Blog</title>
      <link>${SITE_URL}/blog</link>
    </image>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
