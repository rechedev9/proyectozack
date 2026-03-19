import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth-guard';
import { PortalSidebar } from '@/components/layout/PortalSidebar';

interface BrandPortalLayoutProps {
  children: ReactNode;
}

export default async function BrandPortalLayout({ children }: BrandPortalLayoutProps) {
  const session = await requireRole('brand', '/marcas/login');

  return (
    <div className="min-h-screen bg-sp-off flex">
      <PortalSidebar
        title="SocialPro"
        subtitle="Portal de Marcas"
        navItems={[
          { href: '/marcas', label: 'Dashboard' },
          { href: '/marcas/talentos', label: 'Talentos' },
          { href: '/marcas/propuestas', label: 'Propuestas' },
        ]}
        userEmail={session.user.email}
        logoutHref="/api/auth/sign-out"
      />
      <main className="flex-1 p-4 pt-18 md:p-8 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
