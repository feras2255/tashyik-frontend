const MISS_TTL_MS = 24 * 60 * 60 * 1000;
const HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

/**
 * Process-wide cache so SSR workers reuse SEO lookups across crawler hits.
 * useState alone is per-request and does not stop API floods.
 */
function getProcessCache(name) {
  const store = globalThis;
  const key = `__tashyik_${name}`;

  if (!store[key]) {
    store[key] = new Map();
  }

  return store[key];
}

function readCache(map, key) {
  const cached = map.get(key);

  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    map.delete(key);
    return undefined;
  }

  return cached.data;
}

function writeCache(map, key, data, ttlMs) {
  if (map.size >= MAX_ENTRIES) {
    const firstKey = map.keys().next().value;
    if (firstKey !== undefined) {
      map.delete(firstKey);
    }
  }

  map.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function useSlugRedirectLookup() {
  const requestCache = useState('seoSlugRedirectCache', () => ({}));
  const processCache = getProcessCache('seoSlugRedirectCache');

  async function lookup(apiBase, type, slug, locale) {
    const key = `${type}:${slug}:${locale || '_'}`;
    const now = Date.now();

    const fromProcess = readCache(processCache, key);
    if (fromProcess !== undefined) {
      return fromProcess;
    }

    const cached = requestCache.value[key];
    if (cached && cached.expiresAt > now) {
      writeCache(processCache, key, cached.data, Math.max(cached.expiresAt - now, 60_000));
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
      const ttl = data ? HIT_TTL_MS : MISS_TTL_MS;

      requestCache.value = {
        ...requestCache.value,
        [key]: {
          data,
          expiresAt: now + ttl,
        },
      };
      writeCache(processCache, key, data, ttl);

      return data;
    } catch {
      requestCache.value = {
        ...requestCache.value,
        [key]: {
          data: null,
          expiresAt: now + MISS_TTL_MS,
        },
      };
      writeCache(processCache, key, null, MISS_TTL_MS);

      return null;
    }
  }

  return { lookup };
}

export function useLocaleSlugLookup() {
  const requestCache = useState('seoLocaleSlugCache', () => ({}));
  const processCache = getProcessCache('seoLocaleSlugCache');

  async function lookup(apiBase, type, slug, locale) {
    const key = `${type}:${slug}:${locale || '_'}`;
    const now = Date.now();

    const fromProcess = readCache(processCache, key);
    if (fromProcess !== undefined) {
      return fromProcess;
    }

    const cached = requestCache.value[key];
    if (cached && cached.expiresAt > now) {
      writeCache(processCache, key, cached.data, Math.max(cached.expiresAt - now, 60_000));
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
      const ttl = data ? HIT_TTL_MS : MISS_TTL_MS;

      requestCache.value = {
        ...requestCache.value,
        [key]: {
          data,
          expiresAt: now + ttl,
        },
      };
      writeCache(processCache, key, data, ttl);

      return data;
    } catch {
      requestCache.value = {
        ...requestCache.value,
        [key]: {
          data: null,
          expiresAt: now + MISS_TTL_MS,
        },
      };
      writeCache(processCache, key, null, MISS_TTL_MS);

      return null;
    }
  }

  return { lookup };
}
