<script setup>
  import { resolveEntitySlug } from '~/utils/seoSlug';
  import { normalizeSocialLinkItems } from '~/utils/socialLinks';
  import { storeToRefs } from 'pinia';

  const currentYear = computed(() => new Date().getFullYear());
  const layoutStore = useLayoutStore();
  const siteBrand = useSiteBrand();
  const { logo, description, social_links, mobile_app_links, contact_info } = storeToRefs(layoutStore);
  const { hubLinks } = useFooterHubLinks();

  const headingClass = 'mb-5 text-[15px] font-bold leading-snug text-brand-800';
  const linkClass =
    'static-color flex min-h-10 items-center text-sm font-medium leading-6 text-gray-600 transition-colors hover:text-brand-700';
  const linkAccentClass = `${linkClass} font-semibold text-brand-700 hover:text-brand-800`;
  const contactRowClass = 'flex min-h-10 items-center gap-3 text-sm font-medium leading-6 text-gray-600';
  const contactIconClass = 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white';
  const appStoreBadge =
    'static-color flex h-11 w-full max-w-[11.5rem] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition-colors hover:bg-gray-50';

  const { staticAsset } = useStaticAsset();
  const logoSrc = computed(() => logo.value?.light_mode || staticAsset('logo-light-mode.webp'));

  const socialLinkClass = (type) => {
    const base = 'static-color flex size-9 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg transition-colors';

    if (type === 'whatsapp') {
      return `${base} bg-green-500 text-white hover:bg-green-600`;
    }

    if (type === 'extra') {
      return `${base} bg-brand-700 px-2 text-white hover:bg-brand-800`;
    }

    return `${base} bg-brand-700 text-white hover:bg-brand-800`;
  };

  const footerSocialItems = computed(() => normalizeSocialLinkItems(social_links.value));

  const socialAriaLabel = (item) => {
    if (item.type === 'extra') {
      return item.label || 'Social link';
    }

    return item.type.charAt(0).toUpperCase() + item.type.slice(1);
  };
</script>

