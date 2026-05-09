<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const form = ref({
  companyName: '',
  ruc: '',
  email: '',
  address: '',
  password: '',
  confirmPassword: '',
  fleetSize: ''
})

const errors = ref({})
const loading = ref(false)

const validateForm = () => {
  errors.value = {}

  if (!form.value.companyName.trim()) {
    errors.value.companyName = t('companyRegister.register.errors.companyNameRequired') || 'El nombre de la empresa es requerido'
  }

  if (!form.value.ruc.trim()) {
    errors.value.ruc = t('companyRegister.register.errors.rucRequired') || 'El RUC es requerido'
  }

  if (!form.value.email.trim()) {
    errors.value.email = t('companyRegister.register.errors.emailRequired') || 'El correo es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = t('companyRegister.register.errors.emailInvalid') || 'Correo inválido'
  }

  if (!form.value.address.trim()) {
    errors.value.address = t('companyRegister.register.errors.addressRequired') || 'La dirección es requerida'
  }

  if (!form.value.password) {
    errors.value.password = t('companyRegister.register.errors.passwordRequired') || 'La contraseña es requerida'
  } else if (form.value.password.length < 6) {
    errors.value.password = t('companyRegister.register.errors.passwordTooShort') || 'La contraseña debe tener al menos 6 caracteres'
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = t('companyRegister.register.errors.confirmPasswordRequired') || 'Debe confirmar la contraseña'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = t('companyRegister.register.passwordMismatch') || 'Las contraseñas no coinciden'
  }

  if (!form.value.fleetSize) {
    errors.value.fleetSize = t('companyRegister.register.errors.fleetSizeRequired') || 'El tamaño de la flota es requerido'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await userStore.registerCompany({
      companyName: form.value.companyName,
      ruc: form.value.ruc,
      email: form.value.email,
      address: form.value.address,
      password: form.value.password,
      fleetSize: form.value.fleetSize
    })

    alert(t('companyRegister.register.success') || '¡Registro exitoso! Ahora puedes iniciar sesión.')
    // Volver al flujo: después del registro ir al login; al iniciar sesión se redirige a Flota
    router.push('/company/login')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/company/login')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <h2 class="form-title">{{ t('companyRegister.register.title') }}</h2>

    <!-- Nombre de la Empresa -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.companyName') }}</label>
      <input
          type="text"
          v-model="form.companyName"
          class="form-input"
          :class="{ 'input-error': errors.companyName }"
          :placeholder="t('companyRegister.register.companyNamePlaceholder')"
      />
      <span v-if="errors.companyName" class="error-message">
        {{ errors.companyName }}
      </span>
    </div>

    <!-- RUC -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.ruc') }}</label>
      <input
          type="text"
          v-model="form.ruc"
          class="form-input"
          :class="{ 'input-error': errors.ruc }"
          :placeholder="t('companyRegister.register.rucPlaceholder')"
      />
      <span v-if="errors.ruc" class="error-message">
        {{ errors.ruc }}
      </span>
    </div>

    <!-- Correo Corporativo -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.corporateEmail') }}</label>
      <input
          type="email"
          v-model="form.email"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          :placeholder="t('companyRegister.register.corporateEmailPlaceholder')"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <!-- Dirección -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.address') }}</label>
      <input
          type="text"
          v-model="form.address"
          class="form-input"
          :class="{ 'input-error': errors.address }"
          :placeholder="t('companyRegister.register.addressPlaceholder')"
      />
      <span v-if="errors.address" class="error-message">
        {{ errors.address }}
      </span>
    </div>

    <!-- Contraseña -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.password') }}</label>
      <input
          type="password"
          v-model="form.password"
          class="form-input"
          :class="{ 'input-error': errors.password }"
          :placeholder="t('companyRegister.register.passwordPlaceholder')"
      />
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>

    <!-- Confirmar Contraseña -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.confirmPassword') }}</label>
      <input
          type="password"
          v-model="form.confirmPassword"
          class="form-input"
          :class="{ 'input-error': errors.confirmPassword }"
          :placeholder="t('companyRegister.register.confirmPasswordPlaceholder')"
      />
      <span v-if="errors.confirmPassword" class="error-message">
        {{ errors.confirmPassword }}
      </span>
    </div>

    <!-- Tamaño de la Flota -->
    <div class="form-group">
      <label class="form-label">{{ t('companyRegister.register.fleetSize') }}</label>
      <input
          type="number"
          v-model="form.fleetSize"
          class="form-input"
          :class="{ 'input-error': errors.fleetSize }"
          :placeholder="t('companyRegister.register.fleetSizePlaceholder')"
          min="1"
      />
      <span v-if="errors.fleetSize" class="error-message">
        {{ errors.fleetSize }}
      </span>
    </div>

    <!-- Botón Submit -->
    <button type="submit" class="btn-submit" :disabled="loading">
      {{ loading ? t('companyRegister.register.loading') : t('companyRegister.register.submit') }}
    </button>

    <!-- Link a Login -->
    <div class="footer-link">
      <span>{{ t('companyRegister.register.alreadyHaveAccount') }}</span>
      <button type="button" class="link-button" @click="goToLogin">
        {{ t('companyRegister.register.loginLink') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: #e5e5e5;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(45, 106, 46, 0.2);
}

.form-input.input-error {
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.3);
}

.error-message {
  font-size: 0.8rem;
  color: #dc3545;
}

.btn-submit {
  width: 100%;
  padding: 0.9rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #333;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.footer-link {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.3rem;
}

.link-button:hover {
  color: #333;
}
</style>