import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

type Role = 'admin' | 'brand';

interface SessionWithRole {
  user: {
    id: string;
    email: string;
    name: string;
    role: string | null;
  };
}

export async function requireRole(role: Role, loginPath: string): Promise<SessionWithRole> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(loginPath);
  }

  const userRole = (session.user as { role?: string | null }).role;

  if (!userRole || userRole !== role) {
    // Wrong role or null role — redirect to their correct portal or login
    if (userRole === 'admin') redirect('/admin');
    if (userRole === 'brand') redirect('/marcas');
    redirect(loginPath);
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
