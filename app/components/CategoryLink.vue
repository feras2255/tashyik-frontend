<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';

  const props = defineProps(['category', 'swiper']);

  const categorySlug = computed(() => resolveEntitySlug(props.category));
</script>

<template>
  <NuxtLinkLocale 
    :to="{ name: 'categories-category', params: { category: categorySlug } }" 
    class="group relative flex flex-col bg-white rounded-[12px] border border-[#C5C5D3] overflow-hidden hover:shadow-md transition-shadow h-full"
  >
    <!-- Top Image Area -->
    <div class="relative w-full aspect-[4/3] md:h-[160px] bg-[#F7F9FB] overflow-hidden shrink-0 border-b border-[#C5C5D3]">
      <img 
        v-if="category.banner"
        :src="category.banner" 
        :alt="$t('alt.category', { category: category.name })" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        loading="lazy" 
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-brand-50/50 group-hover:bg-brand-100/50 transition-colors duration-500">
        <img 
          :src="category.image" 
          :alt="$t('alt.category', { category: category.name })" 
          class="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500 opacity-60" 
          loading="lazy" 
        />
      </div>

      <!-- Badge if any -->
      <span v-if="category.badge" class="absolute top-2 start-2 bg-brand-50 text-brand-700 font-bold px-2 py-1 rounded-md text-[10px] md:text-xs shadow-sm z-10">
        {{ category.badge === 'تخفيضات قوية' ? $t('home.categories.huge_discounts') : category.badge }}
      </span>
    </div>

    <!-- Content Area -->
    <div class="flex flex-col p-3 md:p-4 bg-white grow">
      
      <!-- Top Row: Icon & Price -->
      <div class="flex justify-between items-center mb-2" dir="rtl">
        <!-- Small Icon -->
        <div class="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shrink-0">
          <img v-if="category.icon || category.image" :src="category.icon || category.image" class="w-full h-full object-contain filter-brand" />
        </div>

        <!-- Starting Price -->
        <span v-if="category.starting_price" class="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
          {{ $t('common.starts_from') || 'تبدأ من' }} {{ category.starting_price }} {{ $t('cities.price_currency') }}
        </span>
      </div>

      <!-- Title -->
      <h3 
        v-text="category.name" 
        class="text-sm md:text-base font-bold text-brand-700 mb-1 text-right line-clamp-1"
        dir="rtl"
      ></h3>
      
      <!-- Description -->
      <p 
        v-if="category.description"
        v-text="category.description" 
        class="text-xs md:text-sm text-gray-500 leading-relaxed text-right line-clamp-2 min-h-[32px] md:min-h-[40px]"
        dir="rtl"
      ></p>
      <div v-else class="min-h-[32px] md:min-h-[40px]"></div>

    </div>
  </NuxtLinkLocale>
</template>
