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

  const homeSeoTitle = computed(() => t('seo.home.title'));

  useHead({
    title: homeSeoTitle,
  });

  useSeoMeta({
    title: homeSeoTitle,
    ogTitle: homeSeoTitle,
    description: () => t('seo.home.description') || description,
    ogDescription: () => t('seo.home.description') || description,
    twitterTitle: () => t('seo.home.title'),
    twitterDescription: () => t('seo.home.description') || description,
    twitterCard: 'summary_large_image',
  });
</script>

<template>
  <main>
    <HomeHeroSection />

    <HomeOffersSection />
    <HomeCategoriesSection />
    <HomeCollectionsSection :start="0" :end="1" :max-services="5" />
    <HomeCollectionsSection :start="1" :max-services="10" />
    <HomeQuestionsSection />

    <HomeFeaturesSection />
    <HomeNewsletterSection />
    <HomeReviewsSection />
    <HomeTopRatedSection />
    <DownloadAppSection />
  </main>
</template>
