<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const head = useLocaleHead();
  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const route = useRoute();
  const layout = useLayoutStore();
  const siteBrand = useSiteBrand();
  const { fetchServiceCityPayload } = useServiceFetchers();
  const { pricingWindowKey } = useSaudiPricingWindowKey();

  function stripHtml(html) {
    if (html == null) {
      return '';
    }

    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function ordersPlusLabel(count) {
    const c = Number(count) || 0;

    if (c <= 0) {
      return '0';
    }

    if (c < 10) {
      return String(c);
    }

    return String(Math.floor(c / 10) * 10);
  }

  const { data: payload, error: pageError } = await useAsyncData(
    () => `service-in-city-${route.params.service}-${route.params.city}-${locale.value}-${pricingWindowKey.value}`,
    async () => {
      return fetchServiceCityPayload(route.params.service, route.params.city, { relatedPerPage: 24 });
    },
    {
      watch: [() => route.params.service, () => route.params.city, locale, pricingWindowKey],
    },
  );

  if (pageError.value) {
    const status = pageError.value.statusCode || pageError.value.status || pageError.value?.response?.status;

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: t('common.page_not_found'),
        fatal: true,
      });
    }

    throw createError({
      statusCode: status || 500,
      statusMessage: pageError.value.message || 'Failed to load page',
      fatal: true,
    });
  }

  const service = computed(() => payload.value?.service ?? null);
  const city = computed(() => payload.value?.city ?? null);
  const relatedServices = computed(() => payload.value?.related ?? []);
  const cityPage = computed(() => payload.value?.cityPage ?? null);

  const cityPageBody = computed(() => {
    const page = cityPage.value;
    if (!page?.body) {
      return '';
    }

    const body = page.body;
    if (typeof body === 'string') {
      return body;
    }

    return body[locale.value] || body.ar || body.en || '';
  });

  const heroLead = computed(() => {
    const s = service.value;

    if (!s) {
      return '';
    }

    if (s.card_description) {
      return s.card_description;
    }

    const plain = stripHtml(s.description || '');

    return plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}…` : plain;
  });

  const includesItems = computed(() => {
    const s = service.value;
    const list = [];

    if (s?.highlights?.length) {
      for (const h of s.highlights) {
        if (h?.title) {
          list.push(String(h.title).trim());
        }
      }
    }

    if (list.length) {
      return list;
    }

    return [
      t('cities.service_in_city_default_bullet1'),
      t('cities.service_in_city_default_bullet2'),
      t('cities.service_in_city_default_bullet3'),
    ];
  });

  const completedOrders = computed(() => Number(service.value?.completed_orders_count) || 0);

  const ratingSocialLine = computed(() => {
    const s = service.value;

    if (!s?.rating) {
      return '';
    }

    if (completedOrders.value > 0) {
      return t('cities.service_in_city_rating_with_orders', {
        rating: s.rating,
        orders: ordersPlusLabel(completedOrders.value),
      });
    }

    return t('cities.service_in_city_rating_line', { rating: s.rating });
  });

  const whatsappHref = computed(() => {
    const w = layout.contact_info?.whatsapp_link;

    if (w && String(w).trim()) {
      return String(w).trim();
    }

    const pub = config.public?.whatsappLink;

    if (pub && String(pub).trim()) {
      return String(pub).trim();
    }

    const phone = layout.contact_info?.phone_number;
    const digits = String(phone || '').replace(/\D/g, '');

    if (digits) {
      return `https://wa.me/${digits}`;
    }

    return null;
  });

  const pageMetaTitle = computed(() => {
    const page = cityPage.value;

    if (!page?.meta_title) {
      return null;
    }

    return page.meta_title[locale.value] || page.meta_title.ar || page.meta_title.en || null;
  });

  const pageKeywords = computed(() => {
    const page = cityPage.value;

    if (page?.keywords) {
      const raw = page.keywords[locale.value] ?? page.keywords.ar ?? page.keywords.en ?? page.keywords;

      if (Array.isArray(raw)) {
        return raw.filter(Boolean).join(', ');
      }

      if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
      }
    }

    return '';
  });

  const entity = computed(() => {
    const s = service.value;
    const c = city.value;
    const page = cityPage.value;

    if (!s || !c) {
      return null;
    }

    const pageMetaDescription = page?.meta_description?.[locale.value] || page?.meta_description?.ar || page?.meta_description?.en || null;

    return {
      name: `${s.name} — ${c.name}`,
      meta_title: pageMetaTitle.value || s.meta_title,
      meta_description: pageMetaDescription || s.meta_description,
      description: cityPageBody.value || s.description,
      keywords: pageKeywords.value || s.keywords,
      og_image: s.og_image,
      image: s.image,
    };
  });

  const serviceCityCanonicalPath = computed(() => {
    const s = service.value;
    const c = city.value;

    if (!s || !c) {
      return '';
    }

    return localePath({
      name: 'services-service-in-city',
      params: {
        service: resolveEntitySlug(s),
        city: resolveEntitySlug(c),
      },
    });
  });

  useEntitySeo({
    entity,
    parentCategory: null,
    ogType: 'website',
    canonicalPath: serviceCityCanonicalPath,
  });

  const orderLink = computed(() => ({
    name: 'services-service-order',
    params: { service: resolveEntitySlug(service.value) },
    query: city.value?.slug ? { city: resolveEntitySlug(city.value) } : {},
  }));

  const serviceCityPagePath = computed(() => serviceCityCanonicalPath.value);

  const plainDescriptionForJsonLd = computed(() => {
    const page = cityPage.value;

    if (page?.meta_description) {
      const pageMeta = page.meta_description[locale.value] || page.meta_description.ar || page.meta_description.en;

      if (pageMeta != null && String(pageMeta).trim()) {
        return stripHtml(String(pageMeta));
      }
    }

    if (cityPageBody.value) {
      return stripHtml(cityPageBody.value);
    }

    const s = service.value;

    if (!s) {
      return '';
    }

    const meta = s.meta_description;

    if (meta != null && String(meta).trim()) {
      return stripHtml(String(meta));
    }

    return stripHtml(s.description || '');
  });

  const heroHeading = computed(() => pageMetaTitle.value || `${service.value?.name} — ${city.value?.name}`);

  const serviceCityJsonLd = computed(() => {
    const s = service.value;
    const c = city.value;

    if (!s || !c) {
      return null;
    }

    const price = s.price?.after_discount;
    const ratingNum = parseFloat(String(s.rating || '').replace(',', '.')) || undefined;

    const payloadLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${s.name} — ${c.name}`,
      description: plainDescriptionForJsonLd.value || undefined,
      areaServed: {
        '@type': 'City',
        name: c.name,
      },
      provider: {
        '@type': 'LocalBusiness',
        name: siteBrand.value,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SA',
        },
      },
      offers: {
        '@type': 'Offer',
        price: price != null && price !== '' ? String(price) : undefined,
        priceCurrency: 'SAR',
        availability: 'https://schema.org/InStock',
      },
    };

    if (ratingNum != null && !Number.isNaN(ratingNum) && completedOrders.value > 0) {
      payloadLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(ratingNum),
        bestRating: '5',
        worstRating: '1',
        ratingCount: String(completedOrders.value),
      };
    }

    if (cityPage.value?.updated_at) {
      payloadLd.dateModified = cityPage.value.updated_at;
    }

    return JSON.stringify(payloadLd);
  });

  const breadcrumbJsonLd = computed(() => {
    const s = service.value;
    const c = city.value;

    if (!s || !c) {
      return null;
    }

    const base = (config.public.appUrl || '').replace(/\/$/, '');
    const pageUrl = `${base}${serviceCityPagePath.value}`;

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('navigation.home'),
          item: `${base}${localePath({ name: 'index' })}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: c.name,
          item: `${base}${localePath({ name: 'cities-slug', params: { slug: resolveEntitySlug(c) } })}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: s.name,
          item: pageUrl,
        },
      ],
    });
  });

  useHead({
    script: computed(() => {
      const scripts = [];

      if (serviceCityJsonLd.value) {
        scripts.push({
          key: 'service-city-service-jsonld',
          type: 'application/ld+json',
          innerHTML: serviceCityJsonLd.value,
        });
      }

      if (breadcrumbJsonLd.value) {
        scripts.push({
          key: 'service-city-breadcrumb-jsonld',
          type: 'application/ld+json',
          innerHTML: breadcrumbJsonLd.value,
        });
      }

      return scripts;
    }),
  });

  const whyItems = computed(() => [
    {
      title: t('cities.service_in_city_why_1_title'),
      body: t('cities.service_in_city_why_1_desc'),
    },
    {
      title: t('cities.service_in_city_why_2_title'),
      body: t('cities.service_in_city_why_2_desc'),
    },
    {
      title: t('cities.service_in_city_why_3_title'),
      body: t('cities.service_in_city_why_3_desc'),
    },
    {
      title: t('cities.service_in_city_why_4_title'),
      body: t('cities.service_in_city_why_4_desc'),
    },
  ]);

  const reviewItems = computed(() => [
    { name: t('cities.service_in_city_rev1_name'), text: t('cities.service_in_city_rev1_text') },
    { name: t('cities.service_in_city_rev2_name'), text: t('cities.service_in_city_rev2_text') },
    { name: t('cities.service_in_city_rev3_name'), text: t('cities.service_in_city_rev3_text') },
  ]);

  const howSteps = computed(() => [
    { title: t('cities.service_in_city_how_step1'), desc: t('cities.service_in_city_how_step1_desc') },
    { title: t('cities.service_in_city_how_step2'), desc: t('cities.service_in_city_how_step2_desc') },
    { title: t('cities.service_in_city_how_step3'), desc: t('cities.service_in_city_how_step3_desc') },
  ]);
</script>

<template>
  <section v-if="service && city" :dir="head.htmlAttrs.dir" class="w-full px-4 pb-28 pt-6 md:pb-10 md:pt-8 lg:pb-12">
    <!-- Hero -->
    <div class="container mx-auto max-w-6xl">
      <div class="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div class="min-w-0">
          <AppBreadcrumb
            class="mb-6 text-gray-600 [&_a]:text-gray-600 [&_a:hover]:text-brand-600"
            :pages="[
              { name: city.name, path: { name: 'cities-slug', params: { slug: resolveEntitySlug(city) } } },
              {
                name: service.name,
                path: { name: 'services-service-in-city', params: { service: resolveEntitySlug(service), city: resolveEntitySlug(city) } },
              },
            ]"
          />

          <h1 class="text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            {{ heroHeading }}
          </h1>

          <p v-if="heroLead" class="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
            {{ heroLead }}
          </p>

          <div class="mt-5 flex flex-col gap-2 text-sm text-gray-700 md:text-base">
            <p v-if="ratingSocialLine" class="font-medium text-gray-900">
              {{ ratingSocialLine }}
            </p>
            <p class="text-gray-500">
              {{ t('cities.service_in_city_social_hint') }}
            </p>
          </div>

          <div
            v-if="service.price?.after_discount != null && service.price.after_discount !== ''"
            class="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-brand-100 bg-brand-50/80 px-4 py-2.5 shadow-sm"
          >
            <span class="text-sm font-medium text-brand-800">{{ t('cities.service_in_city_price_label') }}</span>
            <span class="text-xl font-semibold text-gray-900 md:text-2xl">
              {{ service.price.after_discount }}
              <span class="text-base font-normal text-gray-600">{{ service.price.currency }}</span>
            </span>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <WarrantyBadge v-if="service.warranty_duration" :duration="service.warranty_duration" class="me-0" />
            <div
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm"
            >
              <svg
                class="h-5 w-5 shrink-0 text-brand-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              {{ t('cities.service_in_city_certified_badge') }}
            </div>
          </div>
        </div>

        <div class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md md:rounded-3xl">
          <img
            v-if="service.image"
            :src="service.image"
            :alt="service.image_alt || $t('alt.service', { service: service.name })"
            class="h-full w-full object-cover object-center"
            width="800"
            height="600"
            fetchpriority="high"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              class="h-20 w-20"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main + sidebar -->
    <div class="container mx-auto mt-10 max-w-6xl lg:mt-14">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <article class="min-w-0 space-y-10 lg:col-span-8">
          <section v-if="cityPageBody" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
              {{ t('cities.service_in_city_local_overview', { city: city.name }) }}
            </h2>
            <div class="prose prose-sm mt-4 max-w-none text-gray-700 md:prose-base" v-html="cityPageBody" />
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
              {{ t('cities.service_in_city_includes_title') }}
            </h2>
            <ul class="mt-5 space-y-3 text-gray-700" role="list">
              <li v-for="(item, idx) in includesItems" :key="idx" class="flex gap-3">
                <span
                  class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600"
                  aria-hidden="true"
                >
                  <svg
                    class="h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <span class="text-sm leading-relaxed md:text-base">{{ item }}</span>
              </li>
            </ul>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
              {{ t('cities.service_in_city_how_title') }}
            </h2>
            <p class="mt-3 hidden text-center text-sm font-medium text-gray-500 sm:block" aria-hidden="true">
              {{ howSteps.map((s) => s.title).join(' ← ') }}
            </p>
            <div class="mt-6 grid gap-6 sm:grid-cols-3">
              <div v-for="(step, i) in howSteps" :key="i" class="rounded-xl border border-gray-100 bg-gray-50/80 p-5 text-center">
                <div
                  class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm"
                >
                  {{ i + 1 }}
                </div>
                <p class="mt-3 font-semibold text-gray-900">{{ step.title }}</p>
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ step.desc }}</p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
              {{ t('cities.service_in_city_why_title') }}
            </h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div
                v-for="(card, idx) in whyItems"
                :key="idx"
                class="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-5 shadow-sm"
              >
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-brand-500 shadow-sm ring-1 ring-gray-100"
                >
                  <svg
                    v-if="idx === 0"
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                  <svg
                    v-else-if="idx === 1"
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                  <svg
                    v-else-if="idx === 2"
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ card.title }}</p>
                  <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ card.body }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
              {{ t('cities.service_in_city_reviews_title') }}
            </h2>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <figure
                v-for="(rev, idx) in reviewItems"
                :key="idx"
                class="flex flex-col rounded-xl border border-gray-100 bg-gray-50/50 p-5 shadow-sm"
              >
                <div class="flex gap-0.5 text-amber-400" aria-label="5">
                  <span v-for="s in 5" :key="s" aria-hidden="true">★</span>
                </div>
                <blockquote class="mt-3 flex-1 text-sm leading-relaxed text-gray-700">“{{ rev.text }}”</blockquote>
                <figcaption class="mt-4 text-sm font-semibold text-gray-900">— {{ rev.name }}</figcaption>
              </figure>
            </div>
          </section>

          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
            <NuxtLink
              :to="localePath({ name: 'cities-slug', params: { slug: resolveEntitySlug(city) } })"
              class="text-brand-600 hover:text-brand-700"
            >
              {{ t('cities.view_city_hub', { city: city.name }) }}
            </NuxtLink>
            <NuxtLink
              :to="localePath({ name: 'services-service', params: { service: resolveEntitySlug(service) } })"
              class="text-brand-600 hover:text-brand-700"
            >
              {{ t('service.actions.view_details') }}
            </NuxtLink>
            <NuxtLink :to="localePath({ name: 'categories' })" class="text-brand-600 hover:text-brand-700">
              {{ t('cities.browse_services') }}
            </NuxtLink>
          </div>
        </article>

        <aside class="lg:col-span-4">
          <div class="hidden lg:block lg:sticky lg:top-24">
            <div class="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-brand-50/30 p-6 shadow-md">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {{ t('cities.service_in_city_sidebar_summary') }}
              </p>
              <p class="mt-3 text-lg font-semibold text-gray-900">{{ service.name }}</p>
              <p class="mt-1 text-sm text-gray-600">{{ city.name }}</p>

              <div v-if="service.price?.after_discount != null && service.price.after_discount !== ''" class="mt-6">
                <p class="text-xs text-gray-500">{{ t('cities.service_in_city_price_label') }}</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ service.price.after_discount }}
                  <span class="text-lg font-normal text-gray-600">{{ service.price.currency }}</span>
                </p>
                <del v-if="service.price.has_discount && service.price.original > 0" class="mt-1 block text-sm text-gray-400">
                  {{ service.price.original }} {{ service.price.currency }}
                </del>
              </div>
              <p v-else class="mt-6 text-sm text-gray-600">{{ t('common.no_price') }}</p>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <img class="h-6 shrink-0" src="/images/tabby-tamara.webp" alt="Tabby & Tamara" loading="lazy" width="120" height="24" />
              </div>

              <div v-if="service.warranty_duration" class="mt-5">
                <WarrantyBadge :duration="service.warranty_duration" class="me-0 w-full justify-center" />
              </div>

              <NuxtLinkLocale :to="orderLink" class="mt-6 block w-full">
                <ButtonsFilled class="w-full justify-center py-3.5 text-base">
                  {{ t('cities.service_in_city_cta_order_now') }}
                </ButtonsFilled>
              </NuxtLinkLocale>

              <a
                v-if="whatsappHref"
                :href="whatsappHref"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500 bg-transparent py-3.5 text-base font-medium text-brand-500 hover:bg-brand-100/50 focus:z-10 focus:outline-none focus:ring-4 focus:ring-brand-100"
              >
                <svg
                  class="h-5 w-5 shrink-0 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.96 9.96 0 0 1 2 12"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308"
                  />
                </svg>
                {{ t('cities.service_in_city_whatsapp_cta') }}
              </a>

              <p class="mt-4 text-center text-xs text-gray-500">
                <span aria-hidden="true">🔒</span>
                {{ ' ' }}
                {{ t('cities.service_in_city_trust_secure_pay') }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Related -->
    <div v-if="relatedServices.length" class="container mx-auto mt-14 max-w-6xl border-t border-gray-200 pt-12">
      <h2 class="text-xl font-semibold text-gray-900 md:text-2xl">
        {{ t('cities.service_in_city_related_title', { city: city.name }) }}
      </h2>
      <ul class="mt-8 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        <li v-for="rel in relatedServices" :key="rel.id">
          <ServiceCard :service="rel" :city-slug="resolveEntitySlug(city)" />
        </li>
      </ul>
    </div>

    <!-- Mobile sticky booking bar -->
    <div
      class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
    >
      <div class="container mx-auto flex max-w-6xl flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-gray-900">{{ service.name }}</p>
            <p class="truncate text-xs text-gray-500">{{ city.name }}</p>
          </div>
          <div v-if="service.price?.after_discount != null && service.price.after_discount !== ''" class="shrink-0 text-end">
            <p class="text-[10px] text-gray-500">{{ t('cities.service_in_city_price_label') }}</p>
            <p class="text-lg font-bold text-gray-900">
              {{ service.price.after_discount }}
              <span class="text-xs font-normal text-gray-600">{{ service.price.currency }}</span>
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <NuxtLinkLocale class="min-w-0 flex-1" :to="orderLink">
            <ButtonsFilled class="w-full justify-center py-3 text-sm">
              {{ t('cities.service_in_city_cta_order_now') }}
            </ButtonsFilled>
          </NuxtLinkLocale>
          <a
            v-if="whatsappHref"
            :href="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex shrink-0 items-center justify-center rounded-lg border border-brand-500 px-3 py-3 text-brand-500 hover:bg-brand-100/50 focus:outline-none focus:ring-4 focus:ring-brand-100"
            :aria-label="t('cities.service_in_city_whatsapp_cta')"
          >
            <svg
              class="h-6 w-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.96 9.96 0 0 1 2 12"
                clip-rule="evenodd"
              />
              <path
                d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308"
              />
            </svg>
          </a>
        </div>
        <p class="text-center text-[10px] text-gray-500">
          <span aria-hidden="true">🔒</span>
          {{ ' ' }}
          {{ t('cities.service_in_city_trust_secure_pay') }}
        </p>
      </div>
    </div>
  </section>
</template>
