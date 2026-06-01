<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const apiFetch = useApiFetchClient();

  const defaultOg = computed(() => `${config.public.appUrl?.replace(/\/$/, '') || 'https://www.tashyik.com'}/images/og.webp`);

  useSeoMeta({
    title: t('seo.cities_index.title'),
    ogTitle: t('seo.cities_index.title'),
    description: t('seo.cities_index.description'),
    ogDescription: t('seo.cities_index.description'),
    ogImage: defaultOg,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seo.cities_index.title'),
    twitterDescription: t('seo.cities_index.description'),
    twitterImage: defaultOg,
  });

  const { data: cities, error } = await useAsyncData(
    () => `cities-index-${locale.value}`,
    async () => {
      const res = await apiFetch('/cities', {
        query: { per_page: 120 },
      });

      return res.data ?? [];
    },
    { watch: [locale] },
  );

  if (error.value) {
    const raw = Number(error.value.statusCode || error.value.status || error.value?.response?.status) || 500;
    /**
     * Do not surface HTTP 404 here: `app/error.vue` maps any 404 to `common.page_not_found`, which misleads users
     * when the Nuxt route exists but the API call failed (wrong `NUXT_PUBLIC_API_BASE_URL`, DNS, domain routes, etc.).
     */
    const statusCode = raw === 404 ? 503 : raw;

    throw createError({
      statusCode,
      statusMessage: error.value.message || t('common.something_went_wrong'),
      fatal: true,
    });
  }

  const filterQ = ref('');

  function cityName(city) {
    return String(city?.name ?? '');
  }

  /** Preserve API `item_order` (dashboard drag); do not re-sort alphabetically. */
  const orderedCities = computed(() => cities.value ?? []);

  const cityCount = computed(() => orderedCities.value.length);

  const hasFilter = computed(() => Boolean(filterQ.value.trim()));

  const filteredCities = computed(() => {
    const list = orderedCities.value;
    const q = filterQ.value.trim().toLowerCase();

    if (!q) {
      return list;
    }

    return list.filter((c) => cityName(c).toLowerCase().includes(q));
  });

  function clearCityFilter() {
    filterQ.value = '';
  }

  useHead({
    script: computed(() => {
      if (!cities.value?.length) {
        return [];
      }

      const base = (config.public.appUrl || '').replace(/\/$/, '');

      return [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: t('seo.cities_index.title'),
            itemListElement: cities.value.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.name,
              url: `${base}${localePath({ name: 'cities-slug', params: { slug: resolveEntitySlug(c) } })}`,
            })),
          }),
        },
      ];
    }),
  });
</script>

