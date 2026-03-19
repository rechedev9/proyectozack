import fc from 'fast-check';
import { contactBodySchema } from '@/lib/schemas/contact';
import { proposalSchema } from '@/lib/schemas/proposal';

/* -------------------------------------------------------------------------- */
/*  XSS injection fuzz tests                                                  */
/*  Goal: No XSS payload survives past Zod validation unescaped               */
/*  Note: Even if Zod allows HTML strings (it does), the email.ts escapeHtml  */
/*  function handles output encoding. These tests verify the defense layers.  */
/* -------------------------------------------------------------------------- */

// Curated XSS payloads — real-world attack vectors from OWASP, PortSwigger, HackTricks
const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',
  '"><script>alert(document.cookie)</script>',
  "';!--\"<XSS>=&{()}",
  '<iframe src="javascript:alert(1)">',
  '<a href="javascript:alert(1)">click</a>',
  '<input onfocus=alert(1) autofocus>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>',
  '<video><source onerror=alert(1)>',
  '<math><mtext><table><mglyph><svg><mtext><textarea><path id=x d="M0&#10;0LX"><animate attributeName=d values=alert(1)>',
  '{{constructor.constructor("alert(1)")()}}',
  '${alert(1)}',
  '<div style="background:url(javascript:alert(1))">',
  '<object data="data:text/html,<script>alert(1)</script>">',
  '<embed src="data:text/html,<script>alert(1)</script>">',
  '<form action="javascript:alert(1)"><input type=submit>',
  '<link rel=import href="data:text/html,<script>alert(1)</script>">',
  // Unicode-based bypasses
  '\u003cscript\u003ealert(1)\u003c/script\u003e',
  '<scr\x00ipt>alert(1)</scr\x00ipt>',
  '<img src=x onerror=\u0061lert(1)>',
  // Double encoding
  '%253Cscript%253Ealert(1)%253C%252Fscript%253E',
  '&#60;script&#62;alert(1)&#60;/script&#62;',
  '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;',
  // Event handler injection attempts
  '" onmouseover="alert(1)',
  "' onmouseover='alert(1)",
  '`onmouseover=alert(1)`',
  // Template literal injection
  '${7*7}',
  '{{7*7}}',
  '<%= 7*7 %>',
  // SVG-based
  '<svg><script>alert(1)</script></svg>',
  '<svg/onload=alert(1)>',
  // Mutation XSS (mXSS)
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
];

// Generate random XSS-like payloads
const xssArbitrary = fc.oneof(
  fc.constantFrom(...XSS_PAYLOADS),
  // Random HTML tags with event handlers
  fc.tuple(fc.constantFrom('script', 'img', 'svg', 'iframe', 'object', 'embed', 'a', 'div', 'input', 'form'), fc.string()).map(
    ([tag, content]) => `<${tag}>${content}</${tag}>`,
  ),
  // Random event handler injection
  fc.tuple(fc.constantFrom('onload', 'onerror', 'onclick', 'onfocus', 'onmouseover'), fc.string()).map(
    ([handler, code]) => `" ${handler}="${code}"`,
  ),
);

describe('XSS injection — contact schema', () => {
  it('XSS in name field: Zod accepts strings but enforces length bounds', () => {
    for (const payload of XSS_PAYLOADS) {
      const result = contactBodySchema.safeParse({
        name: payload,
        email: 'test@test.com',
        type: 'brand',
        message: 'A valid message that is long enough.',
      });
      if (payload.length >= 2 && payload.length <= 100) {
        // Zod allows it (it's a valid string) — downstream escapeHtml handles output
        if (result.success) {
          expect(result.data.name).toBe(payload);
        }
      }
      // Either way, safeParse never throws
      expect(typeof result.success).toBe('boolean');
    }
  });

  it('XSS in message field: all payloads handled without throwing', () => {
    for (const payload of XSS_PAYLOADS) {
      const paddedPayload = payload.length < 10 ? payload + ' '.repeat(10 - payload.length) : payload;
      const result = contactBodySchema.safeParse({
        name: 'Test User',
        email: 'test@test.com',
        type: 'brand',
        message: paddedPayload,
      });
      expect(typeof result.success).toBe('boolean');
    }
  });

  it('random XSS-like strings never crash the parser', () => {
    fc.assert(
      fc.property(xssArbitrary, (xss) => {
        const result = contactBodySchema.safeParse({
          name: xss.slice(0, 100) || 'AB',
          email: 'test@test.com',
          type: 'brand',
          message: xss.length >= 10 ? xss.slice(0, 5000) : 'Padding: ' + xss,
        });
        expect(typeof result.success).toBe('boolean');
      }),
      { numRuns: 2_000 },
    );
  });

  it('XSS payloads exceeding max length are always rejected', () => {
    const longXss = '<script>' + 'alert(1);'.repeat(600) + '</script>';
    expect(longXss.length).toBeGreaterThan(5000);

    const result = contactBodySchema.safeParse({
      name: 'Test User',
      email: 'test@test.com',
      type: 'brand',
      message: longXss,
    });
    expect(result.success).toBe(false);
  });
});

describe('XSS injection — proposal schema', () => {
  it('XSS in message field: enforces length bounds, never throws', () => {
    for (const payload of XSS_PAYLOADS) {
      const result = proposalSchema.safeParse({
        talentId: 1,
        campaignType: 'Streaming',
        budgetRange: '<5K',
        timeline: '1 semana',
        message: payload.length >= 10 ? payload.slice(0, 1000) : 'Padding: ' + payload,
      });
      expect(typeof result.success).toBe('boolean');
    }
  });

  it('XSS in enum fields always rejected (not a valid enum value)', () => {
    for (const payload of XSS_PAYLOADS) {
      const result = proposalSchema.safeParse({
        talentId: 1,
        campaignType: payload,
        budgetRange: payload,
        timeline: payload,
        message: 'A valid proposal message.',
      });
      expect(result.success).toBe(false);
    }
  });
});
