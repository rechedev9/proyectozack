import { db } from '@/lib/db';
import { user as userTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { InviteBrandForm } from '@/components/admin/brands/invite-form';
import { BrandsCrmManager } from '@/components/admin/brands/BrandsCrmManager';
import { BrandsTabs } from '@/components/admin/brands/BrandsTabs';
import { listCrmBrands, getBrandContacts } from '@/lib/queries/crmBrands';

export default async function AdminBrandsPage(): Promise<React.ReactElement> {
  const [brandUsers, crmBrands] = await Promise.all([
    db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.role, 'brand'))
      .orderBy(desc(userTable.createdAt)),
    listCrmBrands(),
  ]);

  const contactsByBrand: Record<number, Awaited<ReturnType<typeof getBrandContacts>>> = {};
  await Promise.all(
    crmBrands.map(async (b) => {
      contactsByBrand[b.id] = await getBrandContacts(b.id);
    }),
  );

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text mb-8">Marcas</h1>

      <BrandsTabs
        defaultKey="crm"
        tabs={[
          {
            key: 'crm',
            label: 'CRM',
            content: <BrandsCrmManager brands={crmBrands} contactsByBrand={contactsByBrand} />,
          },
          {
            key: 'portal',
            label: `Portal (${brandUsers.length})`,
            content: (
              <div className="space-y-6">
                <InviteBrandForm />
                {brandUsers.length === 0 ? (
                  <p className="text-sm text-sp-admin-muted">No hay marcas registradas en el portal. Invita tu primera marca.</p>
                ) : (
                  <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                          <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Nombre</th>
                          <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Email</th>
                          <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Creado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandUsers.map((brand) => (
                          <tr key={brand.id} className="border-b border-sp-admin-border/50 last:border-0 hover:bg-sp-admin-hover transition-colors">
                            <td className="px-6 py-4 font-medium text-sp-admin-text">{brand.name}</td>
                            <td className="px-6 py-4 text-sp-admin-muted">{brand.email}</td>
                            <td className="px-6 py-4 text-sp-admin-muted">{new Date(brand.createdAt).toLocaleDateString('es-ES')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
