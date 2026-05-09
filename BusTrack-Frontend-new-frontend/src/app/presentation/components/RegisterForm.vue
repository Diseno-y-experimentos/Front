<script setup lang="js">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const emit = defineEmits(['submit'])

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirm: '',
})

const errors = reactive({
  email: null,
  username: null,
  password: null,
  confirm: null,
})

function isEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

const props = defineProps({
  loading: { type: Boolean, default: false },
})

function validate () {
  // email
  if (!form.email) {
    errors.email = t('auth.register.errors.emailRequired')
  } else if (!isEmail(form.email)) {
    errors.email = t('auth.register.errors.emailInvalid')
  } else {
    errors.email = null
  }

  // username
  errors.username = !form.username
      ? t('auth.register.errors.usernameRequired')
      : null

  // password
  errors.password = form.password.length < 6
      ? t('auth.register.errors.passwordMin')
      : null

  // confirm
  errors.confirm = form.confirm !== form.password
      ? t('auth.register.errors.confirmMismatch')
      : null

  return !errors.email && !errors.username && !errors.password && !errors.confirm
}


const canSubmit = computed(() => {
  if (!form.email || !form.username || !form.password || !form.confirm) {
    return false
  }

  if (!isEmail(form.email)) {
    return false
  }

  if (form.password.length < 6) {
    return false
  }

  if (form.password !== form.confirm) {
    return false
  }

  return true
})

async function onSubmit(){
  if (!validate()) return


  userStore.register({
    username: form.username,
    email: form.email,
    password: form.password
  })

  emit('submit', { ...form })


  router.push('/login')
}

function onGoogleSignup() {
  console.log('Google signup clicked')
}
</script>

<template>
  <div>
    <div class="language-switcher">
      <LanguageSwitcher />
    </div>

    <form class="register-form" @submit.prevent="onSubmit" novalidate>
      <h2 class="title">{{ t('auth.register.title') }}</h2>

      <!-- Botón de Google -->
      <button type="button" class="google-btn" @click="onGoogleSignup">
        {{ t('auth.register.continueWithGoogle') }}
      </button>

      <!-- Correo -->
      <label class="field">
        <span class="label">{{ t('auth.register.email') }}</span>
        <input
            class="input"
            type="email"
            v-model.trim="form.email"
            :placeholder="t('auth.register.emailPlaceholder')"
            autocomplete="email"
            :aria-invalid="!!errors.email"
            :aria-label="t('auth.register.email')"
        />
        <small v-if="errors.email" class="error">{{ errors.email }}</small>
      </label>

      <!-- Usuario -->
      <label class="field">
        <span class="label">{{ t('auth.register.username') }}</span>
        <input
            class="input"
            type="text"
            v-model.trim="form.username"
            :placeholder="t('auth.register.usernamePlaceholder')"
            :aria-label="t('auth.register.username')"
            :aria-invalid="!!errors.username"
        />
        <small v-if="errors.username" class="error">{{ errors.username }}</small>
      </label>

      <!-- Contraseña -->
      <label class="field">
        <span class="label">{{ t('auth.register.password') }}</span>
        <input
            class="input"
            type="password"
            v-model="form.password"
            :placeholder="t('auth.register.passwordPlaceholder')"
            :aria-label="t('auth.register.password')"
            :aria-invalid="!!errors.password"
        />
        <small v-if="errors.password" class="error">{{ errors.password }}</small>
      </label>

      <!-- Confirmar contraseña -->
      <label class="field">
        <span class="label">{{ t('auth.register.confirmPassword') }}</span>

        <input
            class="input"
            type="password"
            v-model="form.confirm"
            :placeholder="t('auth.register.confirmPasswordPlaceholder')"
            :aria-label="t('auth.register.confirmPassword')"
            :aria-invalid="!!errors.confirm"
        />

        <small v-if="errors.confirm" class="error">{{ errors.confirm }}</small>
      </label>

      <button class="btn" type="submit" :disabled="!canSubmit">
        {{ t('auth.register.create') }}
      </button>

      <p class="hint">
        {{ t('auth.register.haveAccount') }}
        <router-link to="/login" class="link">{{ t('auth.register.signIn') }}</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
.register-form {
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