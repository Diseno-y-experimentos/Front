<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  origin: String,
  destination: String,
  currentLocation: String,
  currentCoords: Array,
  showRoute: Boolean
})

const emit = defineEmits(['routeReady'])

const mapContainer = ref(null)
let map = null
let markers = []

const initMap = () => {
  if (!mapContainer.value) return

  const defaultCoords = props.currentCoords
      ? { lat: props.currentCoords[0], lng: props.currentCoords[1] }
      : { lat: -12.0866, lng: -77.0850 } // UPC San Miguel

  map = new google.maps.Map(mapContainer.value, {
    center: defaultCoords,
    zoom: 15,
    mapTypeControl: false,
    fullscreenControl: true,
    streetViewControl: false
  })

  showCurrentLocation()
}

const showCurrentLocation = () => {
  if (!map) return

  const coords = props.currentCoords
      ? { lat: props.currentCoords[0], lng: props.currentCoords[1] }
      : { lat: -12.0866, lng: -77.0850 }


  clearMarkers()

  // Crear marcador de ubicación actual
  const marker = new google.maps.Marker({
    position: coords,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    },
    title: props.currentLocation || 'Tu ubicación'
  })

  markers.push(marker)
  map.setCenter(coords)
  map.setZoom(15)
}

const geocodeAddress = async (address) => {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].geometry.location)
      } else {
        reject(new Error('Geocoding failed'))
      }
    })
  })
}

const showRouteMarkers = async () => {
  if (!props.origin || !props.destination || !map) return

  try {

    clearMarkers()

    // Geocodificar origen y destino
    const originLocation = await geocodeAddress(props.origin)
    const destLocation = await geocodeAddress(props.destination)


    const originMarker = new google.maps.Marker({
      position: originLocation,
      map: map,
      label: 'A',
      title: 'Origen: ' + props.origin,
      animation: google.maps.Animation.DROP
    })


    const destMarker = new google.maps.Marker({
      position: destLocation,
      map: map,
      label: 'B',
      title: 'Destino: ' + props.destination,
      animation: google.maps.Animation.DROP
    })

    markers.push(originMarker, destMarker)


    const bounds = new google.maps.LatLngBounds()
    bounds.extend(originLocation)
    bounds.extend(destLocation)
    map.fitBounds(bounds)


    emit('routeReady', {
      origin: props.origin,
      destination: props.destination,
      originLocation: { lat: originLocation.lat(), lng: originLocation.lng() },
      destLocation: { lat: destLocation.lat(), lng: destLocation.lng() }
    })

  } catch (error) {
    console.error('Error showing route markers:', error)

  }
}

const clearMarkers = () => {
  markers.forEach(marker => marker.setMap(null))
  markers = []
}

watch(() => props.showRoute, (newVal) => {
  if (newVal) {
    showRouteMarkers()
  } else {
    clearMarkers()
    showCurrentLocation()
  }
})

watch(() => props.currentCoords, () => {
  if (!props.showRoute) {
    showCurrentLocation()
  }
}, { deep: true })

onMounted(() => {
  // Cargar Google Maps API si no está cargada
  if (!window.google) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => {
      setTimeout(() => initMap(), 100)
    }
    document.head.appendChild(script)
  } else {
    setTimeout(() => initMap(), 100)
  }
})

onBeforeUnmount(() => {
  if (map) {
    clearMarkers()
    map = null
  }
})
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 640px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: #f0f0f0;
}
</style>