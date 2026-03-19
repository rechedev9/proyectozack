import { NextRequest } from 'next/server';
import fc from 'fast-check';

/* -------------------------------------------------------------------------- */
/*  Fuzz tests for POST /api/contact route handler                            */
/*  Goal: Route NEVER returns 500, NEVER throws unhandled error               */
/* -------------------------------------------------------------------------- */

jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));
jest.mock('@/lib/email', () => ({
  sendContactEmail: jest.fn().mockResolvedValue(undefined),
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

import { POST } from '@/app/api/contact/route';

const makeRequest = (body: string, headers?: Record<string, string>) =>
  new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('POST /api/contact — fuzz', () => {
  beforeEach(() => jest.clearAllMocks());

  it('never returns 500 on random JSON payloads', async () => {
    const anyJson = fc.anything({
      withBigInt: false, // BigInt is not JSON-serializable
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
          return; // Skip non-serializable values
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
        const req = new NextRequest('http://localhost/api/contact', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
        });
        const res = await POST(req);
        expect(res.status).not.toBe(500);
        expect([200, 400, 422]).toContain(res.status);
      }),
      { numRuns: 500 },
    );
  });

  it('handles oversized JSON bodies gracefully', async () => {
    const sizes = [10_000, 100_000, 1_000_000];

    for (const size of sizes) {
      const bigPayload = JSON.stringify({
        name: 'x'.repeat(Math.min(size, 100)),
        email: 'test@test.com',
        type: 'brand',
        message: 'x'.repeat(size),
      });

      const res = await POST(makeRequest(bigPayload));
      expect(res.status).not.toBe(500);
    }
  });

  it('handles XSS payloads in all fields without 500', async () => {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '"><svg onload=alert(1)>',
      "';DROP TABLE users;--",
    ];

    for (const xss of xssPayloads) {
      const res = await POST(makeRequest(JSON.stringify({
        name: xss.slice(0, 100).padEnd(2, 'X'),
        email: 'test@test.com',
        type: 'brand',
        message: xss.padEnd(10, ' '),
      })));
      // Either 200 (valid after Zod) or 422 (rejected by Zod)
      expect(res.status).not.toBe(500);
    }
  });

  it('handles spoofed IP headers without 500', async () => {
    const spoofedIps = [
      '127.0.0.1, 10.0.0.1, 192.168.1.1',
      'undefined',
      '',
      '::1',
      '0.0.0.0',
      'not-an-ip',
      '999.999.999.999',
      '<script>alert(1)</script>',
      "'; DROP TABLE --",
    ];

    for (const ip of spoofedIps) {
      const res = await POST(makeRequest(
        JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          type: 'brand',
          message: 'A valid message for the test.',
        }),
        { 'x-forwarded-for': ip },
      ));
      expect(res.status).toBe(200);
    }
  });

  it('handles concurrent requests without state corruption', async () => {
    const requests = Array.from({ length: 50 }, (_, i) =>
      POST(makeRequest(JSON.stringify({
        name: `User ${i}`,
        email: `user${i}@test.com`,
        type: 'brand',
        message: `Message from concurrent request number ${i}.`,
      }))),
    );

    const results = await Promise.all(requests);
    for (const res of results) {
      expect(res.status).toBe(200);
    }
  });
});
