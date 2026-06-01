const MISS_TTL_MS = 24 * 60 * 60 * 1000;
const HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function useSlugRedirectLookup() {
  const cache = useState('seoSlugRedirectCache', () => ({}));

  async function lookup(apiBase, type, slug, locale) {
    const key = `${type}:${slug}:${locale || '_'}`;
    const now = Date.now();
    const cached = cache.value[key];

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const response = await $fetch(`${apiBase}/seo/slug-redirect`, {
        params: {
          type,
          slug,
          locale,
        },
      });

      const data = response?.data ?? null;

      cache.value = {
        ...cache.value,
        [key]: {
          data,
          expiresAt: now + (data ? HIT_TTL_MS : MISS_TTL_MS),
        },
      };

      return data;
    } catch {
      cache.value = {
        ...cache.value,
        [key]: {
          data: null,
          expiresAt: now + MISS_TTL_MS,
        },
      };

      return null;
    }
  }

  return { lookup };
}

export function useLocaleSlugLookup() {
  const cache = useState('seoLocaleSlugCache', () => ({}));

  async function lookup(apiBase, type, slug, locale) {
    const key = `${type}:${slug}:${locale || '_'}`;
    const now = Date.now();
    const cached = cache.value[key];

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const response = await $fetch(`${apiBase}/seo/resolve-slug`, {
        params: {
          type,
          slug,
          locale,
        },
      });

      const data = response?.data ?? null;

      cache.value = {
        ...cache.value,
        [key]: {
          data,
          expiresAt: now + (data ? HIT_TTL_MS : MISS_TTL_MS),
        },
      };

      return data;
    } catch {
      cache.value = {
        ...cache.value,
        [key]: {
          data: null,
          expiresAt: now + MISS_TTL_MS,
        },
      };

      return null;
    }
  }

  return { lookup };
}
