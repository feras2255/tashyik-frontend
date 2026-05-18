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

  async function fetchCityServices(citySlug, { page = 1, perPage = 48, q = null } = {}) {
    const query = {
      page: Math.max(1, Number(page) || 1),
      per_page: Math.max(1, Number(perPage) || 48),
    };

    if (q && String(q).trim()) {
      query.q = String(q).trim();
    }

    return useApiFetch(`/cities/${citySlug}/services`, { query });
  }

  async function fetchAllCityServices(citySlug, { perPage = 72 } = {}) {
    const out = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await fetchCityServices(citySlug, { page, perPage });

      out.push(...(res.data ?? []));
      lastPage = res.meta?.last_page ?? 1;
      page++;
    } while (page <= lastPage);

    return out;
  }

  async function fetchServiceCityPayload(serviceSlug, citySlug, { relatedPerPage = 24 } = {}) {
    const [svcRes, cityRes, relatedRes] = await Promise.all([
      fetchServiceBySlug(serviceSlug),
      fetchCityBySlug(citySlug),
      fetchCityServices(citySlug, { perPage: relatedPerPage }),
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

    return { service, city, related };
  }

  return {
    fetchServicesPage,
    fetchServiceBySlug,
    fetchCategories,
    fetchCityBySlug,
    fetchCityServices,
    fetchAllCityServices,
    fetchServiceCityPayload,
  };
}
