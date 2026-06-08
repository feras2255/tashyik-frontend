<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const props = defineProps({
    service: {
      type: Object,
      required: true,
    },
  });

  const serviceSlug = computed(() => resolveEntitySlug(props.service));
</script>

<template>
  <NuxtLinkLocale
    :to="{ name: 'services-service', params: { service: serviceSlug } }"
    class="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
  >
    <!-- Image -->
    <div class="relative bg-gray-100 w-full aspect-[4/3] overflow-hidden">
      <img
        :src="service.image"
        :alt="service.name"
        loading="lazy"
        class="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Discount Badge -->
      <div
        v-if="service.price.has_discount"
        class="absolute top-3 start-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md z-10"
      >
        خصم {{ service.price.discount_percintage }}%
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col p-4 md:p-5 bg-white grow">

      <!-- Name -->
      <h3 class="text-base md:text-lg font-bold text-gray-900 text-start line-clamp-1 mb-1">
        {{ service.name }}
      </h3>

      <!-- Description -->
      <p v-if="service.description" class="text-sm text-gray-500 text-start line-clamp-2 mb-3 leading-relaxed">
        {{ service.description }}
      </p>

      <!-- Spacer -->
      <div class="grow"></div>

      <!-- Price Row -->
      <div class="flex items-center gap-3 mt-2">
        <span v-if="service.price.original > 0" class="text-lg font-bold text-brand-700">
          {{ service.price.after_discount }} {{ service.price.currency }}
        </span>
        <span v-else class="text-lg font-bold text-brand-700">
          {{ $t('common.no_price') }}
        </span>

        <del v-if="service.price.has_discount" class="text-sm text-gray-400">
          {{ service.price.original }} {{ service.price.currency }}
        </del>
      </div>
    </div>
  </NuxtLinkLocale>
</template>
