import { requireRole } from '@/lib/auth-guard';
import { PortalSidebar } from '@/components/layout/PortalSidebar';
import {
  DashboardIcon,
  TalentIcon,
  BrandIcon,
  GiveawayIcon,
} from '@/components/admin/SidebarIcons';
import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireRole('admin', '/admin/login');

  return (
    <div className="min-h-screen bg-sp-admin-bg flex overflow-x-hidden">
      <PortalSidebar
        title="SocialPro"
        subtitle="Admin Panel"
        variant="dark"
        navItems={[
          { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
          { href: '/admin/talents', label: 'Roster', icon: <TalentIcon /> },
          { href: '/admin/brands', label: 'Marcas', icon: <BrandIcon /> },
          { href: '/admin/giveaways', label: 'Giveaways', icon: <GiveawayIcon /> },
        ]}
        userEmail={session.user.email}
        logoutHref="/api/auth/sign-out"
      />

      {/* Main content */}
      <main className="flex-1 p-4 pt-18 md:p-8 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
