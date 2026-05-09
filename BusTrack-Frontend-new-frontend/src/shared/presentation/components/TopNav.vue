<script setup lang="js">
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from "@/shared/presentation/components/language-switcher.vue";

const route = useRoute()
const { t } = useI18n()

const tabs = [
  { to: { name: 'search-route' }, labelKey: 'nav.searchRoute' },
  { to: { name: 'notifications' }, labelKey: 'nav.notifications' },
  { to: { name: 'bus-stops' }, labelKey: 'nav.busStops' },
  { to: { name: 'profile' }, labelKey: 'nav.profile' },
]
</script>

<template>
  <header class="nav">
    <div class="brand">BusTrack</div>
    <div class="language-switcher"><LanguageSwitcher /></div>
    <nav class="tabs">
      <RouterLink
          v-for="titem in tabs"
          :key="titem.labelKey"
          class="tab"
          :class="{ active: route.name === titem.to.name }"
          :to="titem.to"
      >
        {{ t(titem.labelKey) }}
      </RouterLink>
    </nav>
  </header>
</template>


<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #9cc642;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.brand {
  text-align: center;
  font-size: 42px;
  font-weight: 700;
  padding: 16px 0;
  color: #fff;
  letter-spacing: 1px;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 14px 24px;
  background: #aedd49;
}

.tab {
  background: transparent;
  border: 0;
  color: #2d6a2e;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  position: relative;
  text-decoration: none;
}

.tab:hover {
  color: #1a4d1b;
}

.tab.active {
  color: #1a4d1b;
  font-weight: 700;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #2d6a2e;
  border-radius: 2px;
}
</style>
