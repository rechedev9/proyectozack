'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  prefetch?: boolean | null;
}

type PortalSidebarProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  userEmail: string;
  logoutHref: string;
  variant?: 'light' | 'dark';
}

export function PortalSidebar({
  title,
  subtitle,
  navItems,
  userEmail,
  logoutHref,
  variant = 'light',
}: PortalSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dark = variant === 'dark';

  function isActive(href: string): boolean {
    if (href === '/admin' || href === '/marcas') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b ${
        dark
          ? 'bg-sp-admin-sidebar border-sp-admin-border'
          : 'bg-white border-sp-border'
      }`}>
        <Link href="/" className="font-display text-lg font-black uppercase gradient-text">
          {title}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`p-2 ${dark ? 'text-sp-admin-text' : 'text-sp-dark'}`}
          aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Cerrar menu"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed md:static z-50 top-0 left-0 h-full w-56 flex flex-col shrink-0
        transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${dark
          ? 'bg-sp-admin-sidebar'
          : 'bg-white border-r border-sp-border'
        }
      `}>
        <div className={`p-6 border-b ${dark ? 'border-sp-admin-border' : 'border-sp-border/60'}`}>
          <Link href="/" className="font-display text-xl font-black uppercase gradient-text hover:opacity-80 transition-opacity">
            {title}
          </Link>
          <p className={`text-[11px] mt-1 ${dark ? 'text-sp-admin-muted' : 'text-sp-muted'}`}>{subtitle}</p>
        </div>
        <div className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map(({ href, label, icon, prefetch }) => {
            const active = isActive(href);
            const prefetchValue = prefetch ?? null;
            return (
              <Link
                key={href}
                href={href}
                prefetch={prefetchValue}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  dark
                    ? active
                      ? 'bg-sp-admin-accent/10 text-sp-admin-accent'
                      : 'text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover'
                    : active
                      ? 'bg-sp-off text-sp-dark'
                      : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off/60'
                }`}
              >
                {icon && (
                  <span className={`w-5 h-5 shrink-0 ${
                    dark
                      ? active ? 'text-sp-admin-accent' : 'text-sp-admin-muted'
                      : 'text-sp-muted'
                  }`}>{icon}</span>
                )}
                {label}
                {active && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${
                    dark ? 'bg-sp-admin-accent' : 'bg-sp-orange'
                  }`} />
                )}
              </Link>
            );
          })}
        </div>
        <div className={`p-4 border-t ${dark ? 'border-sp-admin-border' : 'border-sp-border/60'}`}>
          <p className={`text-[11px] truncate ${dark ? 'text-sp-admin-muted' : 'text-sp-muted'}`}>{userEmail}</p>
          <Link
            href={logoutHref}
            className={`mt-1.5 block text-[11px] transition-colors ${
              dark
                ? 'text-sp-admin-muted hover:text-sp-admin-text'
                : 'text-sp-muted hover:text-sp-dark'
            }`}
          >
            Cerrar sesión
          </Link>
        </div>
      </nav>
    </>
  );
}
