<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const userData = ref({
  name: '',
  email: '',
  password: ''
})


const showPassword = ref(false)


const showSuccessMessage = ref(false)
const successMessage = ref('')


const showErrorMessage = ref(false)
const errorMessage = ref('')


onMounted(() => {
  userStore.loadUserFromStorage()

  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }


  userData.value = {
    name: userStore.user.username || '',
    email: userStore.user.email || '',
    password: userStore.user.password || ''
  }
})

const goBack = () => {
  router.back()
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const changePhoto = () => {

  showInfoMessage(t('accountSettings.photoSoon'))
}

const showInfoMessage = (message) => {
  errorMessage.value = message
  showErrorMessage.value = true

  setTimeout(() => {
    showErrorMessage.value = false
  }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  showErrorMessage.value = true

  setTimeout(() => {
    showErrorMessage.value = false
  }, 4000)
}

const showSuccess = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true

  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const saveChanges = () => {

  if (!userData.value.name || !userData.value.email || !userData.value.password) {
    showError(t('accountSettings.errorAllFields'))
    return
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userData.value.email)) {
    showError(t('accountSettings.errorInvalidEmail'))
    return
  }


  if (userData.value.password.length < 6) {
    showError(t('accountSettings.errorShortPassword'))
    return
  }


  userStore.updateUser({
    username: userData.value.name,
    email: userData.value.email,
    password: userData.value.password
  })

  showSuccess(t('accountSettings.saveSuccess'))
}
</script>

<template>
  <div class="account-settings-container">
    <!-- Mensajes de notificación -->
    <transition name="slide-down">
      <div v-if="showSuccessMessage" class="notification success-notification">
        <span class="notification-icon">✓</span>
        <span class="notification-text">{{ successMessage }}</span>
      </div>
    </transition>

    <transition name="slide-down">
      <div v-if="showErrorMessage" class="notification error-notification">
        <span class="notification-text">{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- Botón Volver -->
    <div class="navigation-section">
      <button class="back-btn" @click="goBack">
        {{ t('accountSettings.back') }}
      </button>
    </div>

    <!-- Contenido Principal -->
    <div class="content-section">
      <h1 class="page-title">{{ $t('accountSettings.title') }}</h1>

      <div class="settings-card">
        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar-icon">
              <span class="avatar-symbol">👤</span>
            </div>
          </div>
          <button class="change-photo-btn" @click="changePhoto">
            {{ $t('accountSettings.changePhoto') }}
          </button>
        </div>

        <!-- Campos de edición -->
        <div class="form-section">
          <!-- Nombre -->
          <div class="form-field">
            <label class="field-label">{{ $t('accountSettings.name') }}</label>
            <input
                v-model="userData.name"
                type="text"
                class="form-input"
                :placeholder="$t('accountSettings.namePlaceholder')"
            >
          </div>

          <!-- Email -->
          <div class="form-field">
            <label class="field-label">{{ $t('accountSettings.email') }}</label>
            <input
                v-model="userData.email"
                type="email"
                class="form-input"
                :placeholder="$t('accountSettings.emailPlaceholder')"
            >
          </div>

          <!-- Contraseña con botón de mostrar/ocultar -->
          <div class="form-field">
            <label class="field-label">{{ $t('accountSettings.password') }}</label>
            <div class="password-field">
              <input
                  v-model="userData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  :placeholder="$t('accountSettings.passwordPlaceholder')"
              >
              <button
                  type="button"
                  class="toggle-password-btn"
                  @click="togglePassword"
                  :title="showPassword ? $t('accountSettings.hidePassword') : $t('accountSettings.showPassword')"
              >
                {{ showPassword ? '🫣' : '👁️' }}
              </button>

            </div>
          </div>
        </div>

        <!-- Botón Guardar -->
        <div class="actions-section">
          <button class="save-btn" @click="saveChanges">
            {{ $t('accountSettings.saveChanges') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-settings-container {
  padding: 20px;
  min-height: 100vh;
  background-color: white;
  position: relative;
}

/* Notificaciones */
.notification {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 1rem;
  min-width: 300px;
  max-width: 500px;
  animation: slideDown 0.3s ease;
}

.success-notification {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: 2px solid #43a047;
}

.error-notification {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border: 2px solid #f57c00;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

/* Animaciones */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.navigation-section {
  margin-bottom: 30px;
}

.back-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.content-section {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  color: #5e7a08;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
}

.settings-card {
  background-color: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-container {
  margin-bottom: 15px;
}

.avatar-icon {
  width: 100px;
  height: 100px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #789c0a;
  transition: all 0.3s ease;
}

.avatar-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(120, 156, 10, 0.3);
}

.avatar-symbol {
  font-size: 3em;
  color: black;
}

.change-photo-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-photo-btn:hover {
  background-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-section {
  margin-bottom: 30px;
}

.form-field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  color: #5e7a08;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1em;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #789c0a;
  box-shadow: 0 0 0 3px rgba(120, 156, 10, 0.1);
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-input {
  flex: 1;
  padding-right: 50px;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.2s ease;
  z-index: 1;
}

.toggle-password-btn:hover {
  transform: scale(1.1);
}

.toggle-password-btn:active {
  transform: scale(0.95);
}

.actions-section {
  display: flex;
  justify-content: center;
}

.save-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1em;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.save-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .account-settings-container {
    padding: 15px;
  }

  .settings-card {
    padding: 20px;
  }

  .page-title {
    font-size: 1.5em;
  }

  .notification {
    min-width: 250px;
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style>