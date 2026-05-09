<script setup lang="js">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useAlertsStore } from '@/stores/useAlertsStore'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  registerRoute: {
    type: String,
    default: '/register'
  },
  variant: {
    type: String,
    default: 'passenger'
  }
})

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const alertsStore = useAlertsStore()

const emit = defineEmits(['submit'])

const form = reactive({
  emailOrUsername: '',
  password: '',
})

const errors = reactive({
  emailOrUsername: null,
  password: null,
  general: null,
})

function validate () {
  errors.emailOrUsername = !form.emailOrUsername
      ? t('auth.login.errors.usernameRequired')
      : null

  errors.password = !form.password
      ? t('auth.login.errors.passwordRequired')
      : null

  errors.general = null
  return !errors.emailOrUsername && !errors.password
}


const canSubmit = computed(() => form.emailOrUsername && form.password)

async function onSubmit () {
  if (!validate()) return

  errors.general = null

  try {
    // CASO EMPRESA
    if (props.variant === 'company') {
      const company = await userStore.loginCompany(form.emailOrUsername, form.password)
      console.log('✅ Login empresa exitoso, redirigiendo...')
      emit('submit', company)
      // Limpiar alertas al iniciar sesión para empezar con tablero vacío
      alertsStore.clearAll()
      // Redirigir a Flota tras login de empresa (antes: monitoring)
      router.push({ name: 'company-fleet' })
    }
    // CASO PASAJERO
    else {
      const success = userStore.login({
        email: form.emailOrUsername,
        username: form.emailOrUsername,
        password: form.password
      })

      if (success) {
        console.log('✅ Login pasajero exitoso, redirigiendo...')
        emit('submit', {
          username: userStore.user.username,
          email: userStore.user.email
        })
        router.push('/home')
      } else {
        console.log('❌ Login fallido: credenciales incorrectas')
        errors.general = `${t('errors.auth.invalidCredentials')}. ${t('errors.tryAgain')}`
      }
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message)
    errors.general = error.message || 'Error al iniciar sesión'
  }
}

function onGoogleLogin () {
  console.log('Google login clicked')
}
</script>

<template>
  <form class="login-form" @submit.prevent="onSubmit" novalidate>
    <h2 class="title">{{ t('auth.login.title') }}</h2>

    <!-- Banner de error general -->
    <div v-if="errors.general" class="error-banner">
      ⚠️ {{ errors.general }}
    </div>

    <!-- Botón Google -->
    <button type="button" class="google-btn" @click="onGoogleLogin">
      {{ t('auth.login.continueWithGoogle') }}
    </button>

    <!-- Email o Username -->
    <label class="field">
      <span class="label">{{ t('auth.login.username') }}</span>
      <input
          class="input"
          type="text"
          v-model.trim="form.emailOrUsername"
          :placeholder="t('auth.login.emailOrUsernamePlaceholder')"
          autocomplete="username"
          :aria-invalid="!!errors.emailOrUsername"
          :aria-label="t('auth.login.emailOrUsername')"
      />
      <small v-if="errors.emailOrUsername" class="error">
        {{ errors.emailOrUsername }}
      </small>
    </label>

    <!-- Password -->
    <label class="field">
      <span class="label">{{ t('auth.login.password') }}</span>
      <input
          class="input"
          type="password"
          v-model="form.password"
          :placeholder="t('auth.login.passwordPlaceholder')"
          :aria-label="t('auth.login.password')"
          :aria-invalid="!!errors.password"
      />
      <small v-if="errors.password" class="error">
        {{ errors.password }}
      </small>
    </label>

    <!-- Submit Button -->
    <button class="btn" type="submit" :disabled="!canSubmit">
      {{ t('auth.login.register')  }}
    </button>

    <!-- Link a Register -->
    <p class="hint">
      {{ t('auth.login.noAccount') }}
      <RouterLink :to="props.registerRoute" class="link">
        {{ t('auth.login.createAccount') }}
      </RouterLink>
    </p>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
}

.title {
  text-align: center;
  color: #2d6a2e;
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
}

.error-banner {
  background-color: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 14px;
  font-weight: 500;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.google-btn {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #000;
  border-radius: 8px;
  background: #fff;
  color: #000;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.google-btn:hover {
  background: #f5f5f5;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 8px;
  background: #e5e5e5;
  color: #666;
  font-size: 15px;
  outline: none;
  box-shadow: none;
  transition: box-shadow 0.2s;
}

.input::placeholder {
  color: #999;
}

.input:focus {
  box-shadow: 0 0 0 2px rgba(45, 106, 46, 0.2);
}

.btn {
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  background: #5a5a5a;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.link {
  color: #2d6a2e;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.error {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 4px;
}
</style>