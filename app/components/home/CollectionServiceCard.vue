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
    class="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-200 transition-all duration-300 overflow-hidden static-color hover:border-brand-500"
  >
    <!-- Image -->
    <div class="relative bg-gray-100 w-full aspect-video overflow-hidden">
      <img
        :src="service.image"
        :alt="service.name"
        loading="lazy"
        class="w-full h-full object-center object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <!-- Discount Badge -->
      <div
        v-if="service.price.has_discount"
        class="absolute top-3 start-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
      >
        {{ $t('common.promotion', { percentage: service.price.discount_percintage }) }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col grow p-4 md:p-5 relative bg-white">
      <!-- Promotional Badge Force HMR -->
      <span v-if="service.badge" class="absolute -top-3.5 md:-top-4 rtl:left-4 ltr:right-4 inline-flex items-center gap-1 bg-brand-50 text-brand-700 font-medium px-2.5 md:px-3 py-1 md:py-1.5 rounded shadow-sm border border-brand-100 z-10 w-fit text-xs md:text-sm whitespace-nowrap">
        <svg class="w-3.5 h-3.5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {{ service.badge }}
      </span>

      <!-- Top Row: Price (Right) & Icon (Left) -->
      <div class="flex justify-between items-center mb-4">
        <!-- Price -->
        <div class="flex flex-col items-start text-start">
          <div v-if="service.price.original > 0" class="inline-flex items-center gap-1">
            <span class="text-[10px] md:text-xs text-[#14b8a6]">{{ $t('cities.service_in_city_price_label') }}</span>
            <span class="text-xs md:text-sm font-bold text-[#14b8a6]">
              {{ service.price.after_discount }} {{ service.price.currency }}
            </span>
          </div>
          <span v-else class="text-xs md:text-sm font-bold text-[#14b8a6]">{{ $t('common.no_price') }}</span>
          <del v-if="service.price.has_discount" class="text-[10px] text-gray-400 mt-0.5">
            {{ service.price.original }} {{ service.price.currency }}
          </del>
        </div>

        <!-- Icon -->
        <div class="w-6 h-6 text-[#7A3E98] flex items-center justify-center shrink-0">
          <img v-if="service.icon" :src="service.icon" class="w-full h-full object-contain" :alt="service.name" />
          <svg v-else class="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z" />
          </svg>
        </div>
      </div>

      <!-- Title & Category -->
      <div class="mb-2 text-right w-full" dir="rtl">
        <!-- Service Type (Bold, 24px, Purple) -->
        <span class="block mb-1" style="font-family: 'Tajawal', sans-serif; font-weight: 700; font-size: 24px; line-height: 32px; color: #7A3E98; text-align: right; vertical-align: middle;">
         {{ service.category?.name || service.parent_category?.name || service.category_name || service.type || ' صيانة' }}
        </span>
        <!-- Service Name (Regular, 16px, Dark Grey) -->
        <h3 class="line-clamp-2" style="font-family: 'Tajawal', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: #444651; text-align: right; vertical-align: middle;">
          {{ service.name }}
        </h3>
      </div>

      <!-- Description (نوع السيرفيز) - Hiding this if user considers service name as the last line, but keeping it empty or as is if it's there -->
      <p v-if="service.card_description || service.description" class="line-clamp-2 mb-2 w-full text-right" style="font-family: 'Tajawal', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: #444651; text-align: right; vertical-align: middle;" dir="rtl">
        {{ service.card_description || service.description }}
      </p>

    </div>
  </NuxtLinkLocale>
</template>
