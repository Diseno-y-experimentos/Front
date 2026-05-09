<script setup lang="js">

</script>

<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card{
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: var(--shadow, 0 10px 20px rgba(0,0,0,.15));
}
</style>
