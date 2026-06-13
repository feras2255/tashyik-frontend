<template>
  <section class="py-8 md:py-14 bg-white" aria-hidden="true">
    <div class="container flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div class="h-8 md:h-9 w-48 rounded-xl home-shimmer" />
        <div class="h-5 w-24 rounded-lg home-shimmer" />
      </div>

      <div class="flex gap-4 overflow-hidden pb-2">
        <div v-for="card in 5" :key="card" class="shrink-0 w-[260px] rounded-2xl border border-gray-100 overflow-hidden bg-white">
          <div class="aspect-[4/3] home-shimmer" />
          <div class="p-4 flex flex-col gap-2">
            <div class="h-4 w-3/4 rounded home-shimmer" />
            <div class="h-3 w-full rounded home-shimmer" />
            <div class="h-8 w-20 rounded-lg home-shimmer mt-2" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
