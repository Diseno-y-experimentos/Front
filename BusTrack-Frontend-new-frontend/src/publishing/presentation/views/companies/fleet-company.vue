<script setup lang="js">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CompanyTopNav from '@/shared/presentation/components/CompanyTopNav.vue'

const { t } = useI18n()

// Estado reactivo
const stats = computed(() => ({
  total: buses.value.length,
  active: buses.value.filter(b => b.status === 'active').length,
  maintenance: buses.value.filter(b => b.status === 'maintenance').length,
  inactive: buses.value.filter(b => b.status === 'inactive').length
}))

const buses = ref([])
const STORAGE_KEY = 'company_fleet_buses_v1'

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      buses.value = JSON.parse(saved)
    }
  } catch (e) {
    // ignore
  }
})

// Persistir cambios localmente
watch(buses, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {
    // ignore
  }
}, { deep: true })

// Estado para modales
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedBus = ref(null)

// Formulario para agregar/editar
const busForm = ref({
  id: '',
  plate: '',
  route: '',
  status: 'active',
  driver: ''
})

// Métodos
const getStatusText = (status) => {
  return t(`fleet.status.${status}`)
}

const getNextBusId = () => {
  if (buses.value.length === 0) {
    return 1
  }
  return Math.max(...buses.value.map(b => b.id)) + 1
}

const handleAddBus = () => {
  busForm.value = {
    id: '',
    plate: '',
    route: '',
    status: 'active',
    driver: ''
  }
  showAddModal.value = true
}

const handleEdit = (bus) => {
  selectedBus.value = bus
  busForm.value = { ...bus }
  showEditModal.value = true
}

const handleDetails = (bus) => {
  selectedBus.value = bus
  showDetailsModal.value = true
}

const saveNewBus = () => {
  // Generar un ID nuevo
  const newId = getNextBusId()
  const newBus = {
    ...busForm.value,
    id: newId
  }
  buses.value.push(newBus)
  showAddModal.value = false
  alert(t('fleet.messages.busAdded'))
}

const saveEditBus = () => {
  const index = buses.value.findIndex(b => b.id === selectedBus.value.id)
  if (index !== -1) {
    buses.value[index] = { ...busForm.value }
  }
  showEditModal.value = false
  alert(t('fleet.messages.busUpdated'))
}

const handleDelete = (bus) => {
  const confirmed = window.confirm(t('fleet.messages.confirmDelete'))
  if (!confirmed) {
    return
  }
  buses.value = buses.value.filter(b => b.id !== bus.id)
  if (selectedBus.value?.id === bus.id) {
    selectedBus.value = null
  }
  showEditModal.value = false
  showDetailsModal.value = false
  alert(t('fleet.messages.busDeleted'))
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDetailsModal.value = false
  selectedBus.value = null
}
</script>

