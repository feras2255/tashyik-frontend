<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const props = defineProps({
    service: {
      type: Object,
      required: true,
    },
  });

  const serviceSlug = computed(() => resolveEntitySlug(props.service));

  function stripTags(html) {
    if (!html) return '';
    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const snippetPlain = computed(() => {
    if (props.service.card_description) {
      return props.service.card_description;
    }
    if (props.service.description) {
      return stripTags(props.service.description).slice(0, 280);
    }
    return '';
  });
</script>

<template>
  <NuxtLinkLocale
    :to="{ name: 'services-service', params: { service: serviceSlug } }"
    class="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-[220px] md:w-full h-full"
  >
    <!-- Image -->
    <div class="relative bg-gray-100 w-full aspect-[4/3] overflow-hidden shrink-0">
      <AppLazyImage
        :src="service.image"
        :alt="service.name"
        wrapper-class="absolute inset-0"
        img-class="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Discount Badge -->
      <div
        v-if="service.price.has_discount"
        class="absolute top-3 start-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md z-10"
      >
        {{ $t('common.promotion', { percentage: service.price.discount_percintage }) }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col p-4 md:p-5 bg-white grow text-center">
      <!-- Name -->
      <h3 class="text-base md:text-lg font-bold text-gray-900 text-center line-clamp-1 mb-1">
        {{ service.name }}
      </h3>

      <!-- Description -->
      <p v-if="snippetPlain" class="text-sm text-gray-500 text-center line-clamp-2 mb-3 leading-relaxed min-h-[40px]">
        {{ snippetPlain }}
      </p>
      <div v-else class="min-h-[40px] mb-3" />

      <!-- Spacer -->
      <div class="grow" />

      <!-- Price Row -->
      <div class="flex items-center justify-center gap-3 mt-2 mb-4">
        <span v-if="service.price.original > 0" class="text-lg font-bold text-brand-700">
          {{ service.price.after_discount }} {{ $t('cities.price_currency') }}
        </span>
        <span v-else class="text-lg font-bold text-brand-700">
          {{ $t('common.no_price') }}
        </span>

        <del v-if="service.price.has_discount" class="text-sm text-gray-400">
          {{ service.price.original }} {{ $t('cities.price_currency') }}
        </del>
      </div>

      <!-- Action Button -->
      <div
        class="mt-auto w-full flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
        style="height: 48px; border-radius: 12px; background: #7a3e98"
      >
        {{ $t('common.order_now') }}
      </div>
    </div>
  </NuxtLinkLocale>
</template>
