<script setup>
  const salesIq = useSalesIq();
  const router = useRouter();
  const localePath = useLocalePath();

  const searchQuery = ref('');

  function onSearch() {
    if (searchQuery.value.trim()) {
      router.push(localePath({ name: 'services', query: { q: searchQuery.value.trim() } }));
    }
  }

  /** Primary display ~622×512 (mobile / split layout); full asset for large viewports. */
  const heroSrcDefault = '/images/hero-workers.png';
  const heroSrcLarge = '/images/hero-workers.png';
  const heroWidth = 622;
  const heroHeight = 512;
  const heroWidthLarge = 1176;
  const heroHeightLarge = 968;
</script>

<template>
  <section class="bg-brand-50">
    <div class="container px-4 flex flex-col lg:grid grid-cols-2 py-10">
      <div class="block my-auto">
        <div class="flex flex-col gap-4 md:gap-5 xl:gap-8">
          <h1 class="flex flex-col gap-3 md:gap-5 my-auto h-full" style="font-family: 'Tajawal', sans-serif;">
            <span v-text="$t('home.hero.title')" class="font-bold text-[44px] leading-[64px] text-[#7A3E98] whitespace-nowrap"></span>
            <span class="inline-flex gap-3 text-black font-bold text-[44px] leading-[64px] text-right align-middle">
              <span v-text="$t('home.hero.subtitle.part_1')"></span>
              <span v-text="$t('home.hero.subtitle.part_2')"></span>
            </span>
            <span class="text-[28px] leading-[64px] text-[#7A3E98] font-bold" v-text="'كل خدمات بيتك في مكان واحد'"></span>
          </h1>
          <p v-text="$t('home.hero.description')" class="text-[#444651] font-normal text-[18px] leading-[28px] max-w-lg" style="font-family: 'Tajawal', sans-serif;"></p>
          
          <form class="relative flex items-center gap-[8px] w-full max-w-[600px] h-[74px] p-[8px] border border-gray-200 rounded-[12px] bg-white mt-4 shadow-sm" @submit.prevent="onSearch">
            <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input v-model="searchQuery" type="search" class="block w-full h-full ps-12 text-sm text-gray-900 bg-transparent border-none focus:ring-0" placeholder="ما هي الخدمة التي تحتاجها؟" required />
            <button type="submit" class="text-white bg-[#7A3E98] hover:bg-brand-800 flex-shrink-0 w-[126px] h-[56px] px-[32px] py-[16px] flex items-center justify-center font-medium rounded-[8px] text-sm transition-colors">ابحث الآن</button>
          </form>
          
          <div class="inline-flex flex-wrap gap-3 sm:gap-4 items-center mt-2">
            <NuxtLinkLocale
              :to="{ name: 'categories' }"
              class="text-sm md:text-base inline-flex items-center justify-center gap-2 leading-[26px] font-normal min-h-12 cursor-pointer rounded-lg bg-brand-500 px-5 py-3 text-center text-white hover:bg-brand-600 focus:outline-none md:px-7 static-color [text-wrap:balance]"
            >
              {{ $t('home.hero.actions.browse_categories') }}
            </NuxtLinkLocale>
            <ButtonsOutline class="min-h-12" @click="salesIq.openChat">
              {{ $t('home.hero.actions.request_custom_service') }}
            </ButtonsOutline>
          </div>
        </div>
      </div>
      <div class="mt-12 mb-8 lg:m-5 flex justify-center lg:justify-end items-center">
        <div class="relative p-6 lg:p-8">
          <img
            class="max-h-[460px] w-auto h-auto rounded-[2rem]"
            :src="heroSrcDefault"
            :srcset="`${heroSrcDefault} ${heroWidth}w, ${heroSrcLarge} ${heroWidthLarge}w`"
            :sizes="`(max-width: 1024px) min(100vw - 2rem, ${heroWidth}px), min(50vw - 3rem, ${heroWidthLarge}px)`"
            :width="heroWidth"
            :height="heroHeight"
            fetchpriority="high"
            decoding="sync"
            :alt="$t('common.brand')"
          />
          
          <!-- 4.9 Rating Overlay — top-end (top-right in RTL) -->
          <div class="flex flex-row gap-2 items-center bg-white rounded-xl shadow-lg absolute top-0 end-0 p-3 px-5">
            <svg class="w-5 h-5 text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
            </svg>
            <span class="font-bold text-gray-800 text-sm">4.9 تقييم العملاء</span>
          </div>
          
          <!-- Fast Response Overlay — bottom-start (bottom-right in RTL) -->
          <div class="flex flex-row gap-2 items-center bg-white rounded-xl shadow-lg absolute bottom-0 start-0 p-3 px-5">
            <svg class="w-5 h-5 text-brand-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span class="font-bold text-gray-800 text-sm">استجابة خلال دقائق</span>
          </div>

          <!-- 500+ Technicians Overlay — bottom-end (bottom-left in RTL) -->
          <div class="flex flex-row gap-2 items-center bg-white rounded-xl shadow-lg absolute bottom-14 end-0 p-3 px-5">
            <svg class="w-5 h-5 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"/>
            </svg>
            <span class="font-bold text-gray-800 text-sm">+500 فني معتمد</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
