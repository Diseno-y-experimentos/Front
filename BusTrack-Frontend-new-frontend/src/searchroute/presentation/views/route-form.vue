<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['search'])

const origin = ref('')
const destination = ref('')


const handleSearch = () => {
  if (origin.value.trim() && destination.value.trim()) {
    emit('search', { origin: origin.value, destination: destination.value })
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
        :disabled="!origin.trim() || !destination.trim()"
    >
      {{ t('searchRoute.search') }}
    </button>
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
</style>