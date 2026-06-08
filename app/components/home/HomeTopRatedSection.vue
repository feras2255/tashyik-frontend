<script setup>
  const providers = [
    {
      name: 'م. أحمد القحطاني',
      title: 'خبير صيانة تكييف',
      rating: 4.9,
      reviewsCount: 130,
      image: '/images/service-provider.webp', // Using existing fallback image
    },
    {
      name: 'خالد منصور',
      title: 'فني كهرباء معتمد',
      rating: 4.8,
      reviewsCount: 85,
      image: '/images/service-provider.webp',
    },
    {
      name: 'سارة الرويلي',
      title: 'مشرفة خدمات تنظيف',
      rating: 4.9,
      reviewsCount: 112,
      image: '/images/service-provider.webp',
    },
  ];
</script>

<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container px-4">
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 md:mb-12">
        الأعلى تقييماً
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(provider, index) in providers" :key="index" class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          
          <!-- Provider Info -->
          <div class="flex items-center gap-4">
            <img :src="provider.image" class="w-14 h-14 rounded-full object-cover" alt="Provider Avatar" loading="lazy" />
            <div class="flex flex-col">
              <span class="font-bold text-gray-900">{{ provider.name }}</span>
              <span class="text-sm text-gray-500">{{ provider.title }}</span>
            </div>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-1.5 flex-row-reverse">
            <svg class="w-5 h-5 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span class="font-medium text-gray-900">{{ provider.rating }}</span>
            <span class="text-xs text-gray-400">({{ provider.reviewsCount }})</span>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
