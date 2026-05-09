<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

const props = defineProps({
  origin: String,
  destination: String,
  currentLocation: String,
  showRoute: Boolean
})

const mapContainer = ref(null)
let map = null
let routingControl = null
let currentLocationMarker = null

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const initMap = () => {
  // Inicializar mapa
  map = L.map(mapContainer.value).setView([-12.0464, -77.0428], 13)

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
}

const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'BusTrack App' } }
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

const showCurrentLocation = async () => {
  if (!props.currentLocation || !map) return

  const coords = await geocodeAddress(props.currentLocation)
  if (coords) {

    if (currentLocationMarker) {
      map.removeLayer(currentLocationMarker)
    }

    // Crear marcador personalizado azul para ubicación actual
    const blueIcon = L.divIcon({
      className: 'custom-location-marker',
      html: '<div style="background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    currentLocationMarker = L.marker(coords, { icon: blueIcon })
        .addTo(map)
        .bindPopup('Tu ubicación actual')

    map.setView(coords, 15)
  }
}

const calculateRoute = async () => {
  if (!props.origin || !props.destination || !map) return

  const originCoords = await geocodeAddress(props.origin)
  const destCoords = await geocodeAddress(props.destination)

  if (!originCoords || !destCoords) {
    alert('No se pudieron encontrar las direcciones. Por favor, verifica que sean correctas.')
    return
  }

  // Remover ruta anterior si existe
  if (routingControl) {
    map.removeControl(routingControl)
  }

  // Remover marcador de ubicación actual si existe
  if (currentLocationMarker) {
    map.removeLayer(currentLocationMarker)
    currentLocationMarker = null
  }

  // Crear control de rutas
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(originCoords[0], originCoords[1]),
      L.latLng(destCoords[0], destCoords[1])
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: {
      styles: [{ color: '#8bc34a', weight: 6, opacity: 0.8 }]
    },
    createMarker: function(i, waypoint, n) {
      const marker = L.marker(waypoint.latLng, {
        draggable: false,
        icon: L.icon({
          iconUrl: i === 0
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
      marker.bindPopup(i === 0 ? 'Origen' : 'Destino')
      return marker
    }
  }).addTo(map)

  // Personalizar el panel de instrucciones
  const routingContainer = document.querySelector('.leaflet-routing-container')
  if (routingContainer) {
    routingContainer.style.display = 'none'
  }
}

watch(() => props.showRoute, (newVal) => {
  if (newVal) {
    calculateRoute()
  } else {

    if (routingControl) {
      map.removeControl(routingControl)
      routingControl = null
    }
    showCurrentLocation()
  }
})

watch(() => props.currentLocation, () => {
  if (!props.showRoute) {
    showCurrentLocation()
  }
})

onMounted(() => {
  initMap()
  if (props.currentLocation && !props.showRoute) {
    setTimeout(() => showCurrentLocation(), 500)
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
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
  z-index: 1;
}


:deep(.leaflet-routing-container) {
  display: none;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
}
</style>