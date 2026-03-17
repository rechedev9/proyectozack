import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-sp-off flex">
      {/* Sidebar */}
      <nav className="w-56 bg-sp-black text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <span className="font-display text-xl font-black uppercase gradient-text">SocialPro</span>
          <p className="text-xs text-sp-muted2 mt-1">Admin Panel</p>
        </div>
        <div className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/talents', label: 'Talentos' },
            { href: '/admin/cases', label: 'Casos' },
            { href: '/admin/testimonials', label: 'Testimonios' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-sp-muted2 hover:text-white hover:bg-white/10 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-sp-muted truncate">{session.user.email}</p>
          <a
            href="/api/auth/sign-out"
            className="mt-2 block text-xs text-sp-muted2 hover:text-white transition-colors"
          >
            Cerrar sesión
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
