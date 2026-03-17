import { NextRequest } from 'next/server';

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
import { db } from '@/lib/db';
import { sendContactEmail } from '@/lib/email';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and inserts into db on valid payload', async () => {
    const res = await POST(makeRequest({
      name: 'Alice',
      email: 'alice@example.com',
      type: 'brand',
      message: 'Looking to collaborate on a campaign.',
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect((db.insert as jest.Mock)).toHaveBeenCalledTimes(1);
  });

  it('returns 422 on invalid payload', async () => {
    const res = await POST(makeRequest({
      name: 'Alice',
      email: 'alice@example.com',
      type: 'brand',
      message: 'short',
    }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe('Validation failed');
  });

  it('returns 400 on non-JSON body', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('still returns 200 if sendContactEmail throws', async () => {
    (sendContactEmail as jest.Mock).mockRejectedValueOnce(new Error('Resend down'));
    const res = await POST(makeRequest({
      name: 'Alice',
      email: 'alice@example.com',
      type: 'brand',
      message: 'Looking to collaborate on a campaign.',
    }));
    expect(res.status).toBe(200);
  });
});
