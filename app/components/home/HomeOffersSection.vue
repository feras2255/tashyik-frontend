<script setup>
  const { fetchServicesPage } = useServiceFetchers();

  const { data: discountedServices, pending } = await useAsyncData(
    'home-discounted-services',
    async () => {
      const res = await fetchServicesPage({ page: 1, perPage: 24 });
      const services = res?.data || [];
      return services.filter(s => s.price?.has_discount).slice(0, 7);
    }
  );
</script>

<template>
  <!-- Only show this section if there are actual discounted services -->
  <section v-if="discountedServices?.length" class="py-8 md:py-14 bg-[#FCFAFF]">
    <div class="container flex flex-col gap-10">

      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl lg:text-4xl font-bold text-brand-700 mb-3">
          {{ $t('home.offers.title') }}
        </h2>
        <p class="text-base md:text-lg text-gray-500">
          {{ $t('home.offers.description') }}
        </p>
      </div>

      <!-- Promo Banner Grid (3 images) -->
      <div v-if="discountedServices.length >= 3" class="flex flex-col lg:flex-row gap-4 h-auto lg:h-[480px]">
        
        <!-- Large Banner (Right side in RTL) -->
        <div v-if="discountedServices[0]" class="relative rounded-2xl overflow-hidden group flex-1 lg:flex-[1.8] h-64 lg:h-full">
          <img
            :src="discountedServices[0].image"
            :alt="discountedServices[0].name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <!-- Badge -->
          <div class="absolute top-4 start-4 bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            {{ $t('home.collections.season_badge') }}
          </div>
          <!-- Content -->
          <div class="absolute bottom-0 start-0 end-0 p-6 md:p-8 text-white">
            <p class="text-sm md:text-base font-medium opacity-90 mb-2">{{ $t('home.offers.free_inspection') }}</p>
            <h3 class="text-2xl md:text-4xl font-bold leading-tight">
              {{ $t('home.offers.discount_on_service', { percentage: discountedServices[0]?.price?.discount_percintage, name: discountedServices[0]?.name }) }}
            </h3>
          </div>
        </div>

        <!-- Left Side Stack (Small Banners) -->
        <div class="flex flex-col gap-4 flex-1 lg:flex-[0.8] h-auto lg:h-full">
           <!-- Small Banner Top -->
           <div v-if="discountedServices[1]" class="relative rounded-2xl overflow-hidden group h-40 lg:h-auto lg:flex-1">
              <img
                :src="discountedServices[1].image"
                :alt="discountedServices[1].name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div class="absolute bottom-0 start-0 end-0 p-4 text-white">
                <p class="text-xs font-medium opacity-90 mb-1">{{ $t('home.offers.first_order_maintenance') }}</p>
                <h3 class="text-base md:text-lg font-bold leading-tight">
                  {{ $t('home.offers.free_inspection_for', { name: discountedServices[1]?.name }) }}
                </h3>
              </div>
           </div>
           <!-- Small Banner Bottom -->
           <div v-if="discountedServices[2]" class="relative rounded-2xl overflow-hidden group h-40 lg:h-auto lg:flex-1">
              <img
                :src="discountedServices[2].image"
                :alt="discountedServices[2].name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div class="absolute bottom-0 start-0 end-0 p-4 text-white">
                <p class="text-xs font-medium opacity-90 mb-1">{{ $t('home.offers.plumbing_saving') }}</p>
                <h3 class="text-base md:text-lg font-bold leading-tight">
                  {{ $t('home.offers.discount_on_service', { percentage: discountedServices[2]?.price?.discount_percintage, name: discountedServices[2]?.name }) }}
                </h3>
              </div>
           </div>
        </div>

      </div>

      <!-- Services Grid (cards below the banners) -->
      <div v-if="discountedServices.length > 3" class="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 xl:gap-6 scrollbar-hide mt-4">
        <HomeOfferServiceCard
          v-for="service in discountedServices.slice(3, 7)"
          :key="service.id"
          :service="service"
          class="shrink-0 md:w-auto"
        />
      </div>
      <!-- Fallback if there are less than 3 services (just show cards) -->
      <div v-else-if="discountedServices.length > 0 && discountedServices.length < 3" class="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 xl:gap-6 scrollbar-hide">
        <HomeOfferServiceCard
          v-for="service in discountedServices"
          :key="service.id"
          :service="service"
          class="shrink-0 md:w-auto"
        />
      </div>



    </div>
  </section>
</template>
