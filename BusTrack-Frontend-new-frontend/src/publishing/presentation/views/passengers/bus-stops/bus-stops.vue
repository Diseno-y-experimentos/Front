<script setup>
import { ref, onMounted, computed } from 'vue'
import GoogleMap from './GoogleMap.vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from "@/stores/useNotificationsStore.js"
import { useAlertsStore } from "@/stores/useAlertsStore.js"

const { t } = useI18n()

const paraderos = ref([])
let currentLocation = ref(null) // ← CAMBIO: let en lugar de const
const loading = ref(true)
let errorMessage = ref('') // ← CAMBIO: let en lugar de const
const notificationsStore = useNotificationsStore()
const alertsStore = useAlertsStore()

const DEFAULT_LOCATION = {
  latitude: -12.0866,
  longitude: -77.0850,
  name: "UPC - Campus San Miguel"
}

const FALLBACK_STOPS = [
  {
    id: 'ns1',
    name: 'Rafael Escardó',
    latitude: -12.083420,
    longitude: -77.075280,
    distance: '150 m',
    address: 'Av. La Marina 2810, San Miguel 15087',
    routes: ['201', '204', '1173', '1286', 'OMB', 'OM36']
  },
  {
    id: 'ns2',
    name: 'Hiraoka',
    latitude: -12.082560,
    longitude: -77.073890,
    distance: '500 m',
    address: 'Av. La Marina 2350, San Miguel 15087',
    routes: ['1275', 'IMB']
  }
]

const OVERPASS_API_URL = import.meta.env.VITE_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter'
const SEARCH_RADIUS = 600

const mapCenter = computed(() => ({
  lat: currentLocation.value?.latitude || DEFAULT_LOCATION.latitude,
  lng: currentLocation.value?.longitude || DEFAULT_LOCATION.longitude
}))

const mapMarkers = computed(() => {
  const markers = []

  if (currentLocation.value) {
    markers.push({
      ...currentLocation.value,
      name: "Tu ubicación",
      isCurrentLocation: true
    })
  }

  paraderos.value.forEach(paradero => {
    markers.push({
      ...paradero,
      isCurrentLocation: false
    })
  })

  return markers
})

const isUsingDefaultLocation = computed(() => {
  return !currentLocation.value || currentLocation.value.name === DEFAULT_LOCATION.name
})

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c

  return distance < 1000
      ? `${Math.round(distance)} m`
      : `${(distance / 1000).toFixed(1)} km`
}

const getUserLocation = () => {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: "Tu ubicación actual"
            })
          },
          (error) => {
            console.warn('Geolocation error, usando ubicación default:', error)
            resolve(DEFAULT_LOCATION)
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000
          }
      )
    } else {
      resolve(DEFAULT_LOCATION)
    }
  })
}

const fetchNearbyStops = async (lat, lon) => {
  try {
    const query = `
      [out:json];
      node
        (around:${SEARCH_RADIUS},${lat},${lon})
        ["highway"="bus_stop"];
      out;
    `

    const url = OVERPASS_API_URL + '?data=' + encodeURIComponent(query)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    const stops = data.elements.map((el) => ({
      id: el.id || `stop-${Math.random()}`,
      name: el.tags?.name || 'Paradero sin nombre',
      latitude: el.lat,
      longitude: el.lon,
      address: el.tags?.description || 'Dirección no disponible',
      distance: calculateDistance(lat, lon, el.lat, el.lon),
      routes: el.tags?.route_ref ? el.tags.route_ref.split(';') : []
    }))

    return stops

  } catch (error) {
    console.error('Error fetching stops from Overpass:', error)
    throw error
  }
}

