<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSavedRoutesStore } from '@/stores/useSavedRoutesStore'
import { useNotificationsStore } from '@/stores/useNotificationsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const savedRoutesStore = useSavedRoutesStore()
const notificationsStore = useNotificationsStore()

const routes = computed(() => savedRoutesStore.getAllRoutes)

const goBack = () => {
  router.back()
}

const viewRouteDetails = (route) => {

  router.push({
    path: '/search-route',
    query: {
      origin: route.origin,
      destination: route.destination
    }
  })
}

const removeRoute = (routeId) => {
  if (confirm(t('favoriteRoutes.confirmDelete'))) {
    savedRoutesStore.removeRoute(routeId)

    notificationsStore.addNotification({
      type: 'info',
      messageKey: 'favoriteRoutes.removed', // mejor usar messageKey
      priority: 'low',
      icon: '🗑️'
    })
  }
}


const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const openInGoogleMaps = (route) => {
  const origin = encodeURIComponent(route.origin)
  const destination = encodeURIComponent(route.destination)
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="favorite-routes-container">

    <div class="header-section">
      <button class="back-btn" @click="goBack">
        {{ $t('favoriteRoutes.back') }}
      </button>
      <h1 class="page-title">{{ $t('favoriteRoutes.title') }}</h1>
    </div>

    <div v-if="routes.length === 0" class="empty-state">
      <div class="empty-icon">📍</div>
      <h2>{{ $t('favoriteRoutes.emptyTitle') }}</h2>
      <p>{{ $t('favoriteRoutes.emptySubtitle') }}</p>
      <button @click="router.push('/search-route')" class="search-btn">
        {{ $t('favoriteRoutes.searchButton') }}
      </button>
    </div>

    <div v-else class="routes-grid">
      <div
          v-for="route in routes"
          :key="route.id"
          class="route-card"
      >
        <div class="route-header">
          <span class="route-icon">🚌</span>
          <span class="route-date">{{ formatDate(route.savedAt) }}</span>
        </div>

        <div class="route-details">
          <div class="location-item origin">
            <span class="location-marker">A</span>
            <div class="location-text">
              <span class="location-label">
                {{ $t('favoriteRoutes.origin') }}
              </span>
              <span class="location-name">{{ route.origin }}</span>
            </div>
          </div>

          <div class="route-arrow">→</div>

          <div class="location-item destination">
            <span class="location-marker">B</span>
            <div class="location-text">
              <span class="location-label">
                {{ $t('favoriteRoutes.destination') }}
              </span>
              <span class="location-name">{{ route.destination }}</span>
            </div>
          </div>
        </div>

        <div class="route-actions">
          <button @click="viewRouteDetails(route)" class="action-btn primary">
            {{ $t('favoriteRoutes.viewRoute') }}
          </button>
          <button @click="openInGoogleMaps(route)" class="action-btn secondary">
            {{ $t('favoriteRoutes.googleMaps') }}
          </button>
          <button
              @click="removeRoute(route.id)"
              class="action-btn danger"
              :title="$t('favoriteRoutes.deleteTooltip')"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.favorite-routes-container {
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

.page-title {
  color: #2e7d32;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
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

.routes-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.route-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #8bc34a;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f5;
}

.route-icon {
  font-size: 1.75rem;
}

.route-date {
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.route-details {
  margin-bottom: 1.5rem;
}

.location-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 1rem;
}

.location-marker {
  background: #8bc34a;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.destination .location-marker {
  background: #e53935;
}

.location-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-label {
  font-size: 0.75rem;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-name {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}

.route-arrow {
  text-align: center;
  font-size: 1.5rem;
  color: #8bc34a;
  margin: 0.5rem 0;
}

.route-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn.primary {
  background: #8bc34a;
  color: white;
}

.action-btn.primary:hover {
  background: #7cb342;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.3);
}

.action-btn.secondary {
  background: #4285F4;
  color: white;
}

.action-btn.secondary:hover {
  background: #3367D6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.action-btn.danger {
  background: #fff;
  color: #e53935;
  border: 2px solid #e0e0e0;
  flex: 0 0 auto;
  min-width: 48px;
}

.action-btn.danger:hover {
  background: #ffebee;
  border-color: #e53935;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .favorite-routes-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .routes-grid {
    grid-template-columns: 1fr;
  }

  .route-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    font-size: 0.85rem;
    padding: 8px 12px;
  }
}
</style>