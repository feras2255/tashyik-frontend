<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  defineProps({
    relatedServices: { type: Array, default: () => [] },
    city: { type: Object, required: true },
  });

  const { t } = useI18n();
</script>

<template>
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
</template>
