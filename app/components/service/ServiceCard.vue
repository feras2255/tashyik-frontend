<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const props = defineProps({
    service: {
      type: Object,
      required: true,
    },
    /** When set, "عرض التفاصيل" opens the city landing URL and order link carries `?city=`. */
    citySlug: {
      type: String,
      default: null,
    },
    /** Highlights matching substring in the title (client-side search). */
    highlightQuery: {
      type: String,
      default: '',
    },
  });

  function stripTags(html) {
    if (!html) {
      return '';
    }

    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const displayName = computed(() => {
    const n = props.service.name;

    if (typeof n === 'string') {
      return n;
    }

    if (n && typeof n === 'object') {
      return n.ar || n.en || Object.values(n).find(Boolean) || '';
    }

    return '';
  });

  const nameSegments = computed(() => {
    const name = displayName.value;
    const q = props.highlightQuery.trim();

    if (!q || !name) {
      return [{ text: name, mark: false }];
    }

    const lower = name.toLocaleLowerCase('ar');
    const qq = q.toLocaleLowerCase('ar');
    const idx = lower.indexOf(qq);

    if (idx === -1) {
      return [{ text: name, mark: false }];
    }

    const end = idx + q.length;

    return [
      { text: name.slice(0, idx), mark: false },
      { text: name.slice(idx, end), mark: true },
      { text: name.slice(end), mark: false },
    ].filter((s) => s.text.length > 0 || s.mark);
  });

  const snippetPlain = computed(() => {
    if (props.service.card_description) {
      return props.service.card_description;
    }

    return stripTags(props.service.description || '').slice(0, 280);
  });

  const hasHighlights = computed(() => Array.isArray(props.service.highlights) && props.service.highlights.length > 0);

  const serviceSlug = computed(() => resolveEntitySlug(props.service));

  const detailsTo = computed(() =>
    props.citySlug
      ? { name: 'services-service-in-city', params: { service: serviceSlug.value, city: props.citySlug } }
      : { name: 'services-service', params: { service: serviceSlug.value } },
  );

  const orderTo = computed(() => ({
    name: 'services-service-order',
    params: { service: serviceSlug.value },
    ...(props.citySlug ? { query: { city: props.citySlug } } : {}),
  }));
</script>

<template>
  <NuxtLinkLocale
    :to="detailsTo"
    class="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-[220px] md:w-full h-full"
    :aria-label="displayName"
  >
    <!-- Image -->
    <div class="relative bg-gray-100 w-full aspect-[4/3] overflow-hidden">
      <img
        v-if="service.image"
        :src="service.image"
        :alt="service.image_alt?.[$i18n.locale] || service.image_alt || $t('alt.service', { service: displayName })"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
        <svg class="h-14 w-14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008H12V8.25Z" />
        </svg>
      </div>

      <!-- Warranty Badge -->
      <WarrantyBadge v-if="service.warranty_duration" :duration="service.warranty_duration" class="absolute start-3 top-3 z-10" />

      <!-- Promotional Badge (If we have both warranty and promotion, place promotion below) -->
      <div
        v-if="service.price?.has_discount"
        class="absolute top-3 end-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md z-10"
      >
        {{ $t('common.promotion', { percentage: service.price.discount_percintage }) }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col p-4 md:p-5 bg-white grow text-center">

      <!-- Badge (Custom Badge) -->
      <div v-if="service.badge" class="mb-2">
        <span class="inline-flex items-center gap-1 whitespace-nowrap rounded border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
          <svg class="h-3.5 w-3.5 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ service.badge }}
        </span>
      </div>

      <!-- Name -->
      <h3 class="text-base md:text-lg font-bold text-gray-900 text-center line-clamp-1 mb-1">
        <template v-for="(seg, i) in nameSegments" :key="i">
          <mark v-if="seg.mark" class="rounded bg-brand-100 px-0.5 text-brand-900">{{ seg.text }}</mark>
          <span v-else>{{ seg.text }}</span>
        </template>
      </h3>

      <!-- Description -->
      <div class="mb-3">
        <p v-if="snippetPlain" class="text-sm text-gray-500 text-center line-clamp-2 leading-relaxed min-h-[40px]">
          {{ snippetPlain }}
        </p>
        <div v-else class="min-h-[40px]"></div>
      </div>

      <!-- Spacer -->
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
      <!-- We use .prevent so clicking the button can optionally navigate to orderTo if needed, 
           but since the parent is a NuxtLink to detailsTo, maybe we should stop propagation? 
           For OfferServiceCard, the button is just a styled div. We'll do the same. -->
      <div class="mt-auto w-full flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity" style="height: 48px; border-radius: 12px; background: #7A3E98;">
        {{ $t('service.actions.order_now') }}
      </div>
    </div>
  </NuxtLinkLocale>
</template>
