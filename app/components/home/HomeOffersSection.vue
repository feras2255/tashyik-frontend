<script setup>
  const { locale } = useI18n();
  const apiFetch = useApiFetchClient();

  const offers = ref([]);
  const pending = ref(true);

  async function loadOffers() {
    pending.value = true;

    try {
      const response = await apiFetch('/general/homepage-offers', { cache: 'no-store' });
      offers.value = Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to load homepage offers:', error);
      offers.value = [];
    } finally {
      pending.value = false;
    }
  }

  watch(locale, loadOffers);

  onMounted(loadOffers);

  const offerCount = computed(() => offers.value.length);

  const bannerCount = computed(() => {
    const count = offerCount.value;
    if (count <= 2) {
      return count;
    }
    if (count <= 4) {
      return 1;
    }
    if (count <= 5) {
      return 2;
    }

    return 3;
  });

  const bannerOffers = computed(() => offers.value.slice(0, bannerCount.value));
  const cardOffers = computed(() => offers.value.slice(bannerCount.value));

  const cardsGridClass = computed(() => {
    const count = cardOffers.value.length;
    if (count <= 1) {
      return 'grid grid-cols-1 gap-4';
    }
    if (count === 2) {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    }
    if (count === 3) {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }

    return 'flex items-stretch gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 xl:gap-6 scrollbar-hide';
  });

  const showSkeleton = computed(() => pending.value && !offers.value.length);
  const showSection = computed(() => showSkeleton.value || offers.value.length > 0);

  function discountHeadline(service) {
    return {
      percentage: service?.price?.discount_percintage,
      name: service?.name,
    };
  }

  const offerBannerImageClass =
    'offer-banner-img w-full h-full object-cover object-center transition-transform duration-500 md:group-hover:scale-105';

  const offerBannerHeroClass = 'relative rounded-2xl overflow-hidden group aspect-[3/2] w-full md:aspect-auto md:h-64 lg:h-full';

  const offerBannerCompactClass =
    'relative rounded-2xl overflow-hidden group aspect-[3/2] w-full md:aspect-auto md:h-48 lg:h-auto lg:flex-1';
</script>

