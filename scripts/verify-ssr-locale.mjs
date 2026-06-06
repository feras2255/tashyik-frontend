import { writeFileSync } from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:3456';

for (const path of ['/', '/hi', '/en', '/fr']) {
  const res = await fetch(`${base}${path}`);
  const html = await res.text();

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const ogTitle = html.match(/property="og:title"[^>]+content="([^"]+)"/)?.[1]
    || html.match(/content="([^"]+)"[^>]+property="og:title"/)?.[1];
  const metaDescription = html.match(/name="description"[^>]+content="([^"]+)"/)?.[1]
    || html.match(/content="([^"]+)"[^>]+name="description"/)?.[1];
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const lang = html.match(/<html[^>]+lang="([^"]+)"/)?.[1];

  console.log(JSON.stringify({
    path,
    status: res.status,
    size: html.length,
    title,
    ogTitle,
    metaDescription: metaDescription?.slice(0, 80),
    hasMaintenanceKeyword: /صيانة|maintenance|रखरखाव|entretien/i.test(html),
    canonical,
    lang,
    hasPayload: /_payload\.json/.test(html),
    hindiHero: html.includes('सऊदी अरब में है'),
    englishHero: html.includes('now in Saudi Arabia'),
    frenchHero: html.includes('Arabie Saoudite'),
    arabicLeak: html.includes('تشييك الآن بالسعودية'),
  }));
}
