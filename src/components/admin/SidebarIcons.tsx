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

export function ContactIcon() {
  return (
    <svg {...s}>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 7l8 5 8-5" />
    </svg>
  );
}

export function AgencyIcon() {
  return (
    <svg {...s}>
      <rect x="4" y="8" width="12" height="9" rx="1" />
      <path d="M7 8V5a3 3 0 0 1 6 0v3" />
      <line x1="8" y1="12" x2="8" y2="14" />
      <line x1="12" y1="12" x2="12" y2="14" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg {...s}>
      <rect x="3" y="12" width="3" height="5" rx="0.5" />
      <rect x="8.5" y="7" width="3" height="10" rx="0.5" />
      <rect x="14" y="3" width="3" height="14" rx="0.5" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg {...s}>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="14" cy="7" r="2.5" />
      <path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M12 14.5c1-.9 2.3-1.5 3.5-1.5 2.5 0 4.5 2.2 4.5 5" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg {...s}>
      <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15.5 5 18l1-5.5-4-4 5.5-1z" />
    </svg>
  );
}
