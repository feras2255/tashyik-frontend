<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const categories = ref(null);

  const { staticAsset } = useStaticAsset();
  const defaultOg = computed(() => staticAsset('og.webp'));

  useSeoMeta({
    title: t('seo.categories.title'),
    ogTitle: t('seo.categories.title'),
    description: t('seo.categories.description'),
    ogDescription: t('seo.categories.description'),
    ogImage: defaultOg,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seo.categories.title'),
    twitterDescription: t('seo.categories.description'),
    twitterImage: defaultOg,
  });

  try {
    const response = await useApiFetch('/categories');

    categories.value = response.data;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }

  if (categories.value?.length) {
    const baseUrl = (config.public.appUrl || 'https://www.tashyik.com').replace(/\/$/, '');

    useHead({
      script: [
        {
          key: 'categories-itemlist-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: t('seo.categories.title'),
            itemListElement: categories.value.map((cat, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: cat.name,
              url: `${baseUrl}${localePath({ name: 'categories-category', params: { category: resolveEntitySlug(cat) } })}`,
            })),
          }),
        },
      ],
    });
  }
</script>

<template>
  <section class="container py-12 md:py-20 space-y-12 px-4">
    <div class="flex flex-col gap-5">
      <h1 v-text="$t('categories.title')" class="text-3xl md:text-4xl text-gray-800 font-medium"></h1>
      <h2 v-text="$t('categories.subtitle')" class="text-lg md:text-xl text-gray-500"></h2>
      <div class="flex flex-wrap gap-4">
        <NuxtLinkLocale :to="{ name: 'services' }" class="text-brand-600 hover:text-brand-700 font-medium text-base w-fit">
          {{ $t('navigation.services') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale :to="{ name: 'cities' }" class="text-brand-600 hover:text-brand-700 font-medium text-base w-fit">
          {{ $t('cities.browse_by_city') }}
        </NuxtLinkLocale>
      </div>
    </div>
    <div>
      <div class="flex flex-col md:grid grid-cols-2 lg:grid-cols-3 gap-5">
        <CategoryLink v-for="category of categories" :key="category.id" :category />
      </div>
    </div>
  </section>

  <!-- Ready to join section -->
  <ReadyToJoinSection :filled="true" />
</template>
