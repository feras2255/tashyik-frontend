<script setup>
  const props = defineProps({
    collection: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    maxServices: {
      type: Number,
      default: 10,
    },
  });

  const displayServices = computed(() => {
    const raw = props.collection.services ?? props.collection.items;
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, props.maxServices);
  });
</script>

<template>
  <section
    :class="[index % 2 === 0 ? 'bg-white' : 'bg-brand-50']"
    class="py-14 md:py-20"
  >
    <div class="container flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2 md:mb-6">
        <h2 class="text-xl lg:text-3xl font-bold text-gray-900">
          {{ collection.title }}
        </h2>
        <NuxtLinkLocale :to="{ name: 'services' }" class="text-sm md:text-base text-gray-500 hover:text-brand-600 flex items-center gap-1 font-medium transition-colors">
          عرض جميع الخدمات
          <svg class="w-4 h-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLinkLocale>
      </div>

      <div
        v-if="!displayServices.length"
        class="rounded-2xl border border-gray-100 bg-gray-50/80 py-12 px-4 text-center text-gray-500"
      >
        {{ $t('services.empty.title') }}
      </div>

      <!-- Grid Layout -->
      <div v-else class="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 xl:gap-6 scrollbar-hide">
        <HomeCollectionServiceCard
          v-for="service in displayServices"
          :key="service.id"
          :service="service"
          class="min-w-[220px] md:min-w-0"
        />
      </div>
    </div>
  </section>
</template>

