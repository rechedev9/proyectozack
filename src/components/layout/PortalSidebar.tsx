import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
}

interface PortalSidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  userEmail: string;
  logoutHref: string;
}

export function PortalSidebar({ title, subtitle, navItems, userEmail, logoutHref }: PortalSidebarProps) {
  return (
    <nav className="w-56 bg-sp-black text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="font-display text-xl font-black uppercase gradient-text hover:opacity-80 transition-opacity">
          {title}
        </Link>
        <p className="text-xs text-sp-muted2 mt-1">{subtitle}</p>
      </div>
      <div className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-sp-muted2 hover:text-white hover:bg-white/10 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-sp-muted truncate">{userEmail}</p>
        <Link
          href={logoutHref}
          className="mt-2 block text-xs text-sp-muted2 hover:text-white transition-colors"
        >
          Cerrar sesion
        </Link>
      </div>
    </nav>
  );
}
