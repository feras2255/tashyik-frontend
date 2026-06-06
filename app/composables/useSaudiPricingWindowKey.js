const SAUDI_TZ = 'Asia/Riyadh';

/** Default night window: 00:00–08:00 Saudi (start inclusive, end exclusive). */
function isSaudiNightWindow(hour, minute) {
  const nowMinutes = hour * 60 + minute;

  return nowMinutes >= 0 && nowMinutes < 8 * 60;
}

/**
 * Returns a stable cache-key segment for customer pricing windows (Saudi time).
 * Changes at night-window boundaries so SSR/client caches refresh when surcharge toggles.
 */
export function useSaudiPricingWindowKey() {
  function saudiPricingWindowKey(at = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: SAUDI_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(at);

    const get = (type) => parts.find((p) => p.type === type)?.value ?? '00';
    const hour = Number(get('hour'));
    const minute = Number(get('minute'));
    const bucket = isSaudiNightWindow(hour, minute) ? 'night' : 'day';

    return `${get('year')}${get('month')}${get('day')}-${bucket}`;
  }

  const pricingWindowKey = ref(saudiPricingWindowKey());

  if (import.meta.client) {
    onMounted(() => {
      pricingWindowKey.value = saudiPricingWindowKey();

      const interval = setInterval(() => {
        const next = saudiPricingWindowKey();
        if (next !== pricingWindowKey.value) {
          pricingWindowKey.value = next;
        }
      }, 60_000);

      onUnmounted(() => clearInterval(interval));
    });
  }

  return { pricingWindowKey, saudiPricingWindowKey };
}
