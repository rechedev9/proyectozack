'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as m from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useScroll, useMotionValueEvent } from 'motion/react';

const NAV_LINKS = [
  { href: '#talentos', label: 'Talentos' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#casos', label: 'Casos de Éxito' },
  { href: '/blog', label: 'Blog' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#contacto', label: 'Contacto' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
        scrolled ? 'bg-sp-black/95 border-white/10' : 'bg-transparent border-transparent'
      }`}
    >
      {/* Scroll progress bar */}
      <m.div
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{
          background: 'linear-gradient(90deg,#f5632a 0%,#e03070 50%,#8b3aad 100%)',
          scaleX: scrollYProgress,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo Integration */}
        <Link href="/" className="relative group flex items-center gap-2">
          <m.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Image 
              src="/images/logos/3.png" 
              alt="SocialPro Logo" 
              width={160} 
              height={40} 
              className="h-9 w-auto object-contain transition-opacity duration-300 brightness-0 invert"
              priority
            />
          </m.div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              {l.href.startsWith('/') ? (
                <Link
                  href={l.href}
                  className="text-sm font-semibold text-sp-muted2 hover:text-white transition-colors py-3"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  href={l.href}
                  className="text-sm font-semibold text-sp-muted2 hover:text-white transition-colors py-3"
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <m.a
          href="#contacto"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
        >
          TRABAJEMOS JUNTOS
        </m.a>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white p-2"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden bg-sp-black border-t border-white/10 px-4 py-4 flex flex-col gap-4"
          >
            {NAV_LINKS.map((l, i) =>
              l.href.startsWith('/') ? (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
                >
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-sp-muted2 hover:text-white transition-colors py-2 block"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </m.div>
              ) : (
                <m.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
                  className="text-sm font-semibold text-sp-muted2 hover:text-white transition-colors py-2"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </m.a>
              )
            )}
            <m.a
              href="#contacto"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: NAV_LINKS.length * 0.04 }}
              className="text-sm font-bold text-white text-center py-2 rounded-full"
              style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
              onClick={() => setOpen(false)}
            >
              TRABAJEMOS JUNTOS
            </m.a>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
