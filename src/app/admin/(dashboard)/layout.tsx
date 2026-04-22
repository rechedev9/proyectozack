import { requireAnyRole } from '@/lib/auth-guard';
import { PortalSidebar } from '@/components/layout/PortalSidebar';
import {
  DashboardIcon,
  TalentIcon,
  BrandIcon,
  GiveawayIcon,
  TeamIcon,
  TargetsIcon,
  StatsIcon,
  TasksIcon,
  MyWeekIcon,
  InvoiceIcon,
} from '@/components/admin/SidebarIcons';
import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
}

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/admin/mi-semana', label: 'Mi Semana', icon: <MyWeekIcon /> },
  { href: '/admin/tareas', label: 'Tareas', icon: <TasksIcon /> },
  { href: '/admin/equipo', label: 'Equipo', icon: <TeamIcon /> },
  { href: '/admin/talents', label: 'Roster', icon: <TalentIcon />, prefetch: false },
  { href: '/admin/brands', label: 'Marcas', icon: <BrandIcon /> },
  { href: '/admin/facturacion', label: 'Facturación', icon: <InvoiceIcon />, prefetch: false },
  { href: '/admin/targets', label: 'Targets', icon: <TargetsIcon />, prefetch: false },
  { href: '/admin/giveaways', label: 'Giveaways', icon: <GiveawayIcon />, prefetch: false },
  { href: '/admin/stats', label: 'Stats', icon: <StatsIcon />, prefetch: false },
] as const;

const STAFF_NAV = [
  { href: '/admin/mi-semana', label: 'Mi Semana', icon: <MyWeekIcon /> },
  { href: '/admin/tareas', label: 'Tareas', icon: <TasksIcon /> },
  { href: '/admin/equipo', label: 'Equipo', icon: <TeamIcon /> },
  { href: '/admin/targets', label: 'Targets', icon: <TargetsIcon />, prefetch: false },
] as const;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireAnyRole(['admin', 'staff'], '/admin/login');
  const navItems = session.user.role === 'staff' ? STAFF_NAV : ADMIN_NAV;

  return (
    <div className="min-h-screen bg-sp-admin-bg flex overflow-x-hidden">
      <PortalSidebar
        title="SocialPro"
        subtitle="Admin Panel"
        variant="dark"
        navItems={[...navItems]}
        userEmail={session.user.email}
        logoutHref="/api/auth/sign-out"
      />

      {/* Main content */}
      <main className="flex-1 p-4 pt-18 md:p-8 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
