<template>
  <section class="py-8 md:py-14" aria-hidden="true">
    <div class="container flex flex-col gap-5">
      <div class="flex flex-row justify-between items-center gap-4">
        <div class="h-8 md:h-10 w-40 rounded-xl home-shimmer" />
        <div class="h-12 w-28 rounded-xl home-shimmer max-md:hidden" />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="card in 8"
          :key="card"
          class="rounded-2xl border border-gray-100 overflow-hidden bg-white p-4 flex flex-col items-center gap-3"
        >
          <div class="w-16 h-16 rounded-2xl home-shimmer" />
          <div class="h-4 w-24 rounded home-shimmer" />
          <div class="h-3 w-20 rounded home-shimmer" />
        </div>
      </div>
    </div>
  </section>
</template>
