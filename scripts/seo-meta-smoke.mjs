/**
 * SEO smoke check: fetches public HTML for every locale + entity URL set and
 * asserts core SEO signals are present in the SSR output. Used as a fast
 * regression gate in CI and locally before deploys.
 *
 * Usage:
 *   BASE_URL=https://www.tashyik.com node scripts/seo-meta-smoke.mjs
 *   BASE_URL=http://localhost:3000 node scripts/seo-meta-smoke.mjs
 *   BASE_URL=http://localhost:3000 SEO_LOCALES=ar,en SEO_SAMPLE_SIZE=2 node scripts/seo-meta-smoke.mjs
 *
 * Checks per page:
 *   - <meta name="description">
 *   - <title> OR og:title
 *   - og:description, og:image
 *   - og:url OR <link rel="canonical">
 *   - hreflang for every configured locale (when on a localizable URL)
 *   - meta robots (no `noindex` unless URL is in SEO_NOINDEX_OK)
 *
 * Per-entity (services / cities / articles): also asserts JSON-LD presence.
 */
const baseUrl = (process.env.BASE_URL || 'https://www.tashyik.com').replace(/\/$/, '');
const apiBase = (process.env.API_BASE || baseUrl.replace(/^https?:\/\//, 'https://api.')).replace(/\/$/, '');
const locales = (process.env.SEO_LOCALES || 'ar,en').split(',').map((l) => l.trim()).filter(Boolean);
const sampleSize = Number.parseInt(process.env.SEO_SAMPLE_SIZE || '3', 10);
const noindexOk = (process.env.SEO_NOINDEX_OK || '/account,/orders,/profile,/cart').split(',').map((p) => p.trim());

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'TashyikSeoSmoke/1.0',
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }

  return res.json();
}

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

function assertMetaName(html, name, label) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`name=["']${escaped}["']`, 'i');
  if (!re.test(html)) {
    throw new Error(`Missing ${label}: no <meta name="${name}">`);
  }
}

function assertOgProperty(html, property, label) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`property=["']${escaped}["']`, 'i');
  if (!re.test(html)) {
    throw new Error(`Missing ${label}: no <meta property="${property}">`);
  }
}

