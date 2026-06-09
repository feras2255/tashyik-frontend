<script setup>
  const { t } = useI18n();

  const reviews = [
    {
      name: t('home.reviews.item_1.name'),
      body: t('home.reviews.item_1.body'),
      date: t('home.reviews.item_1.date'),
      image: '/images/review-1.webp',
      tag: 'صيانة',
    },
    {
      name: t('home.reviews.item_2.name'),
      body: t('home.reviews.item_2.body'),
      date: t('home.reviews.item_2.date'),
      image: '/images/review-2.webp',
      tag: 'تكييفات',
    },
    {
      name: t('home.reviews.item_3.name'),
      body: t('home.reviews.item_3.body'),
      date: t('home.reviews.item_3.date'),
      image: '/images/review-3.webp',
      tag: 'تكييفات',
    },
    {
      name: t('home.reviews.item_4.name'),
      body: t('home.reviews.item_4.body'),
      date: t('home.reviews.item_4.date'),
      image: '/images/review-1.webp',
      tag: 'سباكة',
    },
  ];
</script>

<template>
  <section class="py-8 md:py-14 bg-white">
    <div class="container px-4">
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 md:mb-12">
        {{ $t('home.reviews.title') }}
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HomeReview v-for="(review, index) in reviews" :key="index" :review="review" />
      </div>
    </div>
  </section>
</template>
