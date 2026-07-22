<script setup>
  import { storeToRefs } from 'pinia';

  const layout = useLayoutStore();
  const { logo } = storeToRefs(layout);
  const siteBrand = useSiteBrand();
  const { staticAsset } = useStaticAsset();

  const lightLogo = computed(() => logo.value?.light_mode || staticAsset('logo-light-mode.webp'));
  const darkLogo = computed(() => logo.value?.dark_mode || staticAsset('logo-dark-mode.webp'));
</script>

<template>
  <img :class="`dark:hidden w-auto ${$attrs.class}`" width="121" height="39" :src="lightLogo" :alt="siteBrand" />
  <img :class="`hidden dark:block w-auto ${$attrs.class}`" width="121" height="45" :src="darkLogo" loading="lazy" :alt="siteBrand" />
</template>
