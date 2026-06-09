import { hash } from 'ohash';

/**
 * Base URL for API calls. On the server, `api.localhost` / `*.local.test` often fail from Node DNS;
 * optional `runtimeConfig.apiInternalBaseUrl` or loopback rewrite fixes SSR refresh errors.
 */
function getApiBaseUrl(config) {
  const publicBase = (config.public.apiBaseUrl || '').replace(/\/$/, '');

  if (!publicBase) {
    return publicBase;
  }

  const internal = (config.apiInternalBaseUrl || '').replace(/\/$/, '');

  if (import.meta.server && internal) {
    return internal;
  }

  try {
    const u = new URL(publicBase);

    if (u.hostname === 'api.localhost' || u.hostname.endsWith('.local.test')) {
      u.hostname = '127.0.0.1';

      return u.href.replace(/\/$/, '');
    }
  } catch {
    /* ignore invalid public API URL */
  }

  return publicBase;
}

/**
 * Returns a plain $fetch wrapper bound to the current request context.
 * Safe to call inside useAsyncData callbacks (unlike useApiFetch, which re-enters composables).
 */
export function useApiFetchClient() {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const token = useCookie('token', { default: () => null });
  const baseURL = getApiBaseUrl(config);

  return async function apiFetch(path, options = {}) {
    const locale = nuxtApp.$i18n?.locale;
    const headers = {
      ...options?.headers,
      accept: 'application/json',
      'X-App-Language': unref(locale),
    };

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    const resolvedPath = typeof path === 'function' ? path() : path;

    try {
      return await $fetch(resolvedPath, {
        ...options,
        baseURL,
        headers,
      });
    } catch (error) {
      const status = Number(error?.status || error?.response?.status || error?.statusCode || 500);
      const data = error?.data ?? error?.response?.data ?? null;
      const bodyMessage = data?.message || data?.error?.message || data?.error || null;
      const message = String(bodyMessage || error?.message || error?.statusText || 'Unknown error occurred');
      const normalized = new Error(message);
      normalized.name = 'ApiError';
      normalized.status = status;
      normalized.code = data?.code || data?.error?.code || null;
      normalized.response = { status, data };
      normalized.body = data;
      throw normalized;
    }
  };
}

export function useApiFetch(path, options = {}, useFetchFunction = false) {
  const { $i18n } = useNuxtApp();
  const config = useRuntimeConfig();
  const token = useCookie('token', { default: () => null });
  const baseURL = getApiBaseUrl(config);
  const apiFetch = useApiFetchClient();

  const headers = {
    ...options?.headers,
    accept: 'application/json',
    'X-App-Language': $i18n.locale.value,
  };

  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }

  const key = options.key || hash(['api', unref(typeof path === 'function' ? path() : path), unref(options.query || {}), $i18n.locale.value]);

  return useFetchFunction
    ? useFetch(path, {
      baseURL,
      watch: options.watch ?? [() => unref($i18n.locale)],
      key,
      ...options,
      headers,
    })
    : apiFetch(path, options);
}
