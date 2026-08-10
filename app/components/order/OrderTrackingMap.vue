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

  const { t } = useI18n();
  const mapEl = ref(null);
  let mapInstance = null;
  let polyline = null;
  let remainingLine = null;
  let techMarker = null;
  let destMarker = null;
  let startMarker = null;

  const { onLoaded } = useScriptGoogleMaps({
    scriptOptions: {
      trigger: 'onNuxtReady',
    },
  });

  function toLatLng(point) {
    if (!point) return null;

    const lat = Number(point.lat);
    const lng = Number(point.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  }

  function markerIcon(maps, type) {
    const svg =
      type === 'customer'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
            <defs>
              <filter id="cs" x="-30%" y="-20%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#7f1d1d" flood-opacity="0.35"/>
              </filter>
            </defs>
            <path filter="url(#cs)" fill="#dc2626" d="M22 2C12.06 2 4 10.06 4 20c0 12.5 18 32 18 32s18-19.5 18-32C40 10.06 31.94 2 22 2z"/>
            <circle cx="22" cy="20" r="11.5" fill="#ffffff"/>
            <path fill="#dc2626" d="M22 12.2l-7.2 5.6v9.2h4.6v-5.1h5.2v5.1h4.6v-9.2L22 12.2z"/>
          </svg>`
        : type === 'technician'
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
              <defs>
                <filter id="ts" x="-30%" y="-20%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0c4a6e" flood-opacity="0.35"/>
                </filter>
              </defs>
              <path filter="url(#ts)" fill="#0284c7" d="M22 2C12.06 2 4 10.06 4 20c0 12.5 18 32 18 32s18-19.5 18-32C40 10.06 31.94 2 22 2z"/>
              <circle cx="22" cy="20" r="11.5" fill="#ffffff"/>
              <path fill="#0284c7" d="M22 13.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6zm0 9.2c-3.5 0-7.2 1.7-7.2 3.8v1.8h14.4v-1.8c0-2.1-3.7-3.8-7.2-3.8z"/>
            </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="9" fill="#6b7280" stroke="#ffffff" stroke-width="2.5"/>
              <circle cx="11" cy="11" r="3.2" fill="#ffffff"/>
            </svg>`;

    if (type === 'start') {
      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new maps.Size(18, 18),
        anchor: new maps.Point(9, 9),
      };
    }

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new maps.Size(40, 51),
      anchor: new maps.Point(20, 51),
    };
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

    const tech = toLatLng(props.technician) || toLatLng((props.pathPoints || []).at(-1));
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

    if (startMarker) {
      startMarker.setMap(null);
      startMarker = null;
    }

    if (remainingLine) {
      remainingLine.setMap(null);
      remainingLine = null;
    }

    if (path.length) {
      startMarker = new maps.Marker({
        map: mapInstance,
        position: path[0],
        title: t('order.tracking.route_start'),
        icon: markerIcon(maps, 'start'),
        zIndex: 2,
      });
    }

    const tech = toLatLng(props.technician) || path[path.length - 1] || null;

    if (tech) {
      if (!techMarker) {
        techMarker = new maps.Marker({
          map: mapInstance,
          position: tech,
          title: t('order.tracking.technician'),
          icon: markerIcon(maps, 'technician'),
          zIndex: 4,
        });
      } else {
        techMarker.setPosition(tech);
        techMarker.setIcon(markerIcon(maps, 'technician'));
      }

      const dest = toLatLng(props.destination);
      if (dest) {
        remainingLine = new maps.Polyline({
          map: mapInstance,
          path: [tech, dest],
          geodesic: true,
          strokeColor: '#f59e0b',
          strokeOpacity: 0,
          icons: [
            {
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                strokeColor: '#f59e0b',
                scale: 3,
              },
              offset: '0',
              repeat: '12px',
            },
          ],
          zIndex: 1,
        });
      }
    } else if (techMarker) {
      techMarker.setMap(null);
      techMarker = null;
    }

    const dest = toLatLng(props.destination);

    if (dest) {
      if (!destMarker) {
        destMarker = new maps.Marker({
          map: mapInstance,
          position: dest,
          title: t('order.tracking.destination'),
          icon: markerIcon(maps, 'customer'),
          zIndex: 5,
        });
      } else {
        destMarker.setPosition(dest);
        destMarker.setIcon(markerIcon(maps, 'customer'));
      }
    }

    fitBounds(maps);
  }

  onMounted(() => {
    onLoaded(async (instance) => {
      const maps = await instance.maps;
      const center = toLatLng(props.destination) ||
        toLatLng(props.technician) ||
        toLatLng((props.pathPoints || [])[0]) || { lat: 24.7136, lng: 46.6753 };

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

    <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
      <span class="inline-flex items-center gap-1.5">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3 4 9.2V20h5.2v-5.4h5.6V20H20V9.2L12 3z" />
          </svg>
        </span>
        {{ $t('order.tracking.destination') }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 4.5V20h16v-1.5C20 16 16 14 12 14z" />
          </svg>
        </span>
        {{ $t('order.tracking.technician') }}
      </span>
    </div>

    <div ref="mapEl" class="w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100" />
  </div>
</template>
