import fc from 'fast-check';
import { proposalSchema } from '@/lib/schemas/proposal';

/* -------------------------------------------------------------------------- */
/*  Property-based fuzz tests for proposalSchema                              */
/*  Goal: enum+int constraints hold under adversarial input                   */
/* -------------------------------------------------------------------------- */

const anyValue = fc.anything({
  withBigInt: true,
  withDate: true,
  withMap: true,
  withSet: true,
  withTypedArray: true,
  withNullPrototype: true,
});

const VALID_CAMPAIGN_TYPES = ['Streaming', 'YouTube', 'Social', 'Evento', 'Otro'];
const VALID_BUDGETS = ['<5K', '5-10K', '10-25K', '25K+', 'A definir'];
const VALID_TIMELINES = ['1 semana', '2 semanas', '1 mes', '2+ meses', 'Flexible'];

describe('proposalSchema — fuzz', () => {
  it('never throws on arbitrary input', () => {
    fc.assert(
      fc.property(anyValue, (input) => {
        const result = proposalSchema.safeParse(input);
        expect(typeof result.success).toBe('boolean');
      }),
      { numRuns: 5_000 },
    );
  });

  it('rejects non-integer talentId', () => {
    const nonInt = fc.oneof(
      fc.float().filter((n) => !Number.isInteger(n)),
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity),
    );

    fc.assert(
      fc.property(nonInt, (talentId) => {
        const result = proposalSchema.safeParse({
          talentId,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline: '1 semana',
          message: 'This is a valid proposal message.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('rejects zero and negative talentId', () => {
    const nonPositive = fc.oneof(
      fc.constant(0),
      fc.integer({ max: -1 }),
    );

    fc.assert(
      fc.property(nonPositive, (talentId) => {
        const result = proposalSchema.safeParse({
          talentId,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline: '1 semana',
          message: 'This is a valid proposal message.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 500 },
    );
  });

  it('rejects invalid enum values for campaignType', () => {
    const badCampaign = fc.string().filter((s) => !VALID_CAMPAIGN_TYPES.includes(s));

    fc.assert(
      fc.property(badCampaign, (campaignType) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType,
          budgetRange: '<5K',
          timeline: '1 semana',
          message: 'This is a valid proposal message.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('rejects invalid enum values for budgetRange', () => {
    const badBudget = fc.string().filter((s) => !VALID_BUDGETS.includes(s));

    fc.assert(
      fc.property(badBudget, (budgetRange) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType: 'Streaming',
          budgetRange,
          timeline: '1 semana',
          message: 'This is a valid proposal message.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('rejects invalid enum values for timeline', () => {
    const badTimeline = fc.string().filter((s) => !VALID_TIMELINES.includes(s));

    fc.assert(
      fc.property(badTimeline, (timeline) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline,
          message: 'This is a valid proposal message.',
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 1_000 },
    );
  });

  it('enforces message length bounds', () => {
    const tooShort = fc.string({ maxLength: 9 });
    const tooLong = fc.string({ minLength: 1001 });

    fc.assert(
      fc.property(tooShort, (message) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline: '1 semana',
          message,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 500 },
    );

    fc.assert(
      fc.property(tooLong, (message) => {
        const result = proposalSchema.safeParse({
          talentId: 1,
          campaignType: 'Streaming',
          budgetRange: '<5K',
          timeline: '1 semana',
          message,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 500 },
    );
  });

  it('valid payloads always pass', () => {
    const validProposal = fc.record({
      talentId: fc.integer({ min: 1, max: 999_999 }),
      campaignType: fc.constantFrom(...VALID_CAMPAIGN_TYPES),
      budgetRange: fc.constantFrom(...VALID_BUDGETS),
      timeline: fc.constantFrom(...VALID_TIMELINES),
      message: fc.string({ minLength: 10, maxLength: 1000 }),
    });

    fc.assert(
      fc.property(validProposal, (input) => {
        const result = proposalSchema.safeParse(input);
        expect(result.success).toBe(true);
      }),
      { numRuns: 2_000 },
    );
  });
});
