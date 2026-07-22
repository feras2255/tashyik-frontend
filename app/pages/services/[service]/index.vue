<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const switchLocalePath = useSwitchLocalePath();
  const route = useRoute();
  const layout = useLayoutStore();
  const siteBrand = useSiteBrand();
  const { staticAsset } = useStaticAsset();
  const { fetchServiceBySlug } = useServiceFetchers();
  const { pricingWindowKey } = useSaudiPricingWindowKey();
  const galleryContainer = ref(null);

  const { data: servicePayload, error: pageError } = await useAsyncData(
    () => `service-detail-${route.params.service}-${locale.value}-${pricingWindowKey.value}`,
    async () => {
      const response = await fetchServiceBySlug(route.params.service);

      return response.data;
    },
    {
      watch: [() => route.params.service, locale, pricingWindowKey],
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
      statusMessage: pageError.value.message || 'Failed to fetch service',
      fatal: true,
    });
  }

  const service = computed(() => servicePayload.value ?? null);

  const parentCategory = computed(() => service.value?.parent_category ?? null);

  /** Gallery slides: API gallery first, else card image (matches ServiceCard / city pages). */
  const galleryImages = computed(() => {
    const svc = service.value;
    if (!svc) {
      return [];
    }

    const gallery = (Array.isArray(svc.gallery) ? svc.gallery : []).filter(Boolean);
    if (gallery.length) {
      return gallery;
    }

    return svc.image ? [svc.image] : [];
  });

  const hasMultipleGalleryImages = computed(() => galleryImages.value.length > 1);

  const serviceImageAlt = computed(() => {
    const svc = service.value;
    if (!svc) {
      return '';
    }

    const alt = svc.image_alt;
    if (alt && typeof alt === 'object') {
      return alt[locale.value] || svc.name;
    }

    return alt || t('alt.service', { service: svc.name });
  });

  const showRating = computed(() => {
    const rating = parseFloat(String(service.value?.rating ?? ''));

    return !Number.isNaN(rating) && rating > 0;
  });

  const heroLead = computed(() => {
    const plain = stripHtml(service.value?.description || '');

    if (!plain) {
      return '';
    }

    return plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}…` : plain;
  });

  const orderLink = computed(() => ({
    name: 'services-service-order',
    params: { service: resolveEntitySlug(service.value) },
  }));

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

  const hasPrice = computed(() => {
    const price = service.value?.price;

    return price?.original > 0 && price?.after_discount != null && price.after_discount !== '';
  });

  function stripHtml(html) {
    if (html == null) {
      return '';
    }

    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  useEntitySeo({
    entity: service,
    parentCategory,
    ogType: 'website',
    slugParam: 'service',
  });

  const serviceJsonLd = computed(() => {
    if (!service.value) {
      return null;
    }

    const price = service.value.price?.after_discount;
    const aggregate = service.value.review_aggregate;

    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.value.name,
      description: stripHtml(service.value.description),
      areaServed: {
        '@type': 'Country',
        name: 'Saudi Arabia',
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

    if (aggregate?.count > 0) {
      payload.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: aggregate.average,
        reviewCount: aggregate.count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    if (service.value.updated_at) {
      payload.dateModified = service.value.updated_at;
    }

    return JSON.stringify(payload);
  });

  const breadcrumbJsonLd = computed(() => {
    if (!service.value) {
      return null;
    }

    const base = (config.public.appUrl || '').replace(/\/$/, '');
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('navigation.home'),
        item: `${base}${localePath({ name: 'index' })}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('navigation.categories'),
        item: `${base}${localePath({ name: 'categories' })}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.value.name,
        item: `${base}${switchLocalePath(locale.value)}`,
      },
    ];

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    });
  });

  useHead({
    script: computed(() => {
      const scripts = [];

      if (serviceJsonLd.value) {
        scripts.push({
          key: 'service-schema',
          type: 'application/ld+json',
          innerHTML: serviceJsonLd.value,
        });
      }

      if (breadcrumbJsonLd.value) {
        scripts.push({
          key: 'service-breadcrumb-schema',
          type: 'application/ld+json',
          innerHTML: breadcrumbJsonLd.value,
        });
      }

      return scripts;
    }),
  });

  useSwiper(galleryContainer, {
    slidesPerView: 1,
    grabCursor: true,
    pagination: hasMultipleGalleryImages,
  });
</script>

<template>
  <section v-if="service" class="w-full px-2 pb-28 pt-6 md:px-4 md:pb-10 md:pt-8 lg:pb-12">
    <!-- Hero -->
    <div class="container mx-auto max-w-6xl">
      <AppBreadcrumb :pages="[{ name: service.name }]" />

      <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div class="min-w-0">
          <NuxtLinkLocale
            v-if="parentCategory?.slug"
            :to="{ name: 'categories-category', params: { category: parentCategory.slug } }"
            class="mb-3 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {{ parentCategory.name }}
          </NuxtLinkLocale>

          <h1 class="text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            {{ service.name }}
          </h1>

          <p v-if="heroLead" class="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
            {{ heroLead }}
          </p>

          <div
            v-if="hasPrice"
            class="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-brand-100 bg-brand-50/80 px-4 py-2.5 shadow-sm"
          >
            <span class="text-sm font-medium text-brand-800">{{ t('cities.service_in_city_price_label') }}</span>
            <span class="text-xl font-semibold text-gray-900 md:text-2xl">
              {{ service.price.after_discount }}
              <span class="text-base font-normal text-gray-600">{{ service.price.currency }}</span>
            </span>
            <del v-if="service.price.has_discount" class="text-sm text-gray-400">
              {{ service.price.original }} {{ service.price.currency }}
            </del>
          </div>
          <p v-else class="mt-6 text-base font-medium text-gray-700">{{ t('common.no_price') }}</p>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <WarrantyBadge v-if="service.warranty_duration" :duration="service.warranty_duration" class="me-0" />

            <div
              v-if="showRating"
              class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm"
            >
              <svg
                class="h-4 w-4 fill-yellow-500 stroke-yellow-500"
                viewBox="0 0 18 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8.439 0.745745C8.47552 0.671962 8.53193 0.609855 8.60188 0.566432C8.67182 0.52301 8.75251 0.5 8.83483 0.5C8.91716 0.5 8.99785 0.52301 9.06779 0.566432C9.13773 0.609855 9.19415 0.671962 9.23067 0.745745L11.1557 4.64491C11.2825 4.90155 11.4697 5.12359 11.7012 5.29196C11.9327 5.46033 12.2016 5.57001 12.4848 5.61158L16.7898 6.24158C16.8714 6.2534 16.948 6.28781 17.0111 6.34091C17.0741 6.39402 17.121 6.4637 17.1465 6.54208C17.172 6.62047 17.1751 6.70442 17.1553 6.78444C17.1356 6.86447 17.0938 6.93737 17.0348 6.99491L13.9215 10.0266C13.7162 10.2267 13.5626 10.4736 13.4739 10.7463C13.3852 11.0189 13.3641 11.309 13.4123 11.5916L14.1473 15.8749C14.1617 15.9564 14.1529 16.0404 14.1219 16.1171C14.0909 16.1939 14.0389 16.2604 13.972 16.3091C13.905 16.3577 13.8256 16.3866 13.7431 16.3923C13.6605 16.3981 13.5779 16.3805 13.5048 16.3416L9.6565 14.3182C9.40293 14.1851 9.12082 14.1155 8.83442 14.1155C8.54802 14.1155 8.2659 14.1851 8.01233 14.3182L4.16483 16.3416C4.09178 16.3803 4.00933 16.3977 3.92688 16.3918C3.84442 16.3859 3.76526 16.357 3.69841 16.3084C3.63156 16.2598 3.57969 16.1934 3.54871 16.1168C3.51773 16.0401 3.50888 15.9563 3.52317 15.8749L4.25733 11.5924C4.30583 11.3097 4.28482 11.0194 4.19611 10.7466C4.10741 10.4738 3.95367 10.2267 3.74817 10.0266L0.634833 6.99575C0.575328 6.93827 0.533161 6.86524 0.513135 6.78497C0.493109 6.70471 0.496031 6.62043 0.521565 6.54174C0.5471 6.46305 0.594222 6.39311 0.657564 6.3399C0.720905 6.28668 0.797919 6.25233 0.879833 6.24075L5.184 5.61158C5.46755 5.57033 5.73682 5.46079 5.96865 5.2924C6.20048 5.12401 6.38792 4.9018 6.51483 4.64491L8.439 0.745745Z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ service.rating }}
            </div>

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

          <div class="mt-6 hidden lg:block">
            <NuxtLinkLocale :to="orderLink" class="inline-block w-full max-w-sm">
              <ButtonsFilled class="w-full justify-center py-3.5 text-base">
                {{ t('service.order_service') }}
              </ButtonsFilled>
            </NuxtLinkLocale>
          </div>
        </div>

        <div class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md md:rounded-3xl">
          <swiper-container v-if="hasMultipleGalleryImages" ref="galleryContainer" id="galleryCarousel" class="h-full w-full">
            <swiper-slide v-for="(image, index) in galleryImages" :key="index" class="h-full">
              <img
                :src="image"
                class="h-full w-full object-cover object-center"
                :alt="serviceImageAlt"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : undefined"
                width="960"
                height="720"
              />
            </swiper-slide>
          </swiper-container>

          <img
            v-else-if="galleryImages.length"
            :src="galleryImages[0]"
            :alt="serviceImageAlt"
            class="h-full w-full object-cover object-center"
            width="960"
            height="720"
            fetchpriority="high"
          />

          <div v-else class="flex h-full w-full items-center justify-center text-gray-400" aria-hidden="true">
            <svg
              class="h-20 w-20"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1"
              stroke="currentColor"
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

    <!-- Cities (collapsed by default — SEO links without pushing hero down) -->
    <details
      v-if="service.city_links?.length"
      class="container mx-auto mt-8 max-w-6xl rounded-xl border border-gray-100 bg-white p-4 shadow-sm open:pb-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-gray-800">
        <span>{{ t('cities.available_in') }} ({{ service.city_links.length }})</span>
        <svg
          class="h-5 w-5 shrink-0 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="c in service.city_links"
          :key="c.slug"
          :to="
            localePath({ name: 'services-service-in-city', params: { service: resolveEntitySlug(service), city: resolveEntitySlug(c) } })
          "
          class="inline-flex rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 hover:border-brand-200 hover:bg-brand-50"
        >
          {{ c.name }}
        </NuxtLink>
      </div>
    </details>

    <!-- Main + sidebar -->
    <div class="container mx-auto mt-10 max-w-6xl lg:mt-14">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <article class="min-w-0 space-y-8 lg:col-span-8">
          <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">{{ t('service.highlights.title') }}</h2>
            <p v-if="stripHtml(service.description)" class="mt-4 leading-relaxed text-gray-600">
              {{ stripHtml(service.description) }}
            </p>
            <ul v-if="service.highlights?.length" class="mt-5 space-y-3">
              <li v-for="highlight of service.highlights" :key="highlight.id" class="flex gap-3">
                <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 stroke-green-500">
                  <svg class="h-4 w-4" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M11.8992 0.699951L4.19922 8.39995L0.699219 4.89995"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="text-gray-600">{{ highlight.title }}</span>
              </li>
            </ul>
          </section>
        </article>

        <aside class="lg:col-span-4">
          <div class="hidden lg:block lg:sticky lg:top-24">
            <div class="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-brand-50/30 p-6 shadow-md">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {{ t('service.order_service') }}
              </p>
              <p class="mt-3 text-lg font-semibold text-gray-900">{{ service.name }}</p>

              <AppBadge
                v-if="service.price?.has_discount"
                type="success"
                class="mt-4"
                :title="t('common.promotion', { percentage: service.price.discount_percintage })"
              />

              <div v-if="hasPrice" class="mt-6">
                <p class="text-xs text-gray-500">{{ t('cities.service_in_city_price_label') }}</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ service.price.after_discount }}
                  <span class="text-lg font-normal text-gray-600">{{ service.price.currency }}</span>
                </p>
                <del v-if="service.price.has_discount" class="mt-1 block text-sm text-gray-400">
                  {{ service.price.original }} {{ service.price.currency }}
                </del>
              </div>
              <p v-else class="mt-6 text-sm text-gray-600">{{ t('common.no_price') }}</p>

              <div class="mt-4">
                <img
                  class="h-6 shrink-0"
                  :src="staticAsset('tabby-tamara.webp')"
                  alt="Tabby & Tamara"
                  loading="lazy"
                  width="120"
                  height="24"
                />
              </div>

              <NuxtLinkLocale :to="orderLink" class="mt-6 block w-full">
                <ButtonsFilled class="w-full justify-center py-3.5 text-base">
                  {{ t('service.order_service') }}
                </ButtonsFilled>
              </NuxtLinkLocale>

              <ul class="mt-6 space-y-3 border-t border-dashed border-gray-200 pt-5 text-sm text-gray-500">
                <li class="flex gap-2">
                  <svg
                    class="h-5 w-5 shrink-0 stroke-brand-500"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M10.0003 18.3333C14.6027 18.3333 18.3337 14.6023 18.3337 9.99996C18.3337 5.39759 14.6027 1.66663 10.0003 1.66663C5.39795 1.66663 1.66699 5.39759 1.66699 9.99996C1.66699 14.6023 5.39795 18.3333 10.0003 18.3333Z"
                      stroke-width="1.66667"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path d="M10 5V10L13.3333 11.6667" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ t('service.highlight_1') }}
                </li>
                <li class="flex gap-2">
                  <svg
                    class="h-5 w-5 shrink-0 stroke-brand-500"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M16.6663 10.8333C16.6663 15 13.7497 17.0833 10.283 18.2916C10.1015 18.3532 9.90429 18.3502 9.72467 18.2833C6.24967 17.0833 3.33301 15 3.33301 10.8333V4.99997C3.33301 4.77895 3.42081 4.56699 3.57709 4.41071C3.73337 4.25443 3.94533 4.16663 4.16634 4.16663C5.83301 4.16663 7.91634 3.16663 9.36634 1.89997C9.54289 1.74913 9.76747 1.66626 9.99967 1.66626C10.2319 1.66626 10.4565 1.74913 10.633 1.89997C12.0913 3.17497 14.1663 4.16663 15.833 4.16663C16.054 4.16663 16.266 4.25443 16.4223 4.41071C16.5785 4.56699 16.6663 4.77895 16.6663 4.99997V10.8333Z"
                      stroke-width="1.66667"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ t('service.highlight_2') }}
                </li>
                <li class="flex gap-2">
                  <svg
                    class="h-5 w-5 shrink-0 stroke-brand-500"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.60404 1.91249C9.64056 1.83871 9.69697 1.7766 9.76692 1.73318C9.83686 1.68976 9.91755 1.66675 9.99987 1.66675C10.0822 1.66675 10.1629 1.68976 10.2328 1.73318C10.3028 1.7766 10.3592 1.83871 10.3957 1.91249L12.3207 5.81166C12.4475 6.0683 12.6347 6.29033 12.8662 6.4587C13.0977 6.62707 13.3666 6.73675 13.6499 6.77833L17.9549 7.40833C18.0364 7.42014 18.1131 7.45455 18.1761 7.50766C18.2391 7.56076 18.2861 7.63045 18.3116 7.70883C18.337 7.78721 18.3401 7.87116 18.3204 7.95119C18.3006 8.03121 18.2589 8.10412 18.1999 8.16166L15.0865 11.1933C14.8812 11.3934 14.7276 11.6404 14.6389 11.913C14.5502 12.1856 14.5291 12.4757 14.5774 12.7583L15.3124 17.0417C15.3268 17.1232 15.318 17.2071 15.287 17.2839C15.2559 17.3607 15.204 17.4272 15.137 17.4758C15.07 17.5245 14.9907 17.5533 14.9081 17.5591C14.8255 17.5648 14.743 17.5472 14.6699 17.5083L10.8215 15.485C10.568 15.3518 10.2859 15.2823 9.99946 15.2823C9.71306 15.2823 9.43094 15.3518 9.17737 15.485L5.32987 17.5083C5.25681 17.547 5.17437 17.5644 5.09191 17.5585C5.00946 17.5527 4.9303 17.5238 4.86345 17.4752C4.7966 17.4266 4.74473 17.3601 4.71375 17.2835C4.68277 17.2069 4.67392 17.1231 4.68821 17.0417L5.42237 12.7592C5.47087 12.4764 5.44986 12.1862 5.36115 11.9134C5.27245 11.6406 5.11871 11.3935 4.91321 11.1933L1.79987 8.16249C1.74037 8.10502 1.6982 8.03199 1.67817 7.95172C1.65815 7.87145 1.66107 7.78717 1.6866 7.70848C1.71214 7.6298 1.75926 7.55986 1.8226 7.50665C1.88594 7.45343 1.96296 7.41907 2.04487 7.40749L6.34904 6.77833C6.63259 6.73708 6.90186 6.62754 7.13369 6.45915C7.36552 6.29076 7.55296 6.06855 7.67987 5.81166L9.60404 1.91249Z"
                      stroke-width="1.66667"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ t('service.highlight_3') }}
                </li>
              </ul>

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

    <!-- Mobile sticky booking bar -->
    <div
      class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
    >
      <div class="container mx-auto flex max-w-6xl flex-col gap-2 px-2">
        <div class="flex items-center justify-between gap-3">
          <p class="min-w-0 truncate text-sm font-semibold text-gray-900">{{ service.name }}</p>
          <div v-if="hasPrice" class="shrink-0 text-end">
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
              {{ t('service.order_service') }}
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
      </div>
    </div>
  </section>
</template>

<style scoped>
  #galleryCarousel {
    width: 100%;
    height: 100%;
    --swiper-pagination-color: #724193;
  }
</style>
