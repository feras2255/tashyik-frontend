const LIVE_STATUSES = ['service-provider-on-the-way', 'service-provider-arrived'];
const TRAIL_STATUSES = [...LIVE_STATUSES, 'started'];

/**
 * Customer order live tracking: one snapshot + Pusher deltas (no polling loop).
 */
export function useOrderTracking(orderId, orderStatus) {
  const { $echo } = useNuxtApp();
  const apiFetch = useApiFetchClient();

  const trackingActive = ref(false);
  const status = ref(unref(orderStatus) || null);
  const technician = ref(null);
  const destination = ref(null);
  const distanceKm = ref(null);
  const etaMinutes = ref(null);
  const pathPoints = ref([]);
  const loading = ref(false);
  const error = ref(null);

  let channel = null;
  let subscribedOrderId = null;

  const shouldTrack = computed(() => {
    const current = unref(orderStatus) || status.value;

    return TRAIL_STATUSES.includes(current);
  });

  function applySnapshot(data) {
    status.value = data.status ?? status.value;
    trackingActive.value = Boolean(data.tracking_active);
    technician.value = data.technician ?? null;
    destination.value = data.destination ?? null;
    distanceKm.value = data.distance_km ?? null;
    etaMinutes.value = data.eta_minutes ?? null;
    pathPoints.value = Array.isArray(data.path_points) ? [...data.path_points] : [];
  }

  function appendPoint(point, nextTechnician, nextDistance, nextEta) {
    if (!point?.lat || !point?.lng) {
      return;
    }

    pathPoints.value = [...pathPoints.value, point];

    if (nextTechnician) {
      technician.value = nextTechnician;
    } else {
      technician.value = {
        lat: point.lat,
        lng: point.lng,
        updated_at: point.recorded_at,
        is_stale: false,
      };
    }

    if (nextDistance != null) {
      distanceKm.value = nextDistance;
    }

    if (nextEta != null) {
      etaMinutes.value = nextEta;
    }
  }

  async function fetchSnapshot() {
    const id = unref(orderId);

    if (!id) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await apiFetch(`/user/orders/${id}/tracking`);
      applySnapshot(data);
    } catch (e) {
      error.value = e;
      trackingActive.value = false;
    } finally {
      loading.value = false;
    }
  }

  function leaveChannel() {
    if (!$echo || !subscribedOrderId) {
      return;
    }

    $echo.leave(`order.${subscribedOrderId}`);
    channel = null;
    subscribedOrderId = null;
  }

  function subscribe() {
    const id = unref(orderId);

    if (!$echo || !id || !LIVE_STATUSES.includes(status.value || unref(orderStatus))) {
      return;
    }

    if (subscribedOrderId === id && channel) {
      return;
    }

    leaveChannel();
    subscribedOrderId = id;
    channel = $echo.private(`order.${id}`);

    channel.listen('.TechnicianLocationUpdated', (payload) => {
      appendPoint(payload.point, payload.technician, payload.distance_km, payload.eta_minutes);

      if (payload.destination) {
        destination.value = payload.destination;
      }
    });

    channel.listen('.OrderTrackingStatusChanged', (payload) => {
      status.value = payload.status ?? status.value;
      trackingActive.value = Boolean(payload.tracking_active);

      if (!payload.tracking_active) {
        leaveChannel();
      }
    });
  }

  async function start() {
    if (!shouldTrack.value) {
      return;
    }

    await fetchSnapshot();

    if (trackingActive.value || LIVE_STATUSES.includes(status.value)) {
      subscribe();
    }
  }

  function stop() {
    leaveChannel();
  }

  watch(
    () => unref(orderId),
    async () => {
      stop();
      await start();
    },
  );

  onMounted(() => {
    start();
  });

  onBeforeUnmount(() => {
    stop();
  });

  return {
    trackingActive,
    status,
    technician,
    destination,
    distanceKm,
    etaMinutes,
    pathPoints,
    loading,
    error,
    shouldTrack,
    fetchSnapshot,
    start,
    stop,
  };
}
