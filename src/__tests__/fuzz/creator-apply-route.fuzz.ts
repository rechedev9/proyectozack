import { NextRequest } from 'next/server';
import fc from 'fast-check';

/* -------------------------------------------------------------------------- */
/*  Fuzz tests for POST /api/creator-apply route handler                      */
/*  Goal: Route NEVER returns 500, handles all adversarial input gracefully   */
/* -------------------------------------------------------------------------- */

jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));
jest.mock('@/lib/auth', () => ({ auth: {} }));
jest.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    RESEND_API_KEY: 're_test_000',
    BETTER_AUTH_SECRET: 'test-secret-32-chars-minimum-padding-xx',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}));

import { POST } from '@/app/api/creator-apply/route';

const makeRequest = (body: string) =>
  new NextRequest('http://localhost/api/creator-apply', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/creator-apply — fuzz', () => {
  beforeEach(() => jest.clearAllMocks());

  it('never returns 500 on random JSON payloads', async () => {
    const anyJson = fc.anything({
      withBigInt: false,
      withDate: false,
      withMap: false,
      withSet: false,
      withTypedArray: false,
    });

    await fc.assert(
      fc.asyncProperty(anyJson, async (input) => {
        let body: string;
        try {
          body = JSON.stringify(input);
        } catch {
          return;
        }

        const res = await POST(makeRequest(body));
        expect(res.status).not.toBe(500);
        expect([200, 400, 422]).toContain(res.status);
      }),
      { numRuns: 500 },
    );
  });

  it('never returns 500 on random non-JSON bodies', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (body) => {
        const req = new NextRequest('http://localhost/api/creator-apply', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
        });
        const res = await POST(req);
        expect(res.status).not.toBe(500);
      }),
      { numRuns: 500 },
    );
  });

  it('valid payloads always return 200', async () => {
    const validPayload = fc.record({
      name: fc.string({ minLength: 2, maxLength: 100 }),
      email: fc.constant('test@example.com'), // fast-check doesn't have email arbitrary
      platform: fc.string({ minLength: 1, maxLength: 50 }),
      handle: fc.string({ minLength: 1, maxLength: 100 }),
      followers: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
      message: fc.option(fc.string({ maxLength: 2000 }), { nil: undefined }),
    });

    await fc.assert(
      fc.asyncProperty(validPayload, async (input) => {
        const clean: Record<string, unknown> = { ...input };
        if (clean.followers === undefined) delete clean.followers;
        if (clean.message === undefined) delete clean.message;

        const res = await POST(makeRequest(JSON.stringify(clean)));
        expect(res.status).toBe(200);
      }),
      { numRuns: 300 },
    );
  });

  it('XSS and SQLi in platform/handle fields: never 500', async () => {
    const attackPayloads = [
      '<script>alert(1)</script>',
      "'; DROP TABLE creator_applications; --",
      '<img src=x onerror=alert(document.cookie)>',
      '{{constructor.constructor("alert(1)")()}}',
    ];

    for (const payload of attackPayloads) {
      const res = await POST(makeRequest(JSON.stringify({
        name: 'Test Creator',
        email: 'test@test.com',
        platform: payload.slice(0, 50),
        handle: payload.slice(0, 100),
        message: payload.slice(0, 2000),
      })));
      expect(res.status).not.toBe(500);
    }
  });
});
