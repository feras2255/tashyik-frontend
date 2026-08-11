<script setup>
  defineProps({
    service: { type: Object, required: true },
    city: { type: Object, required: true },
    orderLink: { type: [Object, String], required: true },
    whatsappHref: { type: String, default: null },
  });

  const { t } = useI18n();
  const { staticAsset } = useStaticAsset();
</script>

<template>
  <!-- Desktop sticky sidebar -->
  <aside class="lg:col-span-4">
    <div class="hidden lg:block lg:sticky lg:top-24">
      <div class="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-brand-50/30 p-6 shadow-md">
        <p class="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {{ t('cities.service_in_city_sidebar_summary') }}
        </p>
        <p class="mt-3 text-lg font-semibold text-gray-900">{{ service.name }}</p>
        <p class="mt-1 text-sm text-gray-600">{{ city.name }}</p>

        <div v-if="service.price?.after_discount != null && service.price.after_discount !== ''" class="mt-6">
          <p class="text-xs text-gray-500">{{ t('cities.service_in_city_price_label') }}</p>
          <p class="mt-1 text-3xl font-semibold text-gray-900">
            {{ service.price.after_discount }}
            <span class="text-lg font-normal text-gray-600">{{ service.price.currency }}</span>
          </p>
          <del v-if="service.price.has_discount && service.price.original > 0" class="mt-1 block text-sm text-gray-400">
            {{ service.price.original }} {{ service.price.currency }}
          </del>
        </div>
        <p v-else class="mt-6 text-sm text-gray-600">{{ t('common.no_price') }}</p>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <img class="h-6 shrink-0" :src="staticAsset('tabby-tamara.webp')" alt="Tabby & Tamara" loading="lazy" width="120" height="24" />
        </div>

        <div v-if="service.warranty_duration" class="mt-5">
          <WarrantyBadge :duration="service.warranty_duration" class="me-0 w-full justify-center" />
        </div>

        <NuxtLinkLocale :to="orderLink" class="mt-6 block w-full">
          <ButtonsFilled class="w-full justify-center py-3.5 text-base">
            {{ t('cities.service_in_city_cta_order_now') }}
          </ButtonsFilled>
        </NuxtLinkLocale>

        <a
          v-if="whatsappHref"
          :href="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500 bg-transparent py-3.5 text-base font-medium text-brand-500 hover:bg-brand-100/50 focus:z-10 focus:outline-none focus:ring-4 focus:ring-brand-100"
        >
          <svg
            class="h-5 w-5 shrink-0 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.96 9.96 0 0 1 2 12"
              clip-rule="evenodd"
            />
            <path
              d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308"
            />
          </svg>
          {{ t('cities.service_in_city_whatsapp_cta') }}
        </a>

        <p class="mt-4 text-center text-xs text-gray-500">
          <span aria-hidden="true">🔒</span>
          {{ ' ' }}
          {{ t('cities.service_in_city_trust_secure_pay') }}
        </p>
      </div>
    </div>
  </aside>

  <!-- Mobile sticky booking bar -->
  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
  >
    <div class="container mx-auto flex max-w-6xl flex-col gap-2">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-gray-900">{{ service.name }}</p>
          <p class="truncate text-xs text-gray-500">{{ city.name }}</p>
        </div>
        <div v-if="service.price?.after_discount != null && service.price.after_discount !== ''" class="shrink-0 text-end">
          <p class="text-[10px] text-gray-500">{{ t('cities.service_in_city_price_label') }}</p>
          <p class="text-lg font-bold text-gray-900">
            {{ service.price.after_discount }}
            <span class="text-xs font-normal text-gray-600">{{ service.price.currency }}</span>
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <NuxtLinkLocale class="min-w-0 flex-1" :to="orderLink">
          <ButtonsFilled class="w-full justify-center py-3 text-sm">
            {{ t('cities.service_in_city_cta_order_now') }}
          </ButtonsFilled>
        </NuxtLinkLocale>
        <a
          v-if="whatsappHref"
          :href="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex shrink-0 items-center justify-center rounded-lg border border-brand-500 px-3 py-3 text-brand-500 hover:bg-brand-100/50 focus:outline-none focus:ring-4 focus:ring-brand-100"
          :aria-label="t('cities.service_in_city_whatsapp_cta')"
        >
          <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.96 9.96 0 0 1 2 12"
              clip-rule="evenodd"
            />
            <path
              d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308"
            />
          </svg>
        </a>
      </div>
      <p class="text-center text-[10px] text-gray-500">
        <span aria-hidden="true">🔒</span>
        {{ ' ' }}
        {{ t('cities.service_in_city_trust_secure_pay') }}
      </p>
    </div>
  </div>
</template>
