<script setup>
  defineProps({
    cityName: { type: String, required: true },
    html: { type: String, required: true },
  });

  const { t } = useI18n();
</script>

<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
    <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
      {{ t('cities.service_in_city_local_overview', { city: cityName }) }}
    </h2>
    <div class="prose prose-sm mt-4 max-w-none text-gray-700 md:prose-base" v-html="html" />
  </section>
</template>
