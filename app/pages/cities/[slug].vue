<script setup>
  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const switchLocalePath = useSwitchLocalePath();
  const route = useRoute();
  const layout = useLayoutStore();
  const { fetchCityBySlug, fetchAllCityServices } = useServiceFetchers();

  const searchInput = ref('');
  const selectedCategoryId = ref(null);
  const visibleLimit = ref(12);

  const { data: payload, error: pageError, pending: pagePending } = await useAsyncData(
    () => `city-page-${route.params.slug}-${locale.value}`,
    async () => {
      const slug = route.params.slug;
      const [cityRes, allServices] = await Promise.all([fetchCityBySlug(slug), fetchAllCityServices(slug)]);

      return {
        city: cityRes.data,
        allServices,
      };
    },
    {
      watch: [() => route.params.slug, locale],
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
      statusMessage: pageError.value.message || 'Failed to fetch city',
      fatal: true,
    });
  }

  const city = computed(() => payload.value?.city ?? null);

  const allServices = computed(() => payload.value?.allServices ?? []);

  function pickLocalizedName(name) {
    if (typeof name === 'string') {
      return name;
    }

    if (name && typeof name === 'object') {
      return name[locale.value] || name.ar || name.en || Object.values(name).find(Boolean) || '';
    }

    return '';
  }

  function serviceDisplayName(svc) {
    return pickLocalizedName(svc.name);
  }

  const categoryChips = computed(() => {
    const map = new Map();

    for (const s of allServices.value) {
      const p = s.filter_parent_category;

      if (p?.id != null) {
        map.set(p.id, {
          id: p.id,
          name: pickLocalizedName(p.name),
        });
      }
    }

    return [...map.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), 'ar'));
  });

  const searchTrimmed = computed(() => searchInput.value.trim());

  function serviceMatchesSearch(svc, q) {
    if (!q) {
      return true;
    }

    const qq = q.toLocaleLowerCase('ar');

    if (serviceDisplayName(svc).toLocaleLowerCase('ar').includes(qq)) {
      return true;
    }

    if ((svc.card_description || '').toLocaleLowerCase('ar').includes(qq)) {
      return true;
    }

    for (const h of svc.highlights || []) {
      if (String(h.title || '').toLocaleLowerCase('ar').includes(qq)) {
        return true;
      }
    }

    return false;
  }

  const filteredServices = computed(() => {
    let list = allServices.value;

    if (selectedCategoryId.value != null) {
      list = list.filter((s) => s.filter_parent_category?.id === selectedCategoryId.value);
    }

    list = list.filter((s) => serviceMatchesSearch(s, searchTrimmed.value));

    return list;
  });

  const filteredTotal = computed(() => filteredServices.value.length);

  const displayedServices = computed(() => filteredServices.value.slice(0, visibleLimit.value));

  const hasMore = computed(() => visibleLimit.value < filteredServices.value.length);

  watch([selectedCategoryId, searchTrimmed], () => {
    visibleLimit.value = 12;
  });

  watch(
    () => route.params.slug,
    () => {
      visibleLimit.value = 12;
      selectedCategoryId.value = null;
      searchInput.value = '';
    },
  );

  function loadMore() {
    visibleLimit.value += 12;
  }

  const cityRef = computed(() => city.value);

  const appStoreHref = computed(() => layout.mobile_app_links?.google_play || layout.mobile_app_links?.app_store || null);

  useEntitySeo({
    entity: cityRef,
    parentCategory: null,
    ogType: 'website',
  });

  const breadcrumbJsonLd = computed(() => {
    if (!city.value) {
      return null;
    }

    const base = (config.public.appUrl || '').replace(/\/$/, '');

    return {
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
          name: t('cities.index_title'),
          item: `${base}${localePath({ name: 'cities' })}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: city.value.name,
          item: `${base}${switchLocalePath(locale.value)}`,
        },
      ],
    };
  });

  const localBusinessJsonLd = computed(() => {
    if (!city.value) {
      return null;
    }

    const payloadLb = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `${t('common.brand')} — ${city.value.name}`,
      description: t('cities.schema_description', { city: city.value.name }),
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.value.name,
        addressCountry: 'SA',
      },
    };

    if (city.value.latitude != null && city.value.longitude != null) {
      payloadLb.geo = {
        '@type': 'GeoCoordinates',
        latitude: city.value.latitude,
        longitude: city.value.longitude,
      };
    }

    return payloadLb;
  });

  useHead({
    script: computed(() => {
      const scripts = [];

      if (breadcrumbJsonLd.value) {
        scripts.push({
          key: 'city-breadcrumb-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(breadcrumbJsonLd.value),
        });
      }

      if (localBusinessJsonLd.value) {
        scripts.push({
          key: 'city-localbusiness-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(localBusinessJsonLd.value),
        });
      }

      return scripts;
    }),
  });
</script>

<template>
  <section
    v-if="city"
    class="w-full bg-gray-50/40"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <!-- Compact hero -->
    <div class="border-b border-brand-100/90 bg-gradient-to-b from-brand-50 to-white">
      <div class="container px-4 pb-6 pt-5 md:pb-8 md:pt-6">
        <AppBreadcrumb
          class="mb-4 text-sm text-gray-600 [&_a]:text-gray-600 [&_a:hover]:text-brand-600"
          :pages="[
            { name: t('navigation.home'), path: { name: 'index' } },
            { name: t('cities.index_title'), path: { name: 'cities' } },
            { name: city.name, path: { name: 'cities-slug', params: { slug: city.slug } } },
          ]"
        />

        <div class="flex max-w-3xl flex-col gap-3">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {{ t('cities.hero_h1_maintenance', { city: city.name }) }}
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            {{ t('cities.hero_compact_subtitle') }}
          </p>
          <div class="flex flex-wrap gap-2 pt-1">
            <NuxtLink
              :to="localePath({ name: 'categories' })"
              class="inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              {{ t('cities.browse_services') }}
            </NuxtLink>
            <a
              v-if="appStoreHref"
              :href="appStoreHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-xl border-2 border-brand-600 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              {{ t('cities.hero_cta_app') }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar + grid (tight to hero) -->
    <div class="container space-y-6 px-4 pb-12 pt-6 md:space-y-8 md:pb-16 md:pt-8">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <!-- Search -->
        <label class="mb-2 block text-sm font-medium text-gray-800" for="city-services-search">
          {{ t('cities.services_search_label') }}
        </label>
        <div class="relative w-full">
          <span class="pointer-events-none absolute inset-y-0 end-3 flex items-center text-gray-400" aria-hidden="true">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
          <input
            id="city-services-search"
            v-model="searchInput"
            type="search"
            autocomplete="off"
            class="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pe-11 ps-4 text-sm text-gray-900 shadow-inner placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 md:text-base"
            :placeholder="t('cities.services_search_placeholder')"
          />
        </div>

        <!-- Category chips -->
        <div
          v-if="categoryChips.length"
          class="mt-5 border-t border-gray-100 pt-4"
          role="toolbar"
          :aria-label="t('cities.city_categories_filter_aria')"
        >
          <div class="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            <button
              type="button"
              class="shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              :class="
                selectedCategoryId === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="selectedCategoryId = null"
            >
              {{ t('common.all') }}
            </button>
            <button
              v-for="chip in categoryChips"
              :key="chip.id"
              type="button"
              class="shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              :class="
                selectedCategoryId === chip.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="selectedCategoryId = chip.id"
            >
              {{ chip.name }}
            </button>
          </div>
        </div>

        <!-- Result feedback -->
        <div v-if="allServices.length && !pagePending" class="mt-4 text-sm text-gray-600 md:text-base">
          <p>
            {{
              t('cities.city_search_result_count', {
                filtered: filteredTotal,
                total: allServices.length,
              })
            }}
          </p>
        </div>

        <p
          v-if="searchTrimmed && !pagePending && filteredTotal === 0"
          class="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
          role="status"
        >
          {{ t('cities.city_search_no_results_for', { q: searchTrimmed }) }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pagePending" class="flex justify-center py-16">
        <AppSpinner />
      </div>

      <!-- Grid: match category page (3 cols at xl), ServiceCard -->
      <div
        v-else-if="displayedServices.length"
        class="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-8 xl:grid-cols-3"
      >
        <ServiceCard
          v-for="svc in displayedServices"
          :key="svc.id"
          :service="svc"
          :city-slug="city.slug"
          :highlight-query="searchTrimmed"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!pagePending"
        class="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center"
      >
        <svg class="h-14 w-14 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
        <p class="text-base font-medium text-gray-700">
          {{ searchTrimmed ? t('cities.city_search_no_results_for', { q: searchTrimmed }) : t('cities.services_none_in_city') }}
        </p>
      </div>

      <!-- Load more -->
      <div v-if="hasMore && !pagePending" class="flex justify-center pt-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
          @click="loadMore"
        >
          {{ t('common.load_more') }}
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
