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

  const scrollRef = ref(null);

  const scroll = (dir) => {
    if (!scrollRef.value) return;
    const amount = 280;
    scrollRef.value.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };
</script>

<template>
  <section
    :class="[index % 2 === 0 ? 'bg-white' : 'bg-brand-50']"
    class="py-8 md:py-14"
  >
    <div class="container flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2 md:mb-6">
        <h2 class="text-xl lg:text-3xl font-bold text-gray-900">
          {{ collection.title }}
        </h2>
        <NuxtLinkLocale :to="{ name: 'services' }" class="text-sm md:text-base text-gray-500 hover:text-brand-600 flex items-center gap-1 font-medium transition-colors">
          {{ $t('home.collections.view_all') }}
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

      <!-- Carousel -->
      <div v-else class="relative">
        <!-- Prev -->
        <button
          @click="scroll('prev')"
          class="absolute start-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
          aria-label="السابق"
        >
          <svg class="w-5 h-5 text-brand-600 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Scroll container -->
        <div ref="scrollRef" class="overflow-x-auto pb-2 scrollbar-hide">
          <div class="flex gap-4" style="width: max-content;">
            <HomeCollectionServiceCard
              v-for="service in displayServices"
              :key="service.id"
              :service="service"
              style="width: 260px; flex: 0 0 260px;"
            />
          </div>
        </div>

        <!-- Next -->
        <button
          @click="scroll('next')"
          class="absolute end-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
          aria-label="التالي"
        >
          <svg class="w-5 h-5 text-brand-600 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

