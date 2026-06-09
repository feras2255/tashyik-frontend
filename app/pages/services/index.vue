<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const salesIq = useSalesIq();
  const { fetchServicesPage, fetchCategories } = useServiceFetchers();
  const { pricingWindowKey } = useSaudiPricingWindowKey();

  const route = useRoute();
  const searchInput = ref(route.query.q || '');
  const activeQuery = ref(route.query.q || '');
  const selectedParentId = ref(null);
  const selectedCategoryId = ref(null);
  const services = ref([]);
  const currentPage = ref(1);
  const lastPage = ref(1);
  const loader = ref(false);
  const syncingFromPayload = ref(false);
  const servicesPerPage = 12;

  const defaultOg = computed(() => `${config.public.appUrl?.replace(/\/$/, '') || 'https://www.tashyik.com'}/images/og.webp`);

  useSeoMeta({
    title: t('seo.services.title'),
    ogTitle: t('seo.services.title'),
    description: t('seo.services.description'),
    ogDescription: t('seo.services.description'),
    ogImage: defaultOg,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seo.services.title'),
    twitterDescription: t('seo.services.description'),
    twitterImage: defaultOg,
  });

  const { data: payload, error: pageError, pending: pagePending } = await useAsyncData(
    () => `services-index-${locale.value}-${pricingWindowKey.value}-${route.query.q || ''}`,
    async () => {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetchCategories(),
        fetchServicesPage({ page: 1, perPage: servicesPerPage, q: route.query.q || '' }),
      ]);

      return {
        categories: categoriesRes.data ?? [],
        services: servicesRes.data ?? [],
        meta: servicesRes.meta ?? { current_page: 1, last_page: 1, total: servicesRes.data?.length ?? 0 },
      };
    },
    {
      watch: [locale, pricingWindowKey],
    },
  );

  watch(
    () => route.query.q,
    async (newQ) => {
      if (newQ !== undefined && newQ !== activeQuery.value) {
        searchInput.value = newQ;
        activeQuery.value = newQ;
        currentPage.value = 1;
        await loadServices({ reset: true });
      }
    }
  );

  if (pageError.value) {
    const status = pageError.value.statusCode || pageError.value.status || pageError.value?.response?.status;

    throw createError({
      statusCode: status || 500,
      statusMessage: pageError.value.message || 'Failed to fetch services',
      fatal: true,
    });
  }

  const categories = computed(() => payload.value?.categories ?? []);

  const parentCategoryChips = computed(() =>
    categories.value
      .map((category) => ({
        id: category.id,
        name: category.name,
        serviceCount: Number(category.service_count ?? 0),
        subcategories: category.subcategories ?? [],
      }))
      .filter((category) => category.id != null),
  );

  const visibleSubcategories = computed(() => {
    const groups = parentCategoryChips.value;

    if (selectedParentId.value == null) {
      return groups.flatMap((category) => category.subcategories);
    }

    return groups.find((category) => category.id === selectedParentId.value)?.subcategories ?? [];
  });

  const activeCategoryId = computed(() => selectedCategoryId.value ?? selectedParentId.value);

  const selectedParentCategory = computed(() => parentCategoryChips.value.find((category) => category.id === selectedParentId.value) ?? null);

  const selectedSubcategory = computed(() => visibleSubcategories.value.find((category) => category.id === selectedCategoryId.value) ?? null);

  const resultTotal = computed(() => payload.value?.meta?.total ?? services.value.length);
  const hasMoreServices = computed(() => currentPage.value < lastPage.value);
  const isFiltered = computed(() => Boolean(activeQuery.value || selectedParentId.value || selectedCategoryId.value));

  watch(
    () => payload.value,
    (p) => {
      if (!p) {
        return;
      }

      syncingFromPayload.value = true;
      services.value = [...(p.services ?? [])];
      currentPage.value = p.meta?.current_page ?? 1;
      lastPage.value = p.meta?.last_page ?? 1;
      nextTick(() => {
        syncingFromPayload.value = false;
      });
    },
    { immediate: true },
  );

  async function loadServices({ reset = false } = {}) {
    try {
      loader.value = true;

      const page = reset ? 1 : currentPage.value;
      const response = await fetchServicesPage({
        page,
        perPage: servicesPerPage,
        category: activeCategoryId.value,
        q: activeQuery.value,
      });

      services.value = reset ? [...(response.data ?? [])] : [...services.value, ...(response.data ?? [])];
      currentPage.value = response.meta?.current_page ?? page;
      lastPage.value = response.meta?.last_page ?? 1;

      if (payload.value?.meta && reset) {
        payload.value.meta.total = response.meta?.total ?? response.data?.length ?? 0;
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      loader.value = false;
    }
  }

  async function handleSearch() {
    activeQuery.value = searchInput.value.trim();
    currentPage.value = 1;
    await loadServices({ reset: true });
  }

  async function selectParentCategory(id) {
    selectedParentId.value = id;
    selectedCategoryId.value = null;
    currentPage.value = 1;
    await loadServices({ reset: true });
  }

  async function selectSubcategory(id) {
    selectedCategoryId.value = id;
    currentPage.value = 1;
    await loadServices({ reset: true });
  }

  async function clearFilters() {
    searchInput.value = '';
    activeQuery.value = '';
    selectedParentId.value = null;
    selectedCategoryId.value = null;
    currentPage.value = 1;
    await loadServices({ reset: true });
  }

  async function loadMore() {
    if (loader.value || !hasMoreServices.value) {
      return;
    }

    currentPage.value++;
    await loadServices();
  }

  const itemListJsonLd = computed(() => {
    const base = (config.public.appUrl || '').replace(/\/$/, '');

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('seo.services.title'),
      itemListElement: services.value.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: service.name,
        url: `${base}${localePath({ name: 'services-service', params: { service: resolveEntitySlug(service) } })}`,
      })),
    });
  });

  useHead({
    script: computed(() =>
      services.value.length
        ? [
            {
              type: 'application/ld+json',
              innerHTML: itemListJsonLd.value,
            },
          ]
        : [],
    ),
  });
