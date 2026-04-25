/**
 * Blog cover images — 1200×630px
 *
 * Diseño minimalista:
 *  - SP logo (icon + wordmark) en grande, centrado arriba
 *  - Brand logo sin fondo blanco, en grande (posts campaña)
 *  - Categoría en texto accent (posts editoriales)
 *  - Fondo oscuro con glow sutil del color de marca
 */
import sharp from '../node_modules/sharp/lib/index.js';
import { rename } from 'fs/promises';

const W = 1200, H = 630;

// Accent bar SP gradient
const accentBar = Buffer.from(`<svg width="${W}" height="6" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#f5632a"/>
    <stop offset="35%"  stop-color="#e03070"/>
    <stop offset="62%"  stop-color="#c42880"/>
    <stop offset="100%" stop-color="#8b3aad"/>
  </linearGradient></defs>
  <rect width="${W}" height="6" fill="url(#g)"/>
</svg>`);

// SP full logo — cargado una vez
const spLogoRaw = await sharp('public/images/logos/socialpro-full.png')
  .resize({ width: 300, height: 300, fit: 'inside' })
  .toBuffer();
const { width: spW, height: spH } = await sharp(spLogoRaw).metadata();

/**
 * Carga un logo de marca eliminando píxeles de fondo blanco/casi-blanco.
 * Devuelve { buf: Buffer PNG con alpha, width, height }
 */
async function loadBrandLogo(logoPath, maxW = 500, maxH = 160) {
  const { data, info } = await sharp(logoPath)
    .resize({ width: maxW, height: maxH, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Eliminar píxeles casi-blancos (umbral 228/255)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 228 && g > 228 && b > 228) data[i + 3] = 0;
  }

  const buf = await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();

  return { buf, width, height };
}

const posts = [
  {
    out:       'public/images/blog/1win-socialpro-influencers-instagram.jpg',
    accent:    '#00c2ff',
    brandLogo: 'public/images/brands/1win.png',
    label:     '1WIN × SOCIALPRO',
  },
  {
    out:       'public/images/blog/skinsmonkey-socialpro-cs2-marketplace.jpg',
    accent:    '#f5c500',
    brandText: 'SKINSMONKEY',   // solo tipografía — logo PNG tiene fondo blanco complejo
    label:     'SKINSMONKEY × SOCIALPRO',
  },
  {
    out:       'public/images/blog/razer-socialpro-creadores-gaming.jpg',
    accent:    '#39ff14',
    brandLogo: 'public/images/brands/razer.png',
    label:     'RAZER × SOCIALPRO',
  },
  {
    out:      'public/images/blog/monetizar-canal-youtube-gaming-2026.jpg',
    accent:   '#ff4444',
    category: 'MONETIZACIÓN',
    label:    'MONETIZACIÓN',
  },
  {
    out:      'public/images/blog/guia-marketing-gaming-espana-2026.jpg',
    accent:   '#e03070',
    category: 'MARKETING GAMING',
    label:    'MARKETING',
  },
  {
    out:      'public/images/blog/tendencias-gaming-latam-2026.jpg',
    accent:   '#8b3aad',
    category: 'TENDENCIAS LATAM',
    label:    'TENDENCIAS',
  },
  {
    out:      'public/images/blog/caso-exito-campana-gaming-hardware.jpg',
    accent:   '#f5632a',
    category: 'CASO DE ÉXITO',
    label:    'CASO DE ÉXITO',
  },
  {
    out:      'public/images/blog/guia-creadores-conseguir-sponsor.jpg',
    accent:   '#c42880',
    category: 'GUÍA CREADORES',
    label:    'GUÍA',
  },
  {
    out:      'public/images/blog/tendencias-gaming-espana-2025.jpg',
    accent:   '#5b9bd5',
    category: 'TENDENCIAS ESPAÑA',
    label:    'TENDENCIAS',
  },
];

