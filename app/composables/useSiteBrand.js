/**
 * Site display name from dashboard settings (name.ar / name.en), with i18n fallback.
 * Auto-translate often turns "تشييك" into "Check" / local "check" verbs — reject those.
 */
const MISTRANSLATED_BRANDS = new Set(['check', 'suriin', 'जाँच करना', 'जांच करना', 'চেক', 'چیک', 'periksa', 'vérifier', 'verifier']);

export function useSiteBrand() {
  const layoutStore = useLayoutStore();
  const { site_name } = storeToRefs(layoutStore);
  const { t } = useI18n();

  return computed(() => {
    const fromSettings = site_name.value?.trim();
    if (!fromSettings) {
      return t('common.brand');
    }

    if (MISTRANSLATED_BRANDS.has(fromSettings) || MISTRANSLATED_BRANDS.has(fromSettings.toLowerCase())) {
      return t('common.brand');
    }

    return fromSettings;
  });
}
