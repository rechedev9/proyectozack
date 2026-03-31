'use server';

import { requireRole } from '@/lib/auth-guard';

type InstascoutStatusResponse = {
  read_only?: boolean;
  active?: boolean;
};

export type TargetsDiagnostics = {
  readonly youtubeConfigured: boolean;
  readonly youtubeMessage: string;
  readonly instascoutConfigured: boolean;
  readonly instascoutReachable: boolean;
  readonly instascoutReadOnly: boolean;
  readonly instascoutDashboardUrl: string;
  readonly instascoutServiceMessage: string;
  readonly instascoutSessionMessage: string;
};

export async function getTargetsDiagnosticsAction(): Promise<TargetsDiagnostics> {
  await requireRole('admin', '/admin/login');

  const youtubeConfigured = !!process.env.YOUTUBE_API_KEY;
  const instascoutUrl = process.env.INSTASCOUT_URL ?? '';
  const instascoutSecret = process.env.INSTASCOUT_SECRET ?? '';
  const instascoutConfigured = !!(instascoutUrl && instascoutSecret);

  if (!instascoutConfigured) {
    return {
      youtubeConfigured,
      youtubeMessage: youtubeConfigured
        ? 'Listo para buscar canales'
        : 'Falta YOUTUBE_API_KEY',
      instascoutConfigured: false,
      instascoutReachable: false,
      instascoutReadOnly: true,
      instascoutDashboardUrl: '',
      instascoutServiceMessage: 'Faltan INSTASCOUT_URL y/o INSTASCOUT_SECRET',
      instascoutSessionMessage: 'No se puede comprobar la sesion',
    };
  }

  try {
    const response = await fetch(`${instascoutUrl}/api/status`, {
      headers: { Authorization: `Bearer ${instascoutSecret}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        youtubeConfigured,
        youtubeMessage: youtubeConfigured
          ? 'Listo para buscar canales'
          : 'Falta YOUTUBE_API_KEY',
        instascoutConfigured: true,
        instascoutReachable: false,
        instascoutReadOnly: true,
        instascoutDashboardUrl: instascoutUrl,
        instascoutServiceMessage: `Instascout no responde (${response.status})`,
        instascoutSessionMessage: 'No se puede comprobar la sesion',
      };
    }

    const data: InstascoutStatusResponse = await response.json();
    const readOnly = data.read_only ?? true;

    return {
      youtubeConfigured,
      youtubeMessage: youtubeConfigured
        ? 'Listo para buscar canales'
        : 'Falta YOUTUBE_API_KEY',
      instascoutConfigured: true,
      instascoutReachable: true,
      instascoutReadOnly: readOnly,
      instascoutDashboardUrl: instascoutUrl,
      instascoutServiceMessage: 'Instascout responde correctamente',
      instascoutSessionMessage: readOnly
        ? 'Read-only: faltan cookies validas'
        : 'Cookies cargadas; crawl y enrich disponibles',
    };
  } catch {
    return {
      youtubeConfigured,
      youtubeMessage: youtubeConfigured
        ? 'Listo para buscar canales'
        : 'Falta YOUTUBE_API_KEY',
      instascoutConfigured: true,
      instascoutReachable: false,
      instascoutReadOnly: true,
      instascoutDashboardUrl: instascoutUrl,
      instascoutServiceMessage: 'No se pudo conectar con Instascout',
      instascoutSessionMessage: 'No se puede comprobar la sesion',
    };
  }
}
