<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  center: {
    type: Object,
    required: true
  },
  markers: {
    type: Array,
    default: () => []
  },
  zoom: {
    type: Number,
    default: 15
  }
})

const mapContainer = ref(null)
const isLoading = ref(true)
const mapError = ref(null)

let map = null
let mapMarkers = []

const initMap = () => {
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }

  if (!window.google) {
    console.error('Google Maps API not loaded')
    mapError.value = 'Error al cargar Google Maps'
    return
  }

  try {
    map = new google.maps.Map(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    updateMarkers()
    isLoading.value = false
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = 'Error al inicializar el mapa'
  }
}

const updateMarkers = () => {
  if (!map || !props.markers.length) return

  mapMarkers.forEach(marker => {
    if (marker.infoWindow) marker.infoWindow.close()
    marker.setMap(null)
  })
  mapMarkers = []

  props.markers.forEach(markerData => {
    const position = {
      lat: markerData.latitude,
      lng: markerData.longitude
    }

    const markerIcon = markerData.isCurrentLocation
        ? {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
        : {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#8bc34a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }

    const marker = new google.maps.Marker({
      position,
      map,
      icon: markerIcon,
      title: markerData.name,
      animation: google.maps.Animation.DROP
    })

    const infoWindow = new google.maps.InfoWindow({
      content: createInfoWindowContent(markerData)
    })

    marker.addListener('click', () => {
      mapMarkers.forEach(m => {
        if (m.infoWindow) m.infoWindow.close()
      })
      infoWindow.open(map, marker)
    })

    marker.infoWindow = infoWindow
    mapMarkers.push(marker)
  })

  adjustMapBounds()
}

const adjustMapBounds = () => {
  if (!map || mapMarkers.length === 0) return

  if (mapMarkers.length === 1) {
    map.setCenter(props.center)
    map.setZoom(props.zoom)
  } else {
    const bounds = new google.maps.LatLngBounds()
    props.markers.forEach(marker => {
      bounds.extend({
        lat: marker.latitude,
        lng: marker.longitude
      })
    })
    map.fitBounds(bounds)

    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (map.getZoom() > 16) {
        map.setZoom(16)
      }
    })
  }
}

const createInfoWindowContent = (markerData) => {
  if (markerData.isCurrentLocation) {
    return `
      <div style="padding: 10px; max-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #4285F4; font-size: 16px; font-weight: bold;">
          📍 ${markerData.name}
        </h3>
      </div>
    `
  }

  const routesHtml = markerData.routes?.length > 0
      ? markerData.routes.map(route =>
          `<span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 4px; display: inline-block; margin-bottom: 4px;">${route}</span>`
      ).join('')
      : ''

  return `
    <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: bold;">
        ${markerData.name}
      </h3>
      ${markerData.address ? `
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
          📍 ${markerData.address}
        </p>
      ` : ''}
      ${markerData.distance ? `
        <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 13px; font-weight: bold;">
          📏 ${markerData.distance}
        </p>
      ` : ''}
      ${routesHtml ? `
        <div style="margin-top: 12px;">
          <p style="margin: 0 0 6px 0; color: #333; font-size: 13px; font-weight: bold;">
            🚌 Buses que pasan:
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${routesHtml}
          </div>
        </div>
      ` : ''}
    </div>
  `
}

const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      reject(new Error('Google Maps API key no configurada'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`
    script.async = true
    script.defer = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Error al cargar Google Maps API'))

    document.head.appendChild(script)
  })
}

watch(() => props.markers, () => {
  if (map) {
    updateMarkers()
  }
}, { deep: true })

watch(() => props.center, (newCenter) => {
  if (map && newCenter) {
    map.panTo(newCenter)
  }
}, { deep: true })

onMounted(async () => {
  try {
    await loadGoogleMapsScript()
    setTimeout(() => initMap(), 100)
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    mapError.value = error.message
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (map) {
    mapMarkers.forEach(marker => {
      if (marker.infoWindow) marker.infoWindow.close()
      marker.setMap(null)
    })
    mapMarkers = []
    map = null
  }
})
</script>

<template>
  <div class="google-map-wrapper">
    <div v-if="isLoading" class="map-loading">
      <div class="spinner">⏳</div>
      <span>Cargando mapa...</span>
    </div>

    <div v-else-if="mapError" class="map-error">
      <div class="error-icon">⚠️</div>
      <p>{{ mapError }}</p>
    </div>

    <div
        ref="mapContainer"
        class="google-map-container"
        :class="{ 'map-hidden': isLoading || mapError }"
    />
  </div>
</template>

<style scoped>
.google-map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.google-map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f0f0f0;
}

.map-hidden {
  display: none;
}

.map-loading,
.map-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 500px;
  background: #f9f9f9;
  border-radius: 12px;
  color: #666;
}

.map-loading {
  gap: 15px;
}

.map-error {
  gap: 10px;
  padding: 20px;
  text-align: center;
}

.spinner {
  font-size: 2.5em;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 3em;
}

.map-error p {
  margin: 0;
  color: #d32f2f;
  font-size: 1.1em;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>