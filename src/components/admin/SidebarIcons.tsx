const s = { width: '100%', height: '100%', viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function DashboardIcon() {
  return (
    <svg {...s}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

export function TalentIcon() {
  return (
    <svg {...s}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

export function CaseIcon() {
  return (
    <svg {...s}>
      <path d="M7 3h6l2 3H5l2-3z" />
      <rect x="3" y="6" width="14" height="11" rx="2" />
      <path d="M8 10h4" />
    </svg>
  );
}

export function BrandIcon() {
  return (
    <svg {...s}>
      <rect x="3" y="5" width="14" height="12" rx="2" />
      <path d="M7 5V3h6v2" />
      <path d="M3 10h14" />
    </svg>
  );
}

export function AnalyticsIcon() {
  return (
    <svg {...s}>
      <path d="M3 17V10l4 3 4-7 4 4 2-3" />
      <line x1="3" y1="17" x2="17" y2="17" />
    </svg>
  );
}

export function GiveawayIcon() {
  return (
    <svg {...s}>
      <path d="M10 2a2 2 0 0 1 4 0v2h3a2 2 0 0 1 2 2v2H5V6a2 2 0 0 1 2-2h3V2z" />
      <rect x="4" y="8" width="16" height="10" rx="2" />
      <path d="M12 8v10" />
    </svg>
  );
}
