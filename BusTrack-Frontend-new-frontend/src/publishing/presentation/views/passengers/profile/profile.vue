<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const router = useRouter()
const userStore = useUserStore()

// Estado para controlar visibilidad
const showEmail = ref(false)
const showPassword = ref(false)
const isLoadingProfile = ref(true)

// Cargar datos del usuario al montar el componente
onMounted(async () => {
  try {
    // Restaurar sesión si existe
    await userStore.loadUserFromStorage()

    // Verificar que haya usuario autenticado
    if (!userStore.isLoggedIn || !userStore.user.id) {
      console.warn('No se encontró usuario autenticado')
      await router.push('/login')
      return
    }
  } catch (err) {
    console.error('Error cargando perfil:', err)
    await router.push('/login')
  } finally {
    isLoadingProfile.value = false
  }
})

// Vigilar cambios en el estado de autenticación SOLO después de cargar
watch(() => userStore.isLoggedIn, (newValue) => {
  if (!newValue && !isLoadingProfile.value) {
    router.push('/login')
  }
}, { immediate: false })

const handleLogout = () => {
  console.log('Cerrando sesión...')
  userStore.logout()
  router.push('/login')
}


const toggleEmailVisibility = () => {
  showEmail.value = !showEmail.value
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div v-if="isLoadingProfile" class="loading-container">
    <div class="spinner"></div>
    <p>{{ $t('profile.loading') || 'Cargando perfil...' }}</p>
  </div>

  <div v-else-if="!userStore.isLoggedIn || !userStore.user.id" class="error-container">
    <p>{{ $t('profile.notAuthenticated') || 'No autenticado' }}</p>
  </div>

  <div v-else class="profile-container">
    <!-- Información del usuario -->
    <div class="user-info-section">
      <div class="avatar-container">
        <div class="avatar-icon">
          <span class="avatar-symbol">👤</span>
        </div>
      </div>

      <div class="user-data">
        <!-- Mostrar username -->
        <div class="data-field">
          <label class="field-label">{{ $t('profile.name') }}</label>
          <div class="visible-field">{{ userStore.user.username || 'Usuario' }}</div>
        </div>

        <!-- Mostrar email -->
        <div class="data-field">
          <label class="field-label">{{ $t('profile.email') }}</label>
          <div class="field-with-toggle">
            <div :class="showEmail ? 'visible-field' : 'hidden-field'">
              {{ showEmail ? userStore.user.email : userStore.maskedEmail }}
            </div>
            <button
                class="toggle-btn"
                @click="toggleEmailVisibility"
                :title="showEmail ? 'Ocultar email' : 'Mostrar email'"
            >
              {{ showEmail ? '🫣' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Contraseña con botón  -->
        <div class="data-field">
          <label class="field-label">{{ $t('profile.password') }}</label>
          <div class="field-with-toggle">
            <div :class="showPassword ? 'visible-field' : 'hidden-field'">
              {{ showPassword ? userStore.user.password : userStore.maskedPassword }}
            </div>
            <button
                class="toggle-btn"
                @click="togglePasswordVisibility"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword ? '🫣' : '👁️' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Opciones del perfil -->
    <div class="profile-options-section">
      <h2 class="profile-title">{{ $t('profile.title') }}</h2>

      <div class="option-card">
        <span class="option-text">{{ $t('profile.favoriteRoutes') }}</span>
        <router-link to="/profile/favorite-routes" class="details-btn">
          {{ $t('profile.details') }}
        </router-link>
      </div>

      <div class="option-card">
        <span class="option-text">{{ $t('profile.travelHistory') }}</span>
        <router-link to="/profile/travel-history" class="details-btn">
          {{ $t('profile.details') }}
        </router-link>
      </div>

      <div class="option-card">
        <span class="option-text">{{ $t('profile.notifications') }}</span>
        <router-link to="/profile/notifications" class="details-btn">
          {{ $t('profile.details') }}
        </router-link>
      </div>

      <div class="option-card">
        <span class="option-text">{{ $t('profile.accountSettings') }}</span>
        <router-link to="/profile/account-settings" class="details-btn">
          {{ $t('profile.details') }}
        </router-link>
      </div>

      <!-- Botón cerrar sesión -->
      <div class="logout-container">
        <button class="logout-btn" @click="handleLogout">
          {{ $t('profile.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  gap: 20px;
  background-color: #f5f5f5;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #789c0a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  background-color: #f5f5f5;
  color: #d32f2f;
  font-size: 1.2em;
}

.profile-container {
  display: flex;
  min-height: calc(100vh - 140px);
  padding: 20px;
  gap: 20px;
  font-family: sans-serif;
}

.user-info-section {
  flex: 1;
  background-color: #e8f5d3;
  border-radius: 15px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  margin-bottom: 30px;
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
}

.avatar-symbol {
  font-size: 3em;
  color: black;
}

.user-data {
  width: 100%;
}

.data-field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  color: #5e7a08;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1em;
}


.visible-field {
  background-color: white;
  color: #333;
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: 500;
  border: 2px solid #d0e4a0;
  flex: 1;
}


.hidden-field {
  background-color: black;
  color: white;
  padding: 12px 15px;
  border-radius: 8px;
  font-family: monospace;
  letter-spacing: 2px;
  flex: 1;
}


.field-with-toggle {
  display: flex;
  gap: 10px;
  align-items: center;
}


.toggle-btn {
  background-color: #789c0a;
  border: none;
  border-radius: 8px;
  width: 45px;
  height: 45px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background-color: #5e7a08;
  transform: scale(1.05);
}

.toggle-btn:active {
  transform: scale(0.95);
}

.profile-options-section {
  flex: 2;
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.profile-title {
  color: #5e7a08;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
  font-weight: bold;
}

.option-card {
  background-color: #e8f5d3;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-text {
  color: #5e7a08;
  font-weight: bold;
  font-size: 1.1em;
}

.details-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.details-btn:hover {
  background-color: #333;
}

.logout-container {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #333;
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .option-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>