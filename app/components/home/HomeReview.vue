<script setup>
  defineProps({
    review: {
      type: Object,
      required: true,
    },
  });
</script>

<template>
  <div class="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header: User Info & Date -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img :src="review.image" class="w-12 h-12 rounded-full object-cover" alt="User Avatar" loading="lazy" />
        <span v-text="review.name" class="font-bold text-gray-900"></span>
      </div>
      <span v-text="review.date" class="text-gray-400 text-sm"></span>
    </div>

    <!-- Stars -->
    <div class="flex items-center gap-1">
      <svg v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>

    <!-- Review Body -->
    <p v-text="review.body" class="text-gray-600 leading-relaxed text-sm md:text-base"></p>

    <!-- Tag/Badge -->
    <div class="mt-2 flex">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
        <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ review.tag || 'صيانة' }}</span>
      </div>
    </div>
  </div>
</template>

