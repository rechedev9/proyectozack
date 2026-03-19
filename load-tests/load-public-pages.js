import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, STANDARD_STAGES, THRESHOLDS, randomItem } from './config.js';

/* -------------------------------------------------------------------------- */
/*  Load test — public pages under sustained traffic                          */
/*  Simulates real user browsing patterns on public-facing pages              */
/*  Run: k6 run load-tests/load-public-pages.js                              */
/* -------------------------------------------------------------------------- */

const homeLatency = new Trend('home_page_duration');
const blogLatency = new Trend('blog_page_duration');
const slowPages = new Counter('slow_pages');

export const options = {
  stages: STANDARD_STAGES,
  thresholds: {
    ...THRESHOLDS,
    home_page_duration: ['p(95)<800'],
    blog_page_duration: ['p(95)<600'],
  },
};

const PUBLIC_PAGES = [
  '/',
  '/metodologia',
  '/para-creadores',
  '/blog',
];

export default function () {
  // Simulate a user browsing multiple pages in a session

  // 1. Land on home page (heaviest — fetches 6 queries via Promise.all)
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    'home: 200': (r) => r.status === 200,
    'home: has content': (r) => r.body.length > 1000,
  });
  homeLatency.add(home.timings.duration);
  if (home.timings.duration > 800) slowPages.add(1);

  sleep(Math.random() * 2 + 1); // 1-3s think time (realistic browsing)

  // 2. Navigate to a random public page
  const page = randomItem(PUBLIC_PAGES);
  const res = http.get(`${BASE_URL}${page}`);
  check(res, {
    [`${page}: 200`]: (r) => r.status === 200,
  });
  if (page === '/blog') blogLatency.add(res.timings.duration);

  sleep(Math.random() * 2 + 0.5);

  // 3. Maybe visit another page (60% chance)
  if (Math.random() < 0.6) {
    const page2 = randomItem(PUBLIC_PAGES.filter((p) => p !== page));
    const res2 = http.get(`${BASE_URL}${page2}`);
    check(res2, {
      [`${page2}: 200`]: (r) => r.status === 200,
    });

    sleep(Math.random() * 1.5 + 0.5);
  }

  // 4. RSS feed (some clients/crawlers hit this)
  if (Math.random() < 0.1) {
    const rss = http.get(`${BASE_URL}/blog/feed.xml`);
    check(rss, {
      'rss: 200': (r) => r.status === 200,
      'rss: is xml': (r) => r.headers['Content-Type']?.includes('xml') ?? r.body.includes('<rss'),
    });
  }

  sleep(Math.random() + 0.5);
}
