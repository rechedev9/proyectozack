import { requireRole } from '@/lib/auth-guard';
import { PortalSidebar } from '@/components/layout/PortalSidebar';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireRole('admin', '/admin/login');

  return (
    <div className="min-h-screen bg-sp-off flex">
      <PortalSidebar
        title="SocialPro"
        subtitle="Admin Panel"
        navItems={[
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/talents', label: 'Talentos' },
          { href: '/admin/cases', label: 'Casos' },
          { href: '/admin/brands', label: 'Marcas' },
          { href: '/admin/analytics', label: 'Analytics' },
        ]}
        userEmail={session.user.email}
        logoutHref="/api/auth/sign-out"
      />

      {/* Main content */}
      <main className="flex-1 p-4 pt-18 md:p-8 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
