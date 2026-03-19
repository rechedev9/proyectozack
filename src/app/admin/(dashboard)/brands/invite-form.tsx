'use client';

import { useActionState } from 'react';
import { inviteBrandAction } from './actions';

export function InviteBrandForm() {
  const [state, formAction, isPending] = useActionState(inviteBrandAction, {});

  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
      <h2 className="font-bold text-sp-dark mb-4">Invitar marca</h2>
      <form action={formAction} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-sp-dark mb-1.5">Nombre</label>
          <input name="name" required className="w-full rounded-xl border border-sp-border px-4 py-2.5 text-sm outline-none focus:border-sp-orange transition-colors" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-sp-dark mb-1.5">Email</label>
          <input name="email" type="email" required className="w-full rounded-xl border border-sp-border px-4 py-2.5 text-sm outline-none focus:border-sp-orange transition-colors" />
        </div>
        <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-sp-grad hover:opacity-90 shrink-0 disabled:opacity-60">
          {isPending ? 'Invitando...' : 'Invitar'}
        </button>
      </form>
      {state.error && <p className="text-xs text-red-500 mt-2">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600 mt-2">Invitacion enviada correctamente.</p>}
    </div>
  );
}
