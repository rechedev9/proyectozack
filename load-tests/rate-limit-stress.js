import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, jsonHeaders, randomString } from './config.js';

/* -------------------------------------------------------------------------- */
/*  Rate limiter stress test                                                  */
/*  Verifies that the rate limiter actually enforces limits under real load    */
/*  Tests each rate-limited endpoint individually                             */
/*  Run: k6 run load-tests/rate-limit-stress.js                              */
/* -------------------------------------------------------------------------- */

const rateLimitedCount = new Counter('rate_limited_429');
const passedCount = new Counter('passed_through');
const rateLimitLatency = new Trend('rate_limit_response_time');
const serverErrors = new Rate('server_error_rate');

export const options = {
  scenarios: {
    // Single VU per endpoint — tests per-IP rate limiting precisely
    contact_burst: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 20,  // 5 limit + 15 over = should see 429s
      exec: 'contactBurst',
      startTime: '0s',
    },
    creator_burst: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 15,  // 3 limit + 12 over
      exec: 'creatorBurst',
      startTime: '0s',
    },
    multi_ip_contact: {
      executor: 'per-vu-iterations',
      vus: 10,          // 10 different "users"
      iterations: 3,    // Each sends 3 (under limit)
      exec: 'multiIpContact',
      startTime: '5s',
    },
  },
  thresholds: {
    rate_limited_429: ['count>5'],         // We EXPECT rate limiting to kick in
    server_error_rate: ['rate<0.01'],       // No 500s
    rate_limit_response_time: ['p(95)<100'], // 429s should be fast
  },
};

// Burst contact endpoint from single IP — should hit rate limit
export function contactBurst() {
  const res = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify({
      name: `Rate Test ${randomString(4)}`,
      email: `rate-${randomString(6)}@test.com`,
      type: 'brand',
      message: `Rate limit stress test message: ${randomString(30)}. Verifying enforcement.`,
    }),
    { headers: jsonHeaders() },
  );

  rateLimitLatency.add(res.timings.duration);
  serverErrors.add(res.status >= 500);

  if (res.status === 429) {
    rateLimitedCount.add(1);
    check(res, {
      'contact burst: 429 has error message': (r) => {
        try { return JSON.parse(r.body).error.includes('Too many'); } catch { return false; }
      },
    });
  } else {
    passedCount.add(1);
    check(res, {
      'contact burst: 200 or 429': (r) => r.status === 200 || r.status === 429,
    });
  }

  // No sleep — rapid fire to trigger rate limit
}

// Burst creator-apply endpoint — stricter limit (3/min)
export function creatorBurst() {
  const res = http.post(
    `${BASE_URL}/api/creator-apply`,
    JSON.stringify({
      name: `Rate Creator ${randomString(4)}`,
      email: `rate-creator-${randomString(6)}@test.com`,
      platform: 'Twitch',
      handle: `rate_${randomString(8)}`,
    }),
    { headers: jsonHeaders() },
  );

  rateLimitLatency.add(res.timings.duration);
  serverErrors.add(res.status >= 500);

  if (res.status === 429) rateLimitedCount.add(1);
  else passedCount.add(1);

  check(res, {
    'creator burst: not 500': (r) => r.status < 500,
  });
}

// Multiple VUs hitting contact — each should have independent rate limit
export function multiIpContact() {
  const res = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify({
      name: `Multi IP User ${__VU}-${__ITER}`,
      email: `multi-${__VU}-${randomString(4)}@test.com`,
      type: 'talent',
      message: `Testing independent rate limits per VU/IP. VU: ${__VU}, Iter: ${__ITER}`,
    }),
    { headers: jsonHeaders() },
  );

  serverErrors.add(res.status >= 500);

  check(res, {
    'multi-ip: should pass (under limit)': (r) => r.status === 200,
    'multi-ip: not 500': (r) => r.status < 500,
  });

  sleep(0.5);
}
