'use client';

import { useActionState, useState, useTransition } from 'react';
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  createContactAction,
  updateContactAction,
  deleteContactAction,
  createFollowupAction,
  completeFollowupAction,
  deleteFollowupAction,
} from '@/app/admin/(dashboard)/brands/crm-actions';
import type {
  CrmBrandRow,
  CrmBrandContact,
  CrmBrandFollowup,
  CrmBrandFollowupWithBrand,
  CrmBrandStatus,
} from '@/types';
import {
  CRM_BRAND_STATUSES,
  CRM_BRAND_TIPOS,
  CRM_BRAND_SECTORES,
  CRM_BRAND_GEOS,
  SECTOR_LABELS,
  GEO_LABELS,
  type CrmBrandSector,
  type CrmBrandGeo,
} from '@/lib/schemas/crmBrand';

const STATUS_LABELS: Record<CrmBrandStatus, string> = {
  lead: 'Lead',
  activa: 'Activa',
  pausada: 'Pausada',
  archivada: 'Archivada',
};

const STATUS_STYLES: Record<CrmBrandStatus, string> = {
  lead: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  activa: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pausada: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  archivada: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const TIPO_LABELS: Record<string, string> = {
  agencia: 'Agencia',
  marca: 'Marca',
};

type BrandsCrmManagerProps = {
  readonly brands: readonly CrmBrandRow[];
  readonly contactsByBrand: Readonly<Record<number, readonly CrmBrandContact[]>>;
  readonly followupsByBrand: Readonly<Record<number, readonly CrmBrandFollowup[]>>;
  readonly upcomingFollowups: readonly CrmBrandFollowupWithBrand[];
};

const INPUT = 'w-full rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors';
const LABEL = 'block text-[11px] uppercase tracking-wider font-semibold text-sp-admin-muted mb-1';
const BTN_PRIMARY = 'px-4 py-2 rounded-full text-sm font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer';
const BTN_GHOST = 'px-3 py-1.5 rounded-full text-xs font-semibold text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover transition-colors cursor-pointer';

export function BrandsCrmManager({
  brands,
  contactsByBrand,
  followupsByBrand,
  upcomingFollowups,
}: BrandsCrmManagerProps): React.ReactElement {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);

  const overdue = upcomingFollowups.filter((f) => new Date(f.scheduledAt) < new Date());
  const upcoming = upcomingFollowups.filter((f) => new Date(f.scheduledAt) >= new Date());

  return (
    <div className="space-y-6">
      {/* Follow-up widget */}
      {upcomingFollowups.length > 0 && (
        <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-sp-admin-muted mb-3">
            Próximos seguimientos
          </h3>
          {overdue.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">Vencidos</p>
              <div className="space-y-1.5">
                {overdue.map((f) => (
                  <FollowupWidgetRow key={f.id} followup={f} isOverdue />
                ))}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-sp-admin-muted font-semibold mb-2">Próximos 30 días</p>
              <div className="space-y-1.5">
                {upcoming.map((f) => (
                  <FollowupWidgetRow key={f.id} followup={f} isOverdue={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-sp-admin-muted">
          {brands.length} {brands.length === 1 ? 'marca' : 'marcas'} en el CRM
        </p>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className={BTN_PRIMARY}
        >
          {showCreate ? 'Cancelar' : '+ Nueva marca'}
        </button>
      </div>

      {showCreate && (
        <BrandForm
          mode="create"
          onDone={() => setShowCreate(false)}
        />
      )}

      {brands.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sp-admin-border p-12 text-center">
          <p className="text-sm text-sp-admin-muted">
            No hay marcas registradas todavía. Crea la primera para empezar tu CRM.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Marca</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Sector</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Owner</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Contacto principal</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => {
                const isExpanded = expandedId === brand.id;
                const isEditing = editingBrandId === brand.id;
                const contacts = contactsByBrand[brand.id] ?? [];
                const followups = followupsByBrand[brand.id] ?? [];
                return (
                  <BrandRow
                    key={brand.id}
                    brand={brand}
                    contacts={contacts}
                    followups={followups}
                    isExpanded={isExpanded}
                    isEditing={isEditing}
                    onToggleExpand={() => {
                      setEditingBrandId(null);
                      setExpandedId(isExpanded ? null : brand.id);
                    }}
                    onEdit={() => {
                      setEditingBrandId(isEditing ? null : brand.id);
                      if (!isExpanded) setExpandedId(brand.id);
                    }}
                    onCloseEdit={() => setEditingBrandId(null)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FollowupWidgetRow({
  followup,
  isOverdue,
}: {
  readonly followup: CrmBrandFollowupWithBrand;
  readonly isOverdue: boolean;
}): React.ReactElement {
  const date = new Date(followup.scheduledAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  return (
    <div className={`flex items-start gap-3 rounded-xl px-3 py-2 text-xs ${isOverdue ? 'bg-red-500/10' : 'bg-sp-admin-bg'}`}>
      <span className={`font-mono font-semibold shrink-0 ${isOverdue ? 'text-red-400' : 'text-sp-admin-muted'}`}>{date}</span>
      <span className="font-semibold text-sp-admin-text shrink-0">{followup.brandName}</span>
      <span className="text-sp-admin-muted truncate">{followup.note}</span>
    </div>
  );
}

type BrandRowProps = {
  readonly brand: CrmBrandRow;
  readonly contacts: readonly CrmBrandContact[];
  readonly followups: readonly CrmBrandFollowup[];
  readonly isExpanded: boolean;
  readonly isEditing: boolean;
  readonly onToggleExpand: () => void;
  readonly onEdit: () => void;
  readonly onCloseEdit: () => void;
};

function BrandRow({ brand, contacts, followups, isExpanded, isEditing, onToggleExpand, onEdit, onCloseEdit }: BrandRowProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [showAddContact, setShowAddContact] = useState(false);
  const primary = brand.primaryContact;

  const onDelete = (): void => {
    if (!confirm(`¿Eliminar la marca "${brand.name}" y todos sus contactos?`)) return;
    startTransition(async () => {
      await deleteBrandAction(brand.id);
    });
  };

  const pendingFollowups = followups.filter((f) => !f.completedAt).length;

  return (
    <>
      <tr
        className={`border-b border-sp-admin-border/50 last:border-0 hover:bg-sp-admin-hover transition-colors cursor-pointer ${isExpanded ? 'bg-sp-admin-hover/40' : ''}`}
        onClick={onToggleExpand}
      >
        <td className="px-6 py-4 font-medium text-sp-admin-text">
          <div className="flex items-center gap-2">
            <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▸</span>
            <span>{brand.name}</span>
            {pendingFollowups > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                {pendingFollowups} seguim.
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-sp-admin-muted text-xs">
          {brand.tipo ? TIPO_LABELS[brand.tipo] ?? brand.tipo : '—'}
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[brand.status]}`}>
            {STATUS_LABELS[brand.status]}
          </span>
        </td>
        <td className="px-6 py-4 text-sp-admin-muted text-xs">
          {brand.sector ? (SECTOR_LABELS[brand.sector as CrmBrandSector] ?? brand.sector) : '—'}
        </td>
        <td className="px-6 py-4 text-sp-admin-muted">{brand.ownerName ?? '—'}</td>
        <td className="px-6 py-4 text-sp-admin-muted">
          {primary ? (
            <div className="flex flex-col">
              <span className="text-sp-admin-text font-medium">{primary.name}</span>
              {primary.email && <span className="text-xs">{primary.email}</span>}
            </div>
          ) : (
            <span className="text-xs italic">Sin contacto principal</span>
          )}
        </td>
        <td className="px-6 py-4 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className={BTN_GHOST}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isPending}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Borrar
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-sp-admin-bg/40">
          <td colSpan={7} className="px-6 py-5">
            {isEditing ? (
              <BrandForm mode="edit" brand={brand} onDone={onCloseEdit} />
            ) : (
              <div className="space-y-4">
                <BrandDetails brand={brand} />
                <ContactsList
                  brandId={brand.id}
                  contacts={contacts}
                  showAddForm={showAddContact}
                  onToggleAdd={() => setShowAddContact((v) => !v)}
                />
                <FollowupsList brandId={brand.id} followups={followups} />
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function BrandDetails({ brand }: { readonly brand: CrmBrandRow }): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <Field label="Razón social" value={brand.legalName} />
      <Field label="Web" value={brand.website} link />
      <Field label="Geo" value={brand.geo ? (GEO_LABELS[brand.geo as CrmBrandGeo] ?? brand.geo) : null} />
      <Field label="País" value={brand.country} />
      <Field label="Creado" value={new Date(brand.createdAt).toLocaleDateString('es-ES')} />
      {brand.notes && (
        <div className="col-span-2 md:col-span-4">
          <p className={LABEL}>Notas</p>
          <p className="text-sp-admin-text whitespace-pre-wrap">{brand.notes}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, link = false }: { readonly label: string; readonly value: string | null | undefined; readonly link?: boolean }): React.ReactElement {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      {value ? (
        link ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-sp-admin-accent hover:underline break-all">{value}</a>
        ) : (
          <p className="text-sp-admin-text">{value}</p>
        )
      ) : (
        <p className="text-sp-admin-muted text-xs italic">—</p>
      )}
    </div>
  );
}

type BrandFormProps =
  | { readonly mode: 'create'; readonly onDone: () => void; readonly brand?: undefined }
  | { readonly mode: 'edit'; readonly brand: CrmBrandRow; readonly onDone: () => void };

function BrandForm({ mode, brand, onDone }: BrandFormProps): React.ReactElement {
  const action = mode === 'create' ? createBrandAction : updateBrandAction;
  const [state, formAction, isPending] = useActionState(action, {});

  if (state.success && !isPending) {
    setTimeout(onDone, 0);
  }

  return (
    <form action={formAction} className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5 space-y-4">
      <h3 className="font-bold text-sp-admin-text text-sm">
        {mode === 'create' ? 'Nueva marca' : `Editar ${brand.name}`}
      </h3>
      {mode === 'edit' && <input type="hidden" name="id" value={brand.id} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LABEL}>Nombre *</label>
          <input name="name" required defaultValue={brand?.name} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Razón social</label>
          <input name="legalName" defaultValue={brand?.legalName ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Web</label>
          <input name="website" type="url" placeholder="https://..." defaultValue={brand?.website ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Tipo</label>
          <select name="tipo" defaultValue={brand?.tipo ?? ''} className={INPUT}>
            <option value="">— Sin especificar —</option>
            {CRM_BRAND_TIPOS.map((t) => (
              <option key={t} value={t}>{TIPO_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Sector</label>
          <select name="sector" defaultValue={brand?.sector ?? ''} className={INPUT}>
            <option value="">— Sin especificar —</option>
            {CRM_BRAND_SECTORES.map((s) => (
              <option key={s} value={s}>{SECTOR_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Geo</label>
          <select name="geo" defaultValue={brand?.geo ?? ''} className={INPUT}>
            <option value="">— Sin especificar —</option>
            {CRM_BRAND_GEOS.map((g) => (
              <option key={g} value={g}>{GEO_LABELS[g]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>País (ISO 2)</label>
          <input name="country" maxLength={2} placeholder="ES" defaultValue={brand?.country ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Estado</label>
          <select name="status" defaultValue={brand?.status ?? 'lead'} className={INPUT}>
            {CRM_BRAND_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className={LABEL}>Notas internas</label>
          <textarea name="notes" rows={3} defaultValue={brand?.notes ?? ''} className={INPUT} />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onDone} className={BTN_GHOST}>Cancelar</button>
        <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
          {isPending ? 'Guardando...' : mode === 'create' ? 'Crear marca' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

type ContactsListProps = {
  readonly brandId: number;
  readonly contacts: readonly CrmBrandContact[];
  readonly showAddForm: boolean;
  readonly onToggleAdd: () => void;
};

function ContactsList({ brandId, contacts, showAddForm, onToggleAdd }: ContactsListProps): React.ReactElement {
  return (
    <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-sp-admin-muted">
          Contactos ({contacts.length})
        </h4>
        <button type="button" onClick={onToggleAdd} className={BTN_GHOST}>
          {showAddForm ? 'Cancelar' : '+ Añadir contacto'}
        </button>
      </div>
      {showAddForm && <ContactForm brandId={brandId} onDone={onToggleAdd} />}
      {contacts.length === 0 && !showAddForm ? (
        <p className="text-xs italic text-sp-admin-muted py-2">Sin contactos todavía.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={c} brandId={brandId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, brandId }: { readonly contact: CrmBrandContact; readonly brandId: number }): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return <ContactForm brandId={brandId} contact={contact} onDone={() => setEditing(false)} />;
  }

  const onDelete = (): void => {
    if (!confirm(`¿Eliminar contacto "${contact.name}"?`)) return;
    startTransition(async () => {
      await deleteContactAction(contact.id, brandId);
    });
  };

  return (
    <div className="rounded-xl bg-sp-admin-bg border border-sp-admin-border p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sp-admin-text text-sm">{contact.name}</p>
            {contact.isPrimary && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-sp-admin-accent text-sp-admin-bg">Principal</span>
            )}
          </div>
          {contact.role && <p className="text-xs text-sp-admin-muted">{contact.role}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setEditing(true)} className="px-2 py-1 rounded text-[10px] font-semibold text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover cursor-pointer">Editar</button>
          <button type="button" onClick={onDelete} disabled={isPending} className="px-2 py-1 rounded text-[10px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer">Borrar</button>
        </div>
      </div>
      <div className="space-y-1 text-xs text-sp-admin-muted">
        {contact.email && <p>📧 {contact.email}</p>}
        {contact.phone && <p>📞 {contact.phone}</p>}
        {contact.telegram && <p>✈️ {contact.telegram}</p>}
        {contact.discord && <p>🎮 {contact.discord}</p>}
        {contact.whatsapp && <p>💬 {contact.whatsapp}</p>}
      </div>
    </div>
  );
}

type ContactFormProps = {
  readonly brandId: number;
  readonly contact?: CrmBrandContact;
  readonly onDone: () => void;
};

function ContactForm({ brandId, contact, onDone }: ContactFormProps): React.ReactElement {
  const action = contact ? updateContactAction : createContactAction;
  const [state, formAction, isPending] = useActionState(action, {});

  if (state.success && !isPending) {
    setTimeout(onDone, 0);
  }

  return (
    <form action={formAction} className="rounded-xl bg-sp-admin-bg border border-sp-admin-border p-3 space-y-3">
      <input type="hidden" name="brandId" value={brandId} />
      {contact && <input type="hidden" name="id" value={contact.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Nombre *</label>
          <input name="name" required defaultValue={contact?.name} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Cargo</label>
          <input name="role" placeholder="Marketing Manager" defaultValue={contact?.role ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input name="email" type="email" defaultValue={contact?.email ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Teléfono</label>
          <input name="phone" defaultValue={contact?.phone ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Telegram</label>
          <input name="telegram" placeholder="@usuario" defaultValue={contact?.telegram ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Discord</label>
          <input name="discord" placeholder="usuario#0000" defaultValue={contact?.discord ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>WhatsApp</label>
          <input name="whatsapp" placeholder="+34 ..." defaultValue={contact?.whatsapp ?? ''} className={INPUT} />
        </div>
        <div className="flex items-center gap-2 self-end pb-1">
          <input type="checkbox" name="isPrimary" id={`primary-${contact?.id ?? 'new'}`} defaultChecked={contact?.isPrimary ?? false} value="true" className="rounded border-sp-admin-border" />
          <label htmlFor={`primary-${contact?.id ?? 'new'}`} className="text-xs text-sp-admin-muted cursor-pointer">Marcar como contacto principal</label>
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onDone} className={BTN_GHOST}>Cancelar</button>
        <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
          {isPending ? 'Guardando...' : contact ? 'Guardar' : 'Añadir contacto'}
        </button>
      </div>
    </form>
  );
}

// --- Follow-ups ---

type FollowupsListProps = {
  readonly brandId: number;
  readonly followups: readonly CrmBrandFollowup[];
};

function FollowupsList({ brandId, followups }: FollowupsListProps): React.ReactElement {
  const [showForm, setShowForm] = useState(false);
  const pending = followups.filter((f) => !f.completedAt);
  const completed = followups.filter((f) => f.completedAt);

  return (
    <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-sp-admin-muted">
          Seguimientos ({pending.length} pendientes)
        </h4>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={BTN_GHOST}>
          {showForm ? 'Cancelar' : '+ Añadir seguimiento'}
        </button>
      </div>

      {showForm && <FollowupForm brandId={brandId} onDone={() => setShowForm(false)} />}

      {followups.length === 0 && !showForm ? (
        <p className="text-xs italic text-sp-admin-muted py-2">Sin seguimientos todavía.</p>
      ) : (
        <div className="space-y-2 mt-2">
          {pending.map((f) => (
            <FollowupItem key={f.id} followup={f} brandId={brandId} />
          ))}
          {completed.length > 0 && (
            <details className="mt-2">
              <summary className="text-[10px] uppercase tracking-wider text-sp-admin-muted cursor-pointer select-none">
                Completados ({completed.length})
              </summary>
              <div className="space-y-2 mt-2">
                {completed.map((f) => (
                  <FollowupItem key={f.id} followup={f} brandId={brandId} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function FollowupItem({ followup, brandId }: { readonly followup: CrmBrandFollowup; readonly brandId: number }): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const isDone = !!followup.completedAt;
  const isOverdue = !isDone && new Date(followup.scheduledAt) < new Date();

  const onComplete = (): void => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(followup.id));
      fd.set('brandId', String(brandId));
      await completeFollowupAction({}, fd);
    });
  };

  const onDelete = (): void => {
    if (!confirm('¿Eliminar este seguimiento?')) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(followup.id));
      fd.set('brandId', String(brandId));
      await deleteFollowupAction({}, fd);
    });
  };

  const date = new Date(followup.scheduledAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-xs ${isDone ? 'opacity-50' : isOverdue ? 'bg-red-500/10' : 'bg-sp-admin-bg'} border border-sp-admin-border`}>
      <span className={`font-mono shrink-0 ${isOverdue ? 'text-red-400' : 'text-sp-admin-muted'}`}>{date}</span>
      <span className={`flex-1 ${isDone ? 'line-through text-sp-admin-muted' : 'text-sp-admin-text'}`}>{followup.note}</span>
      {!isDone && (
        <button
          type="button"
          onClick={onComplete}
          disabled={isPending}
          className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 cursor-pointer"
        >
          Completar
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer"
      >
        Borrar
      </button>
    </div>
  );
}

function FollowupForm({ brandId, onDone }: { readonly brandId: number; readonly onDone: () => void }): React.ReactElement {
  const [state, formAction, isPending] = useActionState(createFollowupAction, {});

  if (state.success && !isPending) {
    setTimeout(onDone, 0);
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="rounded-xl bg-sp-admin-bg border border-sp-admin-border p-3 space-y-3 mb-3">
      <input type="hidden" name="brandId" value={brandId} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Fecha *</label>
          <input name="scheduledAt" type="date" required min={todayIso} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Nota *</label>
          <input name="note" required placeholder="Llamar para revisar propuesta..." className={INPUT} />
        </div>
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onDone} className={BTN_GHOST}>Cancelar</button>
        <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
          {isPending ? 'Guardando...' : 'Añadir seguimiento'}
        </button>
      </div>
    </form>
  );
}
