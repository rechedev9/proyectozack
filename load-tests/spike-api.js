import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import {
  BASE_URL,
  SPIKE_STAGES,
  jsonHeaders,
  randomItem,
  randomString,
} from './config.js';

/* -------------------------------------------------------------------------- */
/*  Spike test — sudden traffic burst against API endpoints                   */
/*  Simulates viral moment, bot attack, or DDoS-like burst                    */
/*  Run: k6 run load-tests/spike-api.js                                      */
/* -------------------------------------------------------------------------- */

const rateLimited = new Counter('rate_limited_responses');
const serverErrors = new Counter('server_errors_500');
const successRate = new Rate('success_rate');

export const options = {
  stages: SPIKE_STAGES,
  thresholds: {
    server_errors_500: ['count<5'],    // Near-zero 500s even under spike
    success_rate: ['rate>0.5'],         // At least 50% succeed (rest may be 429)
    http_req_duration: ['p(99)<3000'], // Even 99th percentile under 3s
  },
};

const ENDPOINTS = [
  {
    name: 'contact',
    url: '/api/contact',
    payload: () => ({
      name: `Spike User ${randomString(4)}`,
      email: `spike-${randomString(6)}@test.com`,
      type: randomItem(['brand', 'talent', 'other']),
      message: `Spike test submission with content: ${randomString(30)}. Testing burst handling.`,
    }),
  },
  {
    name: 'creator-apply',
    url: '/api/creator-apply',
    payload: () => ({
      name: `Spike Creator ${randomString(4)}`,
      email: `spike-creator-${randomString(6)}@test.com`,
      platform: randomItem(['Twitch', 'YouTube', 'TikTok']),
      handle: `spike_${randomString(8)}`,
    }),
  },
];

export default function () {
  const endpoint = randomItem(ENDPOINTS);

  const res = http.post(
    `${BASE_URL}${endpoint.url}`,
    JSON.stringify(endpoint.payload()),
    { headers: jsonHeaders() },
  );

  // Track rate limiting
  if (res.status === 429) {
    rateLimited.add(1);
  }

  // Track server errors
  if (res.status >= 500) {
    serverErrors.add(1);
  }

  successRate.add(res.status === 200);

  check(res, {
    [`${endpoint.name}: not 500`]: (r) => r.status < 500,
    [`${endpoint.name}: valid response`]: (r) => r.status === 200 || r.status === 429 || r.status === 422,
  });

  // Minimal think time — simulating aggressive bot/burst
  sleep(Math.random() * 0.5);
}
