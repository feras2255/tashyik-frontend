export function useServiceFetchers() {
  async function fetchServicesPage({ page = 1, perPage = null, category = null, q = null } = {}) {
    const body = {
      category: category || null,
      q: q && String(q).trim() ? String(q).trim() : null,
    };
    const query = new URLSearchParams({
      page: String(Math.max(1, Number(page) || 1)),
    });

    if (perPage) {
      query.set('per_page', String(Math.max(1, Number(perPage) || 1)));
    }

    return useApiFetch(`/services?${query.toString()}`, {
      method: 'POST',
      body,
    });
  }

  async function fetchServiceBySlug(slug) {
    return useApiFetch(`/services/${slug}`);
  }

  async function fetchCategories() {
    return useApiFetch('/categories');
  }

  async function fetchCityBySlug(slug) {
    return useApiFetch(`/cities/${slug}`);
  }

  async function fetchCityServices(citySlug, { page = 1, perPage = 48, q = null, categoryId = null } = {}) {
    const query = {
      page: Math.max(1, Number(page) || 1),
      per_page: Math.max(1, Number(perPage) || 48),
    };

    if (q && String(q).trim()) {
      query.q = String(q).trim();
    }

    if (categoryId != null) {
      query.category_id = categoryId;
    }

    return useApiFetch(`/cities/${citySlug}/services`, { query });
  }

  async function fetchServiceCityPage(serviceSlug, citySlug) {
    return useApiFetch(`/services/${serviceSlug}/in/${citySlug}`).catch(() => ({ data: null }));
  }

  async function fetchServiceCityPayload(serviceSlug, citySlug, { relatedPerPage = 24 } = {}) {
    const [svcRes, cityRes, relatedRes, cityPageRes] = await Promise.all([
      fetchServiceBySlug(serviceSlug),
      fetchCityBySlug(citySlug),
      fetchCityServices(citySlug, { perPage: relatedPerPage }),
      fetchServiceCityPage(serviceSlug, citySlug),
    ]);

    const service = svcRes.data;
    const city = cityRes.data;
    const citySlugs = (service?.city_links ?? []).map((link) => link.slug);

    if (!city?.slug || !citySlugs.includes(city.slug)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      });
    }

    const related = (relatedRes.data ?? []).filter((item) => item.slug !== serviceSlug).slice(0, 9);
    const cityPage = cityPageRes?.data ?? null;

    return { service, city, related, cityPage };
  }

  return {
    fetchServicesPage,
    fetchServiceBySlug,
    fetchCategories,
    fetchCityBySlug,
    fetchCityServices,
    fetchServiceCityPage,
    fetchServiceCityPayload,
  };
}
