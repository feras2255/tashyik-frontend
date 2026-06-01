/**
 * Shared SEO meta for category, service, and article routes.
 * Aligns fallbacks with SSR so crawlers see stable title/description/OG tags.
 */
const OG_LOCALE_BY_CODE = {
  ar: 'ar_SA',
  en: 'en_US',
  hi: 'hi_IN',
  bn: 'bn_BD',
  ur: 'ur_PK',
  tl: 'fil_PH',
  id: 'id_ID',
  fr: 'fr_FR',
};

function stripHtml(html) {
  if (html == null) {
    return '';
  }

  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(s, max) {
  if (!s) {
    return '';
  }

  if (s.length <= max) {
    return s;
  }

  return `${s.slice(0, max - 1).trimEnd()}\u2026`;
}

function resolveImageUrl(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'object') {
    return value.og || value.lg || value.sm || null;
  }

  return null;
}

function formatKeywords(value, localeCode) {
  if (value == null || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'object') {
    const localized = value[localeCode] ?? value.ar ?? value.en ?? Object.values(value).find(Boolean);

    return formatKeywords(localized, localeCode);
  }

  return '';
}

import { resolveEntitySlug } from '~/utils/seoSlug';

export function useEntitySeo(options) {
  const { t, locale, locales } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const switchLocalePath = useSwitchLocalePath();
  const route = useRoute();
  const layout = useLayoutStore();

  const entity = computed(() => unref(options.entity));
  const parentCategory = computed(() => {
    const p = options.parentCategory;

    return p != null ? unref(p) : null;
  });

  const ogType = options.ogType === 'article' ? 'article' : 'website';

  const brand = computed(() => t('common.brand'));
  const shortDesc = computed(() => t('common.short_description'));

  const canonicalUrl = computed(() => {
    const base = (config.public.appUrl || '').replace(/\/$/, '');
    const override = options.canonicalPath != null ? unref(options.canonicalPath) : null;

    if (override) {
      return `${base}${override}`;
    }

    const slugParam = options.slugParam;
    const e = entity.value;

    if (slugParam && e) {
      const resolvedSlug = resolveEntitySlug(e);

      if (resolvedSlug) {
        return `${base}${localePath({
          name: route.name,
          params: {
            ...route.params,
            [slugParam]: resolvedSlug,
          },
          query: route.query,
        })}`;
      }
    }

    return `${base}${switchLocalePath(locale.value)}`;
  });

  const defaultOgImage = computed(() => {
    if (layout.default_og_image) {
      return layout.default_og_image;
    }

    const base = (config.public.appUrl || 'https://www.tashyik.com').replace(/\/$/, '');

    return `${base}/images/og.webp`;
  });

  const displayName = computed(() => {
    const e = entity.value;

    if (!e) {
      return '';
    }

    return e.name || e.title || '';
  });

  const title = computed(() => {
    const e = entity.value;

    if (!e) {
      return brand.value;
    }

    const meta = e.meta_title;

    if (meta != null && String(meta).trim()) {
      return String(meta).trim();
    }

    const name = displayName.value;

    if (name) {
      return `${name} - ${brand.value} | ${shortDesc.value}`;
    }

    return brand.value;
  });

  const description = computed(() => {
    const e = entity.value;

    if (!e) {
      return shortDesc.value;
    }

    const meta = e.meta_description;

    if (meta != null && String(meta).trim()) {
      return truncate(stripHtml(String(meta)), 160);
    }

    const raw = e.description || e.excerpt || '';
    const plain = stripHtml(raw);

    return truncate(plain || shortDesc.value, 160);
  });

  const keywords = computed(() => {
    const e = entity.value;

    if (!e) {
      return '';
    }

    const raw = e.meta_keywords ?? e.keywords;

    return formatKeywords(raw, locale.value);
  });

  const ogImage = computed(() => {
    const e = entity.value;

    if (!e) {
      return defaultOgImage.value;
    }

    const fromEntity =
      resolveImageUrl(e.og_image) ||
      resolveImageUrl(e.image) ||
      resolveImageUrl(e.featured_image_lg) ||
      resolveImageUrl(e.featured_image);
    const fromParent =
      resolveImageUrl(parentCategory.value?.og_image) || resolveImageUrl(parentCategory.value?.image);

    return fromEntity || fromParent || defaultOgImage.value;
  });

  const ogLocale = computed(() => OG_LOCALE_BY_CODE[locale.value] || `${locale.value}_${String(locale.value).toUpperCase()}`);

  const ogLocaleAlternate = computed(() => {
    const list = locales?.value || [];
    const codes = list.map((l) => (typeof l === 'string' ? l : l.code)).filter(Boolean);

    return codes
      .filter((code) => code !== locale.value)
      .map((code) => OG_LOCALE_BY_CODE[code] || code);
  });

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage,
    ogType,
    ogUrl: canonicalUrl,
    ogLocale,
    keywords,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
  });

  useHead({
    meta: computed(() =>
      ogLocaleAlternate.value.map((content) => ({
        property: 'og:locale:alternate',
        content,
      })),
    ),
  });

  return {
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    brand,
  };
}
