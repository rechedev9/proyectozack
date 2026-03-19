import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { env } from './env';

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
  trustedOrigins: [env.NEXT_PUBLIC_SITE_URL],
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
