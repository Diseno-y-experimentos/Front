<script setup lang="js">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import Card from '@/shared/presentation/components/Card.vue'
import LoginForm from '@/app/presentation/components/LoginForm.vue'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'

const loading = ref(false)
const router = useRouter()
const { t } = useI18n()

async function onLogin(payload) {
  console.log('Login completado en LoginPage:', payload)
}

const goBackToRoleSelection = () => {
  router.push('/select-role')
}
</script>

<template>
  <section class="screen">

    <button class="back-btn" @click="goBackToRoleSelection">
      ←
    </button>


    <div class="lang-wrapper">
      <LanguageSwitcher />
    </div>


    <div class="content">

      <h1 class="title">
        {{ t('passenger.loginTitle') }}
      </h1>

      <div class="main-row">
        <div class="brand">
          <div class="logo-box">
            <img src="@/assets/friends.png" alt="Friends" />
          </div>
        </div>

        <Card class="panel">
          <LoginForm :loading="loading" @submit="onLogin" />
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.screen {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #d6ec9c;
  position: relative;
}


.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}


.main-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.title {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 2.4rem;
  letter-spacing: 0.08em;
  color: #2f4f17;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.brand {
  --nudge: 40px;
  transform: translateX(calc(-1 * var(--nudge)));
}

.logo-box {
  width: clamp(240px, 32vw, 360px);
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,.15);
}
.logo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel {
  width: min(92vw, 480px);
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
  z-index: 1;
}

.lang-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.3);
}


@media (max-width: 960px) {
  .main-row {
    flex-direction: column;
    gap: 24px;
  }

  .brand {
    transform: none;
  }

  .logo-box {
    width: min(70vw, 340px);
  }

  .title {
    font-size: 2rem;
  }

  .panel {
    width: min(90vw, 420px);
  }
}
</style>
