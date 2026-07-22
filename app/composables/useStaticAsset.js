const DEFAULT_ASSETS_BASE = 'https://r2media.tashyik.com/assets';

/**
 * Resolve a frontend static image to the Cloudflare R2 CDN URL.
 * Accepts `file.webp`, `/images/file.webp`, or `assets/file.webp`.
 */
export function useStaticAsset() {
  const config = useRuntimeConfig();

  const assetsBaseUrl = computed(() => {
    const configured = String(config.public.assetsBaseUrl || DEFAULT_ASSETS_BASE).trim();

    return configured.replace(/\/$/, '') || DEFAULT_ASSETS_BASE;
  });

  function staticAsset(path, query = '') {
    if (!path) {
      return '';
    }

    const raw = String(path).trim();

    if (/^https?:\/\//i.test(raw)) {
      return query ? `${raw}${raw.includes('?') ? '&' : '?'}${query.replace(/^\?/, '')}` : raw;
    }

    const file = raw
      .replace(/^\/+/, '')
      .replace(/^images\//, '')
      .replace(/^assets\//, '')
      .split('?')[0];

    const url = `${assetsBaseUrl.value}/${file}`;

    if (!query && raw.includes('?')) {
      return `${url}?${raw.split('?').slice(1).join('?')}`;
    }

    if (!query) {
      return url;
    }

    return `${url}?${String(query).replace(/^\?/, '')}`;
  }

  return {
    assetsBaseUrl,
    staticAsset,
  };
}
