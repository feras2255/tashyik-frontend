<script setup>
  const props = defineProps({
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    wrapperClass: {
      type: String,
      default: '',
    },
    imgClass: {
      type: String,
      default: 'w-full h-full object-cover',
    },
  });

  const loaded = ref(false);
  const errored = ref(false);

  function markLoaded() {
    loaded.value = true;
  }

  function markError() {
    errored.value = true;
    loaded.value = true;
  }

  watch(
    () => props.src,
    () => {
      loaded.value = false;
      errored.value = false;
    },
  );
</script>

<template>
  <div class="relative overflow-hidden bg-gray-100" :class="wrapperClass">
    <div v-if="!loaded" class="absolute inset-0 home-shimmer" aria-hidden="true" />

    <img
      v-if="src && !errored"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      fetchpriority="low"
      :class="[imgClass, loaded ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-300']"
      @load="markLoaded"
      @error="markError"
    />
  </div>
</template>
