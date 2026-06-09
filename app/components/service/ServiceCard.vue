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
  <div
    class="group relative flex shrink-0 flex-col rounded-2xl bg-white shadow transition-shadow duration-200 hover:shadow-xl static-color"
    style="width: 300px; min-width: 300px; max-width: 300px; flex: 0 0 300px;"
  >
    <!--
      Whole-card crawlable link: keeps the visual-design "two button" footer
      while letting Googlebot follow the entire card to the detail URL. The
      visible buttons remain interactive — z-index ensures clicks on them
      route to their own destinations and not the card-cover anchor.
    -->
    <NuxtLinkLocale :to="detailsTo" class="absolute inset-0 z-10 rounded-2xl" :aria-label="displayName">
      <span class="sr-only">{{ displayName }}</span>
    </NuxtLinkLocale>

    <!-- Image -->
    <div class="aspect-video w-full shrink-0 overflow-hidden rounded-2xl rounded-b-none bg-gray-100 object-cover object-center">
      <img
        v-if="service.image"
        :src="service.image"
        :alt="service.image_alt?.[$i18n.locale] || service.image_alt || $t('alt.service', { service: displayName })"
        loading="lazy"
        decoding="async"
        width="640"
        height="360"
        class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
        <svg class="h-14 w-14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008H12V8.25Z" />
        </svg>
      </div>
    </div>

    <!-- Warranty -->
    <WarrantyBadge v-if="service.warranty_duration" :duration="service.warranty_duration" class="absolute start-4 top-4" />

    <div class="relative flex h-full w-full flex-col p-6">
      <!-- Promotional Badge -->
      <span
        v-if="service.badge"
        class="absolute -top-3.5 z-10 inline-flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 whitespace-nowrap rounded border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 shadow-sm md:-top-4 md:px-3 md:py-1.5 md:text-sm ltr:right-6 rtl:left-6"
      >
        <svg class="h-3.5 w-3.5 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
        {{ service.badge }}
      </span>
      <!-- Name -->
      <h3 class="text-xl font-semibold text-gray-800">
        <template v-for="(seg, i) in nameSegments" :key="i">
          <mark v-if="seg.mark" class="rounded bg-brand-100 px-0.5 text-brand-900">{{ seg.text }}</mark>
          <span v-else>{{ seg.text }}</span>
        </template>
      </h3>

      <!-- Highlights or short description -->
      <ul v-if="hasHighlights" class="my-6 flex list-disc flex-col gap-3 ps-6 text-gray-500 marker:text-xs">
        <li v-for="highlight of service.highlights" :key="highlight.id">
          <p v-text="highlight.title" class="line-clamp-2" />
        </li>
      </ul>
      <p v-else-if="snippetPlain" class="my-6 line-clamp-3 text-sm leading-relaxed text-gray-500">
        {{ snippetPlain }}
      </p>

      <div class="mt-auto flex flex-col gap-5">
        <hr class="border border-gray-200/70" />

        <!-- Promotion -->
        <AppBadge v-if="service.price?.has_discount" type="success" :title="$t('common.promotion', { percentage: service.price.discount_percintage })" />

        <!-- Price + BNPL -->
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div v-if="service.price?.original > 0" class="flex flex-col items-end gap-0.5 text-end">
            <span v-text="`${service.price.after_discount} ${service.price.currency}`" class="text-2xl font-semibold text-gray-900" />
            <del v-if="service.price.has_discount" v-text="`${service.price.original} ${service.price.currency}`" class="text-sm font-medium text-gray-400" />
          </div>
          <span v-else v-text="$t('common.no_price')" class="text-lg text-gray-800" />
          <img
            class="h-5 shrink-0 self-center sm:h-6"
            src="/images/tabby-tamara.webp"
            alt="Tabby & Tamara"
            loading="lazy"
            decoding="async"
            width="120"
            height="24"
          />
        </div>

        <!-- Actions -->
        <div class="relative z-20 flex flex-col gap-2 overflow-hidden sm:flex-row sm:items-stretch">
          <NuxtLinkLocale class="w-full" :to="orderTo">
            <ButtonsFilled class="w-full text-nowrap">
              {{ $t('service.actions.order_now') }}
            </ButtonsFilled>
          </NuxtLinkLocale>
          <NuxtLinkLocale class="w-full" :to="detailsTo">
            <ButtonsOutline class="w-full text-nowrap">
              {{ $t('service.actions.view_details') }}
            </ButtonsOutline>
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>
