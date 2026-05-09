<script setup lang="js">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/shared/presentation/components/Card.vue'
import LoginForm from '@/app/presentation/components/LoginForm.vue'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'
import { useI18n } from 'vue-i18n'

const loading = ref(false)
const router = useRouter()
const { t } = useI18n()

async function onLogin(payload) {
  console.log('Login empresa completado:', payload)
  router.push({ name: 'company-dashboard' })
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
      <div class="brand">
        <div class="photo-box">
          <img src="@/assets/foto-bus.png" alt="Bus de la empresa" />
        </div>
      </div>

      <div class="right-column">
        <h1 class="title">
          {{ t('company.loginTitle') }}
        </h1>

        <Card class="panel">
          <LoginForm
              :loading="loading"
              variant="company"
              register-route="/company/register"
              @submit="onLogin"
          />
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
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: #d6ec9c;
  position: relative;
  overflow: hidden;
}


.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;


  animation: slide-up-fade 0.6s ease-out forwards;
}

@keyframes slide-up-fade {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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


.brand {
  --nudge: 40px;
  transform: translateX(calc(-1 * var(--nudge)));
}

.photo-box {
  width: clamp(260px, 35vw, 380px);
  aspect-ratio: 4 / 3;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.title {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 2.4rem;
  letter-spacing: 0.08em;
  color: #2f4f17;
}

.panel {
  width: min(92vw, 420px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}


.lang-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
}


@media (max-width: 960px) {
  .content {
    flex-direction: column;
    gap: 24px;
  }

  .brand {
    transform: none;
  }

  .photo-box {
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