for (const post of posts) {
  const isCampaign = !!(post.brandLogo || post.brandText);

  // SP logo: arriba centrado
  const spTop  = isCampaign ? 36 : 70;
  const spLeft = Math.round((W - spW) / 2);
  const spBot  = spTop + spH;

  // Divisor
  const divY = spBot + 28;

  // Contenido debajo del divisor
  const contentTop = divY + 28;

  // ─── Brand logo ─────────────────────────────────────────────────────
  let brandBuf = null, brandW = 0, brandH = 0, brandLeft = 0;

  if (isCampaign && post.brandLogo) {
    try {
      const logo = await loadBrandLogo(post.brandLogo, post.logoMaxW ?? 500, post.logoMaxH ?? 160);
      brandBuf  = logo.buf;
      brandW    = logo.width;
      brandH    = logo.height;
      brandLeft = Math.round((W - brandW) / 2);
    } catch (e) {
      console.warn(`  brand logo error: ${e.message}`);
    }
  }

  // ─── SVG separador / contenido editorial ────────────────────────────
  const catFontSize = post.category && post.category.length > 14 ? 38 : 46;
  const catY        = contentTop + catFontSize;

  // Texto de marca debajo del logo (logo + texto)
  const brandTextBelowLogo = isCampaign && post.brandText && post.brandLogo
    ? `<text x="${W / 2}" y="${contentTop + (brandH ?? 80) + 52}" text-anchor="middle"
        font-family="Arial Black,sans-serif" font-size="34" font-weight="900"
        letter-spacing="5" fill="${post.accent}" opacity="0.90">
        ${post.brandText}
      </text>`
    : '';

  // Tratamiento tipográfico puro (brandText sin logo)
  const brandTextOnly = isCampaign && post.brandText && !post.brandLogo
    ? `<text x="${W / 2}" y="${contentTop + 72}" text-anchor="middle"
        font-family="Arial Black,sans-serif" font-size="76" font-weight="900"
        letter-spacing="4" fill="${post.accent}" opacity="0.92">
        ${post.brandText}
      </text>`
    : '';

  const sepSvg = isCampaign
    ? `<line x1="60" y1="${divY}" x2="${W / 2 - 24}" y2="${divY}"
         stroke="${post.accent}" stroke-width="1" stroke-opacity="0.30"/>
       <text x="${W / 2}" y="${divY + 6}" text-anchor="middle"
         font-family="Arial Black,sans-serif" font-size="18"
         fill="${post.accent}" opacity="0.45">&#215;</text>
       <line x1="${W / 2 + 24}" y1="${divY}" x2="${W - 60}" y2="${divY}"
         stroke="${post.accent}" stroke-width="1" stroke-opacity="0.30"/>
       ${brandTextBelowLogo}
       ${brandTextOnly}`
    : `<line x1="80" y1="${divY}" x2="${W - 80}" y2="${divY}"
         stroke="${post.accent}" stroke-width="1" stroke-opacity="0.18"/>
       <text x="${W / 2}" y="${catY}" text-anchor="middle"
         font-family="Arial Black,sans-serif" font-size="${catFontSize}" font-weight="900"
         letter-spacing="6" fill="${post.accent}" opacity="0.85">
         ${(post.category ?? '').replace(/&/g, '&amp;').replace(/É/g, '&#201;')}
       </text>`;

  // ─── Fondo ───────────────────────────────────────────────────────────
  const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%"   stop-color="#0d0d0d"/>
        <stop offset="100%" stop-color="#12121a"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <!-- Glow principal -->
    <ellipse cx="${W / 2}" cy="${H * 0.58}" rx="500" ry="240"
      fill="${post.accent}" opacity="0.06"/>
    <!-- Glow secundario difuso -->
    <ellipse cx="${W / 2}" cy="${H * 0.28}" rx="300" ry="170"
      fill="${post.accent}" opacity="0.03"/>

    <!-- Separador + contenido -->
    ${sepSvg}

    <!-- Label bottom-right -->
    <text x="${W - 40}" y="${H - 18}" text-anchor="end"
      font-family="Arial,sans-serif" font-size="11" font-weight="700"
      letter-spacing="3" fill="white" opacity="0.16">
      ${(post.label ?? '').replace(/&/g, '&amp;')}
    </text>
  </svg>`);

  // ─── Compositing ─────────────────────────────────────────────────────
  const composites = [
    { input: spLogoRaw, top: spTop,  left: spLeft },
    { input: accentBar, top: H - 6, left: 0 },
  ];

  if (brandBuf) {
    composites.push({ input: brandBuf, top: contentTop, left: brandLeft });
  }

  await sharp(bg)
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(post.out + '.tmp');
  await rename(post.out + '.tmp', post.out);
  console.log(`✓  ${post.out.split('/').pop()}`);
}

console.log('\n✅  Todos los covers generados.');
