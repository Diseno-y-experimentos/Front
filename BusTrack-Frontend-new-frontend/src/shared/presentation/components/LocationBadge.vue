<script setup lang="js">
defineProps({
  text: { type: String, required: true }
})
</script>

<template>
  <div class="badge">
    <span class="pin">📍</span>
    <span class="text">{{ text }}</span>
  </div>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #000;
  color: #fff;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  max-width: 90%;
}

.pin {
  font-size: 22px;
  line-height: 1;
}

.text {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
}
</style>
