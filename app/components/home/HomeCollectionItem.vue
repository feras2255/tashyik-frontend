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

  const swiperContainer = ref(null);
  const swiper = ref(null);

  const displayServices = computed(() => {
    const raw = props.collection.services ?? props.collection.items;
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, props.maxServices);
  });

  swiper.value = useSwiper(swiperContainer, {
    slidesPerView: 1.3,
    spaceBetween: 12,
    grabCursor: true,
    breakpoints: {
      640: {
        slidesPerView: 2.3,
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 16,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });
</script>

<template>
  <section
    :class="[index % 2 === 0 ? 'bg-white' : 'bg-brand-50']"
    class="py-14 md:py-20"
  >
    <div class="container flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl lg:text-3xl font-medium text-gray-800">
          {{ collection.title }}
        </h2>
      </div>

      <div
        v-if="!displayServices.length"
        class="rounded-2xl border border-gray-100 bg-gray-50/80 py-12 px-4 text-center text-gray-500"
      >
        {{ $t('services.empty.title') }}
      </div>

      <!-- Swiper -->
      <ClientOnly v-else>
        <div class="relative">
          <swiper-container ref="swiperContainer" :id="`collectionSwiper-${index}`">
            <swiper-slide v-for="service in displayServices" :key="service.id">
              <HomeCollectionServiceCard :service="service" />
            </swiper-slide>
          </swiper-container>

          <!-- Navigation Arrows -->
          <button
            v-if="displayServices.length > 1"
            @click="swiper?.prev()"
            class="max-md:hidden hover:bg-brand-50 z-10 absolute top-[35%] -start-4 flex items-center justify-center w-10 h-10 rounded-full border border-brand-500 text-brand-500 bg-white shadow-sm"
          >
            <svg class="w-6 h-6 ltr:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
            </svg>
          </button>

          <button
            v-if="displayServices.length > 1"
            @click="swiper?.next()"
            class="max-md:hidden hover:bg-brand-50 z-10 absolute top-[35%] -end-4 flex items-center justify-center w-10 h-10 rounded-full border border-brand-500 text-brand-500 bg-white shadow-sm"
          >
            <svg class="w-6 h-6 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
            </svg>
          </button>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
  @reference "tailwindcss";

  [id^="collectionSwiper-"] {
    width: 100%;
    padding-bottom: 8px;
  }
</style>
