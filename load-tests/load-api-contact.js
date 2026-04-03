import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import {
  BASE_URL,
  STANDARD_STAGES,
  API_THRESHOLDS,
  jsonHeaders,
  randomItem,
  randomString,
  randomInt,
} from './config.js';

/* -------------------------------------------------------------------------- */
/*  Load test — /api/contact endpoint under sustained form submissions        */
/*  Simulates many users submitting the contact form concurrently             */
/*  Run: k6 run load-tests/load-api-contact.js                               */
/* -------------------------------------------------------------------------- */

const contactLatency = new Trend('contact_api_duration');
const validationErrors = new Rate('validation_error_rate');

export const options = {
  stages: STANDARD_STAGES,
  thresholds: {
    ...API_THRESHOLDS,
    contact_api_duration: ['p(95)<300'],
    validation_error_rate: ['rate<0.05'], // <5% invalid payloads (we send some on purpose)
  },
};

const TYPES = ['brand', 'talent', 'other'];
const BUDGETS = ['<5K', '5-10K', '10-25K', '25K+', ''];
const TIMELINES = ['1 semana', '2 semanas', '1 mes', ''];

function generateValidPayload() {
  const type = randomItem(TYPES);
  const payload = {
    name: `Load Test User ${randomString(6)}`,
    email: `loadtest-${randomString(8)}@test.com`,
    type,
    message: `This is a load test message with random content: ${randomString(50)}. Testing sustained throughput under concurrent submissions.`,
  };

  // Add optional fields randomly
  if (Math.random() < 0.5) payload.company = `Company ${randomString(5)}`;
  if (Math.random() < 0.3) payload.phone = `+34${randomInt(600000000, 699999999)}`;

  if (type === 'brand') {
    if (Math.random() < 0.5) payload.budget = randomItem(BUDGETS.filter(Boolean));
    if (Math.random() < 0.5) payload.timeline = randomItem(TIMELINES.filter(Boolean));
    if (Math.random() < 0.3) payload.audience = `Audience ${randomString(20)}`;
  }

  if (type === 'talent') {
    if (Math.random() < 0.5) payload.platform = randomItem(['Twitch', 'YouTube', 'TikTok']);
    if (Math.random() < 0.5) payload.viewers = `${randomInt(100, 50000)}`;
    if (Math.random() < 0.3) payload.monetization = `Monetization ${randomString(15)}`;
  }

  return payload;
}

function generateInvalidPayload() {
  // Various invalid payloads to test error handling under load
  const variants = [
    { name: 'A', email: 'bad', type: 'brand', message: 'short' },
    { name: '', email: '', type: '', message: '' },
    { email: 'test@test.com', message: 'Missing name field here.' },
    { name: 123, email: true, type: null, message: [] },
    {},
  ];
  return randomItem(variants);
}

export default function loadApiContact() {
  // 90% valid payloads, 10% invalid (realistic error rate)
  const isValid = Math.random() < 0.9;
  const payload = isValid ? generateValidPayload() : generateInvalidPayload();

  const res = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify(payload),
    { headers: jsonHeaders() },
  );

  contactLatency.add(res.timings.duration);

  if (isValid) {
    check(res, {
      'valid: status 200': (r) => r.status === 200,
      'valid: success true': (r) => {
        try { return JSON.parse(r.body).success === true; } catch { return false; }
      },
      'valid: not 500': (r) => r.status !== 500,
    });
    validationErrors.add(res.status !== 200);
  } else {
    check(res, {
      'invalid: not 500': (r) => r.status !== 500,
      'invalid: 400 or 422': (r) => r.status === 400 || r.status === 422,
    });
    validationErrors.add(false); // Expected failure, not an error
  }

  // Realistic think time between submissions
  sleep(Math.random() * 3 + 1);
}
