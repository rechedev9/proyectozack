import { getTestimonials } from '@/lib/queries/content';
import { deleteTestimonialAction } from './actions';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-sp-dark mb-8">Testimonios</h1>
      <div className="space-y-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex items-start justify-between bg-white rounded-xl border border-sp-border px-5 py-4 gap-4"
          >
            <div className="flex-1">
              <p className="text-sm text-sp-dark italic line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-xs text-sp-muted mt-1 font-semibold">{t.authorName} — {t.authorRole}</p>
            </div>
            <form action={deleteTestimonialAction} className="shrink-0">
              <input type="hidden" name="id" value={t.id} />
              <DeleteButton name="testimonio" />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
