<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTravelHistoryStore } from '@/stores/useTravelHistoryStore'

const router = useRouter()
const travelHistoryStore = useTravelHistoryStore()

const trips = computed(() => travelHistoryStore.getAllTrips)

const goBack = () => {
  router.back()
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return `Hoy ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const viewRouteAgain = (trip) => {
  router.push({
    path: '/search-route',
    query: {
      origin: trip.origin,
      destination: trip.destination
    }
  })
}

const clearHistory = () => {
  if (confirm('¿Estás seguro de eliminar el historial de viajes? (Las rutas de ejemplo se mantendrán)')) {
    travelHistoryStore.clearHistory()
  }
}

const getStepIcon = (step) => {
  if (step.type === 'walk' || step.mode === 'walking') return '🚶'
  if (step.type === 'bus' || step.mode === 'transit') {
    return step.busNumber ? `🚌 ${step.busNumber}` : '🚌'
  }
  if (step.type === 'stop') return '📍'
  return '📍'
}
</script>

<template>
  <div class="travel-history-container">
    <div class="header-section">
      <button class="back-btn" @click="goBack">
        {{ $t('travelHistory.back') }}
      </button>

      <div class="title-row">
        <h1 class="page-title">{{ $t('travelHistory.title') }}</h1>
        <button
            v-if="trips.length > 0"
            @click="clearHistory"
            class="clear-btn"
        >
          {{ $t('travelHistory.clearHistory') }}
        </button>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="trips.length === 0" class="empty-state">
      <h2>{{ $t('travelHistory.emptyTitle') }}</h2>
      <p>{{ $t('travelHistory.emptySubtitle') }}</p>
      <button @click="router.push('/search-route')" class="search-btn">
        {{ $t('travelHistory.searchRoute') }}
      </button>
    </div>

    <!-- Grid de viajes -->
    <div v-else class="trips-grid">
      <div
          v-for="trip in trips"
          :key="trip.id"
          class="trip-card"
      >
        <div class="trip-header">
          <span class="trip-date">{{ formatDate(trip.timestamp) }}</span>
          <button
              @click="viewRouteAgain(trip)"
              class="repeat-btn"
              :title="$t('travelHistory.repeatTooltip')"
          >
            🔄
          </button>
        </div>

        <div class="trip-route">
          <!-- Origen -->
          <div class="route-point origin">
            <span class="point-marker">A</span>
            <span class="point-name">{{ trip.origin }}</span>
          </div>

          <!-- Pasos del viaje -->
          <div class="route-steps" v-if="trip.steps && trip.steps.length > 0">
            <div
                v-for="(step, index) in trip.steps"
                :key="index"
                class="step-item"
            >
              <div class="step-line"></div>
              <div class="step-content">
                <span class="step-icon">{{ getStepIcon(step) }}</span>
                <span class="step-name">{{ step.name || step.location }}</span>
              </div>
            </div>
          </div>

          <!-- Destino -->
          <div class="route-point destination">
            <span class="point-marker">B</span>
            <span class="point-name">{{ trip.destination }}</span>
          </div>
        </div>

        <div class="trip-footer" v-if="trip.duration || trip.distance">
          <span v-if="trip.duration" class="trip-info">
            ⏱️ {{ trip.duration }}
          </span>
          <span v-if="trip.distance" class="trip-info">
            📏 {{ trip.distance }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.travel-history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem;
}

.header-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
}


.back-btn {
  align-self: flex-start;
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #333;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  color: #2e7d32;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
}

.clear-btn {
  background: #ff5252;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #e53935;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
}

.empty-state {
  max-width: 500px;
  margin: 4rem auto;
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.search-btn {
  background: #8bc34a;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #7cb342;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.4);
}

.trips-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.trip-card {
  background: #000;
  color: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.trip-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.trip-date {
  color: #8bc34a;
  font-weight: 600;
  font-size: 0.95rem;
}

.repeat-btn {
  background: #333;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.repeat-btn:hover {
  background: #8bc34a;
  transform: rotate(180deg);
}

.trip-route {
  margin-bottom: 1rem;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.point-marker {
  background: #8bc34a;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.destination .point-marker {
  background: #e53935;
}

.point-name {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.route-steps {
  margin: 0.5rem 0 0.5rem 16px;
}

.step-item {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  position: relative;
}

.step-line {
  width: 2px;
  height: 20px;
  background: #8bc34a;
  position: absolute;
  left: 15px;
  top: -10px;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 32px;
}

.step-icon {
  font-size: 0.9rem;
}

.step-name {
  font-size: 0.9rem;
  color: #ddd;
}

.trip-footer {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #333;
  margin-top: 1rem;
}

.trip-info {
  font-size: 0.875rem;
  color: #aaa;
}

@media (max-width: 768px) {
  .travel-history-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>