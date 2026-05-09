<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()


const isModified = ref(false)


const notificationSettings = ref([
  { key: 'bus_arrival', enabled: true },
  { key: 'delays', enabled: true },
  { key: 'nearby_stops', enabled: true },
  { key: 'trip_start', enabled: false }
])

const markAsModified = () => {
  isModified.value = true
}

const goBack = () => {
  router.push('/profile')
}

const saveChanges = () => {

  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value))


  console.log('Saved changes:', notificationSettings.value)
  alert(t('notifications.changes_saved'))
  isModified.value = false
}


onMounted(() => {
  const savedSettings = localStorage.getItem('notificationSettings')
  if (savedSettings) {
    notificationSettings.value = JSON.parse(savedSettings)
  }
})
</script>


<template>
  <div class="notifications-container">
    <!-- Boton "Regresar" -->
    <button class="back-btn" @click="goBack">{{ $t('profile-notifications.back') }}</button>

    <h2 class="title">{{ $t('profile-notifications.title') }}</h2>

    <!-- Contenedor de settings  -->
    <div class="settings-box">
      <div v-for="(setting, index) in notificationSettings" :key="index" class="setting-item">
        <span class="setting-label">{{ $t(`profile-notifications.${setting.key}`) }}</span>

        <label class="switch">
          <input type="checkbox" v-model="setting.enabled" @change="markAsModified" />
          <span class="slider"></span>
        </label>

        <span class="status-text">{{ setting.enabled ? $t('profile-notifications.on') : $t('profile-notifications.off') }}</span>
      </div>
    </div>

    <!-- Boton de guardado -->
    <button class="save-btn" @click="saveChanges" :disabled="!isModified">
      {{ $t('profile-notifications.save') }}
    </button>
  </div>
</template>


<style scoped>
.notifications-container {
  display: flex;
  flex-direction: column;
  padding: 30px;
  font-family: 'Georgia', serif;
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.back-btn {
  align-self: flex-start;
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #333;
}

.title {
  text-align: center;
  color: #2e4d0e;
  font-size: 2.5em;
  margin-bottom: 30px;
  font-weight: bold;
}

.settings-box {
  background-color: #c6dd58;
  padding: 40px;
  border-radius: 15px;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.setting-label {
  font-size: 1.3em;
  color: #1c3207;
  font-weight: 500;
  flex: 1;
}


.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  margin: 0 15px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #9e9e9e;
  transition: 0.4s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1c3207;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

.status-text {
  font-size: 1.1em;
  font-weight: bold;
  color: #1c3207;
  min-width: 50px;
  text-align: center;
}

.save-btn {
  align-self: flex-end;
  background-color: black;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  margin-top: 30px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: background-color 0.3s, opacity 0.3s;
}

.save-btn:hover:not(:disabled) {
  background-color: #333;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-container {
    padding: 20px;
  }

  .title {
    font-size: 2em;
  }

  .settings-box {
    padding: 25px;
    width: 95%;
  }

  .setting-item {
    flex-direction: row;
    gap: 10px;
  }

  .setting-label {
    font-size: 1.1em;
  }

  .switch {
    width: 50px;
    height: 25px;
    margin: 0 10px;
  }

  .slider:before {
    height: 19px;
    width: 19px;
  }

  input:checked + .slider:before {
    transform: translateX(25px);
  }

  .status-text {
    font-size: 1em;
  }
}
</style>