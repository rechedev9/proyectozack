'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { statsShares, user } from '@/db/schema';

export async function createStatsShareLink(): Promise<{ id: number; token: string } | null> {
  const session = await requireRole('admin', '/admin/login');

  const token = randomBytes(16).toString('base64url');

  if (process.env.NODE_ENV === 'development' && session.user.id === 'dev') {
    const now = new Date();
    await db
      .insert(user)
      .values({
        id: 'dev',
        name: session.user.name,
        email: session.user.email,
        emailVerified: true,
        role: session.user.role,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: user.id });
  }

  const [row] = await db
    .insert(statsShares)
    .values({ token, createdBy: session.user.id })
    .returning({ id: statsShares.id });

  revalidatePath('/admin/stats');
  return row ? { id: row.id, token } : null;
}

export async function revokeStatsShareLink(id: number): Promise<void> {
  await requireRole('admin', '/admin/login');

  await db
    .update(statsShares)
    .set({ revokedAt: new Date() })
    .where(eq(statsShares.id, id));

  revalidatePath('/admin/stats');
}
