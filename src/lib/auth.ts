import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { env } from './env';

/** Derive www/non-www variants so auth works regardless of redirect config. */
function getSiteOrigins(siteUrl: string): string[] {
  const origins = [siteUrl];
  try {
    const u = new URL(siteUrl);
    if (u.hostname.startsWith('www.')) {
      origins.push(siteUrl.replace('www.', ''));
    } else {
      origins.push(siteUrl.replace('://', '://www.'));
    }
  } catch { /* keep just the original */ }
  return origins;
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  database: drizzleAdapter(db, { provider: 'pg' }),
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60,      // refresh every hour
    freshAge: 60 * 60,       // require re-auth after 1h for sensitive ops
  },
  advanced: {
    useSecureCookies: env.NEXT_PUBLIC_SITE_URL.startsWith('https'),
    defaultCookieAttributes: {
      sameSite: 'lax',
      path: '/',
    },
  },
  trustedOrigins: getSiteOrigins(env.NEXT_PUBLIC_SITE_URL),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
});
