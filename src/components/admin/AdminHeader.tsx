import { SearchIcon, BellIcon, SettingsIcon } from './SidebarIcons';

export function AdminHeader(): React.ReactElement {
  return (
    <header className="sticky top-0 z-30 h-16 bg-sp-admin-bg/95 backdrop-blur border-b border-sp-admin-border flex items-center gap-3 px-4 md:px-6">
      {/* Search — hidden on small mobile, grows on larger screens */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sp-admin-muted pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Buscar…"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-sp-admin-card border border-sp-admin-border text-[13px] text-sp-admin-text placeholder:text-sp-admin-muted focus:outline-none focus:border-sp-admin-accent/60 transition-colors"
          aria-label="Buscar"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
          aria-label="Notificaciones"
        >
          <span className="w-5 h-5 block"><BellIcon /></span>
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
          aria-label="Ajustes"
        >
          <span className="w-5 h-5 block"><SettingsIcon /></span>
        </button>
      </div>
    </header>
  );
}
