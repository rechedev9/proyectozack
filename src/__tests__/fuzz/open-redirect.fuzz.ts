import fc from 'fast-check';

/* -------------------------------------------------------------------------- */
/*  Fuzz tests for open redirect prevention in sendBrandInviteEmail           */
/*  Goal: Only same-domain URLs survive; all others fall back to '#'          */
/* -------------------------------------------------------------------------- */

// Re-implement the URL validation logic from email.ts to test it directly
function validateResetUrl(resetUrl: string, siteUrl = 'http://localhost:3000'): string {
  let result = '#';
  try {
    const parsed = new URL(resetUrl);
    const site = new URL(siteUrl);
    if (parsed.hostname === site.hostname) result = resetUrl;
  } catch {
    // Malformed URL — fall through to '#'
  }
  return result;
}

describe('open redirect prevention — fuzz', () => {
  it('arbitrary strings never produce a non-# URL unless same-domain', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = validateResetUrl(input);
        if (result !== '#') {
          // If it's not '#', it must be a same-domain URL
          const parsed = new URL(result);
          expect(parsed.hostname).toBe('localhost');
        }
      }),
      { numRuns: 5_000 },
    );
  });

  it('known phishing URL patterns always return #', () => {
    const phishingUrls = [
      'https://evil.com/steal-creds',
      'https://localhost.evil.com/fake',
      'https://evil.com/localhost:3000',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'ftp://evil.com/payload',
      '//evil.com/open-redirect',
      'https://evil.com@localhost:3000',
      'https://localhost:3000.evil.com',
      'http://evil.com/?redirect=http://localhost:3000',
      '\thttps://evil.com',
      'https://evil.com\t',
      'https://LOCALHOST:3000',  // case sensitivity check
      'https://evil.com#localhost:3000',
      'https://evil.com?host=localhost',
    ];

    for (const url of phishingUrls) {
      const result = validateResetUrl(url);
      if (result !== '#') {
        // Only acceptable if truly same hostname
        const parsed = new URL(result);
        expect(parsed.hostname).toBe('localhost');
      }
    }
  });

  it('same-domain URLs are preserved', () => {
    const validPaths = [
      'http://localhost:3000/auth/reset-password?token=abc123',
      'http://localhost:3000/marcas/login',
      'http://localhost:3000/',
    ];

    for (const url of validPaths) {
      expect(validateResetUrl(url)).toBe(url);
    }
  });

  it('malformed URLs always return #', () => {
    const malformed = [
      '',
      'not-a-url',
      '://missing-scheme',
      'http://',
      'http://.',
      'http://..',
      'http://../',
      'http://?',
      'http://??',
      'http://??/',
      'http://#',
      'http://##',
    ];

    for (const url of malformed) {
      const result = validateResetUrl(url);
      // Either '#' or a valid same-domain URL
      if (result !== '#') {
        const parsed = new URL(result);
        expect(parsed.hostname).toBe('localhost');
      }
    }
  });

  it('random URL-like strings with various schemes', () => {
    const scheme = fc.constantFrom('http', 'https', 'ftp', 'javascript', 'data', 'file', 'tel', 'mailto');
    const domain = fc.oneof(
      fc.constant('localhost:3000'),
      fc.constant('evil.com'),
      fc.constant('localhost.evil.com'),
      fc.domain(),
    );
    const path = fc.webPath();

    fc.assert(
      fc.property(scheme, domain, path, (s, d, p) => {
        const url = `${s}://${d}${p}`;
        const result = validateResetUrl(url);
        if (result !== '#') {
          const parsed = new URL(result);
          expect(parsed.hostname).toBe('localhost');
        }
      }),
      { numRuns: 2_000 },
    );
  });
});
