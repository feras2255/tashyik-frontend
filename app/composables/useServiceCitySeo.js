import { resolveEntitySlug } from '~/utils/seoSlug';

function stripHtml(html) {
  if (html == null) {
    return '';
  }

  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Entity meta + Service/Breadcrumb JSON-LD for /services/{service}/in/{city}.
 */
export function useServiceCitySeo({ service, city, cityPage, cityPageBody, siteBrand }) {
  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();

  const pageMetaTitle = computed(() => {
    const page = unref(cityPage);

    if (!page?.meta_title) {
      return null;
    }

    return page.meta_title[locale.value] || page.meta_title.ar || page.meta_title.en || null;
  });

  const pageKeywords = computed(() => {
    const page = unref(cityPage);

    if (page?.keywords) {
      const raw = page.keywords[locale.value] ?? page.keywords.ar ?? page.keywords.en ?? page.keywords;

      if (Array.isArray(raw)) {
        return raw.filter(Boolean).join(', ');
      }

      if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
      }
    }

    return '';
  });

  const entity = computed(() => {
    const s = unref(service);
    const c = unref(city);
    const page = unref(cityPage);

    if (!s || !c) {
      return null;
    }

    const pageMetaDescription = page?.meta_description?.[locale.value] || page?.meta_description?.ar || page?.meta_description?.en || null;

    return {
      name: `${s.name} — ${c.name}`,
      meta_title: pageMetaTitle.value || s.meta_title,
      meta_description: pageMetaDescription || s.meta_description,
      description: unref(cityPageBody) || s.description,
      keywords: pageKeywords.value || s.keywords,
      og_image: s.og_image,
      image: s.image,
    };
  });

  const serviceCityCanonicalPath = computed(() => {
    const s = unref(service);
    const c = unref(city);

    if (!s || !c) {
      return '';
    }

    return localePath({
      name: 'services-service-in-city',
      params: {
        service: resolveEntitySlug(s),
        city: resolveEntitySlug(c),
      },
    });
  });

  useEntitySeo({
    entity,
    parentCategory: null,
    ogType: 'website',
    canonicalPath: serviceCityCanonicalPath,
  });

  const completedOrders = computed(() => Number(unref(service)?.completed_orders_count) || 0);

  const plainDescriptionForJsonLd = computed(() => {
    const page = unref(cityPage);

    if (page?.meta_description) {
      const pageMeta = page.meta_description[locale.value] || page.meta_description.ar || page.meta_description.en;

      if (pageMeta != null && String(pageMeta).trim()) {
        return stripHtml(String(pageMeta));
      }
    }

    const body = unref(cityPageBody);

    if (body) {
      return stripHtml(body);
    }

    const s = unref(service);

    if (!s) {
      return '';
    }

    const meta = s.meta_description;

    if (meta != null && String(meta).trim()) {
      return stripHtml(String(meta));
    }

    return stripHtml(s.description || '');
  });

  const heroHeading = computed(() => {
    const s = unref(service);
    const c = unref(city);

    return pageMetaTitle.value || `${s?.name} — ${c?.name}`;
  });

  const serviceCityJsonLd = computed(() => {
    const s = unref(service);
    const c = unref(city);

    if (!s || !c) {
      return null;
    }

    const price = s.price?.after_discount;
    const ratingNum = parseFloat(String(s.rating || '').replace(',', '.')) || undefined;

    const payloadLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${s.name} — ${c.name}`,
      description: plainDescriptionForJsonLd.value || undefined,
      areaServed: {
        '@type': 'City',
        name: c.name,
      },
      provider: {
        '@type': 'LocalBusiness',
        name: unref(siteBrand),
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SA',
        },
      },
      offers: {
        '@type': 'Offer',
        price: price != null && price !== '' ? String(price) : undefined,
        priceCurrency: 'SAR',
        availability: 'https://schema.org/InStock',
      },
    };

    if (ratingNum != null && !Number.isNaN(ratingNum) && completedOrders.value > 0) {
      payloadLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(ratingNum),
        bestRating: '5',
        worstRating: '1',
        ratingCount: String(completedOrders.value),
      };
    }

    if (unref(cityPage)?.updated_at) {
      payloadLd.dateModified = unref(cityPage).updated_at;
    }

    return JSON.stringify(payloadLd);
  });

  const breadcrumbJsonLd = computed(() => {
    const s = unref(service);
    const c = unref(city);

    if (!s || !c) {
      return null;
    }

    const base = (config.public.appUrl || '').replace(/\/$/, '');
    const pageUrl = `${base}${serviceCityCanonicalPath.value}`;

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('navigation.home'),
          item: `${base}${localePath({ name: 'index' })}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: c.name,
          item: `${base}${localePath({ name: 'cities-slug', params: { slug: resolveEntitySlug(c) } })}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: s.name,
          item: pageUrl,
        },
      ],
    });
  });

  useHead({
    script: computed(() => {
      const scripts = [];

      if (serviceCityJsonLd.value) {
        scripts.push({
          key: 'service-city-service-jsonld',
          type: 'application/ld+json',
          innerHTML: serviceCityJsonLd.value,
        });
      }

      if (breadcrumbJsonLd.value) {
        scripts.push({
          key: 'service-city-breadcrumb-jsonld',
          type: 'application/ld+json',
          innerHTML: breadcrumbJsonLd.value,
        });
      }

      return scripts;
    }),
  });

  return {
    heroHeading,
    pageMetaTitle,
    serviceCityCanonicalPath,
  };
}
