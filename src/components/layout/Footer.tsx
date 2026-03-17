export function Footer() {
  return (
    <footer className="bg-sp-black text-sp-muted2 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <span className="font-display text-2xl font-black uppercase tracking-widest gradient-text block mb-3">
            SocialPro
          </span>
          <p className="text-sm leading-relaxed">
            Agencia de talentos gaming & esports. Conectamos creadores con marcas de iGaming, periféricos y más.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Navegación</h3>
          <ul className="space-y-2 text-sm">
            {['#talentos', '#servicios', '#casos', '#equipo', '#contacto'].map((href) => (
              <li key={href}>
                <a href={href} className="hover:text-white transition-colors capitalize">
                  {href.replace('#', '')}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Contacto</h3>
          <p className="text-sm">
            <a href="mailto:marketing@socialpro.es" className="hover:text-white transition-colors">
              marketing@socialpro.es
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-sp-muted">
        © {new Date().getFullYear()} SocialPro. Todos los derechos reservados.
      </div>
    </footer>
  );
}
