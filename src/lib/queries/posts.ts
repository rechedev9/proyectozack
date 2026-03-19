import { cache } from 'react';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/db/schema';
import type { Post } from '@/types';

export async function getPostSlugs(): Promise<{ slug: string }[]> {
  return db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, 'published'));
}

export async function getPosts(): Promise<Post[]> {
  return db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    orderBy: [desc(posts.publishedAt)],
  });
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | undefined> => {
  const row = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  return row ?? undefined;
});
