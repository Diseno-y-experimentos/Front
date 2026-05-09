<script setup lang="js">
import CompanyTopNav from '@/shared/presentation/components/CompanyTopNav.vue'
import { ref, computed } from 'vue'
import { useAlertsStore } from '@/stores/useAlertsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const alertsStore = useAlertsStore()

// --- ESTADO DE FILTROS ---
const filters = ref({
  type: '',
  severity: '',
  status: ''
})

// --- ESTADO DEL MODAL DE CREACIÓN ---
const showCreateModal = ref(false)
const newAlert = ref({
  type: 'traffic',
  severity: 'medium',
  busId: '',
  route: ''
})

const filteredAlerts = computed(() => {
  // Ordenamos para que las nuevas salgan primero (reverse)
  const list = [...alertsStore.getAllAlerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return list.filter(alert => {
    const matchType = !filters.value.type || alert.type === filters.value.type
    const matchSeverity = !filters.value.severity || alert.severity === filters.value.severity
    const matchStatus = !filters.value.status || alert.status === filters.value.status
    return matchType && matchSeverity && matchStatus
  })
})

// --- ACCIONES ---

// 1. Resolver Alerta
const handleResolve = (id) => {
  if (confirm(t('alerts.confirmResolve'))) {
    alertsStore.markAsResolved(id)
  }
}

// 2. Abrir Modal
const openCreateModal = () => {
  // Resetear formulario
  newAlert.value = { type: 'traffic', severity: 'medium', busId: '', route: '' }
  showCreateModal.value = true
}

// 3. Crear Alerta
const createAlert = () => {
  if (!newAlert.value.busId || !newAlert.value.route) {
    alert(t('alerts.errors.missingFields'))
    return
  }

  const autoTitle = t(`alerts.types.${newAlert.value.type}`)

  alertsStore.addAlert({
    title: autoTitle,
    type: newAlert.value.type,
    severity: newAlert.value.severity,
    busId: newAlert.value.busId,
    route: newAlert.value.route
  })

  showCreateModal.value = false
}

// --- UTILIDADES DE ESTILO ---
const getSeverityClass = (severity) => {
  return severity || 'medium'
}
</script>

<template>
  <div class="page">
    <CompanyTopNav />

    <main class="content">
      <div class="alerts-container">

        <div class="alerts-header">
          <h1 class="alerts-title">{{ t('alerts.title') }}</h1>
          <button @click="openCreateModal" class="create-btn">
            + {{ t('alerts.create.button') }}
          </button>
        </div>

        <div class="filters-card">
          <div class="filter-group">
            <label>{{ t('alerts.filters.type') }}</label>
            <select v-model="filters.type">
              <option value="">{{ t('alerts.filters.allTypes') }}</option>
              <option value="detour">{{ t('alerts.types.detour') }}</option>
              <option value="traffic">{{ t('alerts.types.traffic') }}</option>
              <option value="incident">{{ t('alerts.types.incident') }}</option>
              <option value="delay">{{ t('alerts.types.delay') }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>{{ t('alerts.filters.severity') }}</label>
            <select v-model="filters.severity">
              <option value="">{{ t('alerts.filters.allSeverities') }}</option>
              <option value="high">{{ t('alerts.severity.high') }}</option>
              <option value="medium">{{ t('alerts.severity.medium') }}</option>
              <option value="low">{{ t('alerts.severity.low') }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>{{ t('alerts.filters.status') }}</label>
            <select v-model="filters.status">
              <option value="">{{ t('alerts.filters.allStatus') }}</option>
              <option value="pending">{{ t('alerts.status.pending') }}</option>
              <option value="resolved">{{ t('alerts.status.resolved') }}</option>
            </select>
          </div>
        </div>

        <div class="alerts-list">
          <div v-if="filteredAlerts.length === 0" class="empty-state">
            <div class="empty-icon">🔕</div>
            <p>{{ t('alerts.empty') }}</p>
          </div>

          <div
              v-else
              v-for="alert in filteredAlerts"
              :key="alert.id"
              class="alert-card"
              :class="getSeverityClass(alert.severity)"
          >
            <div class="alert-icon">
              <span v-if="alert.severity === 'high'">🚨</span>
              <span v-else-if="alert.severity === 'medium'">⚠️</span>
              <span v-else>ℹ️</span>
            </div>

            <div class="alert-content">
              <h3 class="alert-title">{{ alert.title }}</h3>
              <p class="alert-details">
                <strong>Bus {{ alert.busId }}</strong> • {{ alert.route }}
              </p>

              <div class="badges-row">
                <span class="badge" :class="alert.severity">
                  {{ t(`alerts.severity.${alert.severity}`) }}
                </span>
                <span class="badge status" :class="alert.status">
                  {{ t(`alerts.status.${alert.status}`) }}
                </span>
              </div>
            </div>

            <button
                v-if="alert.status === 'pending'"
                @click="handleResolve(alert.id)"
                class="action-btn resolve-btn"
                :title="t('alerts.actions.resolve')"
            >
              {{ t('alerts.actions.resolve') }}
            </button>
            <button
                v-else
                class="action-btn disabled-btn"
                disabled
            >
              ✓
            </button>
          </div>
        </div>

        <!-- MODAL DE CREACIÓN -->
        <div v-if="showCreateModal" class="modal-backdrop">
          <div class="modal-card">
            <h2 class="modal-title">{{ t('alerts.create.title') }}</h2>

            <div class="modal-form">
              <div class="form-group">
                <label>{{ t('alerts.create.type') }}</label>
                <select v-model="newAlert.type">
                  <option value="detour">{{ t('alerts.types.detour') }}</option>
                  <option value="traffic">{{ t('alerts.types.traffic') }}</option>
                  <option value="incident">{{ t('alerts.types.incident') }}</option>
                  <option value="delay">{{ t('alerts.types.delay') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>{{ t('alerts.create.severity') }}</label>
                <select v-model="newAlert.severity">
                  <option value="high">{{ t('alerts.severity.high') }}</option>
                  <option value="medium">{{ t('alerts.severity.medium') }}</option>
                  <option value="low">{{ t('alerts.severity.low') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>{{ t('alerts.create.busId') }}</label>
                <input
                    v-model="newAlert.busId"
                    type="text"
                    :placeholder="t('alerts.create.busIdPlaceholder')"
                >
              </div>

              <div class="form-group">
                <label>{{ t('alerts.create.route') }}</label>
                <input
                    v-model="newAlert.route"
                    type="text"
                    :placeholder="t('alerts.create.routePlaceholder')"
                >
              </div>
            </div>

            <div class="modal-actions">
              <button @click="showCreateModal = false" class="btn-cancel">
                {{ t('alerts.create.cancel') }}
              </button>
              <button @click="createAlert" class="btn-save">
                {{ t('alerts.create.save') }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
}

.content {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 16px 48px;
}

/* =========================================
   Contenedor Principal y Fondo
   ========================================= */
.alerts-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem;
  position: relative;
}

.alerts-header {
  max-width: 1000px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.alerts-title {
  font-size: 2.5rem;
  color: #2e7d32;
  margin: 0;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.create-btn {
  position: absolute;
  right: 0;
  background: #2e7d32;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: #1b5e20;
  transform: translateY(-2px);
}

/* =========================================
   Tarjeta de Filtros
   ========================================= */
.filters-card {
  max-width: 1000px;
  margin: 0 auto 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.9rem;
  color: #2e7d32;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  background-color: #fafafa;
  font-size: 0.95rem;
  color: #333;
  outline: none;
  min-width: 180px;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  background-color: white;
}

/* =========================================
   Lista y Tarjetas
   ========================================= */
.alerts-list {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alert-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.25);
}

.alert-card.high {
  border-left: 6px solid #e53935;
}

.alert-card.medium {
  border-left: 6px solid #fbc02d;
}

.alert-card.low {
  border-left: 6px solid #43a047;
}

.alert-icon {
  font-size: 2rem;
  flex-shrink: 0;
  opacity: 0.8;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #333;
}

.alert-details {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 0.75rem 0;
}

.badges-row {
  display: flex;
  gap: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.high { background: #ffebee; color: #c62828; }
.badge.medium { background: #fffde7; color: #f9a825; }
.badge.low { background: #e8f5e9; color: #2e7d32; }

.badge.status.pending { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
.badge.status.resolved { background: #e0f2f1; color: #00695c; border: 1px solid #b2dfdb; }

/* =========================================
   Botones de Acción
   ========================================= */
.action-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.resolve-btn {
  background: #2e7d32;
  color: white;
}

.resolve-btn:hover {
  background: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.disabled-btn {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  font-size: 1.2rem;
  padding: 0.4rem 1rem;
}

/* =========================================
   Empty State
   ========================================= */
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
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.5rem;
  color: #666;
  margin: 0;
  font-weight: 600;
}

/* =========================================
   MODAL DE CREACIÓN
   ========================================= */
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
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-title {
  color: #2e7d32;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: #2e7d32;
  color: white;
}

.btn-save:hover {
  background: #1b5e20;
}

/* Responsive */
@media (max-width: 768px) {
  .alerts-container { padding: 1rem; }
  .alert-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .action-btn { width: 100%; margin-top: 0.5rem; }
  .filters-card { gap: 1rem; }
  .filter-group select { width: 100%; }
  .alerts-header { flex-direction: column; gap: 1rem; }
  .create-btn { position: static; width: 100%; }
}
</style>