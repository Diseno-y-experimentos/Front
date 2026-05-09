<script setup>
import CompanyTopNav from '@/shared/presentation/components/CompanyTopNav.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '@/stores/useNotificationsStore'

const { t } = useI18n()
const notificationsStore = useNotificationsStore()

const buses = ref([
  {
    id: 204,
    route: 'Miraflores - San Isidro',
    driver: 'Juan Pérez',
    lastUpdate: 2,
    status: 'on_time',
    coordinates: { lat: -12.076, lng: -77.08 }
  },
  {
    id: 301,
    route: 'Surco - Centro',
    driver: 'Carlos Rodríguez',
    lastUpdate: 1,
    status: 'delayed',
    delayMinutes: 8
  },
  {
    id: 412,
    route: 'San Borja - Chorrillos',
    driver: 'Luis Torres',
    lastUpdate: 15,
    status: 'out_of_service'
  }
])

const isRefreshing = ref(false)
const showCreateModal = ref(false)
const hasConnectionError = ref(false)

const newBus = ref({
  id: '',
  route: '',
  driver: '',
  status: 'on_time'
})

const busesVisible = computed(() => {
  return hasConnectionError.value ? [] : buses.value
})

const refreshData = () => {
  isRefreshing.value = true
  hasConnectionError.value = false

  setTimeout(() => {
    const simulateError = Math.random() < 0.2

    if (simulateError) {
      hasConnectionError.value = true
      console.log('❌ US07 Negativo: Error de conexión con el servidor')
    } else {
      hasConnectionError.value = false
      notificationsStore.addNotification({
        type: 'info',
        messageKey: 'monitoring.updated',
        priority: 'low',
        icon: '🔄'
      })
      console.log('✅ US07 Positivo: Buses cargados correctamente')
    }

    isRefreshing.value = false
  }, 1000)
}

const openCreateModal = () => {
  newBus.value = { id: '', route: '', driver: '', status: 'on_time' }
  showCreateModal.value = true
}

const createBus = () => {
  if (!newBus.value.id || !newBus.value.route || !newBus.value.driver) {
    alert(t('monitoring.errors.missingFields'))
    return
  }

  buses.value.unshift({
    id: newBus.value.id,
    route: newBus.value.route,
    driver: newBus.value.driver,
    status: newBus.value.status,
    lastUpdate: 0,
    delayMinutes: newBus.value.status === 'delayed' ? 5 : 0
  })

  notificationsStore.addNotification({
    type: 'success',
    messageKey: 'monitoring.messages.busAdded',
    messageParams: { busId: newBus.value.id },
    priority: 'medium',
    icon: '🚌'
  })

  showCreateModal.value = false
}

const deleteBus = (busId) => {
  if (confirm(t('monitoring.confirmDelete'))) {
    buses.value = buses.value.filter(b => b.id !== busId)

    notificationsStore.addNotification({
      type: 'warning',
      messageKey: 'monitoring.messages.busDeleted',
      messageParams: { busId },
      priority: 'low',
      icon: '🗑️'
    })
  }
}

