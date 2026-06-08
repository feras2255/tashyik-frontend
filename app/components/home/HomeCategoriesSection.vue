<script setup>
  const route = useRoute();
  const apiFetch = useApiFetchClient();
  const { locale } = useI18n();

  const { data, error } = await useAsyncData(
    () => `home-categories-${locale.value}-${route.fullPath}`,
    () => apiFetch('/categories'),
  );

  watch(error, (e) => {
    if (e) console.error('Failed to load categories:', e);
  });

  const categories = computed(() => data.value?.data ?? data.value ?? []);
  const top6Categories = computed(() => categories.value.slice(0, 6));
  const isLoading = computed(() => !data.value && !error.value);
</script>

<template>
  <section class="py-14 md:py-26">
    <div class="container flex flex-col gap-5">
      <div class="flex flex-row gap-3 sm:gap-5 justify-between items-center flex-wrap">
        <h2 v-text="$t('home.categories.title')" class="text-xl lg:text-4xl font-medium text-gray-800"></h2>
        <ButtonsOutline class="max-md:hidden min-h-12 min-w-12 inline-flex items-center justify-center">
          <NuxtLinkLocale :to="{ name: 'categories' }" class="inline-flex items-center justify-center min-h-12 px-2">
            {{ $t('home.categories.action') }}
          </NuxtLinkLocale>
        </ButtonsOutline>
      </div>

      <div v-if="isLoading">
        <div class="w-full h-[260px] md:h-[500px] rounded-2xl bg-gray-100 animate-pulse flex flex-col items-center justify-center p-8 gap-2">
          <div class="bg-gray-200 w-16 h-16 rounded-lg mb-3"></div>
          <div class="h-5 w-40 rounded-full bg-gray-200"></div>
          <div class="h-5 w-64 rounded-full bg-gray-200"></div>
        </div>
      </div>

      <div v-else>
        <div class="grid grid-cols-3 gap-1 md:gap-5">
          <CategoryLink v-for="category in top6Categories" :key="category.id" :category="category" />
        </div>
      </div>

      <ButtonsOutline class="md:hidden block mx-auto min-h-12 min-w-12">
        <NuxtLinkLocale :to="{ name: 'categories' }" class="inline-flex items-center justify-center min-h-12 w-full">
          {{ $t('home.categories.action') }}
        </NuxtLinkLocale>
      </ButtonsOutline>
    </div>
  </section>
</template>

<style scoped>
  @reference "tailwindcss";
</style>
