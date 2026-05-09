<script setup>
import { useSavedRoutesStore } from '@/stores/useSavedRoutesStore'
import { useNotificationsStore } from '@/stores/useNotificationsStore'
import { useTravelHistoryStore } from '@/stores/useTravelHistoryStore'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'

const { t } = useI18n()
const savedRoutesStore = useSavedRoutesStore()
const notificationsStore = useNotificationsStore()
const travelHistoryStore = useTravelHistoryStore()

const props = defineProps({
  origin: String,
  destination: String,
  routeData: Object
})

const emit = defineEmits(['save-route'])

const isSaving = ref(false)
const saveMessage = ref('')

const saveRoute = () => {
  isSaving.value = true
  saveMessage.value = ''

  const routeToSave = {
    origin: props.origin,
    destination: props.destination,
  }

  const success = savedRoutesStore.addRoute(routeToSave)

  if (success) {
    notificationsStore.addNotification({
      type: 'success',
      message: `Ruta guardada: ${props.origin} → ${props.destination}`,
      priority: 'low',
      icon: '⭐'
    })

    saveMessage.value = '✓ Ruta guardada en favoritos'
    emit('save-route', routeToSave)
  } else {
    saveMessage.value = 'Esta ruta ya está en favoritos'
    notificationsStore.addNotification({
      type: 'info',
      message: `La ruta ${props.origin} → ${props.destination} ya está guardada`,
      priority: 'low',
      icon: 'ℹ️'
    })
  }

  setTimeout(() => {
    isSaving.value = false
    saveMessage.value = ''
  }, 3000)
}


const openInGoogleMaps = () => {
  const origin = encodeURIComponent(props.origin)
  const destination = encodeURIComponent(props.destination)
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`
  window.open(url, '_blank')
}

onMounted(() => {
  // Agregar al historial de viajes automáticamente
  travelHistoryStore.addTrip({
    origin: props.origin,
    destination: props.destination,
    steps: [], // Puedes agregar pasos si tienes esa info
  })
})

const extractStepsFromRouteData = (routeData) => {
  return []
}
</script>

<template>
  <div class="route-results">
    <div class="results-header">
      <h2>{{ $t('routeResults.title') }}</h2>
    </div>

    <div class="address-card">
      <div class="address-item origin">
        <div class="label">
          <span class="marker">A</span>
          <span class="text">{{ $t('routeResults.origin') }}</span>
        </div>
        <div class="address-content">
          <p>{{ origin }}</p>
        </div>
      </div>

      <div class="arrow-separator">
        ↓
      </div>

      <div class="address-item destination">
        <div class="label">
          <span class="marker">B</span>
          <span class="text">{{ $t('routeResults.destination') }}</span>
        </div>
        <div class="address-content">
          <p>{{ destination }}</p>
        </div>
      </div>
    </div>

    <div
        v-if="saveMessage"
        class="save-message"
        :class="{ success: isSaveSuccess }"
    >
      {{ saveMessage }}
    </div>

    <div class="buttons-row">
      <button
          class="save-route-btn"
          type="button"
          @click="saveRoute"
          :disabled="isSaving"
      >
        <span v-if="!isSaving">{{ $t('routeResults.saveRoute') }}</span>
        <span v-else>{{ $t('routeResults.saving') }}</span>
      </button>

      <button @click="openInGoogleMaps" class="google-maps-btn">
        {{ $t('routeResults.openInGoogleMaps') }}
      </button>
    </div>
  </div>
</template>


<style scoped>
.route-results {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 640px;
  overflow-y: auto;
}

.results-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.results-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.address-card {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.address-item {
  margin-bottom: 12px;
}

.address-item:last-child {
  margin-bottom: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.marker {
  background: #8bc34a;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.destination .marker {
  background: #e53935;
}

.label .text {
  font-weight: 600;
  color: #5c7a3a;
  font-size: 14px;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.address-content p {
  flex: 1;
  margin: 0;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.arrow-separator {
  text-align: center;
  font-size: 24px;
  color: #8bc34a;
  margin: 8px 0;
}

.info-box {
  display: flex;
  gap: 12px;
  background: #e8f5e9;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #8bc34a;
}

.info-content {
  flex: 1;
}

.info-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #2e7d32;
  line-height: 1.5;
}

.info-content p:last-child {
  margin-bottom: 0;
}

.info-content strong {
  font-weight: 700;
}

.save-message {
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  animation: slideIn 0.3s ease;
}

.save-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.buttons-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.save-route-btn {
  flex: 1;
  min-width: 160px;
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: #000;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, .2);
  transition: all 0.3s ease;
}

.save-route-btn:hover:not(:disabled) {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, .3);
}

.save-route-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-maps-btn {
  flex: 1;
  min-width: 160px;
  padding: 12px 16px;
  background: #4285F4;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
}

.google-maps-btn:hover {
  background: #3367D6;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(66, 133, 244, 0.4);
}

.route-results::-webkit-scrollbar {
  width: 8px;
}

.route-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.route-results::-webkit-scrollbar-thumb {
  background: #8bc34a;
  border-radius: 10px;
}

.route-results::-webkit-scrollbar-thumb:hover {
  background: #7cb342;
}

@media (max-width: 600px) {
  .buttons-row {
    flex-direction: column;
  }

  .save-route-btn,
  .google-maps-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>