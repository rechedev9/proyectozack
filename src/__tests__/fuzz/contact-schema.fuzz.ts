import fc from 'fast-check';
import { contactBodySchema } from '@/lib/schemas/contact';

/* -------------------------------------------------------------------------- */
/*  Property-based fuzz tests for contactBodySchema                           */
/*  Goal: Zod NEVER lets invalid data through, NEVER throws on any input      */
/* -------------------------------------------------------------------------- */

// Arbitrary that generates completely random JS values
const anyValue = fc.anything({
  withBigInt: true,
  withDate: true,
  withMap: true,
  withSet: true,
  withTypedArray: true,
  withNullPrototype: true,
  withObjectString: true,
  stringUnit: 'grapheme-composite',
});

// Arbitrary that generates objects with random keys and values
const randomObject = fc.dictionary(fc.string(), anyValue);

describe('contactBodySchema — fuzz', () => {
  it('never throws on arbitrary input (always returns SafeParseResult)', () => {
    fc.assert(
      fc.property(anyValue, (input) => {
        const result = contactBodySchema.safeParse(input);
        // safeParse must ALWAYS return an object with a boolean success field
        expect(typeof result.success).toBe('boolean');
      }),
      { numRuns: 5_000 },
    );
  });

  it('rejects non-object inputs', () => {
    const nonObjects = fc.oneof(
      fc.string(),
      fc.integer(),
      fc.float(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.array(anyValue),
    );

    fc.assert(
      fc.property(nonObjects, (input) => {
        const result = contactBodySchema.safeParse(input);
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('rejects objects with random fields (missing required)', () => {
    fc.assert(
      fc.property(randomObject, (input) => {
        // Unless the random object happens to have ALL required fields
        // with valid values, it should fail
        const result = contactBodySchema.safeParse(input);
        if (result.success) {
          // If it somehow passed, verify it has proper types
          expect(typeof result.data.name).toBe('string');
          expect(typeof result.data.email).toBe('string');
          expect(['brand', 'talent', 'other']).toContain(result.data.type);
          expect(typeof result.data.message).toBe('string');
          expect(result.data.name.length).toBeGreaterThanOrEqual(2);
          expect(result.data.message.length).toBeGreaterThanOrEqual(10);
        }
      }),
      { numRuns: 5_000 },
    );
  });

  it('enforces max lengths — random long strings never pass', () => {
    const longString = fc.string({ minLength: 5001 });

    fc.assert(
      fc.property(longString, (msg) => {
        const result = contactBodySchema.safeParse({
          name: 'Valid Name',
          email: 'valid@email.com',
          type: 'brand',
          message: msg,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 500 },
    );
  });

  it('enforces min lengths — random short names never pass', () => {
    const shortName = fc.string({ maxLength: 1 });

    fc.assert(
      fc.property(shortName, (name) => {
        const result = contactBodySchema.safeParse({
          name,
          email: 'valid@email.com',
          type: 'brand',
          message: 'A valid message that is long enough.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 500 },
    );
  });

  it('rejects type field with arbitrary strings (enum enforcement)', () => {
    const notValidType = fc.string().filter(
      (s) => !['brand', 'talent', 'other'].includes(s),
    );

    fc.assert(
      fc.property(notValidType, (type) => {
        const result = contactBodySchema.safeParse({
          name: 'Valid Name',
          email: 'valid@email.com',
          type,
          message: 'A valid message that is long enough.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('optional fields accept strings within bounds or undefined', () => {
    const optionalField = fc.oneof(
      fc.constant(undefined),
      fc.string({ maxLength: 100 }),
    );

    fc.assert(
      fc.property(optionalField, (company) => {
        const payload: Record<string, unknown> = {
          name: 'Valid Name',
          email: 'valid@email.com',
          type: 'brand',
          message: 'A valid message that is long enough.',
        };
        if (company !== undefined) payload.company = company;

        const result = contactBodySchema.safeParse(payload);
        expect(result.success).toBe(true);
      }),
      { numRuns: 500 },
    );
  });

  it('strips or rejects prototype pollution keys', () => {
    const pollutionPayloads = [
      JSON.parse('{"__proto__":{"admin":true}}'),
      JSON.parse('{"constructor":{"prototype":{"admin":true}}}'),
      JSON.parse('{"prototype":{"isAdmin":true}}'),
    ];

    for (const extra of pollutionPayloads) {
      const payload = {
        name: 'Valid Name',
        email: 'valid@email.com',
        type: 'brand' as const,
        message: 'A valid message that is long enough.',
        ...extra,
      };
      const result = contactBodySchema.safeParse(payload);
      if (result.success) {
        // Ensure pollution keys are NOT in the parsed output
        expect(result.data).not.toHaveProperty('__proto__.admin');
        expect(result.data).not.toHaveProperty('admin');
        expect((result.data as Record<string, unknown>)['isAdmin']).toBeUndefined();
      }
    }
  });
});
