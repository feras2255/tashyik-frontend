/**
 * Sync locale + message catalog from URL prefix before SSR renders page content.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp();
  const i18n = nuxtApp.$i18n;

  if (!i18n?.locale || !i18n?.locales || typeof i18n.setLocale !== 'function') {
    return;
  }

  const segment = to.path.split('/').filter(Boolean)[0];
  const supported = i18n.locales.value.map((entry) => entry.code);
  const target = segment && supported.includes(segment) ? segment : (to.path === '/' || to.path === '' ? 'ar' : null);

  if (!target || i18n.locale.value === target) {
    return;
  }

  await i18n.setLocale(target);
});
