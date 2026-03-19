import Link from 'next/link';
import Image from 'next/image';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

export function Footer() {
  return (
    <footer className="bg-sp-black text-sp-muted2 border-t border-white/5">
      <FadeInOnScroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/logos/4.png" 
                alt="SocialPro Logo" 
                width={140} 
                height={35} 
                className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Agencia de talentos gaming & esports de alto rendimiento. Conectamos creadores con marcas líderes en iGaming y tecnología.
            </p>
            <div className="space-y-1">
              <p className="text-sm">
                <a href="tel:+34604868426" className="hover:text-white transition-colors">
                  +34 604 868 426
                </a>
              </p>
              <p className="text-sm">
                <a href="mailto:marketing@socialpro.es" className="hover:text-white transition-colors">
                  marketing@socialpro.es
                </a>
              </p>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Navegación</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '#talentos', label: 'Talentos' },
                { href: '#servicios', label: 'Servicios' },
                { href: '#casos', label: 'Casos de Éxito' },
                { href: '/blog', label: 'Blog' },
                { href: '/para-creadores', label: 'Para Creadores' },
                { href: '#nosotros', label: 'Nosotros' },
                { href: '#contacto', label: 'Contacto' },
              ].map(({ href, label }) => (
                <li key={href}>
                  {href.startsWith('/') ? (
                    <Link href={href} className="hover:text-white transition-colors">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="hover:text-white transition-colors">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Servicios</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Talent Management',
                'Campañas iGaming',
                'YouTube Management',
                'Content Production',
                'Compliance iGaming',
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
              <li>
                <Link href="/metodologia" className="hover:text-white transition-colors">
                  Nuestra Metodología
                </Link>
              </li>
            </ul>
          </div>

          {/* Mercados */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Mercados</h3>
            <ul className="space-y-2 text-sm">
              {['España', 'Latinoamérica', 'Turquía', 'Europa', 'India & Japón'].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </FadeInOnScroll>
      <div className="border-t border-white/5 py-4 text-center text-xs text-sp-muted">
        © {new Date().getFullYear()} SocialPro. Todos los derechos reservados.
      </div>
    </footer>
  );
}
