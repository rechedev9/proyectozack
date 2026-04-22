'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { talents, talentSocials, talentVerticals } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/auth-guard';
import { TALENT_VERTICALS } from '@/lib/schemas/talentBusiness';

type TalentVertical = (typeof TALENT_VERTICALS)[number];

type ParsedRow = {
  readonly rowNumber: number;
  readonly name: string;
  readonly country: string | null;
  readonly verticals: readonly TalentVertical[];
  readonly primaryPlatform: 'twitch' | 'youtube';
  readonly handle: string;
  readonly followersDisplay: string;
  readonly profileUrl: string | null;
  readonly warnings: readonly string[];
  readonly error: string | null;
};

export type PreviewState = {
  readonly rows: readonly ParsedRow[];
  readonly error?: string;
};

export type ImportState = {
  readonly created?: number;
  readonly skipped?: number;
  readonly errors?: readonly string[];
  readonly success?: boolean;
};

const REQUIRED_COLS = ['name', 'primary_platform', 'handle'] as const;
const ALLOWED_COLS = [
  'name',
  'country',
  'verticals',
  'primary_platform',
  'handle',
  'followers',
  'profile_url',
] as const;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 4) || 'XX';
}

function formatFollowers(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export async function previewImportAction(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  await requireRole('admin', '/admin/login');

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { rows: [], error: 'No se ha subido ningún archivo' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { rows: [], error: 'Archivo demasiado grande (máx 2MB)' };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], error: 'El archivo está vacío o solo tiene cabecera' };
  }

  const header = parseCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const missing = REQUIRED_COLS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return { rows: [], error: `Faltan columnas requeridas: ${missing.join(', ')}` };
  }

  const colIdx: Record<string, number> = {};
  for (const col of ALLOWED_COLS) colIdx[col] = header.indexOf(col);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    const warnings: string[] = [];
    let error: string | null = null;

    const name = (cells[colIdx.name!] ?? '').trim();
    if (!name) {
      error = 'Nombre vacío';
    } else if (name.length > 100) {
      error = 'Nombre > 100 caracteres';
    }

    const primaryPlatformRaw = (cells[colIdx.primary_platform!] ?? '').trim().toLowerCase();
    let primaryPlatform: 'twitch' | 'youtube' = 'twitch';
    if (primaryPlatformRaw === 'twitch' || primaryPlatformRaw === 'youtube') {
      primaryPlatform = primaryPlatformRaw;
    } else if (!error) {
      error = `primary_platform inválido: "${primaryPlatformRaw}" (debe ser twitch o youtube)`;
    }

    const handle = (cells[colIdx.handle!] ?? '').trim();
    if (!handle && !error) error = 'Handle vacío';

    const country = colIdx.country! >= 0 ? (cells[colIdx.country!] ?? '').trim().toUpperCase().slice(0, 2) : '';

    const verticalsRaw = colIdx.verticals! >= 0 ? (cells[colIdx.verticals!] ?? '').trim() : '';
    const verticals: TalentVertical[] = [];
    if (verticalsRaw) {
      for (const v of verticalsRaw.split('|').map((s) => s.trim()).filter(Boolean)) {
        if ((TALENT_VERTICALS as readonly string[]).includes(v)) {
          verticals.push(v as TalentVertical);
        } else {
          warnings.push(`vertical desconocido: ${v}`);
        }
      }
    }

    const followersRaw = colIdx.followers! >= 0 ? (cells[colIdx.followers!] ?? '').trim() : '';
    const followersNum = parseInt(followersRaw.replace(/[^\d]/g, ''), 10);
    const followersDisplay = Number.isFinite(followersNum) && followersNum > 0 ? formatFollowers(followersNum) : '-';

    const profileUrlRaw = colIdx.profile_url! >= 0 ? (cells[colIdx.profile_url!] ?? '').trim() : '';
    let profileUrl: string | null = null;
    if (profileUrlRaw) {
      try {
        new URL(profileUrlRaw);
        profileUrl = profileUrlRaw;
      } catch {
        warnings.push('profile_url no es URL válida');
      }
    }

    rows.push({
      rowNumber: i + 1,
      name,
      country: country || null,
      verticals,
      primaryPlatform,
      handle,
      followersDisplay,
      profileUrl,
      warnings,
      error,
    });
  }

  return { rows };
}

const PLATFORM_HEX: Record<string, string> = {
  twitch: '#9146ff',
  youtube: '#ff0000',
};

export async function confirmImportAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireRole('admin', '/admin/login');

  const rowsJson = formData.get('rows');
  if (typeof rowsJson !== 'string') return { errors: ['No hay datos'] };

  let rows: ParsedRow[];
  try {
    rows = JSON.parse(rowsJson) as ParsedRow[];
  } catch {
    return { errors: ['JSON inválido'] };
  }

  const toCreate = rows.filter((r) => !r.error);
  if (toCreate.length === 0) return { errors: ['Ninguna fila válida'] };

  // Max current sortOrder to append new ones at the end
  const [maxRow] = await db.select({ max: sql<number>`COALESCE(MAX(${talents.sortOrder}), 0)` }).from(talents);
  let nextSort = (maxRow?.max ?? 0) + 1;

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of toCreate) {
    const baseSlug = slugify(row.name);
    if (!baseSlug) {
      errors.push(`"${row.name}": slug vacío`);
      skipped++;
      continue;
    }

    const existing = await db
      .select({ id: talents.id })
      .from(talents)
      .where(eq(talents.slug, baseSlug))
      .limit(1);
    if (existing.length > 0) {
      errors.push(`"${row.name}": ya existe (slug=${baseSlug})`);
      skipped++;
      continue;
    }

    try {
      const [inserted] = await db
        .insert(talents)
        .values({
          slug: baseSlug,
          name: row.name,
          role: 'Creator',
          game: 'General',
          platform: row.primaryPlatform,
          status: 'inactive',
          bio: '',
          gradientC1: '#f5632a',
          gradientC2: '#8b3aad',
          initials: initialsOf(row.name),
          sortOrder: nextSort++,
          visibility: 'internal',
          creatorCountry: row.country ?? undefined,
        })
        .returning({ id: talents.id });

      if (!inserted) {
        errors.push(`"${row.name}": insert devolvió vacío`);
        skipped++;
        continue;
      }

      await db.insert(talentSocials).values({
        talentId: inserted.id,
        platform: row.primaryPlatform,
        handle: row.handle,
        followersDisplay: row.followersDisplay,
        profileUrl: row.profileUrl ?? undefined,
        hexColor: PLATFORM_HEX[row.primaryPlatform] ?? '#888',
        sortOrder: 0,
      });

      if (row.verticals.length > 0) {
        await db
          .insert(talentVerticals)
          .values(row.verticals.map((v) => ({ talentId: inserted.id, vertical: v })))
          .onConflictDoNothing();
      }

      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      errors.push(`"${row.name}": ${msg}`);
      skipped++;
    }
  }

  revalidatePath('/admin/talents');
  return { created, skipped, errors, success: true };
}
