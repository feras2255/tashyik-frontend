<script setup>
  const props = defineProps({
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: undefined,
    },
    maxServices: {
      type: Number,
      default: 10,
    },
  });

  const { data, error, pending } = useApiFetch('/general/service-collections', {}, true);

  watch(error, (e) => {
    if (e) console.error('Failed to load service collections:', e);
  });

  function collectionsFromPayload(payload) {
    const raw = payload?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
    return [];
  }

  const allCollections = computed(() => collectionsFromPayload(data.value));

  const visibleCollections = computed(() => {
    const list = allCollections.value;
    if (!list.length) return [];
    return list.slice(props.start, props.end);
  });
</script>

<template>
  <div v-if="pending && !allCollections.length" class="container flex justify-center py-14 md:py-20">
    <AppSpinner />
  </div>
  <template v-else-if="visibleCollections?.length">
    <HomeCollectionItem
      v-for="(collection, index) in visibleCollections"
      :key="collection.title"
      :collection="collection"
      :index="start + index"
      :max-services="maxServices"
    />
  </template>
</template>
