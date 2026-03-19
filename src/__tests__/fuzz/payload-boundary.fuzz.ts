import fc from 'fast-check';
import { contactBodySchema } from '@/lib/schemas/contact';
import { proposalSchema } from '@/lib/schemas/proposal';

/* -------------------------------------------------------------------------- */
/*  Payload boundary fuzz tests                                               */
/*  Goal: Verify schemas handle extreme sizes, deeply nested objects,         */
/*  unicode edge cases, and binary-like content without crashing              */
/* -------------------------------------------------------------------------- */

describe('payload boundary — oversized strings', () => {
  it('contact: message >5000 chars always rejected', () => {
    fc.assert(
      fc.property(fc.integer({ min: 5001, max: 50_000 }), (len) => {
        const result = contactBodySchema.safeParse({
          name: 'Test User',
          email: 'test@test.com',
          type: 'brand',
          message: 'x'.repeat(len),
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('contact: name >100 chars always rejected', () => {
    fc.assert(
      fc.property(fc.integer({ min: 101, max: 10_000 }), (len) => {
        const result = contactBodySchema.safeParse({
          name: 'A'.repeat(len),
          email: 'test@test.com',
          type: 'brand',
          message: 'A valid message that is long enough.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('proposal: message >1000 chars always rejected', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1001, max: 50_000 }), (len) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline: '1 semana',
          message: 'x'.repeat(len),
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

describe('payload boundary — unicode and special characters', () => {
  // Arbitrary that generates strings with full unicode range
  const unicodeString = fc.string({
    unit: 'grapheme-composite',
    minLength: 10,
    maxLength: 200,
  });

  it('contact: handles unicode strings in all text fields', () => {
    fc.assert(
      fc.property(unicodeString, (text) => {
        const result = contactBodySchema.safeParse({
          name: text.slice(0, 100) || 'AB',
          email: 'test@test.com',
          type: 'brand',
          message: text.length >= 10 ? text.slice(0, 5000) : text.padEnd(10, ' '),
          company: text.slice(0, 100),
        });
        expect(typeof result.success).toBe('boolean');
      }),
      { numRuns: 1_000 },
    );
  });

  it('handles null bytes, control chars, and zero-width chars', () => {
    const edgeCaseStrings = [
      'test\x00injection',           // null byte
      'test\x01\x02\x03',            // control chars
      'test\u200B\u200C\u200D',      // zero-width chars
      'test\uFEFF',                   // BOM
      'test\u202E\u202Dreverse',     // RTL/LTR override
      '\uD800',                       // lone surrogate (invalid)
      '\uDFFF',                       // lone surrogate (invalid)
      'test\r\n\r\n',                // CRLF
      '\t\t\ttabs',                   // tabs
      '   spaces   ',                 // leading/trailing spaces
      '',                             // empty
      ' ',                            // single space
      'a'.repeat(5001),              // exactly over limit
      '🎮🎯🏆'.repeat(100),          // emoji stress
      'ñáéíóúü'.repeat(50),          // accented latin
      '中文测试'.repeat(50),           // CJK
      'العربية'.repeat(50),          // Arabic (RTL)
      '🏳️‍🌈'.repeat(50),             // complex emoji (ZWJ sequences)
    ];

    for (const str of edgeCaseStrings) {
      const result = contactBodySchema.safeParse({
        name: (str.slice(0, 100) || 'AB').padEnd(2, 'X'),
        email: 'test@test.com',
        type: 'brand',
        message: str.length >= 10 ? str.slice(0, 5000) : ('Padding:  ' + str),
      });
      expect(typeof result.success).toBe('boolean');
    }
  });
});

describe('payload boundary — deeply nested and exotic types', () => {
  it('deeply nested objects are rejected (not a flat object)', () => {
    const deepObject = { a: { b: { c: { d: { e: { f: 'deep' } } } } } };
    const result = contactBodySchema.safeParse(deepObject);
    expect(result.success).toBe(false);
  });

  it('arrays instead of strings are rejected', () => {
    const result = contactBodySchema.safeParse({
      name: ['Alice', 'Bob'],
      email: ['alice@test.com'],
      type: ['brand'],
      message: ['Hello world, this is a test message.'],
    });
    expect(result.success).toBe(false);
  });

  it('numbers instead of strings are rejected', () => {
    const result = contactBodySchema.safeParse({
      name: 12345,
      email: 67890,
      type: 1,
      message: 99999,
    });
    expect(result.success).toBe(false);
  });

  it('handles objects with excessive number of keys', () => {
    const bigObj: Record<string, string> = {
      name: 'Test User',
      email: 'test@test.com',
      type: 'brand',
      message: 'A valid message that is long enough.',
    };
    // Add 1000 extra keys
    for (let i = 0; i < 1000; i++) {
      bigObj[`extra_${i}`] = 'value';
    }
    const result = contactBodySchema.safeParse(bigObj);
    // Zod strips unknown keys in default mode — should still parse valid fields
    expect(typeof result.success).toBe('boolean');
  });

  it('proposal: huge talentId values are handled', () => {
    const hugeInts = [
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER + 1,
      2 ** 53,
      999_999_999_999,
    ];

    for (const id of hugeInts) {
      const result = proposalSchema.safeParse({
        talentId: id,
        campaignType: 'Streaming',
        budgetRange: '<5K',
        timeline: '1 semana',
        message: 'A valid proposal message here.',
      });
      // MAX_SAFE_INTEGER is a valid positive integer
      // Beyond that, Number.isInteger returns false
      expect(typeof result.success).toBe('boolean');
    }
  });
});

describe('payload boundary — JSON edge cases', () => {
  it('handles payloads with __proto__ pollution attempts', () => {
    const payload = JSON.parse(
      '{"name":"Test","email":"t@t.com","type":"brand","message":"Valid msg for testing","__proto__":{"admin":true}}',
    );
    const result = contactBodySchema.safeParse(payload);
    expect(typeof result.success).toBe('boolean');
    if (result.success) {
      expect((result.data as Record<string, unknown>)['admin']).toBeUndefined();
    }
  });

  it('handles payload with toString/valueOf overrides', () => {
    const payload = {
      name: 'Test User',
      email: 'test@test.com',
      type: 'brand',
      message: 'A valid message that is long enough.',
      toString: () => 'hacked',
      valueOf: () => 42,
    };
    const result = contactBodySchema.safeParse(payload);
    expect(typeof result.success).toBe('boolean');
  });
});
