<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import TopNav from "@/shared/presentation/components/TopNav.vue";

defineOptions({ name: 'App' })

const route = useRoute()

// ÚNICA lógica para decidir si se muestra el TopNav de pasajeros
const showTopNav = computed(() => {
  // Rutas que explícitamente ocultan el header (ej. select-role)
  if (route.meta.hideTopNav) return false

  // Rutas públicas: login/register de pasajero y empresa
  if (route.meta.public) return false

  // Rutas de la sección empresa tienen su propio header
  if (route.meta.section === 'company') return false

  // En el resto (app de pasajeros autenticada) sí se muestra
  return true
})
</script>

<template>
  <div id="app">
    <TopNav v-if="showTopNav" />
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  background-color: white;
}

#app {
  min-height: 100vh;
  background-color: white;
}
</style>
