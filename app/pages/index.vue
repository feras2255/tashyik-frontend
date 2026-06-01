<script setup>
  const { t } = useI18n();
  const { description } = useLayoutStore();

  const heroImageSrc = '/images/home-hero-section-622.webp';

  useHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: heroImageSrc,
        fetchpriority: 'high',
      },
    ],
  });

  const explicitTitle = computed(() => t('seo.home.title'));
  const explicitDescription = computed(() => t('seo.home.description'));
  const fallbackDescription = computed(() => description || explicitDescription.value);

  useSeoMeta({
    title: explicitTitle,
    ogTitle: explicitTitle,
    description: fallbackDescription,
    ogDescription: fallbackDescription,
    twitterTitle: explicitTitle,
    twitterDescription: fallbackDescription,
    twitterCard: 'summary_large_image',
  });
</script>

<template>
  <!-- Hero Section -->
  <HomeHeroSection />

  <!-- Featured Collection (first one, teaser) -->
  <HomeCollectionsSection :start="0" :end="1" :max-services="5" />

  <!-- Categories Section -->
  <HomeCategoriesSection />

  <!-- Remaining Collections -->
  <HomeCollectionsSection :start="1" :max-services="10" />

  <!-- Features -->
  <HomeFeaturesSection />

  <!-- Reviews Section -->
  <HomeReviewsSection />

  <!-- Download App -->
  <DownloadAppSection />

  <!-- Questions Section -->
  <HomeQuestionsSection />
</template>
