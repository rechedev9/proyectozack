'use client';

import { useActionState, useState, useTransition } from 'react';
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  createContactAction,
  updateContactAction,
  deleteContactAction,
} from '@/app/admin/(dashboard)/brands/crm-actions';
import type { CrmBrandRow, CrmBrandContact, CrmBrandStatus } from '@/types';
import { CRM_BRAND_STATUSES } from '@/lib/schemas/crmBrand';

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

type BrandsCrmManagerProps = {
  readonly brands: readonly CrmBrandRow[];
  readonly contactsByBrand: Readonly<Record<number, readonly CrmBrandContact[]>>;
};

const INPUT = 'w-full rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors';
const LABEL = 'block text-[11px] uppercase tracking-wider font-semibold text-sp-admin-muted mb-1';
const BTN_PRIMARY = 'px-4 py-2 rounded-full text-sm font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer';
const BTN_GHOST = 'px-3 py-1.5 rounded-full text-xs font-semibold text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover transition-colors cursor-pointer';

export function BrandsCrmManager({ brands, contactsByBrand }: BrandsCrmManagerProps): React.ReactElement {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
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
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Sector</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Owner</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Contactos</th>
                <th className="text-left px-6 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Contacto principal</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => {
                const isExpanded = expandedId === brand.id;
                const isEditing = editingBrandId === brand.id;
                const contacts = contactsByBrand[brand.id] ?? [];
                return (
                  <BrandRow
                    key={brand.id}
                    brand={brand}
                    contacts={contacts}
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

type BrandRowProps = {
  readonly brand: CrmBrandRow;
  readonly contacts: readonly CrmBrandContact[];
  readonly isExpanded: boolean;
  readonly isEditing: boolean;
  readonly onToggleExpand: () => void;
  readonly onEdit: () => void;
  readonly onCloseEdit: () => void;
};

function BrandRow({ brand, contacts, isExpanded, isEditing, onToggleExpand, onEdit, onCloseEdit }: BrandRowProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [showAddContact, setShowAddContact] = useState(false);
  const primary = brand.primaryContact;

  const onDelete = (): void => {
    if (!confirm(`¿Eliminar la marca "${brand.name}" y todos sus contactos?`)) return;
    startTransition(async () => {
      await deleteBrandAction(brand.id);
    });
  };

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
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[brand.status]}`}>
            {STATUS_LABELS[brand.status]}
          </span>
        </td>
        <td className="px-6 py-4 text-sp-admin-muted">{brand.sector ?? '—'}</td>
        <td className="px-6 py-4 text-sp-admin-muted">{brand.ownerName ?? '—'}</td>
        <td className="px-6 py-4 text-sp-admin-muted">{brand.contactCount}</td>
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

function Field({ label, value, link = false }: { readonly label: string; readonly value: string | null; readonly link?: boolean }): React.ReactElement {
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
          <label className={LABEL}>Sector</label>
          <input name="sector" placeholder="iGaming, FMCG, Tech..." defaultValue={brand?.sector ?? ''} className={INPUT} />
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
          <label className={LABEL}>WhatsApp</label>
          <input name="whatsapp" placeholder="+34 ..." defaultValue={contact?.whatsapp ?? ''} className={INPUT} />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
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
