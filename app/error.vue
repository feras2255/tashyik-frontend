<script setup>
  const { t } = useI18n();
  const props = defineProps({
    error: {
      type: Object,
      default: () => ({}),
    },
  });

  const statusCode = computed(() => Number(props.error?.statusCode) || 500);
  const is404 = computed(() => statusCode.value === 404);

  const event = useRequestEvent();

  if (import.meta.server && event) {
    setResponseStatus(event, statusCode.value);
  }

  useSeoMeta({
    title: () => (is404.value ? t('common.page_not_found') : t('common.something_went_wrong')),
    robots: 'noindex, nofollow',
  });

  function clearAndGoHome() {
    clearError({ redirect: '/' });
  }
</script>

<template>
  <div class="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
    <p class="text-sm font-medium text-brand-600" v-text="statusCode" />

    <h1 class="mt-4 text-2xl md:text-3xl font-medium text-gray-900 text-center">
      {{ is404 ? $t('common.page_not_found') : $t('common.something_went_wrong') }}
    </h1>

    <p v-if="!is404 && error?.message" class="mt-3 text-gray-500 max-w-md text-sm text-center break-words">
      {{ error.message }}
    </p>

    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
        @click="clearAndGoHome"
      >
        {{ $t('navigation.home') }}
      </button>
    </div>
  </div>
</template>
