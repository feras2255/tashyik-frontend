/**
 * Normalize /general/footer-links (or home.footer_links slice).
 */
export function normalizeFooterHubLinks(response) {
  const payload =
    response?.data && (Array.isArray(response.data.services) || Array.isArray(response.data.cities)) ? response.data : response;

  return {
    services: Array.isArray(payload?.services) ? payload.services : [],
    cities: Array.isArray(payload?.cities) ? payload.cities : [],
  };
}

/**
 * Footer services/cities from dashboard settings.
 * Always refetches on the client — SSR often cannot reach the API subdomain and caches empty lists.
 */
export function useFooterHubLinks() {
  const { locale } = useI18n();
  const apiFetch = useApiFetchClient();
  const homePageData = useHomePageData();

  async function fetchFooterHubLinks() {
    try {
      const response = await apiFetch('/general/footer-links');

      return normalizeFooterHubLinks(response);
    } catch (error) {
      console.error('Failed to load footer hub links', error);

      return { services: [], cities: [] };
    }
  }

  const { data: footerLinksPayload } = useAsyncData(() => `footer-hub-links-${locale.value}`, fetchFooterHubLinks, {
    watch: [locale],
    server: false,
    default: () => ({ services: [], cities: [] }),
  });

  const hubLinks = computed(() => {
    const fromApi = footerLinksPayload.value ?? { services: [], cities: [] };
    const fromHome = homePageData?.value?.footer_links;

    return {
      services: fromApi.services.length > 0 ? fromApi.services : Array.isArray(fromHome?.services) ? fromHome.services : [],
      cities: fromApi.cities.length > 0 ? fromApi.cities : Array.isArray(fromHome?.cities) ? fromHome.cities : [],
    };
  });

  return { hubLinks };
}
