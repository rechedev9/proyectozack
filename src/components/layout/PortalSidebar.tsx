'use client';

import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-sp-black px-4 h-14 border-b border-white/10">
        <Link href="/" className="font-display text-lg font-black uppercase gradient-text">
          {title}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="text-white p-2"
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
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed md:static z-50 top-0 left-0 h-full w-56 bg-sp-black text-white flex flex-col shrink-0
        transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
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
              onClick={() => setOpen(false)}
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
            Cerrar sesión
          </Link>
        </div>
      </nav>
    </>
  );
}
