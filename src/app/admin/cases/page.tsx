import { getCaseStudies } from '@/lib/queries/cases';
import { deleteCaseAction } from './actions';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default async function AdminCasesPage() {
  const cases = await getCaseStudies();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Casos de éxito</h1>
      <div className="space-y-3">
        {cases.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-white rounded-xl border border-sp-border px-5 py-4"
          >
            <div>
              <span className="font-bold text-sp-dark">{c.brandName}</span>
              <span className="ml-3 text-xs text-sp-muted line-clamp-1 max-w-md">{c.title}</span>
            </div>
            <form action={deleteCaseAction}>
              <input type="hidden" name="id" value={c.id} />
              <DeleteButton name={`caso ${c.brandName}`} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
