import { db } from '@/lib/db';
import { talents, caseStudies, testimonials, contactSubmissions } from '@/db/schema';
import { sql } from 'drizzle-orm';

export default async function AdminDashboardPage() {
  const [talentCount, caseCount, testimonialCount, submissionCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(talents),
    db.select({ count: sql<number>`count(*)` }).from(caseStudies),
    db.select({ count: sql<number>`count(*)` }).from(testimonials),
    db.select({ count: sql<number>`count(*)` }).from(contactSubmissions),
  ]);

  const stats = [
    { label: 'Talentos', value: talentCount[0]?.count ?? 0, href: '/admin/talents' },
    { label: 'Casos', value: caseCount[0]?.count ?? 0, href: '/admin/cases' },
    { label: 'Testimonios', value: testimonialCount[0]?.count ?? 0, href: '/admin/testimonials' },
    { label: 'Contactos', value: submissionCount[0]?.count ?? 0, href: '#' },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, href }) => (
          <a
            key={label}
            href={href}
            className="rounded-2xl bg-white border border-sp-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="font-display text-4xl font-black gradient-text">{value}</div>
            <div className="text-sm text-sp-muted mt-1">{label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