<template>
  <div class="page">
    <CompanyTopNav />

    <main class="content">
      <div class="page-header">
        <h1 class="page-title">{{ t('fleet.title') }}</h1>
        <button class="btn-add" @click="handleAddBus">
          <span>+</span>
          {{ t('fleet.actions.addBus') }}
        </button>
      </div>

      <!-- Estadísticas -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-number">{{ stats.total }}</span>
          <span class="stat-label">{{ t('fleet.stats.total') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.active }}</span>
          <span class="stat-label">{{ t('fleet.stats.active') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.maintenance }}</span>
          <span class="stat-label">{{ t('fleet.stats.maintenance') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.inactive }}</span>
          <span class="stat-label">{{ t('fleet.stats.inactive') }}</span>
        </div>
      </div>

      <!-- Tabla de flota -->
      <div class="table-container">
        <table class="fleet-table">
          <thead>
          <tr>
            <th>{{ t('fleet.table.id') }}</th>
            <th>{{ t('fleet.table.plate') }}</th>
            <th>{{ t('fleet.table.route') }}</th>
            <th>{{ t('fleet.table.status') }}</th>
            <th>{{ t('fleet.table.driver') }}</th>
            <th>{{ t('fleet.table.actions') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="bus in buses" :key="bus.id">
            <td class="bus-id">{{ bus.id }}</td>
            <td>{{ bus.plate }}</td>
            <td>{{ bus.route }}</td>
            <td>
                <span
                    class="status-badge"
                    :class="`status-${bus.status.toLowerCase()}`"
                >
                  {{ getStatusText(bus.status) }}
                </span>
            </td>
            <td>{{ bus.driver || '-' }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-edit" @click="handleEdit(bus)">
                  {{ t('fleet.actions.edit') }}
                </button>
                <button class="btn-action btn-details" @click="handleDetails(bus)">
                  {{ t('fleet.actions.details') }}
                </button>
                <button class="btn-action btn-delete" @click="handleDelete(bus)">
                  {{ t('fleet.actions.delete') }}
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Agregar Bus -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('fleet.modal.addTitle') }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.plate') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.plate"
                :placeholder="t('fleet.form.platePlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.route') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.route"
                :placeholder="t('fleet.form.routePlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.status') }}</label>
            <select class="form-select" v-model="busForm.status">
              <option value="active">{{ t('fleet.status.active') }}</option>
              <option value="maintenance">{{ t('fleet.status.maintenance') }}</option>
              <option value="inactive">{{ t('fleet.status.inactive') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.driver') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.driver"
                :placeholder="t('fleet.form.driverPlaceholder')"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">
            {{ t('fleet.actions.cancel') }}
          </button>
          <button class="btn-primary" @click="saveNewBus">
            {{ t('fleet.actions.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Editar Bus -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('fleet.modal.editTitle') }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.id') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.id"
                disabled
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.plate') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.plate"
                :placeholder="t('fleet.form.platePlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.route') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.route"
                :placeholder="t('fleet.form.routePlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.status') }}</label>
            <select class="form-select" v-model="busForm.status">
              <option value="active">{{ t('fleet.status.active') }}</option>
              <option value="maintenance">{{ t('fleet.status.maintenance') }}</option>
              <option value="inactive">{{ t('fleet.status.inactive') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('fleet.form.driver') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="busForm.driver"
                :placeholder="t('fleet.form.driverPlaceholder')"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">
            {{ t('fleet.actions.cancel') }}
          </button>
          <button class="btn-primary" @click="saveEditBus">
            {{ t('fleet.actions.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detalles Bus -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('fleet.modal.detailsTitle') }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <span class="detail-label">{{ t('fleet.form.id') }}:</span>
            <span class="detail-value">{{ selectedBus?.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('fleet.form.plate') }}:</span>
            <span class="detail-value">{{ selectedBus?.plate }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('fleet.form.route') }}:</span>
            <span class="detail-value">{{ selectedBus?.route }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('fleet.form.status') }}:</span>
            <span
                class="status-badge"
                :class="`status-${selectedBus?.status.toLowerCase()}`"
            >
              {{ getStatusText(selectedBus?.status) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('fleet.form.driver') }}:</span>
            <span class="detail-value">{{ selectedBus?.driver || '-' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeModal">
            {{ t('fleet.actions.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1400px;
  margin: 32px auto;
  padding: 0 16px 48px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #A4C639;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-add:hover {
  background: #8fb030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(164, 198, 57, 0.3);
}


.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 3rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.95rem;
  color: #666;
}


.table-container {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.fleet-table {
  width: 100%;
  border-collapse: collapse;
}

.fleet-table thead {
  background: #f0f4ed;
}

.fleet-table th {
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #4a5f2a;
  font-size: 0.95rem;
  border-bottom: 2px solid #e0e0e0;
}

.fleet-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  color: #2c3e50;
}

.fleet-table tbody tr:hover {
  background: #f9fdf5;
}

.bus-id {
  font-weight: 700;
  color: #2c3e50;
}


.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  min-width: 100px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-maintenance {
  background: #fff3cd;
  color: #856404;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}


.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.85rem;
}

.btn-edit {
  background: #A4C639;
  color: white;
}

.btn-edit:hover {
  background: #8fb030;
}

.btn-details {
  background: #f0f0f0;
  color: #666;
}

.btn-details:hover {
  background: #e0e0e0;
}

.btn-delete {
  background: #e25555;
  color: white;
}

.btn-delete:hover {
  background: #c94545;
}

/* Modales */
.modal-overlay {
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
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2c3e50;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #A4C639;
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #f0f0f0;
}

.btn-primary {
  padding: 0.8rem 1.5rem;
  background: #A4C639;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #8fb030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(164, 198, 57, 0.3);
}

.btn-secondary {
  padding: 0.8rem 1.5rem;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #e0e0e0;
  color: #2c3e50;
}

@media (max-width: 968px) {
  .stats-card {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modal {
    width: 95%;
  }
}
</style>