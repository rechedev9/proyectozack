import Image from 'next/image';
import { getAllGiveaways } from '@/lib/queries/giveaways';
import { getAllTalents } from '@/lib/queries/talents';
import { createGiveawayAction, deleteGiveawayAction } from './actions';

function isActive(endsAt: Date): boolean {
  return new Date(endsAt) > new Date();
}

interface PageProps {
  searchParams: Promise<{ creator?: string; status?: string }>;
}

export default async function AdminGiveawaysPage({ searchParams }: PageProps) {
  const { creator, status } = await searchParams;
  const [allGiveaways, allTalents] = await Promise.all([
    getAllGiveaways(),
    getAllTalents(),
  ]);

  let giveaways = allGiveaways;
  if (creator) {
    giveaways = giveaways.filter((g) => g.talent.slug === creator);
  }
  if (status === 'active') {
    giveaways = giveaways.filter((g) => isActive(g.endsAt));
  } else if (status === 'finished') {
    giveaways = giveaways.filter((g) => !isActive(g.endsAt));
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Giveaways</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form className="flex gap-3">
          <select name="creator" defaultValue={creator ?? ''} className="rounded-lg border border-sp-border px-3 py-2 text-sm">
            <option value="">Todos los creadores</option>
            {allTalents.map((t) => (
              <option key={t.id} value={t.slug}>{t.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={status ?? ''} className="rounded-lg border border-sp-border px-3 py-2 text-sm">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="finished">Finalizado</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-sp-off text-sp-dark text-sm font-semibold hover:bg-sp-bg2 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* Create form */}
      <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold uppercase text-sp-dark mb-4">Crear Giveaway</h2>
        <form action={createGiveawayAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Creador</label>
            <select name="talentId" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm">
              <option value="">Seleccionar...</option>
              {allTalents.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Titulo del premio</label>
            <input name="title" required maxLength={200} className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Marca</label>
            <input name="brandName" required maxLength={150} className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Valor</label>
            <input name="value" maxLength={50} placeholder="1.250€" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">URL del sorteo</label>
            <input name="redirectUrl" type="url" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Imagen del premio (URL)</label>
            <input name="imageUrl" type="url" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Logo de marca (URL)</label>
            <input name="brandLogo" type="url" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Descripcion</label>
            <input name="description" className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Inicio</label>
            <input name="startsAt" type="datetime-local" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sp-dark mb-1">Fin</label>
            <input name="endsAt" type="datetime-local" required className="w-full rounded-lg border border-sp-border px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-sp-dark text-white text-sm font-bold hover:bg-sp-black transition-colors">
              Crear Giveaway
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {giveaways.length === 0 ? (
        <p className="text-sm text-sp-muted">No hay giveaways. Crea el primero.</p>
      ) : (
        <div className="rounded-2xl bg-white border border-sp-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sp-border bg-sp-off">
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Imagen</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Premio</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Creador</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Marca</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Valor</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Fin</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-dark">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {giveaways.map((g) => (
                <tr key={g.id} className="border-b border-sp-border/50 last:border-0">
                  <td className="px-6 py-4">
                    {g.imageUrl ? (
                      <Image src={g.imageUrl} alt={g.title} width={48} height={36} className="rounded object-contain bg-gray-100" />
                    ) : (
                      <div className="w-12 h-9 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">—</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-sp-dark">{g.title}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.talent.name}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.brandName}</td>
                  <td className="px-6 py-4 text-sp-muted">{g.value || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive(g.endsAt) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isActive(g.endsAt) ? 'Activo' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sp-muted">
                    {new Date(g.endsAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <form action={deleteGiveawayAction}>
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="talentSlug" value={g.talent.slug} />
                      <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
