<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const origin = ref('')
const destination = ref('')
const routes = ref([])
const showError = ref(false)
const errorMessage = ref('')
const isSearching = ref(false)

const availableRoutes = [
  {
    id: 1,
    name: 'Ruta 201',
    origin: 'San Miguel',
    destination: 'Miraflores',
    duration: '25 min',
    stops: 12,
    buses: ['Bus 204', 'Bus 205']
  },
  {
    id: 2,
    name: 'Ruta 301',
    origin: 'Surco',
    destination: 'Centro',
    duration: '35 min',
    stops: 18,
    buses: ['Bus 301', 'Bus 302']
  },
  {
    id: 3,
    name: 'Ruta 412',
    origin: 'San Borja',
    destination: 'Chorrillos',
    duration: '40 min',
    stops: 20,
    buses: ['Bus 412']
  }
]

const searchRoutes = () => {
  if (!origin.value.trim() || !destination.value.trim()) {
    errorMessage.value = 'Complete origen y destino'
    showError.value = true
    routes.value = []
    return
  }

  isSearching.value = true
  showError.value = false

  setTimeout(() => {
    const found = availableRoutes.filter(route => {
      const matchOrigin = route.origin.toLowerCase().includes(origin.value.toLowerCase())
      const matchDest = route.destination.toLowerCase().includes(destination.value.toLowerCase())
      return matchOrigin && matchDest
    })

    if (found.length === 0) {
      errorMessage.value = 'Ruta no encontrada'
      showError.value = true
      routes.value = []
      console.log('❌ US01 Negativo: Ruta no encontrada')
    } else {
      routes.value = found
      console.log(`✅ US01 Positivo: ${found.length} ruta(s) encontrada(s)`)
    }

    isSearching.value = false
  }, 800)
}

// Testing US01
const testUS01 = (originInput, destInput) => {
  console.log('\n🧪 ===== TESTING US01 =====')
  origin.value = originInput
  destination.value = destInput
  searchRoutes()
  console.log('========================\n')
}

if (import.meta.env.DEV) {
  window.testUS01 = testUS01
  console.log('🧪 Testing US01 disponible: testUS01(origin, dest)')
  console.log('testUS01("San Miguel", "Miraflores") → Debe encontrar ruta')
  console.log('testUS01("Lima", "Cusco") → Ruta no encontrada')
}
</script>

<template>
  <div class="page">
    <main class="content">
      <div class="search-container">
        <h1 class="title">{{ t('searchRoutes.title') || 'Buscar Rutas' }}</h1>

        <div class="search-form">
          <div class="form-field">
            <label>{{ t('searchRoutes.origin') || 'Origen' }}</label>
            <input
                v-model="origin"
                type="text"
                placeholder="Ej: San Miguel"
                class="form-input"
            />
          </div>

          <div class="form-field">
            <label>{{ t('searchRoutes.destination') || 'Destino' }}</label>
            <input
                v-model="destination"
                type="text"
                placeholder="Ej: Miraflores"
                class="form-input"
            />
          </div>

          <button
              @click="searchRoutes"
              class="search-btn"
              :disabled="isSearching"
          >
            {{ isSearching ? 'Buscando...' : (t('searchRoutes.search') || 'Buscar Ruta') }}
          </button>
        </div>

        <transition name="fade">
          <div v-if="showError" class="error-banner">
            ⚠️ {{ errorMessage }}
          </div>
        </transition>

        <div v-if="routes.length > 0" class="results-section">
          <h2>{{ t('searchRoutes.results') || 'Rutas Disponibles' }}</h2>

          <div class="routes-list">
            <div v-for="route in routes" :key="route.id" class="route-card">
              <div class="route-header">
                <h3>{{ route.name }}</h3>
                <span class="route-duration">⏱️ {{ route.duration }}</span>
              </div>

              <div class="route-details">
                <p><strong>Origen:</strong> {{ route.origin }}</p>
                <p><strong>Destino:</strong> {{ route.destination }}</p>
                <p><strong>Paradas:</strong> {{ route.stops }}</p>
                <p><strong>Buses:</strong> {{ route.buses.join(', ') }}</p>
              </div>
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
  background: #f5f5f5;
}

.content {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.search-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #A4C639;
}

.search-btn {
  padding: 1rem;
  background: #A4C639;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover:not(:disabled) {
  background: #8fb030;
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error-banner {
  background: #ffebee;
  border: 2px solid #e53935;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.results-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-card {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-left: 5px solid #A4C639;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.route-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.route-header h3 {
  color: #2c3e50;
  margin: 0;
}

.route-duration {
  background: #A4C639;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.route-details p {
  margin: 0.5rem 0;
  color: #555;
}
</style>