</script>

<template>
  <section class="w-full bg-gray-50/40" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="border-b border-brand-100/90 bg-gradient-to-b from-brand-50 to-white">
      <div class="container px-4 pb-6 pt-5 md:pb-8 md:pt-6">
        <AppBreadcrumb
          class="mb-4 text-sm text-gray-600 [&_a]:text-gray-600 [&_a:hover]:text-brand-600"
          :pages="[
            { name: t('navigation.home'), path: { name: 'index' } },
            { name: t('navigation.services'), path: { name: 'services' } },
          ]"
        />

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div class="flex max-w-3xl flex-col gap-3">
            <p class="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {{ t('services.index_eyebrow') }}
            </p>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {{ t('services.index_title') }}
            </h1>
            <p class="max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
              {{ t('services.index_subtitle') }}
            </p>
          </div>

          <div class="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
            <p class="text-sm font-medium text-gray-500">{{ t('services.index_support_title') }}</p>
            <button
              type="button"
              class="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              @click="salesIq.openChat"
            >
              {{ t('services.custom_service.action') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container space-y-6 px-4 pb-12 pt-6 md:space-y-8 md:pb-16 md:pt-8">
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="p-4 md:p-6">
            <form @submit.prevent="handleSearch">
              <label class="mb-2 block text-sm font-semibold text-gray-900" for="services-index-search">
                {{ t('services.index_search_label') }}
              </label>
              <div class="relative w-full">
                <span class="pointer-events-none absolute inset-y-0 end-3 flex items-center text-gray-400" aria-hidden="true">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </span>
                <input
                  id="services-index-search"
                  v-model="searchInput"
                  type="search"
                  autocomplete="off"
                  class="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pe-28 ps-4 text-sm text-gray-900 shadow-inner placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 md:text-base"
                  :placeholder="t('services.index_search_placeholder')"
                />
                <button
                  type="submit"
                  class="absolute bottom-1.5 end-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
                >
                  {{ t('common.search') }}
                </button>
              </div>
            </form>

            <div v-if="parentCategoryChips.length" class="mt-6 border-t border-gray-100 pt-5">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ t('services.index_filter_by_category') }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ selectedSubcategory?.name || selectedParentCategory?.name || t('common.all') }}
                  </p>
                </div>
                <button
                  v-if="isFiltered"
                  type="button"
                  class="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  @click="clearFilters"
                >
                  {{ t('services.index_clear_filters') }}
                </button>
              </div>

              <div class="-mx-1 flex gap-2 overflow-x-auto pb-2 pt-1">
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  :class="selectedParentId === null ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  @click="selectParentCategory(null)"
                >
                  {{ t('common.all') }}
                </button>
                <button
                  v-for="category in parentCategoryChips"
                  :key="category.id"
                  type="button"
                  class="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  :class="selectedParentId === category.id ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  @click="selectParentCategory(category.id)"
                >
                  <span>{{ category.name }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs"
                    :class="selectedParentId === category.id ? 'bg-white/20 text-white' : 'bg-white text-gray-500'"
                  >
                    {{ category.serviceCount }}
                  </span>
                </button>
              </div>

              <div v-if="visibleSubcategories.length" class="mt-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="subcategory in visibleSubcategories"
                    :key="subcategory.id"
                    type="button"
                    class="rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    :class="selectedCategoryId === subcategory.id ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-200' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'"
                    @click="selectSubcategory(subcategory.id)"
                  >
                    {{ subcategory.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside class="border-t border-gray-100 bg-gradient-to-br from-brand-50/80 to-white p-4 lg:border-s lg:border-t-0 md:p-6">
            <p class="text-sm font-semibold text-gray-900">{{ t('services.index_filter_by_category') }}</p>
            <dl class="mt-4 space-y-4">
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ t('navigation.categories') }}</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900">
                  {{ selectedSubcategory?.name || selectedParentCategory?.name || t('common.all') }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ t('navigation.services') }}</dt>
                <dd class="mt-1 text-lg font-semibold text-brand-700">
                  {{ services.length }} / {{ resultTotal }}
                </dd>
              </div>
            </dl>
            <button
              v-if="isFiltered"
              type="button"
              class="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
              @click="clearFilters"
            >
              {{ t('services.index_clear_filters') }}
            </button>
          </aside>
        </div>

        <div class="border-t border-gray-100 px-4 py-3 text-sm text-gray-600 md:px-6 md:text-base">
          <p>
            {{ t('services.index_result_count', { count: services.length, total: resultTotal }) }}
          </p>
        </div>
      </div>

      <div v-if="pagePending" class="flex justify-center py-16">
        <AppSpinner />
      </div>

      <div v-else-if="services.length" style="margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); overflow-x: auto; padding-bottom: 1rem;">
        <div style="display: flex; flex-wrap: nowrap; gap: 1rem; padding-left: calc(50vw - 50%); padding-right: calc(50vw - 50%);">
          <ServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            :highlight-query="activeQuery"
          />
        </div>
      </div>

      <div
        v-else
        class="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center"
      >
        <svg class="h-14 w-14 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-700">
          {{ t('services.empty.title') }}
        </h2>
        <p class="max-w-md text-sm text-gray-500">
          {{ t('services.empty.subtitle') }}
        </p>
      </div>

      <div v-if="hasMoreServices && !pagePending" class="flex justify-center pt-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loader"
          @click="loadMore"
        >
          <AppSpinner v-if="loader" class="h-5 w-5" />
          <span v-else>{{ t('common.load_more') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