<template>
  <footer class="static-color mt-auto w-full border-t border-brand-100 bg-[#FCFAFF] text-gray-600">
    <div class="mx-auto w-full px-4 py-14 sm:px-6 lg:px-10 xl:px-16 2xl:px-20">
      <div class="grid grid-cols-1 items-start gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
        <!-- Column 1 (RTL right): Apps -->
        <section class="min-w-0 2xl:col-span-1">
          <h2 :class="headingClass">{{ $t('footer.our_apps') }}</h2>
          <div class="flex flex-col gap-3">
            <a v-if="mobile_app_links?.app_store" :href="mobile_app_links.app_store" :class="appStoreBadge" target="_blank" rel="noopener">
              <svg class="size-5 shrink-0 text-gray-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M7.875 2.937A.37.37 0 0 1 7.5 2.57C7.5 1.15 8.676 0 10.124 0a.37.37 0 0 1 .375.367c0 1.42-1.175 2.57-2.624 2.57"
                />
                <path
                  fill="currentColor"
                  d="M7.875 2.937A.37.37 0 0 1 7.5 2.57C7.5 1.15 8.676 0 10.124 0a.37.37 0 0 1 .375.367c0 1.42-1.175 2.57-2.624 2.57m5.475 7.731c.145.106.192.3.11.458C12.14 13.712 11.087 15 10.125 15c-.448 0-.888-.142-1.317-.418a1.99 1.99 0 0 0-2.073-.044c-.52.305-1.015.462-1.485.462c-1.415 0-3.75-4.267-3.75-6.608c0-2.5 1.339-4.406 3.375-4.406q1.437-.001 2.48.419c.294.118.627.11.914-.025c.564-.266 1.308-.394 2.23-.394c1.127 0 2.11.55 2.926 1.615a.36.36 0 0 1-.075.514c-.911.67-1.35 1.421-1.35 2.277c0 .855.439 1.607 1.35 2.276"
                />
              </svg>
              <span class="flex flex-col items-start leading-tight">
                <span class="text-[9px] font-medium text-gray-500">{{ $t('download_app.download_on_the') }}</span>
                <span class="text-xs font-semibold text-gray-900">App Store</span>
              </span>
            </a>
            <a
              v-if="mobile_app_links?.google_play"
              :href="mobile_app_links.google_play"
              :class="appStoreBadge"
              target="_blank"
              rel="noopener"
            >
              <svg class="size-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 283" aria-hidden="true">
                <path fill="#EA4335" d="M119.553 134.916L1.06 259.061a32.14 32.14 0 0 0 47.062 19.071l133.327-75.934z" />
                <path
                  fill="#FBBC04"
                  d="M239.37 113.814L181.715 80.79l-64.898 56.95l65.162 64.28l57.216-32.67a31.345 31.345 0 0 0 0-55.537z"
                />
                <path fill="#4285F4" d="M1.06 23.487A30.6 30.6 0 0 0 0 31.61v219.327a32.3 32.3 0 0 0 1.06 8.124l122.555-120.966z" />
                <path
                  fill="#34A853"
                  d="m120.436 141.274l61.278-60.483L48.564 4.503A32.85 32.85 0 0 0 32.051 0C17.644-.028 4.978 9.534 1.06 23.399z"
                />
              </svg>
              <span class="flex flex-col items-start leading-tight">
                <span class="text-[9px] font-medium text-gray-500">{{ $t('download_app.get_it_on') }}</span>
                <span class="text-xs font-semibold text-gray-900">Google Play</span>
              </span>
            </a>
          </div>
        </section>

        <!-- Column 2: Contact -->
        <section class="min-w-0 2xl:col-span-1">
          <h2 :class="headingClass">{{ $t('footer.contact_us.title') }}</h2>
          <ul class="space-y-1">
            <li v-if="contact_info?.phone_number">
              <div :class="contactRowClass">
                <span :class="contactIconClass" aria-hidden="true">
                  <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19 12q0-2.925-2.037-4.962T12 5V3q1.875 0 3.513.713t2.85 1.924t1.925 2.85T21 12zm-4 0q0-1.25-.875-2.125T12 9V7q2.075 0 3.538 1.463T17 12zm4.95 9q-3.125 0-6.187-1.35T8.2 15.8t-3.85-5.55T3 4.05V3h5.9l.925 5.025l-2.85 2.875q.55.975 1.225 1.85t1.45 1.625q.725.725 1.588 1.388T13.1 17l2.9-2.9l5 1.025V21z"
                    />
                  </svg>
                </span>
                <span dir="ltr">{{ contact_info.phone_number }}</span>
              </div>
            </li>
            <li v-if="contact_info?.email">
              <div :class="contactRowClass">
                <span :class="contactIconClass" aria-hidden="true">
                  <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m4 6l6.108 4.612l.002.002c.678.497 1.017.746 1.389.842a2 2 0 0 0 1.002 0c.372-.096.712-.345 1.392-.844c0 0 3.917-3.006 6.107-4.612M3 15.8V8.2c0-1.12 0-1.68.218-2.108c.192-.377.497-.682.874-.874C4.52 5 5.08 5 6.2 5h11.6c1.12 0 1.68 0 2.107.218c.377.192.683.497.875.874c.218.427.218.987.218 2.105v7.607c0 1.118 0 1.676-.218 2.104a2 2 0 0 1-.875.874c-.427.218-.986.218-2.104.218H6.197c-1.118 0-1.678 0-2.105-.218a2 2 0 0 1-.874-.874C3 17.48 3 16.92 3 15.8"
                    />
                  </svg>
                </span>
                <span dir="ltr">{{ contact_info.email }}</span>
              </div>
            </li>
            <li>
              <div :class="contactRowClass">
                <span :class="contactIconClass" aria-hidden="true">
                  <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"
                    />
                    <path fill="currentColor" d="M12.5 7H11v6l5.25 3.15l.75-1.23l-4.5-2.67z" />
                  </svg>
                </span>
                <span>{{ $t('footer.contact_us.support') }}</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- Column 3: Service areas -->
        <nav class="min-w-0 2xl:col-span-1" :aria-label="$t('footer.service_areas')">
          <h2 :class="headingClass">{{ $t('footer.service_areas') }}</h2>
          <ul class="space-y-1">
            <li v-for="city in hubLinks.cities" :key="city.id">
              <NuxtLinkLocale :to="{ name: 'cities-city', params: { city: resolveEntitySlug(city) } }" :class="[linkClass, 'line-clamp-1']">
                {{ city.name }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale :to="{ name: 'cities' }" :class="linkAccentClass">
                {{ $t('footer.see_all_cities') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>

        <!-- Column 4: Important links -->
        <nav class="min-w-0 2xl:col-span-1" :aria-label="$t('footer.important_links')">
          <h2 :class="headingClass">{{ $t('footer.important_links') }}</h2>
          <ul class="space-y-1">
            <li>
              <NuxtLinkLocale :to="{ name: 'privacy-policy' }" :class="linkClass">
                {{ $t('footer.privacy_policy') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale :to="{ name: 'terms-and-conditions' }" :class="linkClass">
                {{ $t('footer.terms_and_conditions') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale to="#" :class="linkClass">{{ $t('footer.faq') }}</NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale to="#" :class="linkClass">{{ $t('footer.contact_us_link') }}</NuxtLinkLocale>
            </li>
          </ul>
        </nav>

        <!-- Column 5: Services -->
        <nav class="min-w-0 2xl:col-span-1" :aria-label="$t('footer.our_services')">
          <h2 :class="headingClass">{{ $t('footer.our_services') }}</h2>
          <ul class="space-y-1">
            <li v-for="service in hubLinks.services" :key="service.id">
              <NuxtLinkLocale
                :to="{ name: 'services-service', params: { service: resolveEntitySlug(service) } }"
                :class="[linkClass, 'line-clamp-1']"
              >
                {{ service.name }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale :to="{ name: 'services' }" :class="linkAccentClass">
                {{ $t('footer.see_all_services') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>

        <!-- Brand block (RTL far left) -->
        <section class="min-w-0 sm:col-span-2 lg:col-span-3 2xl:col-span-2">
          <NuxtLinkLocale :to="{ name: 'index' }" class="static-color mb-6 inline-flex">
            <img
              :src="logoSrc"
              :alt="siteBrand"
              class="h-10 w-auto max-w-[9.5rem] object-contain object-right"
              width="152"
              height="40"
              loading="lazy"
            />
          </NuxtLinkLocale>

          <p v-if="description" class="mb-6 max-w-md text-sm leading-7 text-gray-600" v-text="description" />
          <p v-else class="mb-6 max-w-md text-sm leading-7 text-gray-600">
            {{ $t('footer.description_1') }}<span class="font-bold text-brand-700">{{ $t('footer.description_2') }}</span>
          </p>

          <div v-if="footerSocialItems.length" class="mb-6 flex flex-wrap items-center gap-3">
            <a
              v-for="(item, index) in footerSocialItems"
              :key="`${item.type}-${item.url}-${index}`"
              :href="item.url"
              :aria-label="socialAriaLabel(item)"
              target="_blank"
              rel="nofollow noopener"
              :class="socialLinkClass(item.type)"
            >
              <AppFooterSocialIcon :type="item.type" :label="item.label" class="text-white" />
            </a>
          </div>

          <NuxtLinkLocale
            :to="{ name: 'about' }"
            class="static-color inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            <span>{{ $t('footer.about_us') }}</span>
            <svg class="size-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6 6 6-6 6" />
            </svg>
          </NuxtLinkLocale>
        </section>
      </div>
    </div>

    <!-- Copyright bar -->
    <div class="border-t border-brand-200/70 bg-white">
      <div class="mx-auto w-full px-4 py-4 text-center sm:px-6 lg:px-10 xl:px-16 2xl:px-20">
        <p class="text-xs leading-6 text-gray-500">
          {{ $t('footer.copyright') }} &copy; {{ currentYear }} {{ siteBrand }}
          {{ $t('footer.copyright_suffix') }}
        </p>
        <p class="mt-1 text-[11px] leading-5 text-gray-400">
          {{ $t('footer.powered_by') }}
          <a
            href="https://www.trafyekbls.com/ar"
            target="_blank"
            rel="nofollow noopener"
            class="static-color font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 transition-colors hover:text-brand-800"
          >
            {{ $t('footer.developer') }}
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
