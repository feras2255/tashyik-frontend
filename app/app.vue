<script setup>
  const { t } = useI18n();
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteBrand = useSiteBrand();

  const siteUrl = computed(() => (config.public.appUrl || 'https://www.tashyik.com').replace(/\/$/, ''));

  const layout = useLayoutStore();
  const { staticAsset } = useStaticAsset();

  const twitterSite = computed(() => config.public.twitterSite || layout.twitter_site || undefined);

  const globalJsonLd = computed(() => {
    const base = siteUrl.value;
    const social = layout.social_links || {};
    const extraSocialUrls = Array.isArray(social.extra) ? social.extra.map((link) => link?.url).filter(Boolean) : [];
    const sameAs = [
      social.facebook,
      social.instagram,
      social.twitter,
      social.youtube,
      social.tiktok,
      social.snapchat,
      social.linkedin,
      social.telegram,
      social.whatsapp,
      layout.contact_info?.whatsapp_link,
      ...extraSocialUrls,
    ].filter((u) => u && String(u).trim());

    const organization = {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: siteBrand.value,
      url: base,
      logo: staticAsset('og.webp'),
      description: layout.description?.trim() || t('common.short_description'),
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
      name: siteBrand.value,
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

  useHead(() => ({
    titleTemplate: (titleChunk) => {
      const brand = siteBrand.value;
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
    meta: [{ property: 'og:site_name', content: siteBrand.value }],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      {
        key: 'global-schema-org',
        type: 'application/ld+json',
        innerHTML: globalJsonLd.value,
      },
    ],
  }));

  useSeoMeta({
    twitterSite,
  });
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
