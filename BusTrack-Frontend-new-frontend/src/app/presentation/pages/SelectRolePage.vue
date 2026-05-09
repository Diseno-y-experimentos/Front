<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'

const router = useRouter()
const { t } = useI18n()

const selectedRole = ref(null)
const showError = ref(false)

const selectRole = (role) => {
  selectedRole.value = role
  showError.value = false
  console.log(`✅ Rol seleccionado: ${role}`)
}

const continueToLogin = () => {
  if (!selectedRole.value) {
    showError.value = true
    console.log('❌ US14 Negativo: Debe seleccionar un tipo de usuario')
    return
  }

  if (selectedRole.value === 'passenger') {
    console.log('✅ US14 Positivo: Redirigiendo a login de pasajero')
    router.push('/login')
  } else if (selectedRole.value === 'company') {
    console.log('✅ US14 Positivo: Redirigiendo a login de empresa')
    router.push('/company/login')
  }
}

// Testing US14
const testUS14 = (roleSelected = null) => {
  console.log('\n🧪 ===== TESTING US14 =====')
  console.log(`Rol seleccionado: ${roleSelected || 'ninguno'}`)

  selectedRole.value = roleSelected

  if (!roleSelected) {
    showError.value = true
    console.log('❌ US14 Negativo: "Seleccione un tipo de usuario"')
  } else {
    showError.value = false
    const route = roleSelected === 'passenger' ? '/login' : '/company/login'
    console.log(`✅ US14 Positivo: Redirige a ${route}`)
  }

  console.log('========================\n')
}

if (import.meta.env.DEV) {
  window.testUS14 = testUS14
  console.log('🧪 Testing US14 disponible: testUS14(role)')
  console.log('Ejemplo: testUS14(null) → Debe mostrar error')
  console.log('Ejemplo: testUS14("passenger") → Debe permitir continuar')
}
</script>

<template>
  <div class="select-role-page">
    <div class="lang-wrapper">
      <LanguageSwitcher />
    </div>

    <div class="card">
      <img src="@/assets/logo-bustrack.png" alt="BusTrack" class="logo" />

      <h2 class="title">{{ t('selectRole.title') }}</h2>

      <transition name="fade">
        <div v-if="showError" class="error-message">
          ⚠️ {{ t('selectRole.error')  }}
        </div>
      </transition>

      <button
          class="btn btn-passenger"
          :class="{ 'btn-selected': selectedRole === 'passenger' }"
          @click="selectRole('passenger')"
      >
        <span v-if="selectedRole === 'passenger'" class="checkmark">✓</span>
        {{ t('selectRole.passenger') }}
      </button>

      <button
          class="btn btn-company"
          :class="{ 'btn-selected': selectedRole === 'company' }"
          @click="selectRole('company')"
      >
        <span v-if="selectedRole === 'company'" class="checkmark">✓</span>
        {{ t('selectRole.company') }}
      </button>

      <button
          class="btn btn-continue"
          @click="continueToLogin"
          :disabled="!selectedRole"
      >
        {{ t('selectRole.continue')  }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.select-role-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #c8d852;
  position: relative;
}

.lang-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
}

.card {
  background: #ffffff;
  padding: 3rem 4rem;
  border-radius: 24px;
  box-shadow: 0 18px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  animation: card-pop 0.6s ease-out;
  min-width: 400px;
}

.logo {
  width: 220px;
  height: auto;
  border-radius: 18px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
}

.title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.error-message {
  width: 100%;
  padding: 0.8rem 1rem;
  background: #ffebee;
  border: 2px solid #e53935;
  border-radius: 8px;
  color: #c62828;
  font-weight: 600;
  text-align: center;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.btn {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 3px solid transparent;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
}

.btn-passenger {
  background: #5f8f2a;
  color: #ffffff;
}

.btn-company {
  background: #000000;
  color: #ffffff;
}

.btn-selected {
  border-color: #ffd700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
}

.checkmark {
  font-size: 1.3rem;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.btn-continue {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  margin-top: 1rem;
  font-size: 1.15rem;
}

.btn-continue:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-continue:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 500px) {
  .card {
    min-width: 90vw;
    padding: 2rem;
  }
}
</style>