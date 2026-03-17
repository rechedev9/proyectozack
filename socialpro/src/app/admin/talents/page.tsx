import { getTalents } from '@/lib/queries/talents';
import { deleteTalentAction } from './actions';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default async function AdminTalentsPage() {
  const talents = await getTalents();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Talentos</h1>
      <div className="space-y-3">
        {talents.map((talent) => (
          <div
            key={talent.id}
            className="flex items-center justify-between bg-white rounded-xl border border-sp-border px-5 py-4"
          >
            <div>
              <span className="font-bold text-sp-dark">{talent.name}</span>
              <span className="ml-3 text-xs text-sp-muted">{talent.role}</span>
              <span className="ml-3 text-xs text-sp-muted uppercase">{talent.platform}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  talent.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {talent.status}
              </span>
              <form action={deleteTalentAction}>
                <input type="hidden" name="id" value={talent.id} />
                <DeleteButton name={talent.name} />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
