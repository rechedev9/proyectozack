'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const PORTAL_PREFIXES = ['/admin', '/marcas', '/creadores'];
const LOGIN_SUFFIXES = ['/login'];

function isPortalRoute(pathname: string): boolean {
  for (const prefix of PORTAL_PREFIXES) {
    if (!pathname.startsWith(prefix)) continue;
    // Allow login pages to keep public chrome
    if (LOGIN_SUFFIXES.some((s) => pathname.endsWith(s))) return false;
    return true;
  }
  return false;
}

type PublicChromeProps = {
  nav: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function PublicChrome({ nav, footer, children }: PublicChromeProps) {
  const pathname = usePathname();
  const isPortal = isPortalRoute(pathname);

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      {nav}
      <main className="pt-16">{children}</main>
      {footer}
    </>
  );
}
