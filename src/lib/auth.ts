import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { env } from './env';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, { provider: 'pg' }),
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
