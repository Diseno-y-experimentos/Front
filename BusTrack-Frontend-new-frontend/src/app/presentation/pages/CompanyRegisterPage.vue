<script setup>
import Card from '@/shared/presentation/components/Card.vue'
import CompanyRegisterForm from '@/app/presentation/components/CompanyRegisterForm.vue'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'
</script>

<template>
  <section class="screen">

    <div class="lang-wrapper">
      <LanguageSwitcher />
    </div>


    <div class="content">
      <div class="icon">
        <div class="person-icon">
          <img src="@/assets/person-icon.png" alt="BusTrack" />
        </div>
      </div>

      <Card class="panel">
        <CompanyRegisterForm />
      </Card>
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


.lang-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
}

.icon {
  --nudge: 40px;
  transform: translateX(calc(-1 * var(--nudge)));
}

.person-icon img {
  width: clamp(180px, 26vw, 260px);
  height: auto;
  border-radius: 50%;
}

.panel {
  width: min(90vw, 450px);
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
}


@media (max-width: 960px) {
  .content {
    flex-direction: column;
    gap: 24px;
  }

  .icon {
    transform: none;
  }

  .person-icon img {
    width: min(60vw, 220px);
  }
}
</style>

