/* -------------------------------------------------------------------------- */
/*  Shared config for k6 load tests                                           */
/*  Override BASE_URL with: k6 run -e BASE_URL=https://staging.socialpro.es   */
/* -------------------------------------------------------------------------- */

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Standard thresholds — fail the test if these are exceeded
export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'],  // 95th < 500ms, 99th < 1.5s
  http_req_failed: ['rate<0.01'],                    // <1% error rate
  http_reqs: ['rate>10'],                            // >10 req/s throughput
};

// Stricter thresholds for API endpoints
export const API_THRESHOLDS = {
  http_req_duration: ['p(95)<300', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
};

// Rate limit thresholds — expect 429s after hitting limits
export const RATE_LIMIT_THRESHOLDS = {
  http_req_duration: ['p(95)<500'],
  // We EXPECT failures (429s) — so no http_req_failed threshold here
};

// Standard load profile: ramp up → sustain → ramp down
export const STANDARD_STAGES = [
  { duration: '30s', target: 20 },   // ramp up to 20 VUs
  { duration: '1m',  target: 20 },   // sustain 20 VUs
  { duration: '30s', target: 50 },   // ramp up to 50 VUs
  { duration: '1m',  target: 50 },   // sustain 50 VUs
  { duration: '30s', target: 0 },    // ramp down
];

// Spike profile: sudden burst
export const SPIKE_STAGES = [
  { duration: '10s', target: 5 },    // warm up
  { duration: '5s',  target: 200 },  // spike to 200 VUs
  { duration: '30s', target: 200 },  // sustain spike
  { duration: '10s', target: 0 },    // ramp down
];

// Smoke profile: minimal load, just verify things work
export const SMOKE_STAGES = [
  { duration: '30s', target: 3 },    // 3 VUs for 30s
];

// Soak profile: low load, long duration (memory leaks, connection pool exhaustion)
export const SOAK_STAGES = [
  { duration: '30s', target: 10 },   // ramp up
  { duration: '10m', target: 10 },   // sustain 10 VUs for 10 min
  { duration: '30s', target: 0 },    // ramp down
];

// Helpers
export function jsonHeaders() {
  return { 'Content-Type': 'application/json' };
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
