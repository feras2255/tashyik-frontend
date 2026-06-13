<template>
  <div class="flex flex-col gap-5" aria-hidden="true">
    <div v-for="row in 4" :key="row" class="rounded-lg overflow-hidden border border-gray-100">
      <div class="h-16 home-shimmer" />
    </div>
  </div>
</template>
