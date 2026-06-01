const LOCALE_SLUG_CHECKS = [
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
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const { lookup } = useLocaleSlugLookup();

  const routeName = String(to.name || '');
  const rule = LOCALE_SLUG_CHECKS.find((entry) => entry.match(routeName));

  if (!rule) {
    return;
  }

  const locale = unref(nuxtApp.$i18n?.locale);
  const defaultLocale = nuxtApp.$i18n?.defaultLocale ?? 'ar';

  if (locale === defaultLocale) {
    return;
  }

  const apiBase = String(config.public.apiBaseUrl || '').replace(/\/$/, '');

  if (!apiBase) {
    return;
  }

  for (const { type, param } of rule.params) {
    const currentSlug = to.params[param];

    if (!currentSlug || typeof currentSlug !== 'string') {
      continue;
    }

    const resolved = await lookup(apiBase, type, currentSlug, locale);

    if (!resolved?.preferred_slug || resolved.preferred_slug === currentSlug) {
      continue;
    }

    const target = localePath({
      name: to.name,
      params: {
        ...to.params,
        [param]: resolved.preferred_slug,
      },
      query: to.query,
    });

    return navigateTo(target, {
      redirectCode: 301,
    });
  }
});
