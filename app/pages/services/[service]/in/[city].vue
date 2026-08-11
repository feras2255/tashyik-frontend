<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';
  import { sanitizeRichHtml } from '~/utils/sanitizeHtml';

  const head = useLocaleHead();
  const { t, locale } = useI18n();
  const config = useRuntimeConfig();
  const route = useRoute();
  const layout = useLayoutStore();
  const siteBrand = useSiteBrand();
  const { fetchServiceCityPayload } = useServiceFetchers();
  const { pricingWindowKey } = useSaudiPricingWindowKey();

  function stripHtml(html) {
    if (html == null) {
      return '';
    }

    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function ordersPlusLabel(count) {
    const c = Number(count) || 0;

    if (c <= 0) {
      return '0';
    }

    if (c < 10) {
      return String(c);
    }

    return String(Math.floor(c / 10) * 10);
  }

  const { data: payload, error: pageError } = await useAsyncData(
    () => `service-in-city-${route.params.service}-${route.params.city}-${locale.value}-${pricingWindowKey.value}`,
    async () => {
      return fetchServiceCityPayload(route.params.service, route.params.city, { relatedPerPage: 24 });
    },
    {
      watch: [() => route.params.service, () => route.params.city, locale, pricingWindowKey],
    },
  );

  if (pageError.value) {
    const status = pageError.value.statusCode || pageError.value.status || pageError.value?.response?.status;

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: t('common.page_not_found'),
        fatal: true,
      });
    }

    throw createError({
      statusCode: status || 500,
      statusMessage: pageError.value.message || 'Failed to load page',
      fatal: true,
    });
  }

  const service = computed(() => payload.value?.service ?? null);
  const city = computed(() => payload.value?.city ?? null);
  const relatedServices = computed(() => payload.value?.related ?? []);
  const cityPage = computed(() => payload.value?.cityPage ?? null);

  const cityPageBody = computed(() => {
    const page = cityPage.value;
    if (!page?.body) {
      return '';
    }

    const body = page.body;
    const raw = typeof body === 'string' ? body : body[locale.value] || body.ar || body.en || '';

    return sanitizeRichHtml(raw);
  });

  const heroLead = computed(() => {
    const s = service.value;

    if (!s) {
      return '';
    }

    if (s.card_description) {
      return s.card_description;
    }

    const plain = stripHtml(s.description || '');

    return plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}…` : plain;
  });

  const includesItems = computed(() => {
    const s = service.value;
    const list = [];

    if (s?.highlights?.length) {
      for (const h of s.highlights) {
        if (h?.title) {
          list.push(String(h.title).trim());
        }
      }
    }

    if (list.length) {
      return list;
    }

    return [
      t('cities.service_in_city_default_bullet1'),
      t('cities.service_in_city_default_bullet2'),
      t('cities.service_in_city_default_bullet3'),
    ];
  });

  const completedOrders = computed(() => Number(service.value?.completed_orders_count) || 0);

  const ratingSocialLine = computed(() => {
    const s = service.value;

    if (!s?.rating) {
      return '';
    }

    if (completedOrders.value > 0) {
      return t('cities.service_in_city_rating_with_orders', {
        rating: s.rating,
        orders: ordersPlusLabel(completedOrders.value),
      });
    }

    return t('cities.service_in_city_rating_line', { rating: s.rating });
  });

  const whatsappHref = computed(() => {
    const w = layout.contact_info?.whatsapp_link;

    if (w && String(w).trim()) {
      return String(w).trim();
    }

    const pub = config.public?.whatsappLink;

    if (pub && String(pub).trim()) {
      return String(pub).trim();
    }

    const phone = layout.contact_info?.phone_number;
    const digits = String(phone || '').replace(/\D/g, '');

    if (digits) {
      return `https://wa.me/${digits}`;
    }

    return null;
  });

  const { heroHeading } = useServiceCitySeo({
    service,
    city,
    cityPage,
    cityPageBody,
    siteBrand,
  });

  const orderLink = computed(() => ({
    name: 'services-service-order',
    params: { service: resolveEntitySlug(service.value) },
    query: city.value?.slug ? { city: resolveEntitySlug(city.value) } : {},
  }));

  const whyItems = computed(() => [
    {
      title: t('cities.service_in_city_why_1_title'),
      body: t('cities.service_in_city_why_1_desc'),
    },
    {
      title: t('cities.service_in_city_why_2_title'),
      body: t('cities.service_in_city_why_2_desc'),
    },
    {
      title: t('cities.service_in_city_why_3_title'),
      body: t('cities.service_in_city_why_3_desc'),
    },
    {
      title: t('cities.service_in_city_why_4_title'),
      body: t('cities.service_in_city_why_4_desc'),
    },
  ]);

  const reviewItems = computed(() => [
    { name: t('cities.service_in_city_rev1_name'), text: t('cities.service_in_city_rev1_text') },
    { name: t('cities.service_in_city_rev2_name'), text: t('cities.service_in_city_rev2_text') },
    { name: t('cities.service_in_city_rev3_name'), text: t('cities.service_in_city_rev3_text') },
  ]);

  const howSteps = computed(() => [
    { title: t('cities.service_in_city_how_step1'), desc: t('cities.service_in_city_how_step1_desc') },
    { title: t('cities.service_in_city_how_step2'), desc: t('cities.service_in_city_how_step2_desc') },
    { title: t('cities.service_in_city_how_step3'), desc: t('cities.service_in_city_how_step3_desc') },
  ]);
</script>

<template>
  <section v-if="service && city" :dir="head.htmlAttrs.dir" class="w-full px-4 pb-28 pt-6 md:pb-10 md:pt-8 lg:pb-12">
    <ServiceCityHero
      :service="service"
      :city="city"
      :hero-heading="heroHeading"
      :hero-lead="heroLead"
      :rating-social-line="ratingSocialLine"
    />

    <div class="container mx-auto mt-10 max-w-6xl lg:mt-14">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <article class="min-w-0 space-y-10 lg:col-span-8">
          <ServiceCityBody v-if="cityPageBody" :city-name="city.name" :html="cityPageBody" />

          <ServiceCityContentSections
            :service="service"
            :city="city"
            :includes-items="includesItems"
            :how-steps="howSteps"
            :why-items="whyItems"
            :review-items="reviewItems"
          />
        </article>

        <ServiceCityPricingPanel :service="service" :city="city" :order-link="orderLink" :whatsapp-href="whatsappHref" />
      </div>
    </div>

    <ServiceCityRelated :related-services="relatedServices" :city="city" />
  </section>
</template>
