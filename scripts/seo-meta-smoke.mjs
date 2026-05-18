/**
 * Lightweight SEO smoke check: fetches public HTML and asserts core meta signals exist.
 * Usage:
 *   BASE_URL=https://www.tashyik.com node scripts/seo-meta-smoke.mjs
 *   BASE_URL=http://localhost:3000 node scripts/seo-meta-smoke.mjs
 *
 * Checks: meta description, og:description, og:image, title (og:title or <title>),
 * and URL (og:url or rel=canonical).
 */
const baseUrl = (process.env.BASE_URL || 'https://www.tashyik.com').replace(/\/$/, '');

const paths = process.env.SEO_PATHS
  ? process.env.SEO_PATHS.split(',').map((p) => p.trim())
  : ['/', '/categories', '/articles'];

async function fetchHtml(path) {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': 'TashyikSeoSmoke/1.0',
      accept: 'text/html',
    },
  });

  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }

  return { url, html: await res.text() };
}

/** Unhead / Vue may emit single or double quotes; match property name case-insensitively. */
function assertOgProperty(html, property, label) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`property=["']${escaped}["']`, 'i');
  if (!re.test(html)) {
    throw new Error(`Missing ${label}: no <meta property="${property}">`);
  }
}

function assertMetaName(html, name, label) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`name=["']${escaped}["']`, 'i');
  if (!re.test(html)) {
    throw new Error(`Missing ${label}: no <meta name="${name}">`);
  }
}

/** Prefer explicit og:title; allow plain <title> for older shells that only emit title + canonical. */
function assertTitleSignal(html) {
  if (/property=["']og:title["']/i.test(html)) {
    return;
  }
  if (/<title>[^<]{1,500}<\/title>/i.test(html)) {
    return;
  }
  throw new Error('Missing title signal: no og:title and no <title> text');
}

/** Prefer og:url; canonical is an acceptable substitute for crawlers. */
function assertUrlSignal(html) {
  if (/property=["']og:url["']/i.test(html)) {
    return;
  }
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) {
    return;
  }
  throw new Error('Missing URL signal: no og:url and no rel=canonical link');
}

async function main() {
  let failed = false;

  for (const path of paths) {
    try {
      const { url, html } = await fetchHtml(path);
      assertMetaName(html, 'description', 'meta description');
      assertTitleSignal(html);
      assertOgProperty(html, 'og:description', 'og:description');
      assertOgProperty(html, 'og:image', 'og:image');
      assertUrlSignal(html);
      console.log(`OK ${url}`);
    } catch (e) {
      failed = true;
      console.error(`FAIL ${baseUrl}${path.startsWith('/') ? path : `/${path}`}: ${e.message || e}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
