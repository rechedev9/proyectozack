import { getCaseStudies } from '@/lib/queries/cases';
import { deleteCaseAction } from './actions';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default async function AdminCasesPage(): Promise<React.ReactElement> {
  const cases = await getCaseStudies();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text mb-8">Casos de éxito</h1>
      <div className="space-y-3">
        {cases.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-sp-admin-card rounded-xl border border-sp-admin-border px-5 py-4 hover:bg-sp-admin-hover transition-colors"
          >
            <div>
              <span className="font-bold text-sp-admin-text">{c.brandName}</span>
              <span className="ml-3 text-xs text-sp-admin-muted line-clamp-1 max-w-md">{c.title}</span>
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
