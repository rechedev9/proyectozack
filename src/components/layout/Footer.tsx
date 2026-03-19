import Link from 'next/link';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

export function Footer() {
  return (
    <footer className="bg-sp-black text-sp-muted2 border-t border-white/10">
      <FadeInOnScroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-black uppercase tracking-widest gradient-text block mb-3">
              SocialPro
            </span>
            <p className="text-sm leading-relaxed mb-4">
              Agencia de talentos gaming & esports. Conectamos creadores con marcas de iGaming, periféricos y más.
            </p>
            <p className="text-sm">
              <a href="tel:+34604868426" className="hover:text-white transition-colors">
                +34 604 868 426
              </a>
            </p>
            <p className="text-sm mt-1">
              <a href="mailto:marketing@socialpro.es" className="hover:text-white transition-colors">
                marketing@socialpro.es
              </a>
            </p>
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
