// https://nuxt.com/docs/api/configuration/nuxt-config
// Dev note: paired workspace sync with backend repo.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Read an optional list of routes to prerender at build time. The backend
 * artisan command `app:seo-export-prerender-routes` writes `seo-prerender-routes.json`
 * containing the top service-city pages (by completed orders) to materialise
 * as static HTML. The file is gitignored so production builds always use a
 * fresh snapshot exported during the deploy step.
 */
function loadPrerenderRoutes(): string[] {
  const file = resolve(process.cwd(), 'seo-prerender-routes.json');

  if (!existsSync(file)) {
    return [];
  }

  try {
    const raw = readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is string => typeof entry === 'string' && entry.startsWith('/'))
      .slice(0, 100);
  } catch {
    return [];
  }
}

/**
 * Response headers for HTML routes. Full CSP belongs at CDN (Cloudflare) after staging QA.
 * COOP uses same-origin-allow-popups to reduce breakage vs popup OAuth flows.
 */
const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
};

if (isProd) {
  securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

/** Public site origin — matches `i18n.baseUrl`; used as default `runtimeConfig.public.appUrl` for canonical/hreflang when env is unset. */
const siteBaseUrl = 'https://www.tashyik.com';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/app.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxtjs/i18n', 'nuxt-swiper', '@pinia/nuxt', '@nuxt/scripts', '@nuxt/fonts'],

  /**
   * `inlineStyles: true` can cause a visible “CSS flash” on hard refresh in dev: critical CSS inlines
   * first, then Vite attaches the full stylesheet after hydration. `false` keeps one consistent cascade.
   */
  features: {
    inlineStyles: false,
  },

  scripts: {
    // Idle-load registry scripts (GTM) after Nuxt hydration to keep TBT low on mobile PSI.
    // Note: object triggers like { idleTimeout: N } are broken in @nuxt/scripts <=0.12.2 (fix landed
    // post-release in commit faf83ff, 2025-10-15). Stick to the documented string trigger here.
    defaultScriptOptions: {
      trigger: 'onNuxtReady',
    },
    registry: {
      googleTagManager: true,
      // googleAnalytics omitted intentionally — load GA4 via GTM only to avoid duplicate gtag/gtm.js work.
      // googleMaps omitted — Maps JS API loads only via useScriptGoogleMaps() in AppMap (address flows).
    },
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/services', '/cities', '/categories', ...loadPrerenderRoutes()],
      failOnError: false,
    },
    routeRules: {
      '/_nuxt/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
      '/images/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
      '/fonts/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      },
      '/**': {
        headers: securityHeaders,
      },
    },
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://api.tashyik.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://api.tashyik.com' },
        { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
      ],
    },
  },

  fonts: {
    families: [
      {
        name: 'ExpoArabic',
        weights: [300, 400, 500, 700],
        sources: [
          {
            src: 'fonts/Expo-Arabic-Light.ttf',
            weight: 300,
            style: 'normal',
          },
          {
            src: 'fonts/Expo-Arabic-Book.ttf',
            weight: 400,
            style: 'normal',
          },
          {
            src: 'fonts/Expo-Arabic-Medium.ttf',
            weight: 500,
            style: 'normal',
          },
          {
            src: 'fonts/Expo-Arabic-Bold.ttf',
            weight: 700,
            style: 'normal',
          },
        ],
      },
    ],
    preload: true,
    /** Avoid swap reflow on refresh: keep ExpoArabic when cached; otherwise fall back without a second layout pass. */
    display: 'optional',
  },

  runtimeConfig: {
    /**
     * Server-only API base (SSR / prerender). Use when `NUXT_PUBLIC_API_BASE_URL` uses a hostname
     * that Node cannot resolve (e.g. `api.localhost`). If empty, `useApiFetch` rewrites common dev hosts to 127.0.0.1.
     */
    apiInternalBaseUrl: process.env.NUXT_API_INTERNAL_BASE_URL || '',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || (isProd ? siteBaseUrl : ''),
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      keywords: '',
      salesIqKey: '',
      whatsappLink: '',
      /** Twitter @handle for twitter:site (optional). */
      twitterSite: process.env.NUXT_PUBLIC_TWITTER_SITE || '',
      saudiBusinessCenterCertificate: '',
      i18n: {
        baseUrl: siteBaseUrl,
      },
      scripts: {
        googleMaps: {
          apiKey: '',
        },
        googleTagManager: {
          id: '',
        },
        googleAnalytics: {
          id: '',
        },
      },
    },
  },

  i18n: {
    baseUrl: siteBaseUrl,
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: 'ar',
      /**
       * Unprefixed paths (e.g. `/cities`) map to the default locale in `prefix_and_default`. Without `alwaysRedirect`,
       * nuxt-i18n skips detection when the path resolves to a supported locale (`skipDetect` in runtime/utils.js),
       * so cookie/header locale is ignored and `/cities` can 404 for non-default locales.
       */
      redirectOn: 'no prefix',
      alwaysRedirect: true,
    },
    locales: [
      {
        name: 'العربية',
        code: 'ar',
        language: 'ar',
        file: 'ar.ts',
        dir: 'rtl',
      },
      {
        name: 'English',
        code: 'en',
        language: 'en',
        file: 'en.ts',
        dir: 'ltr',
      },
      {
        name: 'हिन्दी',
        code: 'hi',
        language: 'hi',
        file: 'hi.ts',
        dir: 'ltr',
      },
      {
        name: 'বাংলা',
        code: 'bn',
        language: 'bn',
        file: 'bn.ts',
        dir: 'ltr',
      },
      {
        name: 'اردو',
        code: 'ur',
        language: 'ur',
        file: 'ur.ts',
        dir: 'rtl',
      },
      {
        name: 'Tagalog',
        code: 'tl',
        language: 'tl',
        file: 'tl.ts',
        dir: 'ltr',
      },
      {
        name: 'Bahasa Indonesia',
        code: 'id',
        language: 'id',
        file: 'id.ts',
        dir: 'ltr',
      },
      {
        name: 'Français',
        code: 'fr',
        language: 'fr',
        file: 'fr.ts',
        dir: 'ltr',
      },
    ],
    strategy: 'prefix_and_default',
    defaultLocale: 'ar',
    lazy: true,
    langDir: 'locales',
  },
});
