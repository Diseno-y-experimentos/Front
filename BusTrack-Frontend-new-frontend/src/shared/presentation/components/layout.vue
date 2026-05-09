<script setup>
</script>

<template>
  <div class="app-layout">
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>


<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>