<template>
  <HomeOffersSkeleton v-if="showSkeleton" />

  <section v-else-if="showSection" class="py-8 md:py-14 bg-[#FCFAFF]">
    <div class="container flex flex-col gap-10">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl lg:text-4xl font-bold text-brand-700 mb-3">
          {{ $t('home.offers.title') }}
        </h2>
        <p class="text-base md:text-lg text-gray-500">
          {{ $t('home.offers.description') }}
        </p>
      </div>

      <!-- 1 offer: single hero -->
      <div
        v-if="offerCount === 1 && offers[0]"
        class="relative rounded-2xl overflow-hidden group aspect-[3/2] w-full md:aspect-auto md:h-[420px]"
      >
        <AppLazyImage :src="offers[0].image" :alt="offers[0].name" wrapper-class="absolute inset-0" :img-class="offerBannerImageClass" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div class="absolute top-4 start-4 bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-10">
          {{ $t('home.collections.season_badge') }}
        </div>
        <div class="absolute bottom-0 start-0 end-0 p-6 md:p-8 text-white z-10">
          <p v-if="offers[0]?.badge" class="text-sm md:text-base font-medium opacity-90 mb-2">{{ offers[0]?.badge }}</p>
          <h3 class="text-2xl md:text-4xl font-bold leading-tight">
            {{ $t('home.offers.discount_on_service', discountHeadline(offers[0])) }}
          </h3>
        </div>
      </div>

      <!-- 2 offers: equal split -->
      <div v-else-if="offerCount === 2" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="service in offers"
          :key="service.id"
          class="relative rounded-2xl overflow-hidden group aspect-[3/2] w-full md:aspect-auto md:h-80"
        >
          <AppLazyImage :src="service.image" :alt="service.name" wrapper-class="absolute inset-0" :img-class="offerBannerImageClass" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div class="absolute bottom-0 start-0 end-0 p-5 text-white z-10">
            <p v-if="service?.badge" class="text-xs font-medium opacity-90 mb-1">{{ service?.badge }}</p>
            <h3 class="text-lg md:text-2xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', discountHeadline(service)) }}
            </h3>
          </div>
        </div>
      </div>

      <!-- 3–4 offers: one hero, rest as cards below -->
      <div v-else-if="bannerCount === 1 && offerCount >= 3" class="flex flex-col gap-4">
        <div v-if="bannerOffers[0]" :class="[offerBannerHeroClass, 'md:h-[360px]']">
          <AppLazyImage
            :src="bannerOffers[0].image"
            :alt="bannerOffers[0].name"
            wrapper-class="absolute inset-0"
            :img-class="offerBannerImageClass"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div class="absolute top-4 start-4 bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-10">
            {{ $t('home.collections.season_badge') }}
          </div>
          <div class="absolute bottom-0 start-0 end-0 p-6 md:p-8 text-white z-10">
            <p v-if="bannerOffers[0]?.badge" class="text-sm md:text-base font-medium opacity-90 mb-2">{{ bannerOffers[0]?.badge }}</p>
            <h3 class="text-2xl md:text-3xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[0])) }}
            </h3>
          </div>
        </div>
      </div>

      <!-- 5 offers: two hero banners -->
      <div v-else-if="bannerCount === 2" class="flex flex-col lg:flex-row gap-4 h-auto lg:h-[360px]">
        <div v-if="bannerOffers[0]" :class="[offerBannerHeroClass, 'flex-1 lg:flex-[1.6]']">
          <AppLazyImage
            :src="bannerOffers[0].image"
            :alt="bannerOffers[0].name"
            wrapper-class="absolute inset-0"
            :img-class="offerBannerImageClass"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div class="absolute top-4 start-4 bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-10">
            {{ $t('home.collections.season_badge') }}
          </div>
          <div class="absolute bottom-0 start-0 end-0 p-6 md:p-8 text-white z-10">
            <p v-if="bannerOffers[0]?.badge" class="text-sm md:text-base font-medium opacity-90 mb-2">{{ bannerOffers[0]?.badge }}</p>
            <h3 class="text-2xl md:text-3xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[0])) }}
            </h3>
          </div>
        </div>

        <div v-if="bannerOffers[1]" :class="[offerBannerHeroClass, 'flex-1']">
          <AppLazyImage
            :src="bannerOffers[1].image"
            :alt="bannerOffers[1].name"
            wrapper-class="absolute inset-0"
            :img-class="offerBannerImageClass"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div class="absolute bottom-0 start-0 end-0 p-4 md:p-6 text-white z-10">
            <p v-if="bannerOffers[1]?.badge" class="text-xs font-medium opacity-90 mb-1">{{ bannerOffers[1]?.badge }}</p>
            <h3 class="text-base md:text-xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[1])) }}
            </h3>
          </div>
        </div>
      </div>

      <!-- 6–7 offers: three hero banners -->
      <div v-else-if="bannerCount === 3" class="flex flex-col lg:flex-row gap-4 h-auto lg:h-[480px]">
        <div v-if="bannerOffers[0]" :class="[offerBannerHeroClass, 'flex-1 lg:flex-[1.8]']">
          <AppLazyImage
            :src="bannerOffers[0].image"
            :alt="bannerOffers[0].name"
            wrapper-class="absolute inset-0"
            :img-class="offerBannerImageClass"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div class="absolute top-4 start-4 bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-10">
            {{ $t('home.collections.season_badge') }}
          </div>
          <div class="absolute bottom-0 start-0 end-0 p-6 md:p-8 text-white z-10">
            <p v-if="bannerOffers[0]?.badge" class="text-sm md:text-base font-medium opacity-90 mb-2">{{ bannerOffers[0]?.badge }}</p>
            <h3 class="text-2xl md:text-4xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[0])) }}
            </h3>
          </div>
        </div>

        <div class="flex flex-col gap-4 flex-1 lg:flex-[0.8] h-auto lg:h-full">
          <div v-if="bannerOffers[1]" :class="offerBannerCompactClass">
            <AppLazyImage
              :src="bannerOffers[1].image"
              :alt="bannerOffers[1].name"
              wrapper-class="absolute inset-0"
              :img-class="offerBannerImageClass"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div class="absolute bottom-0 start-0 end-0 p-4 text-white z-10">
              <p v-if="bannerOffers[1]?.badge" class="text-xs font-medium opacity-90 mb-1">{{ bannerOffers[1]?.badge }}</p>
              <h3 class="text-base md:text-lg font-bold leading-tight">
                {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[1])) }}
              </h3>
            </div>
          </div>
          <div v-if="bannerOffers[2]" :class="offerBannerCompactClass">
            <AppLazyImage
              :src="bannerOffers[2].image"
              :alt="bannerOffers[2].name"
              wrapper-class="absolute inset-0"
              :img-class="offerBannerImageClass"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div class="absolute bottom-0 start-0 end-0 p-4 text-white z-10">
              <p v-if="bannerOffers[2]?.badge" class="text-xs font-medium opacity-90 mb-1">{{ bannerOffers[2]?.badge }}</p>
              <h3 class="text-base md:text-lg font-bold leading-tight">
                {{ $t('home.offers.discount_on_service', discountHeadline(bannerOffers[2])) }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards row (remaining offers with price + order button) -->
      <div v-if="cardOffers.length" :class="[cardsGridClass, bannerOffers.length ? 'mt-4' : '']">
        <HomeOfferServiceCard v-for="service in cardOffers" :key="service.id" :service="service" class="shrink-0 md:w-auto h-full" />
      </div>
    </div>
  </section>
</template>

<style scoped>
  @reference "tailwindcss";

  @media (max-width: 767px) {
    :deep(.offer-banner-img) {
      object-fit: cover;
      object-position: center 35%;
    }
  }
</style>
