<script setup>
  const head = useLocaleHead();
  const layoutStore = useLayoutStore();
  const authStore = useAuthStore();
  const { load: loadLayout } = layoutStore;
  const switchLocalePath = useSwitchLocalePath();
  const { locale, locales } = useI18n();
  const config = useRuntimeConfig();
  const route = useRoute();
  const alternateLocales = ref();

  const apiFetch = useApiFetchClient();
  const onHomePage = computed(() => isHomeRoute(route));
  const homeFetchFailed = ref(false);

  const {
    data: homePageData,
    pending: homePagePending,
    error: homePageError,
    refresh: refreshHomePage,
  } = useAsyncData(
    () => `home-page-${locale.value}-${route.fullPath}`,
    () => {
      if (!isHomeRoute(route)) {
        return null;
      }

      return apiFetch('/general/home', { cache: 'no-store' });
    },
    {
      lazy: true,
      // Do not block SSR — the document must not wait 10–15s for /general/home.
      server: false,
      // Always refetch on home visit so dashboard offer order changes show immediately.
      getCachedData: () => null,
      watch: [() => locale.value, () => route.fullPath],
    },
  );

  watch(
    homePageData,
    (value) => {
      if (value?.layout) {
        applyLayoutPayload(layoutStore, authStore, value.layout);
        homeFetchFailed.value = false;
      }
    },
    { immediate: true },
  );

  watch(homePageError, async (error) => {
    if (!error || !import.meta.client || !onHomePage.value) {
      return;
    }

    homeFetchFailed.value = true;
    console.error('Failed to load /general/home, falling back to /general/layout:', error);

    try {
      await loadLayout();
    } catch (layoutError) {
      console.error('Failed to load layout fallback:', layoutError);
    }
  });

  watch(onHomePage, (isHome, wasHome) => {
    if (isHome && wasHome === false && import.meta.client) {
      refreshHomePage();
    }
  });

  if (import.meta.client) {
    onMounted(async () => {
      if (layoutStore.logo?.light_mode) {
        return;
      }

      try {
        await loadLayout();
      } catch (layoutError) {
        console.error('Failed to load layout bootstrap:', layoutError);
      }
    });
  } else if (!onHomePage.value) {
    await loadLayout();
  }

  provide(HOME_PAGE_DATA_KEY, homePageData);
  provide(HOME_PAGE_PENDING_KEY, homePagePending);
  provide(HOME_PAGE_ERROR_KEY, homePageError);
  provide(HOME_PAGE_REFRESH_KEY, refreshHomePage);

  if (import.meta.client) {
    watch(locale, () => {
      homeFetchFailed.value = false;

      if (onHomePage.value) {
        refreshHomePage();
      } else {
        loadLayout();
      }
    });
  }

  const defaultOg = computed(() => `${config.public.appUrl?.replace(/\/$/, '') || 'https://www.tashyik.com'}/images/og.webp`);

  useSeoMeta({
    ogImage: defaultOg,
    ogImageType: 'image/webp',
    ogImageWidth: '1200',
    ogImageHeight: '630',
  });

  alternateLocales.value = locales.value.map(function (language) {
    return { rel: 'alternate', hreflang: language.code, href: `${config.public.appUrl}${switchLocalePath(language.code)}` };
  });

  useHead({
    link: [
      { rel: 'canonical', href: `${config.public.appUrl}${switchLocalePath(locale.value)}` },
      ...alternateLocales.value,
      { rel: 'alternate', hreflang: 'x-default', href: `${config.public.appUrl}${switchLocalePath('ar')}` },
    ],
  });
</script>

<template>
  <Html :lang="head.htmlAttrs.lang || 'ar'" :dir="head.htmlAttrs.dir || 'rtl'" class="scroll-smooth">
    <Body>
      <AppHeader />

      <NuxtLoadingIndicator color="repeating-linear-gradient(to right, #FFEB3B 0%, #FFEB3B 50%, #FF9800 100%)" />

      <main class="min-h-[calc(100vh-13rem)] bg-gray-50 flex flex-col w-full max-w-screen-2xl mx-auto">
        <slot />
      </main>

      <ClientOnly>
        <!-- Chatbot Button -->
        <ChatbotButton />

        <!-- Whatsapp button -->
        <WhatsappButton />

        <!-- Zoho SalesIQ -->
        <ZohoSalesIQ />
      </ClientOnly>

      <AppFooter />
    </Body>
  </Html>
</template>
