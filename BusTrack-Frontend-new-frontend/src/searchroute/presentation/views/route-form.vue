<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useRouteStore from '@/searchroute/application/route.store.js'

const { t } = useI18n()
const emit = defineEmits(['search'])
const routeStore = useRouteStore()

const origin = ref('')
const destination = ref('')
const isSearching = ref(false)
const searchError = ref('')


const handleSearch = async () => {
  const nextOrigin = origin.value.trim()
  const nextDestination = destination.value.trim()

  if (!nextOrigin || !nextDestination) {
    return
  }

  isSearching.value = true
  searchError.value = ''

  try {
    const query = `${nextOrigin} ${nextDestination}`.trim()
    const routes = await routeStore.fetchRoutes(query)

    emit('search', {
      origin: nextOrigin,
      destination: nextDestination,
      query,
      routes
    })
  } catch (error) {
    console.error('Error buscando rutas en el backend:', error)
    searchError.value = t('searchRoute.error') || 'No se pudieron buscar rutas en el backend'
    emit('search', {
      origin: nextOrigin,
      destination: nextDestination,
      query: `${nextOrigin} ${nextDestination}`.trim(),
      routes: []
    })
  } finally {
    isSearching.value = false
  }
}
</script>

<template>
  <div class="route-form">
    <div class="input-group">
      <label>{{ t('searchRoute.from') }}</label>
      <input
          v-model="origin"
          type="text"
          :placeholder="t('searchRoute.fromPlaceholder')"
          @keyup.enter="handleSearch"
      />
    </div>

    <div class="input-group">
      <label>{{ t('searchRoute.to') }}</label>
      <input
          v-model="destination"
          type="text"
          :placeholder="t('searchRoute.toPlaceholder')"
          @keyup.enter="handleSearch"
      />
    </div>

    <button
        @click="handleSearch"
        :disabled="!origin.trim() || !destination.trim() || isSearching"
    >
      {{ isSearching ? (t('searchRoute.searching') || 'Buscando...') : t('searchRoute.search') }}
    </button>

    <p v-if="searchError" class="search-error">{{ searchError }}</p>
  </div>
</template>

<style scoped>
.route-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 18px;
  font-weight: 600;
  font-style: italic;
  color: #fff;
}

.input-group input {
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  background: #000;
  color: #fff;
  outline: none;
  transition: all 0.2s ease;
}

.input-group input::placeholder {
  color: #666;
  font-style: italic;
}

.input-group input:focus {
  background: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

button {
  width: 100%;
  max-width: 280px;
  margin: 12px auto 0;
  padding: 16px 32px;
  background: #8bc34a;
  color: #fff;
  border: 3px solid #fff;
  border-radius: 30px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  background: #7cb342;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-error {
  margin: 0;
  text-align: center;
  color: #ffdddd;
  font-size: 14px;
  font-weight: 600;
}
</style>