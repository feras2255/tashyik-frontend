<script setup>
  const { t } = useI18n();
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = computed(() => (config.public.appUrl || 'https://www.tashyik.com').replace(/\/$/, ''));

  const layout = useLayoutStore();

  const twitterSite = computed(() => config.public.twitterSite || layout.twitter_site || undefined);

  const globalJsonLd = computed(() => {
    const base = siteUrl.value;
    const social = layout.social_links || {};
    const sameAs = [social.facebook, social.twitter, social.instagram, social.snapchat, social.tiktok].filter(
      (u) => u && String(u).trim(),
    );

    const organization = {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: t('common.brand'),
      url: base,
      logo: `${base}/images/og.webp`,
      description: t('common.short_description'),
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SA',
      },
    };

    if (sameAs.length) {
      organization.sameAs = sameAs;
    }

    const website = {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name: t('common.brand'),
      url: base,
      publisher: { '@id': `${base}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${base}/services?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [organization, website],
    });
  });

  useHead({
    titleTemplate: (titleChunk) => {
      const brand = t('common.brand');
      const isHome = route.path === '/' || /^\/(ar|en|hi|bn|ur|tl|id|fr)\/?$/.test(route.path);

      if (isHome) {
        return titleChunk && titleChunk.length > 15 ? titleChunk : `${brand} | ${t('common.short_description')}`;
      }

      if (!titleChunk) {
        return brand;
      }

      const lower = titleChunk.toLowerCase();
      if (lower.includes(brand.toLowerCase()) || lower.includes('tashyik')) {
        return titleChunk;
      }

      return `${titleChunk} - ${brand}`;
    },
    meta: [{ property: 'og:site_name', content: t('common.brand') }],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      {
        key: 'global-schema-org',
        type: 'application/ld+json',
        innerHTML: globalJsonLd,
      },
    ],
  });

  useSeoMeta({
    twitterSite,
  });
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
