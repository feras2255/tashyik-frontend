<template>
  <section class="bg-white py-8 md:py-14">
    <div class="container px-4 flex flex-col gap-10">
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
        {{ $t('home.features.title') }}
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.fast_support.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.fast_support.description') }}</p>
        </div>
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.clear_prices.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.clear_prices.description') }}</p>
        </div>
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.trusted_techs.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.trusted_techs.description') }}</p>
        </div>
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.instant_booking.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.instant_booking.description') }}</p>
        </div>
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.real_reviews.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.real_reviews.description') }}</p>
        </div>
        <div class="rounded-2xl flex flex-col items-start text-start gap-3" style="background:#FAF7FC;border-radius:16px;padding:32px;gap:12px;height:206px;">
          <svg class="w-8 h-8 text-brand-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ $t('home.features.warranty.title') }}</h3>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed">{{ $t('home.features.warranty.description') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
