<script setup lang="js">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import CompanyTopNav from '@/shared/presentation/components/CompanyTopNav.vue'

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()

// Estado reactivo
const companyInfo = ref({
  name: '',
  ruc: '',
  address: ''
})

const alertPreferences = ref({
  delayMinutes: 10,
  types: {
    delays: true,
    routeDeviations: false,
    incidents: false,
    maintenance: false,
    traffic: false
  }
})

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Cargar datos al montar el componente
onMounted(() => {
  loadCompanyData()
  loadAlertPreferences()
})

// Cargar datos de la empresa desde el usuario actual
const loadCompanyData = () => {
  if (userStore.user && userStore.isCompany) {
    companyInfo.value = {
      name: userStore.user.companyName || '',
      ruc: userStore.user.ruc || '',
      address: userStore.user.address || ''
    }
    console.log('✅ Datos de empresa cargados:', companyInfo.value)
  }
}

// Cargar preferencias de alertas desde localStorage
const loadAlertPreferences = () => {
  const saved = localStorage.getItem('company_alert_preferences')
  if (saved) {
    alertPreferences.value = JSON.parse(saved)
    console.log('✅ Preferencias de alertas cargadas:', alertPreferences.value)
  }
}

// Guardar información de la empresa
const saveCompanyInfo = () => {
  if (!companyInfo.value.name.trim()) {
    alert('El nombre de la empresa es requerido')
    return
  }

  // Actualizar en el store
  userStore.updateCompanyInfo({
    companyName: companyInfo.value.name,
    ruc: companyInfo.value.ruc,
    address: companyInfo.value.address
  })

  console.log('✅ Información de empresa guardada:', companyInfo.value)
  alert(t('settings.messages.companySaved'))
}

// Guardar preferencias de alertas
const saveAlertPreferences = () => {
  // Guardar en localStorage
  localStorage.setItem('company_alert_preferences', JSON.stringify(alertPreferences.value))

  console.log('✅ Preferencias de alertas guardadas:', alertPreferences.value)
  alert(t('settings.messages.preferencesSaved'))
}

// Cambiar contraseña (funcional)
const changePassword = () => {
  // Validaciones
  if (!companyInfo.value.name.trim()) {
    alert(t('settings.errors.companyNameRequired'))
    return
  }

  if (!security.value.currentPassword) {
    alert(t('settings.errors.currentPasswordRequired'))
    return
  }

  if (!security.value.newPassword) {
    alert(t('settings.errors.newPasswordRequired'))
    return
  }

  if (security.value.newPassword.length < 6) {
    alert(t('settings.errors.passwordTooShort'))
    return
  }

  if (security.value.currentPassword !== userStore.user.password) {
    alert(t('settings.errors.currentPasswordIncorrect'))
    return
  }

  // Cambiar la contraseña
  try {
    userStore.updatePassword(security.value.newPassword)

    alert(t('settings.messages.passwordChanged'))

    // Limpiar campos
    security.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    console.log('✅ Contraseña cambiada exitosamente')
  } catch (error) {
    alert(t('settings.errors.passwordChangeFailed') + ': ' + error.message)
  }
}

// Cerrar sesión
const handleLogout = () => {
  if (confirm(t('settings.messages.confirmLogout'))) {
    userStore.logout()
    console.log('✅ Sesión cerrada, redirigiendo...')
    router.push('/select-role')
  }
}

// Cambiar idioma
const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('language', lang)
  console.log('✅ Idioma cambiado a:', lang)
}
</script>