<template>
  <section class="w-full">
    <div class="relative overflow-hidden border-b border-brand-100/80 bg-gradient-to-br from-brand-50 via-white to-gray-50">
      <div class="pointer-events-none absolute -end-20 top-10 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -start-24 bottom-0 h-48 w-48 rounded-full bg-amber-100/50 blur-3xl" aria-hidden="true"></div>

      <div class="container relative px-4 py-10 md:py-16">
        <AppBreadcrumb
          :pages="[{ name: t('cities.index_title') }]"
          class="mb-8 text-sm text-gray-600 [&_a]:text-gray-600 [&_a:hover]:text-brand-600"
        />

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div class="flex max-w-3xl flex-col gap-4 md:gap-5">
            <span class="inline-flex w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow-sm ring-1 ring-brand-100">
              {{ t('navigation.cities') }}
            </span>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {{ t('cities.index_title') }}
            </h1>
            <p class="max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
              {{ t('cities.index_subtitle') }}
            </p>
            <div class="flex flex-wrap gap-3 pt-1">
              <NuxtLinkLocale
                :to="{ name: 'categories' }"
                class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                {{ t('cities.index_browse_categories') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale
                :to="{ name: 'services' }"
                class="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-brand-600 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                {{ t('navigation.services') }}
              </NuxtLinkLocale>
            </div>
          </div>

          <div class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-brand-100/40 backdrop-blur">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">{{ t('navigation.cities') }}</p>
                <p class="mt-1 text-3xl font-bold text-gray-900">{{ cityCount }}</p>
              </div>
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
                <svg class="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503-12.62 3.17-1.585A.75.75 0 0 1 19.5 3.715v13.57a.75.75 0 0 1-.415.67l-3.588 1.794a.75.75 0 0 1-.67 0l-5.66-2.83a.75.75 0 0 0-.67 0l-3.17 1.585A.75.75 0 0 1 4.5 17.835V4.265a.75.75 0 0 1 .415-.67l3.588-1.794a.75.75 0 0 1 .67 0l5.66 2.83a.75.75 0 0 0 .67 0Z" />
                </svg>
              </span>
            </div>

            <label class="mb-2 block text-sm font-medium text-gray-800" for="cities-filter">
              {{ t('cities.index_filter_placeholder') }}
            </label>
            <div class="relative">
              <input
                id="cities-filter"
                v-model="filterQ"
                type="search"
                class="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pe-20 ps-4 text-sm text-gray-900 shadow-inner placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                :placeholder="t('cities.index_filter_placeholder')"
                autocomplete="off"
              />
              <button
                v-if="hasFilter"
                type="button"
                class="absolute inset-y-1 end-10 flex w-8 items-center justify-center rounded-lg text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :aria-label="t('services.index_clear_filters')"
                @click="clearCityFilter"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <span class="pointer-events-none absolute inset-y-0 end-3 flex items-center text-gray-400" aria-hidden="true">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
            </div>
            <p v-if="cityCount" class="mt-3 text-sm text-gray-500" role="status">
              {{ t('cities.city_search_result_count', { filtered: filteredCities.length, total: cityCount }) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50/40">
      <div class="container w-full space-y-10 px-4 py-10 md:py-14">
        <ul
          v-if="filteredCities.length"
          class="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          :aria-label="t('cities.index_title')"
        >
          <li v-for="c in filteredCities" :key="c.id">
            <NuxtLinkLocale
              :to="{ name: 'cities-slug', params: { slug: resolveEntitySlug(c) } }"
              class="group relative flex h-full min-h-[11rem] overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              :aria-label="t('cities.view_city_hub', { city: c.name })"
            >
              <span class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-300 to-amber-300 opacity-80 transition group-hover:opacity-100" aria-hidden="true"></span>

              <span class="flex h-full w-full flex-col">
                <span class="mb-5 flex items-start justify-between gap-4">
                  <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600" aria-hidden="true">
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7.5-4.108 7.5-11.25a7.5 7.5 0 0 0-15 0C4.5 16.892 12 21 12 21Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  </span>
                  <span class="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-100">
                    {{ t('cities.available_in') }}
                  </span>
                </span>

                <span class="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-brand-700">
                  {{ c.name }}
                </span>
                <span class="mt-2 text-sm leading-relaxed text-gray-500">
                  {{ t('cities.index_card_subtitle') }}
                </span>

                <span class="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-5 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                  <span>{{ t('cities.view_city_hub', { city: c.name }) }}</span>
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white" aria-hidden="true">
                    <svg class="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </span>
                </span>
              </span>
            </NuxtLinkLocale>
          </li>
        </ul>
        <div
          v-else
          class="mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm"
        >
          <svg class="h-14 w-14 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p class="text-base font-medium text-gray-700">
            {{ hasFilter ? t('cities.index_filter_no_match') : t('cities.services_none_in_city') }}
          </p>
          <button
            v-if="hasFilter"
            type="button"
            class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            @click="clearCityFilter"
          >
            {{ t('services.index_clear_filters') }}
          </button>
        </div>

        <div class="mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <p class="max-w-xl text-sm leading-relaxed text-gray-700 md:text-base">
            {{ t('cities.index_secondary_hint') }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLinkLocale
              :to="{ name: 'categories' }"
              class="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              {{ t('cities.index_browse_categories') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              :to="{ name: 'services' }"
              class="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              {{ t('navigation.services') }}
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
