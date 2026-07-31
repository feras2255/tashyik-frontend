import { isArchivedCitySlug } from '~/utils/seoSlug';

const ENTITY_SLUG_CHECKS = [
  {
    match: (name) => String(name).includes('services-service-in-city'),
    params: [
      { type: 'services', param: 'service' },
      { type: 'cities', param: 'city' },
    ],
  },
  {
    match: (name) => String(name).includes('services-service') && !String(name).includes('services-service-in-city'),
    params: [{ type: 'services', param: 'service' }],
  },
  {
    match: (name) => String(name).includes('categories-category'),
    params: [{ type: 'categories', param: 'category' }],
  },
  {
    match: (name) => String(name).includes('cities-slug'),
    params: [{ type: 'cities', param: 'slug' }],
  },
  {
    match: (name) => String(name).includes('articles-slug'),
    params: [{ type: 'articles', param: 'slug' }],
  },
];

export default defineNuxtRouteMiddleware(async (to) => {
  const routeName = String(to.name || '');
  const rule = ENTITY_SLUG_CHECKS.find((entry) => entry.match(routeName));

  // Homepage and non-entity routes must exit before any i18n/API composables.
  if (!rule) {
    return;
  }

  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const { lookup } = useSlugRedirectLookup();

  const apiBase = String(config.public.apiBaseUrl || '').replace(/\/$/, '');

  if (!apiBase) {
    return;
  }

  const locale = unref(nuxtApp.$i18n?.locale);

  for (const { type, param } of rule.params) {
    const currentSlug = to.params[param];

    if (!currentSlug || typeof currentSlug !== 'string') {
      continue;
    }

    // Cheap 404 before any API call — archived cities were flooding /seo/*.
    if (type === 'cities' && isArchivedCitySlug(currentSlug)) {
      return abortNavigation(
        createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          fatal: true,
        }),
      );
    }

    const redirect = await lookup(apiBase, type, currentSlug, locale);

    if (redirect?.new_slug && redirect.new_slug !== currentSlug) {
      const target = localePath({
        name: to.name,
        params: {
          ...to.params,
          [param]: redirect.new_slug,
        },
        query: to.query,
      });

      return navigateTo(target, {
        redirectCode: Number(redirect.http_status) || 301,
      });
    }
  }
});
