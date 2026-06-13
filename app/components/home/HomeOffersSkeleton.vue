<template>
  <section class="py-8 md:py-14 bg-[#FCFAFF]" aria-hidden="true">
    <div class="container flex flex-col gap-10">
      <div class="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div class="h-9 md:h-11 w-56 rounded-xl home-shimmer" />
        <div class="h-5 w-72 max-w-full rounded-lg home-shimmer" />
      </div>

      <div class="flex flex-col lg:flex-row gap-4 h-auto lg:h-[480px]">
        <div class="rounded-2xl home-shimmer flex-1 lg:flex-[1.8] h-64 lg:h-full min-h-[16rem]" />

        <div class="flex flex-col gap-4 flex-1 lg:flex-[0.8] h-auto lg:h-full">
          <div class="rounded-2xl home-shimmer h-40 lg:flex-1 min-h-[10rem]" />
          <div class="rounded-2xl home-shimmer h-40 lg:flex-1 min-h-[10rem]" />
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div v-for="card in 4" :key="card" class="rounded-2xl border border-gray-100 overflow-hidden bg-white">
          <div class="aspect-[4/3] home-shimmer" />
          <div class="p-4 flex flex-col gap-2">
            <div class="h-4 w-3/4 mx-auto rounded home-shimmer" />
            <div class="h-3 w-full rounded home-shimmer" />
            <div class="h-8 w-24 mx-auto rounded-lg home-shimmer mt-2" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
