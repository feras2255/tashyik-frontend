<script setup>
  const props = defineProps({
    pathPoints: {
      type: Array,
      default: () => [],
    },
    technician: {
      type: Object,
      default: null,
    },
    destination: {
      type: Object,
      default: null,
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    etaMinutes: {
      type: Number,
      default: null,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
    trackingActive: {
      type: Boolean,
      default: false,
    },
  });

  const mapEl = ref(null);
  let mapInstance = null;
  let polyline = null;
  let techMarker = null;
  let destMarker = null;

  const { onLoaded } = useScriptGoogleMaps({
    scriptOptions: {
      trigger: 'onNuxtReady',
    },
  });

  function toLatLng(point) {
    if (!point) return null;

    return { lat: Number(point.lat), lng: Number(point.lng) };
  }

  function fitBounds(maps) {
    const bounds = new maps.LatLngBounds();
    let has = false;

    (props.pathPoints || []).forEach((p) => {
      const ll = toLatLng(p);
      if (ll) {
        bounds.extend(ll);
        has = true;
      }
    });

    const tech = toLatLng(props.technician);
    const dest = toLatLng(props.destination);

    if (tech) {
      bounds.extend(tech);
      has = true;
    }

    if (dest) {
      bounds.extend(dest);
      has = true;
    }

    if (has && mapInstance) {
      mapInstance.fitBounds(bounds, 48);
    }
  }

  function render(maps) {
    if (!mapInstance) {
      return;
    }

    const path = (props.pathPoints || []).map(toLatLng).filter(Boolean);

    if (!polyline) {
      polyline = new maps.Polyline({
        map: mapInstance,
        path,
        geodesic: true,
        strokeColor: '#0f766e',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      });
    } else {
      polyline.setPath(path);
    }

    const tech = toLatLng(props.technician) || path[path.length - 1] || null;

    if (tech) {
      if (!techMarker) {
        techMarker = new maps.Marker({
          map: mapInstance,
          position: tech,
          title: 'Technician',
        });
      } else {
        techMarker.setPosition(tech);
      }
    }

    const dest = toLatLng(props.destination);

    if (dest && !destMarker) {
      destMarker = new maps.Marker({
        map: mapInstance,
        position: dest,
        title: 'Destination',
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#dc2626',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }

    fitBounds(maps);
  }

  onMounted(() => {
    onLoaded(async (instance) => {
      const maps = await instance.maps;
      const center = toLatLng(props.destination) || toLatLng(props.technician) || { lat: 24.7136, lng: 46.6753 };

      mapInstance = new maps.Map(mapEl.value, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
      });

      render(maps);

      watch(
        () => [props.pathPoints, props.technician, props.destination],
        () => render(maps),
        { deep: true },
      );
    });
  });
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
      <span v-if="trackingActive" class="inline-flex items-center gap-1.5 font-medium text-brand-600">
        <span class="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
        {{ $t('order.tracking.live') }}
      </span>
      <span v-if="isStale" class="text-amber-600">{{ $t('order.tracking.stale') }}</span>
      <span v-if="distanceKm != null">{{ $t('order.tracking.distance', { km: distanceKm }) }}</span>
      <span v-if="etaMinutes != null">{{ $t('order.tracking.eta', { minutes: etaMinutes }) }}</span>
    </div>
    <div ref="mapEl" class="w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100" />
  </div>
</template>
