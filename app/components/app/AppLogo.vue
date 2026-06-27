<script setup>
  const { logo } = useLayoutStore();
  const siteBrand = useSiteBrand();
</script>

<template>
  <img
    :class="`dark:hidden w-auto ${$attrs.class}`"
    width="121"
    height="39"
    :src="logo?.light_mode ?? '/images/logo-light-mode.webp'"
    :alt="siteBrand"
  />
  <img
    :class="`hidden dark:block w-auto ${$attrs.class}`"
    width="121"
    height="45"
    :src="logo?.dark_mode ?? '/images/logo-dark-mode.webp'"
    loading="lazy"
    :alt="siteBrand"
  />
</template>
