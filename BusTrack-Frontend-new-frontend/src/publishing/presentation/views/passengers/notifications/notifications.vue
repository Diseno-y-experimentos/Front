<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useNotificationsStore } from '@/stores/useNotificationsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const notificationsStore = useNotificationsStore()

const showToast = ref(false)
const toastMessage = ref('')
const toastIcon = ref('')

const notifications = computed(() => notificationsStore.getAllNotifications)

onMounted(() => {
  notificationsStore.items = JSON.parse(localStorage.getItem('notifications') || '[]')
})

watch(
    () => notificationsStore.items.length,
    (newLength, oldLength) => {
      if (newLength > oldLength) {
        const latestNotification = notificationsStore.items[0]
        showToastNotification(latestNotification)
      }
    }
)

const showToastNotification = (notification) => {
  toastIcon.value = notification.icon || '📢'
  toastMessage.value = translateMessage(notification)
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 60000)

  if (diffInMinutes < 1) return t('notifications.timeAgo.now')
  if (diffInMinutes < 60) return t('notifications.timeAgo.minutesAgo', { minutes: diffInMinutes })
  if (diffInMinutes < 1440) return t('notifications.timeAgo.hoursAgo', { hours: Math.floor(diffInMinutes / 60) })
  return t('notifications.timeAgo.daysAgo', { days: Math.floor(diffInMinutes / 1440) })
}

const translateMessage = (notification) => {
  if (notification.messageKey) {
    return t(notification.messageKey, notification.messageParams || {})
  }
  return notification.message || t('notifications.messages.default')
}

const removeNotification = (id) => {
  notificationsStore.removeNotification(id)
}

const clearAllNotifications = () => {
  if (confirm(t('notifications.confirmClearAll'))) {
    notificationsStore.clearAll()
  }
}

const getPriorityClass = (priority) => {
  return priority || 'medium'
}

// Testing US05 and US06
const testUS05 = (delayMinutes, enabled = true) => {
  console.log('\n🧪 ===== TESTING US05 =====')

  localStorage.setItem('notificationsEnabled', enabled.toString())

  const testData = {
    busNumber: '201',
    routeName: 'Ruta San Miguel - Miraflores',
    delayMinutes,
    stopName: 'Rafael Escardó'
  }

  const notified = notificationsStore.notifyDelay(testData)

  if (notified) {
    console.log('✅ US05 Positivo: Notificación enviada')
    console.log('✅ Debes ver un toast en la pantalla')
  } else {
    console.log('❌ US05 Negativo: No se envió notificación')
  }

  console.log('========================\n')
  return notified
}

const testUS06 = (hasConnection = true) => {
  console.log('\n🧪 ===== TESTING US06 =====')

  const testData = {
    busNumber: '301',
    originalRoute: 'Surco - Centro',
    newRoute: 'Surco - San Isidro',
    reason: 'Tráfico en Av. Benavides'
  }

  const notified = hasConnection
      ? notificationsStore.notifyRouteDetourWithConnection(testData)
      : false

  if (notified) {
    console.log('✅ US06 Positivo: Alerta de desvío enviada')
    console.log('✅ Debes ver un toast en la pantalla')
  } else {
    console.log('❌ US06 Negativo: No se envió alerta (sin conexión)')
  }

  console.log('========================\n')
  return notified
}

if (import.meta.env.DEV) {
  window.testUS05 = testUS05
  window.testUS06 = testUS06
  console.log('🧪 Testing disponible en /passengers/notifications')
  console.log('testUS05(15, true) → Debe mostrar notificación')
  console.log('testUS06(true) → Debe mostrar alerta')
}
</script>

<template>
  <div class="notifications-container">
    <transition name="slide-down">
      <div v-if="showToast" class="toast-notification">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>

    <div class="notifications-header">
      <h1 class="notifications-title">{{ t('notifications.title') }}</h1>
      <button
          v-if="notifications.length > 0"
          @click="clearAllNotifications"
          class="clear-all-btn"
      >
        {{ t('notifications.clearAll') }}
      </button>
    </div>

    <div v-if="notifications.length === 0" class="empty-state">
      <p>{{ t('notifications.empty.title') }}</p>
      <span>{{ t('notifications.empty.subtitle') }}</span>
    </div>

    <div v-else class="notifications-list">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification-card', getPriorityClass(notification.priority)]"
      >
        <div class="notification-icon">
          {{ notification.icon || '📍' }}
        </div>
        <div class="notification-content">
          <p class="notification-text">{{ translateMessage(notification) }}</p>
          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>
        <button
            @click="removeNotification(notification.id)"
            class="remove-btn"
            :title="t('notifications.remove')"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem;
}

.notifications-header {
  max-width: 1000px;
  margin: 0 auto 2rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-title {
  font-size: 2.5rem;
  color: #2e7d32;
  margin: 0;
  font-weight: 700;
  text-align: center;
}

.clear-all-btn {
  position: absolute;
  right: 0;
  padding: 10px 20px;
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
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

.empty-state p {
  font-size: 1.5rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.empty-state span {
  color: #999;
  font-size: 1rem;
}

.notifications-list {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  transition: all 0.3s ease;
  background: white;
}

.notification-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.25);
}

.notification-card.high {
  border-left: 4px solid #e53935;
}

.notification-card.medium {
  border-left: 4px solid #8bc34a;
}

.notification-card.low {
  border-left: 4px solid #4285F4;
}

.notification-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 1.05rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  line-height: 1.5;
  color: #333;
}

.notification-time {
  font-size: 0.875rem;
  color: #999;
  font-weight: 400;
}

.remove-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-btn:hover {
  background: #ff5252;
  color: white;
  transform: scale(1.1);
}

.toast-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 9999;
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-weight: 600;
  line-height: 1.4;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .notifications-container {
    padding: 1rem;
  }

  .notifications-header {
    flex-direction: column;
    gap: 1rem;
  }

  .notifications-title {
    font-size: 2rem;
  }

  .clear-all-btn {
    position: static;
    width: 100%;
  }

  .notification-card {
    padding: 1rem;
  }

  .notification-icon {
    font-size: 1.5rem;
  }

  .notification-text {
    font-size: 0.95rem;
  }

  .toast-notification {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>