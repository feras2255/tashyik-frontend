<script setup>
  const apiFetch = useApiFetchClient();
  const { data: categoriesPayload, pending } = useHomeSection('categories', () => apiFetch('/categories'));

  const categories = computed(() => {
    const raw = categoriesPayload.value;
    if (Array.isArray(raw)) return raw;
    return raw?.data ?? [];
  });
</script>

<template>
  <section class="py-8 md:py-14">
    <div class="container flex flex-col gap-5">
      <div class="flex flex-row gap-3 sm:gap-5 justify-between items-center flex-wrap">
        <h2 class="text-xl lg:text-4xl font-medium text-gray-800" v-text="$t('home.categories.title')" />
        <ButtonsOutline class="max-md:hidden min-h-12 min-w-12 inline-flex items-center justify-center">
          <NuxtLinkLocale :to="{ name: 'categories' }" class="inline-flex items-center justify-center min-h-12 px-2">
            {{ $t('home.categories.action') }}
          </NuxtLinkLocale>
        </ButtonsOutline>
      </div>

      <HomeCategoriesSkeleton v-if="pending && !categories.length" />

      <div v-else>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
          <CategoryLink v-for="category in categories.slice(0, 8)" :key="category.id" :category="category" />
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
