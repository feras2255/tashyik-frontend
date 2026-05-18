export const useCitiesStore = defineStore('cities', () => {
  const collection = ref(null);

  async function load() {
    if (!collection.value) {
      try {
        const response = await useApiFetch('/cities', {
          query: { per_page: 200 },
        });

        collection.value = response.data;
      } catch (error) {
        console.error('Failed to get cities:', error);
      }
    }
  }

  return {
    // state
    collection,

    // actions
    load,
  };
});
