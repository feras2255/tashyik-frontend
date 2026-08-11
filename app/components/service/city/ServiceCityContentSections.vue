<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  defineProps({
    service: { type: Object, required: true },
    city: { type: Object, required: true },
    includesItems: { type: Array, default: () => [] },
    howSteps: { type: Array, default: () => [] },
    whyItems: { type: Array, default: () => [] },
    reviewItems: { type: Array, default: () => [] },
  });

  const { t } = useI18n();
  const localePath = useLocalePath();
</script>

<template>
  <div class="contents">
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
          <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm">
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
        <div v-for="(card, idx) in whyItems" :key="idx" class="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-5 shadow-sm">
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
  </div>
</template>
