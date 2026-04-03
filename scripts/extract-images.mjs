/**
 * extract-images.mjs
 * Reads the source HTML file, extracts all base64-encoded images,
 * decodes them, and writes to public/images/{category}/{key}.jpg|png
 *
 * Run: node scripts/extract-images.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HTML_SRC = join(ROOT, '..', 'socialpro-final (10) (1).html');
const PUBLIC = join(ROOT, 'public', 'images');

const html = readFileSync(HTML_SRC, 'utf8');

/** Extract a base64 data URI and write to dest. Returns dest path or null. */
function extractAndWrite(dataUri, destPath) {
  if (!dataUri || dataUri === 'null' || dataUri === 'undefined') return null;
  const m = dataUri.match(/^data:image\/(jpeg|png|jpg|gif|webp);base64,(.+)$/s);
  if (!m) return null;
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const finalPath = destPath.replace(/\.(jpg|png)$/, `.${ext}`);
  const buf = Buffer.from(m[2], 'base64');
  writeFileSync(finalPath, buf);
  console.log('  wrote', finalPath.replace(ROOT, ''));
  return finalPath;
}

/** Parse a JS object literal (simple key:value pairs) from source */
function extractJsObject(name) {
  const re = new RegExp(`var ${name}\\s*=\\s*(\\{[\\s\\S]*?\\});`);
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractJsArray(name) {
  const re = new RegExp(`var ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`);
  const m = html.match(re);
  return m ? m[1] : null;
}

// ── BRAND_LOGOS ──────────────────────────────────────────────────────────────
console.log('\nExtracting brand logos...');
const brandLogosRaw = extractJsObject('BRAND_LOGOS');
if (brandLogosRaw) {
  const pairs = [...brandLogosRaw.matchAll(/'([^']+)'\s*:\s*'(data:image[^']+)'/g)];
  for (const [, key, uri] of pairs) {
    const dest = join(PUBLIC, 'brands', `${key}.png`);
    extractAndWrite(uri, dest);
  }
} else {
  console.warn('  BRAND_LOGOS not found');
}

// ── TALENT_PHOTOS ────────────────────────────────────────────────────────────
console.log('\nExtracting talent photos...');
const talentPhotosRaw = extractJsObject('TALENT_PHOTOS');
if (talentPhotosRaw) {
  const pairs = [...talentPhotosRaw.matchAll(/'([^']+)'\s*:\s*'(data:image[^']+)'/g)];
  for (const [, key, uri] of pairs) {
    const dest = join(PUBLIC, 'talents', `${key}.jpg`);
    extractAndWrite(uri, dest);
  }
} else {
  console.warn('  TALENT_PHOTOS not found — trying inline TALENTS array...');
  // Fallback: extract photos from TALENTS array
  const talentsRaw = extractJsArray('TALENTS');
  if (talentsRaw) {
    const pairs = [...talentsRaw.matchAll(/id:'([^']+)'[^}]*photo:'(data:image[^']+)'/g)];
    for (const [, key, uri] of pairs) {
      const dest = join(PUBLIC, 'talents', `${key}.jpg`);
      extractAndWrite(uri, dest);
    }
  }
}

// ── TEAM_PHOTOS ──────────────────────────────────────────────────────────────
console.log('\nExtracting team photos...');
const teamPhotosRaw = extractJsObject('TEAM_PHOTOS');
if (teamPhotosRaw) {
  const pairs = [...teamPhotosRaw.matchAll(/'([^']+)'\s*:\s*'(data:image[^']+)'/g)];
  for (const [, key, uri] of pairs) {
    const dest = join(PUBLIC, 'team', `${key}.jpg`);
    extractAndWrite(uri, dest);
  }
} else {
  console.warn('  TEAM_PHOTOS not found');
}

// ── COLLAB_PHOTOS ────────────────────────────────────────────────────────────
console.log('\nExtracting collab photos...');
const collabPhotosRaw = extractJsObject('COLLAB_PHOTOS');
if (collabPhotosRaw) {
  const pairs = [...collabPhotosRaw.matchAll(/'([^']+)'\s*:\s*'(data:image[^']+)'/g)];
  for (const [, key, uri] of pairs) {
    const dest = join(PUBLIC, 'collabs', `${key}.jpg`);
    extractAndWrite(uri, dest);
  }
} else {
  console.warn('  COLLAB_PHOTOS not found');
}

// ── CASE_DATA logos ──────────────────────────────────────────────────────────
console.log('\nExtracting case logos...');
const caseDataRaw = extractJsObject('CASE_DATA');
if (caseDataRaw) {
  const pairs = [...caseDataRaw.matchAll(/(\w+)\s*:\s*\{[^}]*logo\s*:\s*'(data:image[^']+)'/g)];
  for (const [, key, uri] of pairs) {
    const dest = join(PUBLIC, 'cases', `${key}.jpg`);
    extractAndWrite(uri, dest);
  }
} else {
  console.warn('  CASE_DATA not found');
}

// ── PF_ITEMS images ──────────────────────────────────────────────────────────
console.log('\nExtracting portfolio images...');
const pfRaw = extractJsArray('PF_ITEMS');
if (pfRaw) {
  let idx = 0;
  const pairs = [...pfRaw.matchAll(/img\s*:\s*'(data:image[^']+)'/g)];
  for (const [, uri] of pairs) {
    const dest = join(PUBLIC, 'portfolio', `${idx}.jpg`);
    extractAndWrite(uri, dest);
    idx++;
  }
} else {
  console.warn('  PF_ITEMS not found');
}

console.log('\nDone! Check public/images/ for extracted files.');
