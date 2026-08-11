<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  defineProps({
    service: { type: Object, required: true },
    city: { type: Object, required: true },
    heroHeading: { type: String, required: true },
    heroLead: { type: String, default: '' },
    ratingSocialLine: { type: String, default: '' },
  });

  const { t } = useI18n();
</script>

<template>
  <div class="container mx-auto max-w-6xl">
    <div class="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
      <div class="min-w-0">
        <AppBreadcrumb
          class="mb-6 text-gray-600 [&_a]:text-gray-600 [&_a:hover]:text-brand-600"
          :pages="[
            { name: city.name, path: { name: 'cities-slug', params: { slug: resolveEntitySlug(city) } } },
            {
              name: service.name,
              path: {
                name: 'services-service-in-city',
                params: { service: resolveEntitySlug(service), city: resolveEntitySlug(city) },
              },
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
</template>
