<script setup>
  const props = defineProps({
    duration: {
      type: String,
      required: true,
    },
  });

  const { t } = useI18n();

  /** Avoid "ضمان لمدة ضمان لمدة …" when API already returns a full label (legacy/cache). */
  const label = computed(() => {
    const value = props.duration?.trim() ?? '';

    if (/^ضمان\b/i.test(value) || /^warranty\b/i.test(value)) {
      return value;
    }

    return t('common.warranty', { duration: value });
  });
</script>

<template>
  <div
    class="me-4 inline-flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 stroke-green-700 shadow-sm sm:text-sm"
  >
    <svg
      class="h-4 w-4 shrink-0"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.00033 14.6668C8.00033 14.6668 13.3337 12.0002 13.3337 8.00016V3.3335L8.00033 1.3335L2.66699 3.3335V8.00016C2.66699 12.0002 8.00033 14.6668 8.00033 14.6668Z"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M10.6663 6L6.99967 9.66667L5.33301 8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="truncate">{{ label }}</span>
  </div>
</template>