const openDirections = (paradero) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${paradero.latitude},${paradero.longitude}`
  window.open(url, '_blank')
}

const setNotification = (paradero) => {
  if (!notificationsStore.areNotificationsEnabled()) {
    alert('⚠️ Las notificaciones están desactivadas.\n\nActívalas en Configuración para recibir alertas de retrasos.')
    return
  }

  notificationsStore.configureStopNotification(paradero)

  alert(`✅ Notificación configurada para:\n"${paradero.name}"\n\n🔔 Recibirás alertas si hay retrasos mayores a 10 minutos.`)
}

// Testing US05
const testUS05 = (delayMinutes, enabled = true) => {
  console.log('\n🧪 ===== TESTING US05 =====')
  console.log(`Retraso simulado: ${delayMinutes} minutos`)
  console.log(`Notificaciones habilitadas: ${enabled}`)

  localStorage.setItem('notificationsEnabled', enabled.toString())

  const testData = {
    busNumber: '201',
    routeName: 'Ruta San Miguel - Miraflores',
    delayMinutes: delayMinutes,
    stopName: 'Rafael Escardó'
  }

  const notified = notificationsStore.notifyDelay(testData)

  if (notified) {
    alertsStore.reportMajorDelay(
        testData.busNumber,
        testData.routeName,
        testData.delayMinutes,
        testData.stopName
    )
  }

  console.log('========================\n')

  return notified
}

onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    currentLocation.value = await getUserLocation()

    try {
      const stops = await fetchNearbyStops(
          currentLocation.value.latitude,
          currentLocation.value.longitude
      )

      if (stops.length === 0) {
        paraderos.value = FALLBACK_STOPS
        errorMessage.value = 'No se encontraron paraderos reales. Mostrando paraderos de ejemplo.'
      } else if (stops.length < 3) {
        paraderos.value = [...stops, ...FALLBACK_STOPS].slice(0, 10)
      } else {
        paraderos.value = stops
      }

    } catch (overpassError) {
      console.warn('Overpass API falló, usando paraderos de respaldo')
      paraderos.value = FALLBACK_STOPS
      errorMessage.value = 'No se pudieron cargar paraderos en tiempo real. Mostrando paraderos de ejemplo.'
    }

  } catch (error) {
    console.error('Error crítico cargando paraderos:', error)
    currentLocation.value = DEFAULT_LOCATION
    paraderos.value = FALLBACK_STOPS
    errorMessage.value = 'Error al cargar paraderos. Mostrando información de respaldo.'
  } finally {
    loading.value = false
  }
})

if (import.meta.env.DEV) {
  window.testUS05 = testUS05
  console.log('🧪 Testing disponible: testUS05(delayMinutes, enabled)')
  console.log('Ejemplo: testUS05(15, true) → Debe notificar')
  console.log('Ejemplo: testUS05(5, true) → NO debe notificar')
  console.log('Ejemplo: testUS05(15, false) → NO debe notificar (deshabilitado)')
}
</script>

<template>
  <div class="paraderos-page">
    <div class="content">
      <h1>{{ t('busStops.title') }}</h1>

      <!-- Mensaje de error si existe -->
      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Contenido principal -->
      <div v-if="!loading" class="main-layout">
        <!-- Lista de paraderos -->
        <div class="paraderos-list">
          <div
              v-for="paradero in paraderos"
              :key="paradero.id"
              class="paradero-card"
          >
            <div class="card-header">
              <h3>{{ paradero.name }}</h3>
              <span class="distance">{{ paradero.distance }}</span>
            </div>

            <div class="card-content">
              <p class="address">📍 {{ paradero.address }}</p>

              <div class="buses-section" v-if="paradero.routes.length > 0">
                <h4>{{ t('busStops.passingBuses') }}</h4>
                <div class="buses-grid">
                  <span
                      v-for="ruta in paradero.routes"
                      :key="ruta"
                      class="bus-tag"
                  >
                    {{ ruta }}
                  </span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button
                  class="btn btn-primary"
                  @click="openDirections(paradero)"
              >
                {{ t('busStops.directions') }}
              </button>
              <button
                  class="btn btn-secondary"
                  @click="setNotification(paradero)"
              >
                {{ t('busStops.notifyArrival') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mapa -->
        <div class="map-section">
          <GoogleMap
              :center="mapCenter"
              :markers="mapMarkers"
              :zoom="15"
          />
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="spinner">⏳</div>
        <span>{{ t('busStops.loading') }}</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.paraderos-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
}

.content h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 2em;
}

.location-info {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95em;
}

.error-message {
  background: #fff3cd;
  color: #856404;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border-left: 4px solid #ffc107;
}

.main-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  min-height: 700px;
}

.paraderos-list {
  flex: 0 0 450px;
}

.map-section {
  flex: 1;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paradero-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #789c0a;
  transition: transform 0.2s, box-shadow 0.2s;
}

.paradero-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
}

.distance {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  font-weight: bold;
}

.address {
  color: #666;
  margin: 0 0 15px 0;
  font-size: 0.95em;
}

.buses-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1em;
}

.buses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bus-tag {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: bold;
  border: 1px solid #c8e6c9;
  font-size: 0.9em;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #789c0a;
  color: white;
}

.btn-secondary:hover {
  background: #677e08;
  transform: translateY(-1px);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  gap: 15px;
  color: #666;
  font-size: 1.1em;
}

.spinner {
  font-size: 2.5em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


@media (max-width: 1024px) {
  .main-layout {
    gap: 30px;
  }

  .paraderos-list {
    flex: 0 0 400px;
  }

  .map-section {
    height: 550px;
  }
}

@media (max-width: 768px) {
  .paraderos-page {
    padding: 15px;
  }

  .main-layout {
    flex-direction: column;
    gap: 20px;
    min-height: auto;
  }

  .paraderos-list {
    flex: none;
    width: 100%;
  }

  .map-section {
    height: 400px;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>