import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BaseApi } from '@/shared/infrastructure/base-api.js'

const api = new BaseApi()
const BUSES_ENDPOINT = '/buses'

function normalizeBus(resource = {}) {
    return {
        id: resource.Id ?? resource.id ?? '',
        plate: resource.Plate ?? resource.plate ?? '',
        route: resource.Route ?? resource.route ?? '',
        status: resource.Status ?? resource.status ?? 'active',
        driver: resource.Driver ?? resource.driver ?? '',
        createdAt: resource.CreatedAt ?? resource.createdAt ?? null,
        updatedAt: resource.UpdatedAt ?? resource.updatedAt ?? null
    }
}

export const useBusesStore = defineStore('buses', () => {
    // --- ESTADO ---
    const buses = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // --- GETTERS ---
    const busesCount = computed(() => buses.value.length)
    const activeBuses = computed(() => buses.value.filter(b => b.status === 'active').length)
    const maintenanceBuses = computed(() => buses.value.filter(b => b.status === 'maintenance').length)
    const inactiveBuses = computed(() => buses.value.filter(b => b.status === 'inactive').length)

    // --- ACCIONES ---

    /**
     * Obtiene todas las rutas de la compañía
     */
    async function fetchBuses() {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.http.get(BUSES_ENDPOINT)
            const busesData = Array.isArray(response.data) ? response.data : response.data?.data ?? []
            buses.value = busesData.map(normalizeBus)
            return buses.value
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error al obtener buses'
            console.error('❌ Error fetching buses:', error.value)
            return []
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Agrega un nuevo autobús
     */
    async function addBus(busData) {
        isLoading.value = true
        error.value = null

        try {
            const payload = {
                Plate: busData.plate ?? busData.Plate ?? '',
                Route: busData.route ?? busData.Route ?? '',
                Status: busData.status ?? busData.Status ?? 'active',
                Driver: busData.driver ?? busData.Driver ?? ''
            }

            const response = await api.http.post(BUSES_ENDPOINT, payload)
            const newBus = normalizeBus(response.data)
            buses.value.push(newBus)
            console.log('✅ Bus agregado:', newBus)
            return newBus
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error al agregar bus'
            console.error('❌ Error adding bus:', error.value)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Actualiza un autobús existente
     */
    async function updateBus(busId, busData) {
        isLoading.value = true
        error.value = null

        try {
            const payload = {
                Plate: busData.plate ?? busData.Plate ?? '',
                Route: busData.route ?? busData.Route ?? '',
                Status: busData.status ?? busData.Status ?? 'active',
                Driver: busData.driver ?? busData.Driver ?? ''
            }

            const response = await api.http.put(`${BUSES_ENDPOINT}/${busId}`, payload)
            const updatedBus = normalizeBus(response.data)
            const index = buses.value.findIndex(b => b.id === busId)
            if (index !== -1) {
                buses.value[index] = updatedBus
            }
            console.log('✅ Bus actualizado:', updatedBus)
            return updatedBus
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error al actualizar bus'
            console.error('❌ Error updating bus:', error.value)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Elimina un autobús
     */
    async function deleteBus(busId) {
        isLoading.value = true
        error.value = null

        try {
            await api.http.delete(`${BUSES_ENDPOINT}/${busId}`)
            buses.value = buses.value.filter(b => b.id !== busId)
            console.log('✅ Bus eliminado:', busId)
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Error al eliminar bus'
            console.error('❌ Error deleting bus:', error.value)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        buses,
        isLoading,
        error,
        busesCount,
        activeBuses,
        maintenanceBuses,
        inactiveBuses,
        fetchBuses,
        addBus,
        updateBus,
        deleteBus
    }
})

