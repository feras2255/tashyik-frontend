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

  const apiFetch = useApiFetchClient();
  const homePageData = useHomePageData();
  const homePagePending = useHomePagePending();

  const fallbackCollections = ref([]);
  const fallbackPending = ref(false);

  async function loadFallbackCollections() {
    fallbackPending.value = true;
    try {
      const response = await apiFetch('/general/service-collections');
      fallbackCollections.value = collectionsFromPayload(response);
    } catch (error) {
      console.error('Failed to load service collections:', error);
      fallbackCollections.value = [];
    } finally {
      fallbackPending.value = false;
    }
  }

  watch(
    [homePageData, homePagePending],
    () => {
      const fromHome = homePageData?.value?.collections;
      if (Array.isArray(fromHome) && fromHome.length) {
        return;
      }

      if (!homePagePending?.value && import.meta.client) {
        loadFallbackCollections();
      }
    },
    { immediate: true },
  );

  function collectionsFromPayload(payload) {
    const raw = payload?.data ?? payload;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
    return [];
  }

  const allCollections = computed(() => {
    const fromHome = homePageData?.value?.collections;
    if (Array.isArray(fromHome) && fromHome.length) {
      return fromHome;
    }

    return fallbackCollections.value;
  });

  const pending = computed(() => {
    if (allCollections.value.length) {
      return false;
    }

    return Boolean(homePagePending?.value || fallbackPending.value);
  });

  const visibleCollections = computed(() => {
    const list = allCollections.value;
    if (!list.length) return [];
    return list.slice(props.start, props.end);
  });
</script>

<template>
  <HomeCollectionsSkeleton v-if="pending && !allCollections.length" />

  <template v-else-if="visibleCollections?.length">
    <HomeCollectionItem
      v-for="(collection, index) in visibleCollections"
      :key="collection.id || collection.slug || collection.title || start + index"
      :collection="collection"
      :index="start + index"
      :max-services="maxServices"
    />
  </template>
</template>
