import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import {
  BASE_URL,
  SOAK_STAGES,
  THRESHOLDS,
  jsonHeaders,
  randomItem,
  randomString,
} from './config.js';

/* -------------------------------------------------------------------------- */
/*  Soak test — low sustained load for extended duration                      */
/*  Detects: memory leaks, DB connection pool exhaustion, handle leaks        */
/*  Run: k6 run load-tests/soak.js                                           */
/*  Note: runs 11+ min — use for pre-deploy validation                       */
/* -------------------------------------------------------------------------- */

const responseTime = new Trend('response_time_over_time');
const errorRate = new Rate('error_rate');
const slowRequests = new Counter('slow_requests_over_1s');

export const options = {
  stages: SOAK_STAGES,
  thresholds: {
    ...THRESHOLDS,
    error_rate: ['rate<0.02'],          // <2% errors sustained
    slow_requests_over_1s: ['count<50'], // Few slow requests over entire soak
  },
};

const ACTIONS = [
  { weight: 40, fn: browsePage },
  { weight: 30, fn: submitContact },
  { weight: 15, fn: submitCreatorApply },
  { weight: 10, fn: checkBlog },
  { weight: 5,  fn: checkRss },
];

// Weighted random selection
function pickAction() {
  const total = ACTIONS.reduce((sum, a) => sum + a.weight, 0);
  let rand = Math.random() * total;
  for (const action of ACTIONS) {
    rand -= action.weight;
    if (rand <= 0) return action.fn;
  }
  return ACTIONS[0].fn;
}

function browsePage() {
  const pages = ['/', '/metodologia', '/para-creadores', '/blog'];
  const page = randomItem(pages);
  const res = http.get(`${BASE_URL}${page}`);

  responseTime.add(res.timings.duration);
  errorRate.add(res.status >= 500);
  if (res.timings.duration > 1000) slowRequests.add(1);

  check(res, {
    'browse: 200': (r) => r.status === 200,
  });
}

function submitContact() {
  const res = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify({
      name: `Soak User ${randomString(4)}`,
      email: `soak-${randomString(6)}@test.com`,
      type: randomItem(['brand', 'talent', 'other']),
      message: `Soak test message: ${randomString(40)}. Monitoring for resource leaks.`,
    }),
    { headers: jsonHeaders() },
  );

  responseTime.add(res.timings.duration);
  errorRate.add(res.status >= 500);
  if (res.timings.duration > 1000) slowRequests.add(1);

  check(res, {
    'contact: not 500': (r) => r.status < 500,
  });
}

function submitCreatorApply() {
  const res = http.post(
    `${BASE_URL}/api/creator-apply`,
    JSON.stringify({
      name: `Soak Creator ${randomString(4)}`,
      email: `soak-creator-${randomString(6)}@test.com`,
      platform: randomItem(['Twitch', 'YouTube']),
      handle: `soak_${randomString(6)}`,
    }),
    { headers: jsonHeaders() },
  );

  responseTime.add(res.timings.duration);
  errorRate.add(res.status >= 500);
  if (res.timings.duration > 1000) slowRequests.add(1);

  check(res, {
    'creator-apply: not 500': (r) => r.status < 500,
  });
}

function checkBlog() {
  const res = http.get(`${BASE_URL}/blog`);

  responseTime.add(res.timings.duration);
  errorRate.add(res.status >= 500);
  if (res.timings.duration > 1000) slowRequests.add(1);

  check(res, {
    'blog: 200': (r) => r.status === 200,
  });
}

function checkRss() {
  const res = http.get(`${BASE_URL}/blog/feed.xml`);

  responseTime.add(res.timings.duration);
  errorRate.add(res.status >= 500);

  check(res, {
    'rss: 200': (r) => r.status === 200,
  });
}

export default function () {
  const action = pickAction();
  action();

  // Realistic think time for soak — users don't spam
  sleep(Math.random() * 3 + 2);
}
