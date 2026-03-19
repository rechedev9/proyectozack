import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, SMOKE_STAGES, THRESHOLDS } from './config.js';

/* -------------------------------------------------------------------------- */
/*  Smoke test — minimal load to verify all endpoints are reachable           */
/*  Run: k6 run load-tests/smoke.js                                          */
/* -------------------------------------------------------------------------- */

export const options = {
  stages: SMOKE_STAGES,
  thresholds: THRESHOLDS,
};

export default function () {
  // Home page (SSR)
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    'home: status 200': (r) => r.status === 200,
    'home: has html': (r) => r.body.includes('</html>'),
  });

  sleep(1);

  // Metodología page
  const metodo = http.get(`${BASE_URL}/metodologia`);
  check(metodo, {
    'metodologia: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Para creadores page
  const creators = http.get(`${BASE_URL}/para-creadores`);
  check(creators, {
    'para-creadores: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Blog listing
  const blog = http.get(`${BASE_URL}/blog`);
  check(blog, {
    'blog: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Contact API — valid payload
  const contact = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify({
      name: 'Smoke Test',
      email: 'smoke@test.com',
      type: 'brand',
      message: 'This is a smoke test message for load testing.',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(contact, {
    'contact API: status 200': (r) => r.status === 200,
    'contact API: success true': (r) => {
      try { return JSON.parse(r.body).success === true; } catch { return false; }
    },
  });

  sleep(1);

  // Contact API — invalid payload (should 422, not 500)
  const badContact = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify({ name: 'A', message: 'short' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(badContact, {
    'bad contact: not 500': (r) => r.status !== 500,
    'bad contact: status 422': (r) => r.status === 422,
  });

  sleep(1);

  // Creator apply API — valid payload
  const apply = http.post(
    `${BASE_URL}/api/creator-apply`,
    JSON.stringify({
      name: 'Smoke Creator',
      email: 'creator@test.com',
      platform: 'Twitch',
      handle: 'smoketest',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(apply, {
    'creator-apply: status 200': (r) => r.status === 200,
  });

  sleep(1);

  // Brand login page (should render, not crash)
  const brandLogin = http.get(`${BASE_URL}/marcas/login`);
  check(brandLogin, {
    'brand login: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Admin login page
  const adminLogin = http.get(`${BASE_URL}/admin/login`);
  check(adminLogin, {
    'admin login: status 200': (r) => r.status === 200,
  });

  sleep(1);
}
