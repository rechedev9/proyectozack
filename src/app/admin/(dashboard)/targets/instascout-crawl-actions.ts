'use server';

import { requireRole } from '@/lib/auth-guard';

function instascoutFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = process.env.INSTASCOUT_URL;
  const secret = process.env.INSTASCOUT_SECRET;
  if (!base || !secret) throw new Error('INSTASCOUT_URL / INSTASCOUT_SECRET not set');
  return fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
}

export type JobStatus = {
  readonly readOnly: boolean;
  readonly active: boolean;
  readonly id: string;
  readonly type: string;
  readonly status: string;
  readonly elapsed: string;
  readonly error: string;
};

type RawStatus = {
  read_only: boolean;
  active: boolean;
  id?: string;
  type?: string;
  status?: string;
  elapsed?: string;
  error?: string;
};

export async function getJobStatusAction(): Promise<JobStatus> {
  await requireRole('admin', '/admin/login');
  const res = await instascoutFetch('/api/status');
  if (!res.ok) throw new Error(`instascout status error (${res.status})`);
  const raw: RawStatus = await res.json();
  return {
    readOnly: raw.read_only,
    active: raw.active,
    id: raw.id ?? '',
    type: raw.type ?? '',
    status: raw.status ?? '',
    elapsed: raw.elapsed ?? '',
    error: raw.error ?? '',
  };
}

export async function startCrawlHashtagAction(
  formData: FormData,
): Promise<{ ok: boolean; error: string }> {
  await requireRole('admin', '/admin/login');

  const tag = (formData.get('tag') as string | null)?.trim();
  const limit = formData.get('limit') as string | null;
  if (!tag) return { ok: false, error: 'hashtag requerido' };

  const body = new URLSearchParams({ tag, limit: limit ?? '500' });
  const res = await instascoutFetch('/api/crawl/hashtag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || `Error ${res.status}` };
  }
  return { ok: true, error: '' };
}

export async function startEnrichAction(
  formData: FormData,
): Promise<{ ok: boolean; error: string }> {
  await requireRole('admin', '/admin/login');

  const limit = formData.get('limit') as string | null;
  const minFollowers = formData.get('min_followers') as string | null;
  const body = new URLSearchParams({
    limit: limit ?? '200',
    ...(minFollowers ? { min_followers: minFollowers } : {}),
  });

  const res = await instascoutFetch('/api/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || `Error ${res.status}` };
  }
  return { ok: true, error: '' };
}

export async function cancelJobAction(): Promise<{ ok: boolean; error: string }> {
  await requireRole('admin', '/admin/login');

  const res = await instascoutFetch('/api/jobs/cancel', { method: 'POST' });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || `Error ${res.status}` };
  }
  return { ok: true, error: '' };
}