<template>
  <div class="page">
    <CompanyTopNav />

    <main class="content">
      <h1 class="page-title">{{ t('settings.title') }}</h1>

      <div class="settings-grid">
        <!-- Información de la Empresa -->
        <div class="settings-card full-width">
          <h2 class="card-title">{{ t('settings.companyInfo.title') }}</h2>
          <div class="form-group">
            <label class="form-label">{{ t('settings.companyInfo.name') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="companyInfo.name"
                :placeholder="t('settings.companyInfo.namePlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.companyInfo.ruc') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="companyInfo.ruc"
                :placeholder="t('settings.companyInfo.rucPlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.companyInfo.address') }}</label>
            <input
                type="text"
                class="form-input"
                v-model="companyInfo.address"
                :placeholder="t('settings.companyInfo.addressPlaceholder')"
            >
          </div>
          <button class="btn-save" @click="saveCompanyInfo">
            {{ t('settings.actions.saveChanges') }}
          </button>
        </div>

        <!-- Preferencias de Alertas -->
        <div class="settings-card">
          <h2 class="card-title">{{ t('settings.alerts.title') }}</h2>
          <div class="form-group">
            <label class="form-label">{{ t('settings.alerts.delayMinutes') }}</label>
            <input
                type="number"
                class="form-input"
                v-model="alertPreferences.delayMinutes"
                placeholder="10"
                min="1"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.alerts.types') }}</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="alert-delay"
                    class="checkbox-input"
                    v-model="alertPreferences.types.delays"
                >
                <label for="alert-delay" class="checkbox-label">
                  {{ t('settings.alerts.delays') }}
                  <span class="status-badge" :class="alertPreferences.types.delays ? 'status-on' : 'status-off'">
                    {{ alertPreferences.types.delays ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
              <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="alert-route"
                    class="checkbox-input"
                    v-model="alertPreferences.types.routeDeviations"
                >
                <label for="alert-route" class="checkbox-label">
                  {{ t('settings.alerts.routeDeviations') }}
                  <span class="status-badge" :class="alertPreferences.types.routeDeviations ? 'status-on' : 'status-off'">
                    {{ alertPreferences.types.routeDeviations ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
              <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="alert-incident"
                    class="checkbox-input"
                    v-model="alertPreferences.types.incidents"
                >
                <label for="alert-incident" class="checkbox-label">
                  {{ t('settings.alerts.incidents') }}
                  <span class="status-badge" :class="alertPreferences.types.incidents ? 'status-on' : 'status-off'">
                    {{ alertPreferences.types.incidents ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
              <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="alert-maintenance"
                    class="checkbox-input"
                    v-model="alertPreferences.types.maintenance"
                >
                <label for="alert-maintenance" class="checkbox-label">
                  {{ t('settings.alerts.maintenance') }}
                  <span class="status-badge" :class="alertPreferences.types.maintenance ? 'status-on' : 'status-off'">
                    {{ alertPreferences.types.maintenance ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
              <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="alert-traffic"
                    class="checkbox-input"
                    v-model="alertPreferences.types.traffic"
                >
                <label for="alert-traffic" class="checkbox-label">
                  {{ t('settings.alerts.traffic') }}
                  <span class="status-badge" :class="alertPreferences.types.traffic ? 'status-on' : 'status-off'">
                    {{ alertPreferences.types.traffic ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <button class="btn-save" @click="saveAlertPreferences">
            {{ t('settings.actions.saveChanges') }}
          </button>
        </div>

        <!-- Seguridad -->
        <div class="settings-card">
          <h2 class="card-title">{{ t('settings.security.title') }}</h2>
          <div class="form-group">
            <label class="form-label">{{ t('settings.security.currentPassword') }}</label>
            <input
                type="password"
                class="form-input"
                v-model="security.currentPassword"
                :placeholder="t('settings.security.currentPasswordPlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.security.newPassword') }}</label>
            <input
                type="password"
                class="form-input"
                v-model="security.newPassword"
                :placeholder="t('settings.security.newPasswordPlaceholder')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.security.confirmPassword') }}</label>
            <input
                type="password"
                class="form-input"
                v-model="security.confirmPassword"
                :placeholder="t('settings.security.confirmPasswordPlaceholder')"
            >
          </div>
          <button class="btn-save" @click="changePassword">
            {{ t('settings.actions.changePassword') }}
          </button>
        </div>
      </div>

      <!-- Cerrar Sesión -->
      <div class="logout-container">
        <button class="btn-logout btn-logout-centered" @click="handleLogout">
          {{ t('settings.actions.logout') }}
        </button>
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

.page-title {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.settings-card.full-width {
  grid-column: 1 / -1;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
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

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2c3e50;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #A4C639;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #A4C639;
}

.checkbox-label {
  font-size: 0.95rem;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  justify-content: space-between;
}


.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-on {
  background: #d4edda;
  color: #155724;
}

.status-off {
  background: #f8d7da;
  color: #721c24;
}

.btn-save {
  width: 100%;
  padding: 0.9rem;
  background: #A4C639;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-save:hover {
  background: #8fb030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(164, 198, 57, 0.3);
}

.btn-logout {
  width: 100%;
  padding: 0.9rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-logout:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-logout-centered {
  max-width: 300px;
}

@media (max-width: 968px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>