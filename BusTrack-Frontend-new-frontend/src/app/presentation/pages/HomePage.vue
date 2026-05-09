<script setup lang="js">
import { ref, onMounted, onUnmounted } from 'vue'
import LocationBadge from "@/shared/presentation/components/LocationBadge.vue"
import RouteMapEmbed from "@/shared/presentation/components/RouteMapEmbed.vue"
import RouteForm from "@/searchroute/presentation/views/route-form.vue"
import RouteResults from "@/searchroute/presentation/components/RouteResults.vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const DEFAULT_LOCATION = 'UPC - Campus San Miguel, Av. de la Marina 2810, San Miguel 15087'
const DEFAULT_COORDS = [-12.0866, -77.0850]

const address = ref(DEFAULT_LOCATION)
const coords = ref(DEFAULT_COORDS)
const showRoute = ref(false)
const routeData = ref({ origin: '', destination: '' })
const routeInfo = ref(null)
let watchId = null

const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'BusTrack App' } }
    )
    const data = await response.json()
    if (data && data.display_name) return data.display_name
    return DEFAULT_LOCATION
  } catch (error) {
    console.error('Error al obtener dirección:', error)
    return DEFAULT_LOCATION
  }
}

const trackLocation = () => {
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          coords.value = [latitude, longitude]
          const locationAddress = await getAddressFromCoords(latitude, longitude)
          address.value = locationAddress
        },
        (error) => {
          console.log('Geolocation error:', error)
          address.value = DEFAULT_LOCATION
          coords.value = DEFAULT_COORDS
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    )
  } else {
    address.value = DEFAULT_LOCATION
    coords.value = DEFAULT_COORDS
  }
}

const handleSearch = (data) => {
  routeData.value = data
  showRoute.value = true
  routeInfo.value = null
}

const handleRouteReady = (data) => {
  routeInfo.value = data
}

const resetToCurrentLocation = () => {
  showRoute.value = false
  routeInfo.value = null
  routeData.value = { origin: '', destination: '' }
}

onMounted(() => {
  trackLocation()
})

onUnmounted(() => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})
</script>

<template>
  <div class="page">
    <main class="wrap">
      <div class="two-col">

        <!-- Mapa -->
        <section class="left-col">
          <div class="badge-row">
            <LocationBadge
                :text="showRoute ? t('home.showingRoute') : address"
                @click="resetToCurrentLocation"
                :style="{ cursor: showRoute ? 'pointer' : 'default' }"
            />
          </div>

          <section class="map-section">
            <RouteMapEmbed
                :current-location="address"
                :current-coords="coords"
                :origin="routeData.origin"
                :destination="routeData.destination"
                :show-route="showRoute"
                @route-ready="handleRouteReady"
            />
          </section>
        </section>


        <section class="right-col">

          <div v-if="!showRoute">
            <h2 class="section-title center">{{ t('home.searchTitle') }}</h2>
            <div class="card">
              <RouteForm @search="handleSearch" />
            </div>
          </div>


          <div v-else class="results-wrapper">
            <RouteResults
                :origin="routeData.origin"
                :destination="routeData.destination"
                :route-data="routeInfo"
            />
            <button class="new-search-btn" @click="resetToCurrentLocation">
              ← {{ t('home.newSearch') }}
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.wrap {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  flex: 1;
}

.two-col {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 32px;
  align-items: start;
}

.left-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  font-size: 1.06rem;
  margin-top: 50px;
}

.right-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-left: 20px;
  margin-top: 200px;
}

.section-title {
  width: 100%;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: .5px;
  color: #333;
  margin: 8px 0;
}

.section-title.center {
  text-align: center;
}

.badge-row {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  transform: scale(1.08);
  transform-origin: left center;
}

.card {
  width: 100%;
  max-width: 720px;
  background: #8bc34a;
  border: none;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}

.map-section {
  width: 100%;
}

.results-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.new-search-btn {
  width: 100%;
  background: #8bc34a;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-search-btn:hover {
  background: #7cb342;
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  .two-col {
    display: flex;
    flex-direction: column;
  }
  .right-col .card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .wrap {
    padding: 24px 12px 32px;
  }
  .section-title {
    font-size: 18px;
  }
}
</style>