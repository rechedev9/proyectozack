'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendStaffInviteEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/site-url';
import { auth } from '@/lib/auth';
import { requireRole } from '@/lib/auth-guard';

type InviteState = {
  error?: string;
  success?: boolean;
}

export async function inviteStaffAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  await requireRole('admin', '/admin/login');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || !email) return { error: 'Nombre y email son obligatorios' };

  const existing = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
  if (existing.length > 0) return { error: 'Este email ya está registrado' };

  const tempPassword = crypto.randomUUID();

  try {
    await auth.api.signUpEmail({
      body: { name, email, password: tempPassword },
    });

    await db.update(userTable).set({ role: 'staff' }).where(eq(userTable.email, email));

    const loginUrl = absoluteUrl('/admin/login');
    try {
      await sendStaffInviteEmail({ staffEmail: email, staffName: name, loginUrl });
    } catch (err) {
      const emailMsg = err instanceof Error ? err.message : 'unknown';
      console.error('[admin] Staff invite email error:', emailMsg);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] Staff creation error:', msg);
    return { error: 'Error al crear la cuenta' };
  }

  revalidatePath('/admin/equipo');
  return { success: true };
}
