'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendBrandInviteEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/site-url';
import { auth } from '@/lib/auth';
import { requireRole } from '@/lib/auth-guard';

type InviteState = {
  error?: string;
  success?: boolean;
}

export async function inviteBrandAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  // Auth gate — only admins can invite brands
  await requireRole('admin', '/admin/login');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || !email) return { error: 'Nombre y email son obligatorios' };

  // Check if email already exists
  const existing = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
  if (existing.length > 0) return { error: 'Este email ya está registrado' };

  // Generate a random temp password (brand will set their own via invite link)
  const tempPassword = crypto.randomUUID();

  try {
    // Create user via Better Auth sign-up API
    await auth.api.signUpEmail({
      body: { name, email, password: tempPassword },
    });

    // Set role to 'brand'
    await db.update(userTable).set({ role: 'brand' }).where(eq(userTable.email, email));

    // Send invite email — brand sets their own password by clicking "set password"
    // which links to the brand login page (they use "forgot password" from there)
    const portalUrl = absoluteUrl('/marcas/login');
    try {
      await sendBrandInviteEmail({ brandEmail: email, brandName: name, resetUrl: portalUrl });
    } catch (err) {
      const emailMsg = err instanceof Error ? err.message : 'unknown';
      console.error('[admin] Brand invite email error:', emailMsg);
      // Account created but email failed — admin can resend or share link manually
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[admin] Brand creation error:', msg);
    return { error: 'Error al crear la cuenta' };
  }

  revalidatePath('/admin/brands');
  return { success: true };
}
