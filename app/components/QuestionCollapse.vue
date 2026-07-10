<script setup>
  const props = defineProps({
    headingClass: { type: String, default: '' },
    titleClass: { type: String, default: '' },
    titleStyle: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    items: { type: Array, default: null },
    fetchGeneral: { type: Boolean, default: true },
  });

  const apiFetch = useApiFetchClient();
  const homePageData = useHomePageData();

  const loadedQuestions = ref([]);
  const questionsPending = ref(false);

  async function loadQuestions() {
    if (!props.fetchGeneral || (Array.isArray(props.items) && props.items.length)) {
      return;
    }

    const fromHome = unwrapListPayload(readInjectedRef(homePageData)?.questions);
    if (fromHome.length) {
      loadedQuestions.value = fromHome;
      return;
    }

    questionsPending.value = true;

    try {
      loadedQuestions.value = unwrapListPayload(await apiFetch('/general/questions'));
    } catch (error) {
      console.error('Failed to get questions:', error);
      loadedQuestions.value = [];
    } finally {
      questionsPending.value = false;
    }
  }

  const questions = computed(() => {
    if (Array.isArray(props.items) && props.items.length) {
      return props.items.map((item, idx) => ({
        id: item.id ?? `local-${idx}`,
        title: item.title ?? item.question ?? '',
        answer: item.answer ?? '',
      }));
    }

    return loadedQuestions.value;
  });

  const showSkeleton = computed(() => props.fetchGeneral && !questions.value.length && questionsPending.value);

  function setupAccordions() {
    useFlowbite(({ initAccordions }) => {
      initAccordions();
    });
  }

  onMounted(async () => {
    await loadQuestions();
    setupAccordions();
  });

  watch(homePageData, () => {
    if (!import.meta.client || loadedQuestions.value.length) {
      return;
    }

    loadQuestions();
  });

  watch(
    questions,
    (list) => {
      if (!import.meta.client || !list?.length) {
        return;
      }

      nextTick(() => setupAccordions());
    },
    { flush: 'post' },
  );

  const faqJsonLd = computed(() => {
    const list = questions.value;

    if (!list || list.length === 0) {
      return null;
    }

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: list.map((q) => ({
        '@type': 'Question',
        name: q.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    });
  });

  useHead({
    script: computed(() =>
      faqJsonLd.value
        ? [
            {
              key: 'faq-page-schema',
              type: 'application/ld+json',
              innerHTML: faqJsonLd.value,
            },
          ]
        : [],
    ),
  });
</script>

<template>
  <HomeQuestionsSkeleton v-if="showSkeleton" />

  <div v-else id="accordion-collapse" data-accordion="collapse" class="flex flex-col gap-5">
    <div v-for="question in questions" :key="question.id" :class="headingClass">
      <h3 :id="`questions-collapse-heading-${question.id}`">
        <button
          type="button"
          :class="titleClass"
          :style="titleStyle"
          class="flex items-center justify-between w-full font-medium"
          :data-accordion-target="`#questions-collapse-body-${question.id}`"
          aria-expanded="false"
          :aria-controls="`questions-collapse-body-${question.id}`"
        >
          <span class="text-start" v-text="question.title" />
          <svg
            data-accordion-icon
            class="w-3 h-3 rotate-180 shrink-0 stroke-gray-500"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.8298 5.8314L5.8314 0.833008L0.833008 5.8314"
              stroke-width="1.66613"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div :id="`questions-collapse-body-${question.id}`" class="hidden" :aria-labelledby="`questions-collapse-heading-${question.id}`">
        <p :class="bodyClass" class="pt-0 -mt-3 bg-white rounded-b-lg text-gray-500" v-text="question.answer" />
      </div>
    </div>
  </div>
</template>