const getStatusStyles = (status) => {
  const styles = {
    on_time: { card: 'border-green', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
    delayed: { card: 'border-yellow', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
    out_of_service: { card: 'border-red', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' }
  }
  return styles[status] || styles.on_time
}

const openExternalMap = () => {
  window.open('https://www.google.com/maps/search/?api=1&query=UPC+San+Miguel', '_blank')
}

// Testing US07
const testUS07 = (simulateError = false) => {
  console.log('\n🧪 ===== TESTING US07 =====')
  console.log(`Simular error: ${simulateError}`)

  isRefreshing.value = true

  setTimeout(() => {
    if (simulateError) {
      hasConnectionError.value = true
      console.log('❌ US07 Negativo: Error de conexión mostrado')
      console.log('✅ Mensaje en pantalla: "Error de conexión"')
    } else {
      hasConnectionError.value = false
      console.log('✅ US07 Positivo: Panel de monitoreo cargado')
      console.log(`✅ Buses visibles: ${busesVisible.value.length}`)
    }
    isRefreshing.value = false
  }, 500)

  console.log('========================\n')
}

if (import.meta.env.DEV) {
  window.testUS07 = testUS07
  console.log('🧪 Testing US07 disponible: testUS07(simulateError)')
  console.log('Ejemplo: testUS07(false) → Debe mostrar buses')
  console.log('Ejemplo: testUS07(true) → Debe mostrar "Error de conexión"')
}
</script>


<template>
  <div class="page">
    <CompanyTopNav />

    <main class="content">
      <div class="monitoring-container">

        <div class="header-section">
          <h2 class="page-title">{{ t('monitoring.title') }}</h2>
          <div class="header-actions">
            <button
                @click="openCreateModal"
                class="action-btn create-btn"
            >
              + {{ t('monitoring.addBus') }}
            </button>
            <button
                @click="refreshData"
                class="action-btn refresh-btn"
                :disabled="isRefreshing"
            >
              {{ isRefreshing ? t('monitoring.refreshing') : t('monitoring.refresh') }}
            </button>
          </div>
        </div>

        <!-- US07 Negativo: Mensaje de Error de Conexión -->
        <div v-if="hasConnectionError" class="error-banner">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <div class="error-text">
              <h3>{{ t('monitoring.connectionError.title') }}</h3>
              <p>{{ t('monitoring.connectionError.description') }}</p>
              <button @click="refreshData" class="retry-btn">
                {{ t('monitoring.connectionError.retry') }}
              </button>

            </div>
        </div>

        <div class="content-grid">
          <div class="map-card">
            <div class="map-frame">
              <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.666986967664!2d-77.08272992419403!3d-12.075486242270928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c9665c1507bb%3A0x66c7e33527a05786!2sUPC%20-%20Campus%20San%20Miguel!5e0!3m2!1ses-419!2spe!4v1700000000000!5m2!1ses-419!2spe"
                  width="100%"
                  height="100%"
                  style="border:0;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
              </iframe>
              <button @click="openExternalMap" class="expand-map-btn">
                ↗️ {{ t('monitoring.expandMap') }}
              </button>
            </div>
          </div>

          <div class="buses-list">
            <!-- ✅ CAMBIO 1: Cambia "buses" por "busesVisible" -->
            <div v-if="busesVisible.length === 0 && !hasConnectionError" class="empty-state">
              <p>{{ t('monitoring.empty') }}</p>
            </div>

            <!-- ✅ CAMBIO 2: Cambia "buses" por "busesVisible" -->
            <div
                v-for="bus in busesVisible"
                :key="bus.id"
                class="bus-card"
                :class="getStatusStyles(bus.status).card"
            >
              <button
                  class="delete-btn"
                  @click="deleteBus(bus.id)"
                  :title="t('monitoring.deleteTooltip')"
              >×</button>

              <div class="card-header">
                <h3 class="bus-id">Bus {{ bus.id }}</h3>

                <div class="status-badge" :class="getStatusStyles(bus.status).badge">
                  <span class="status-dot" :class="getStatusStyles(bus.status).dot"></span>
                  <span v-if="bus.status === 'delayed'">
                    {{ t('monitoring.status.delayed', { minutes: bus.delayMinutes }) }}
                  </span>
                  <span v-else>
                    {{ t(`monitoring.status.${bus.status}`) }}
                  </span>
                </div>
              </div>

              <div class="card-details">
                <div class="detail-row">
                  <span class="label">{{ t('monitoring.details.route') }}:</span>
                  <span class="value">{{ bus.route }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ t('monitoring.details.driver') }}:</span>
                  <span class="value">{{ bus.driver }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ t('monitoring.details.updated') }}:</span>
                  <span class="value">{{ bus.lastUpdate }} min</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>

      <div v-if="showCreateModal" class="modal-backdrop">
        <div class="modal-card">
          <h2 class="modal-title">{{ t('monitoring.create.title') }}</h2>

          <div class="modal-form">
            <div class="form-group">
              <label>{{ t('monitoring.create.busId') }}</label>
              <input v-model="newBus.id" type="text" placeholder="Ej: 505">
            </div>

            <div class="form-group">
              <label>{{ t('monitoring.create.route') }}</label>
              <input v-model="newBus.route" type="text" placeholder="Ej: Av. La Marina - Javier Prado">
            </div>

            <div class="form-group">
              <label>{{ t('monitoring.create.driver') }}</label>
              <input v-model="newBus.driver" type="text" placeholder="Nombre del conductor">
            </div>

            <div class="form-group">
              <label>{{ t('monitoring.create.status') }}</label>
              <select v-model="newBus.status">
                <option value="on_time">{{ t('monitoring.status.on_time') }}</option>
                <option value="delayed">{{ t('monitoring.status.delayed_generic') }}</option>
                <option value="out_of_service">{{ t('monitoring.status.out_of_service') }}</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="showCreateModal = false" class="btn-cancel">
              {{ t('monitoring.create.cancel') }}
            </button>
            <button @click="createBus" class="btn-save">
              {{ t('monitoring.create.save') }}
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>

.monitoring-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
}


.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}


.action-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  color: white;
}

.refresh-btn { background: #8bc34a; }
.refresh-btn:hover:not(:disabled) { background: #689f38; transform: translateY(-2px); }
.refresh-btn:disabled { opacity: 0.7; cursor: wait; }

.create-btn { background: #2e7d32; }
.create-btn:hover { background: #1b5e20; transform: translateY(-2px); }


.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}


.map-card {
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  height: 500px;
}
.map-frame {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.expand-map-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: white;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  cursor: pointer;
}


.buses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  color: #666;
  background: white;
  padding: 2rem;
  border-radius: 12px;
}

.bus-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 5px solid transparent;
  position: relative;
}

.bus-card:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}


.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #999;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.2s;
}
.delete-btn:hover { color: #e53935; }


.border-green { border-left-color: #8bc34a; }
.border-yellow { border-left-color: #fdd835; }
.border-red { border-left-color: #e53935; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  padding-right: 20px;
}

.bus-id {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }

.bg-green-100 { background-color: #dcedc8; } .text-green-800 { color: #33691e; } .bg-green-500 { background-color: #7cb342; }
.bg-yellow-100 { background-color: #fff9c4; } .text-yellow-800 { color: #f57f17; } .bg-yellow-500 { background-color: #fbc02d; }
.bg-red-100 { background-color: #ffcdd2; } .text-red-800 { color: #b71c1c; } .bg-red-500 { background-color: #e53935; }

.detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; }
.label { color: #757575; font-weight: 500; }
.value { color: #212121; font-weight: 600; text-align: right; }


.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-title {
  color: #2e7d32;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: #333; }
.form-group input, .form-group select {
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}
.form-group input:focus, .form-group select:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-cancel, .btn-save {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel { background: #f5f5f5; color: #666; }
.btn-save { background: #2e7d32; color: white; }
.btn-save:hover { background: #1b5e20; }

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .map-card { height: 300px; }
}

.error-banner {
  background: #ffebee;
  border: 2px solid #e53935;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-text h3 {
  margin: 0 0 0.5rem 0;
  color: #c62828;
  font-size: 1.2rem;
  font-weight: 700;
}

.error-text p {
  margin: 0;
  color: #666;
}

.retry-btn {
  padding: 0.7rem 1.5rem;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.retry-btn:hover {
  background: #c62828;
  transform: translateY(-2px);
}
</style>