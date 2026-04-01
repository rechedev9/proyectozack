'use server';

import { requireRole } from '@/lib/auth-guard';

export type TargetsDiagnostics = {
  readonly youtubeConfigured: boolean;
  readonly youtubeMessage: string;
  readonly twitchConfigured: boolean;
  readonly twitchMessage: string;
};

export async function getTargetsDiagnosticsAction(): Promise<TargetsDiagnostics> {
  await requireRole('admin', '/admin/login');

  const youtubeConfigured = !!process.env.YOUTUBE_API_KEY;
  const twitchConfigured = !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);

  return {
    youtubeConfigured,
    youtubeMessage: youtubeConfigured
      ? 'Listo para buscar canales'
      : 'Falta YOUTUBE_API_KEY',
    twitchConfigured,
    twitchMessage: twitchConfigured
      ? 'Listo para buscar canales'
      : 'Faltan TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET',
  };
}
