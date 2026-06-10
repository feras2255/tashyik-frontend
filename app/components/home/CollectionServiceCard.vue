<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const props = defineProps({
    service: {
      type: Object,
      required: true,
    },
  });

  const serviceSlug = computed(() => resolveEntitySlug(props.service));
  const { fetchServiceBySlug } = useServiceFetchers();

  // Local description ref - falls back to fetched data
  const fetchedDescription = ref('');

  function stripTags(html) {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const snippetPlain = computed(() => {
    if (props.service.card_description) {
      return props.service.card_description;
    }
    if (props.service.description) {
      return stripTags(props.service.description).slice(0, 280);
    }
    if (fetchedDescription.value) {
      return stripTags(fetchedDescription.value).slice(0, 280);
    }
    return '';
  });

  // Fetch description if not provided by collections API
  onMounted(async () => {
    if (!props.service.description && !props.service.card_description && serviceSlug.value) {
      try {
        const res = await fetchServiceBySlug(serviceSlug.value);
        if (res?.data?.description) {
          fetchedDescription.value = res.data.description;
        }
      } catch {
        // silently ignore
      }
    }
  });
</script>

<template>
  <NuxtLinkLocale
    :to="{ name: 'services-service', params: { service: serviceSlug } }"
    class="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-full"
  >
    <!-- Image -->
    <div class="relative bg-gray-100 w-full aspect-[4/3] overflow-hidden shrink-0">
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
        {{ $t('common.promotion', { percentage: service.price.discount_percintage }) }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col p-4 md:p-5 bg-white grow text-center relative">
      <!-- Promotional Badge Force HMR -->
      <span v-if="service.badge" class="absolute -top-3.5 md:-top-4 rtl:left-4 ltr:right-4 inline-flex items-center gap-1 bg-brand-50 text-brand-700 font-medium px-2.5 md:px-3 py-1 md:py-1.5 rounded shadow-sm border border-brand-100 z-10 w-fit text-xs md:text-sm whitespace-nowrap">
        <svg class="w-3.5 h-3.5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {{ service.badge }}
      </span>

      <!-- Name -->
      <h3 class="text-base md:text-lg font-bold text-gray-900 text-center line-clamp-1 mb-1">
        {{ service.name }}
      </h3>

      <!-- Description -->
      <p v-if="snippetPlain" class="text-sm text-gray-500 text-center line-clamp-2 mb-3 leading-relaxed min-h-[40px]">
        {{ snippetPlain }}
      </p>
      <div v-else class="min-h-[40px] mb-3"></div>

      <div class="grow"></div>

      <!-- Price Row -->
      <div class="flex items-center justify-center gap-3 mt-2 mb-4">
        <span v-if="service.price?.original > 0" class="text-lg font-bold text-brand-700">
          {{ service.price.after_discount }} {{ $t('cities.price_currency') }}
        </span>
        <span v-else class="text-lg font-bold text-brand-700">
          {{ $t('common.no_price') }}
        </span>

        <del v-if="service.price?.has_discount" class="text-sm text-gray-400">
          {{ service.price.original }} {{ $t('cities.price_currency') }}
        </del>
      </div>

      <!-- Action Button -->
      <div class="mt-auto w-full flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity" style="height: 48px; border-radius: 12px; background: #7A3E98;">
        {{ $t('common.order_now') }}
      </div>
    </div>
  </NuxtLinkLocale>
</template>
