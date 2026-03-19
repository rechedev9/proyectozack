'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface PortalSidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  userEmail: string;
  logoutHref: string;
}

export function PortalSidebar({ title, subtitle, navItems, userEmail, logoutHref }: PortalSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin' || href === '/marcas') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white px-4 h-14 border-b border-sp-border">
        <Link href="/" className="font-display text-lg font-black uppercase gradient-text">
          {title}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="text-sp-dark p-2"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed md:static z-50 top-0 left-0 h-full w-56 bg-white border-r border-sp-border flex flex-col shrink-0
        transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-sp-border/60">
          <Link href="/" className="font-display text-xl font-black uppercase gradient-text hover:opacity-80 transition-opacity">
            {title}
          </Link>
          <p className="text-[11px] text-sp-muted mt-1">{subtitle}</p>
        </div>
        <div className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-sp-off text-sp-dark'
                    : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off/60'
                }`}
              >
                {icon && <span className="w-5 h-5 shrink-0 text-sp-muted">{icon}</span>}
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sp-orange" />
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sp-border/60">
          <p className="text-[11px] text-sp-muted truncate">{userEmail}</p>
          <Link
            href={logoutHref}
            className="mt-1.5 block text-[11px] text-sp-muted hover:text-sp-dark transition-colors"
          >
            Cerrar sesión
          </Link>
        </div>
      </nav>
    </>
  );
}