function assertTitleSignal(html) {
  if (/property=["']og:title["']/i.test(html)) {
    return;
  }
  if (/<title>[^<]{1,500}<\/title>/i.test(html)) {
    return;
  }
  throw new Error('Missing title signal: no og:title and no <title> text');
}

function assertUrlSignal(html) {
  if (/property=["']og:url["']/i.test(html)) {
    return;
  }
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) {
    return;
  }
  throw new Error('Missing URL signal: no og:url and no rel=canonical link');
}

function assertHreflang(html, expectedLocales) {
  const matches = html.match(/<link[^>]+rel=["']alternate["'][^>]*hreflang=["'][a-zA-Z-]+["'][^>]*>/gi) || [];

  if (matches.length === 0) {
    throw new Error('Missing hreflang alternates entirely');
  }

  const found = new Set();
  matches.forEach((tag) => {
    const m = tag.match(/hreflang=["']([a-zA-Z-]+)["']/i);
    if (m) found.add(m[1].toLowerCase());
  });

  for (const locale of expectedLocales) {
    if (!found.has(locale.toLowerCase())) {
      throw new Error(`Missing hreflang for locale "${locale}"`);
    }
  }
}

function assertRobotsAllowsIndex(html, path) {
  if (noindexOk.some((prefix) => path.startsWith(prefix))) {
    return;
  }

  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);

  if (!robotsMatch) {
    return;
  }

  const directives = robotsMatch[1].toLowerCase();

  if (/noindex/.test(directives)) {
    throw new Error(`<meta name="robots"> contains "noindex" but path is supposed to be indexable: ${directives}`);
  }
}

function assertJsonLd(html, requiredTypes) {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  if (blocks.length === 0) {
    throw new Error('Missing JSON-LD: no <script type="application/ld+json">');
  }

  const types = new Set();

  for (const block of blocks) {
    const inner = block.replace(/<script[^>]*>|<\/script>/gi, '').trim();

    try {
      const parsed = JSON.parse(inner);
      const collect = (node) => {
        if (Array.isArray(node)) {
          node.forEach(collect);
          return;
        }

        if (node && typeof node === 'object' && node['@type']) {
          if (Array.isArray(node['@type'])) {
            node['@type'].forEach((t) => types.add(t));
          } else {
            types.add(node['@type']);
          }
        }

        if (node && typeof node === 'object') {
          Object.values(node).forEach(collect);
        }
      };

      collect(parsed);
    } catch {
      // Tolerate malformed blocks; downstream type check will catch missing schema.
    }
  }

  for (const required of requiredTypes) {
    if (!types.has(required)) {
      throw new Error(`Missing JSON-LD @type "${required}" (found: ${[...types].join(',') || 'none'})`);
    }
  }
}

async function buildPaths() {
  const paths = ['/', '/categories', '/services', '/cities', '/articles', '/about', '/contact'];

  try {
    const services = await fetchJson(`${apiBase}/services?limit=${sampleSize}`);
    (services?.data || []).slice(0, sampleSize).forEach((s) => {
      paths.push(`/services/${s.slug}`);
    });

    const cities = await fetchJson(`${apiBase}/cities?limit=${sampleSize}`);
    (cities?.data || []).slice(0, sampleSize).forEach((c) => {
      paths.push(`/cities/${c.slug}`);
    });

    if ((services?.data || []).length && (cities?.data || []).length) {
      const serviceSlug = services.data[0].slug;
      const citySlug = cities.data[0].slug;
      paths.push(`/services/${serviceSlug}/in/${citySlug}`);
    }

    const articles = await fetchJson(`${apiBase}/articles?limit=${sampleSize}`);
    (articles?.data || []).slice(0, sampleSize).forEach((a) => {
      paths.push(`/articles/${a.slug}`);
    });
  } catch (error) {
    console.warn(`Sample fetch from ${apiBase} failed; smoke test will skip dynamic URLs. Reason: ${error.message || error}`);
  }

  return paths;
}

function expectedJsonLdTypes(path) {
  if (path === '/') return ['Organization', 'WebSite'];
  if (/^\/services\/[^/]+\/in\/[^/]+$/.test(path)) return ['BreadcrumbList', 'Service'];
  if (/^\/services\/[^/]+$/.test(path)) return ['BreadcrumbList', 'Service'];
  if (/^\/cities\/[^/]+$/.test(path)) return ['BreadcrumbList'];
  if (/^\/articles\/[^/]+$/.test(path)) return ['Article'];
  if (path === '/categories' || path === '/cities' || path === '/services') return ['ItemList'];
  return [];
}

async function checkPath(path) {
  const isDefaultLocale = !locales.slice(1).some((l) => path.startsWith(`/${l}/`) || path === `/${l}`);
  const fullPath = isDefaultLocale ? path : path; // keep raw path; locale prefix handled by caller
  const { url, html } = await fetchHtml(fullPath);

  assertMetaName(html, 'description', 'meta description');
  assertTitleSignal(html);
  assertOgProperty(html, 'og:description', 'og:description');
  assertOgProperty(html, 'og:image', 'og:image');
  assertUrlSignal(html);
  assertHreflang(html, locales);
  assertRobotsAllowsIndex(html, path);

  if (!/^\/articles\/[^/]+$/.test(path)) {
    const keywordsMatch = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i);
    if (!keywordsMatch || !keywordsMatch[1]?.trim()) {
      console.warn(`WARN ${baseUrl}${path}: no meta keywords (optional until backend keywords fill completes)`);
    }
  }

  const required = expectedJsonLdTypes(path);
  if (required.length > 0) {
    assertJsonLd(html, required);
  }

  return url;
}

async function main() {
  const paths = await buildPaths();
  const fullSet = [];

  for (const path of paths) {
    fullSet.push(path);
    for (const locale of locales.slice(1)) {
      fullSet.push(`/${locale}${path === '/' ? '' : path}`);
    }
  }

  let failed = 0;
  let passed = 0;

  for (const path of fullSet) {
    try {
      const url = await checkPath(path);
      console.log(`OK   ${url}`);
      passed++;
    } catch (error) {
      failed++;
      console.error(`FAIL ${baseUrl}${path}: ${error.message || error}`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed across ${fullSet.length} URL(s).`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
