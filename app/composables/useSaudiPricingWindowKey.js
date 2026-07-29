const SAUDI_TZ = 'Asia/Riyadh';

function parseHm(time) {
  const [h = '0', m = '0'] = String(time || '00:00').split(':');

  return Number(h) * 60 + Number(m);
}

/** start inclusive, end exclusive; supports overnight windows. */
function isInWindow(nowMinutes, startTime, endTime) {
  const start = parseHm(startTime);
  const end = parseHm(endTime);

  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  }

  return nowMinutes >= start || nowMinutes < end;
}

function saudiParts(at = new Date()) {
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

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

/**
 * Cache-key segment for customer pricing windows.
 * Uses API night_pricing_window when available (silent — no UI about night fees).
 * Includes auth city id so per-city baked prices refresh correctly.
 */
export function useSaudiPricingWindowKey() {
  const layout = useLayoutStore();
  const auth = useAuthStore();

  function saudiPricingWindowKey(at = new Date()) {
    const { year, month, day, hour, minute } = saudiParts(at);
    const nowMinutes = hour * 60 + minute;
    const windowMeta = layout.night_pricing_window;
    const enabled = windowMeta?.enabled !== false;
    const start = windowMeta?.start_time || '00:00';
    const end = windowMeta?.end_time || '08:00';
    const inWindow = enabled && isInWindow(nowMinutes, start, end);
    const bucket = inWindow ? 'night' : 'day';
    const cityId = auth.user?.city_id ?? auth.user?.city?.id ?? 'nocity';

    return `${year}${month}${day}-${bucket}-c${cityId}`;
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

      watch(
        () => [layout.night_pricing_window, auth.user?.city_id, auth.user?.city?.id],
        () => {
          pricingWindowKey.value = saudiPricingWindowKey();
        },
        { deep: true },
      );

      onUnmounted(() => clearInterval(interval));
    });
  }

  return { pricingWindowKey, saudiPricingWindowKey };
}
