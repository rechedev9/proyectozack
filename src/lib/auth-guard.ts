import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

type Role = 'admin' | 'brand';

/** Only these paths are valid redirect targets — prevents open redirect. */
const ALLOWED_LOGIN_PATHS = new Set(['/admin/login', '/marcas/login']);

type SessionWithRole = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string | null;
  };
}

export async function requireRole(role: Role, loginPath: string): Promise<SessionWithRole> {
  const safePath = ALLOWED_LOGIN_PATHS.has(loginPath) ? loginPath : '/';
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(safePath);
  }

  const userRole = (session.user as { role?: string | null }).role;

  if (!userRole || userRole !== role) {
    // Wrong role or null role — redirect to their correct portal or login
    if (userRole === 'admin') redirect('/admin');
    if (userRole === 'brand') redirect('/marcas');
    redirect(safePath);
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole,
    },
  };
}
