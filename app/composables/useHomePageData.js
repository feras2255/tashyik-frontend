export const HOME_PAGE_DATA_KEY = 'home-page-data';
export const HOME_PAGE_PENDING_KEY = 'home-page-pending';
export const HOME_PAGE_ERROR_KEY = 'home-page-error';
export const HOME_PAGE_REFRESH_KEY = 'home-page-refresh';

/**
 * Aggregated homepage payload from the default layout (lazy-loaded on index routes).
 */
export function useHomePageData() {
  return inject(HOME_PAGE_DATA_KEY, null);
}

/**
 * True while the homepage aggregate API request is in flight.
 */
export function useHomePagePending() {
  return inject(HOME_PAGE_PENDING_KEY, ref(false));
}

export function useHomePageError() {
  return inject(HOME_PAGE_ERROR_KEY, ref(null));
}

export function useHomePageRefresh() {
  return inject(HOME_PAGE_REFRESH_KEY, null);
}

export function applyLayoutPayload(layoutStore, authStore, payload) {
  if (!payload) {
    return;
  }

  authStore.user = payload.user ?? null;
  layoutStore.logo = payload.logo ?? null;
  layoutStore.description = payload.description ?? null;
  layoutStore.site_name = payload.site_name ?? null;
  layoutStore.default_og_image = payload.default_og_image ?? null;
  layoutStore.twitter_site = payload.twitter_site ?? null;
  layoutStore.mobile_app_links = payload.mobile_app_links ?? null;
  layoutStore.contact_info = payload.contact_info ?? {};
  layoutStore.social_links = payload.social_links ?? {};
}

export function isHomeRoute(route) {
  const name = String(route?.name ?? '');

  if (name === 'index' || name.startsWith('index___')) {
    return true;
  }

  const path = String(route?.path ?? '/').replace(/\/$/, '') || '/';

  return path === '/' || /^\/(en|hi|bn|ur|tl|id|fr)$/.test(path);
}

/**
 * Read one homepage slice. Uses /general/home on index; falls back to individual API if home fails.
 */
export function useHomeSection(sliceKey, fallbackFetcher = null) {
  const route = useRoute();
  const onHome = isHomeRoute(route);
  const homePageData = useHomePageData();
  const homePagePending = useHomePagePending();
  const homePageError = useHomePageError();

  const fallbackData = ref(null);
  const fallbackPending = ref(false);
  const fallbackStarted = ref(false);

  async function runFallback() {
    if (!fallbackFetcher || fallbackStarted.value || import.meta.server) {
      return;
    }

    fallbackStarted.value = true;
    fallbackPending.value = true;

    try {
      fallbackData.value = await fallbackFetcher();
    } catch (error) {
      console.error(`Failed to load home section "${sliceKey}":`, error);
      fallbackData.value = null;
    } finally {
      fallbackPending.value = false;
    }
  }

  if (!onHome && typeof fallbackFetcher === 'function') {
    useAsyncData(`home-section-fallback-${sliceKey}-${route.fullPath}`, () => runFallback(), { lazy: true });
  }

  function homeSliceReady(value) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value != null && value !== false;
  }

  if (onHome && typeof fallbackFetcher === 'function') {
    watch(
      [homePagePending, homePageError, homePageData],
      () => {
        if (import.meta.server) {
          return;
        }

        const slice = homePageData?.value?.[sliceKey];
        const homeReady = homeSliceReady(slice);
        const homeFailed = Boolean(homePageError?.value) || (!homePagePending?.value && homePageData?.value == null);

        if (!homeReady && (homeFailed || !homePagePending?.value) && !fallbackStarted.value) {
          runFallback();
        }
      },
      { immediate: true },
    );
  }

  const data = computed(() => {
    if (onHome) {
      return homePageData?.value?.[sliceKey] ?? fallbackData.value;
    }

    return fallbackData.value;
  });

  const pending = computed(() => {
    if (onHome) {
      if (fallbackStarted.value) {
        return fallbackPending.value;
      }

      return Boolean(homePagePending?.value);
    }

    return fallbackPending.value;
  });

  return { data, pending, onHome };
}
