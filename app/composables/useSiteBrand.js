/**
 * Site display name from dashboard settings (name.ar / name.en), with i18n fallback.
 */
export function useSiteBrand() {
  const layoutStore = useLayoutStore();
  const { site_name } = storeToRefs(layoutStore);
  const { t } = useI18n();

  return computed(() => {
    const fromSettings = site_name.value?.trim();

    return fromSettings || t('common.brand');
  });
}
