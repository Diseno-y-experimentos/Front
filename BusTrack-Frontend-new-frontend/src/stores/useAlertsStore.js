import { defineStore } from 'pinia'
import { BaseApi } from '@/shared/infrastructure/base-api.js'

const api = new BaseApi()

function normalizeAlert(resource = {}) {
    return {
        id: resource.Id ?? resource.id ?? Date.now(),
        title: resource.Title ?? resource.title ?? 'Alerta del Sistema',
        message: resource.Message ?? resource.message ?? resource.details ?? '',
        isRead: resource.IsRead ?? resource.isRead ?? false,
        status: (resource.IsRead ?? resource.isRead) ? 'resolved' : 'pending',
        severity: resource.Severity ?? resource.severity ?? 'medium',
        type: resource.Type ?? resource.type ?? 'info',
        timestamp: resource.CreatedAt ?? resource.createdAt ?? resource.timestamp ?? new Date().toISOString(),
        updatedAt: resource.UpdatedAt ?? resource.updatedAt ?? null,
        busId: resource.BusId ?? resource.busId ?? 'N/A',
        route: resource.Route ?? resource.route ?? 'Sin Ruta',
        details: resource.Message ?? resource.message ?? resource.details ?? ''
    }
}

/**
 * Alerts Store
 * Manages system alerts including traffic incidents, delays, and route detours
 */
export const useAlertsStore = defineStore('alerts', {
    state: () => ({
        items: JSON.parse(localStorage.getItem('alerts') || '[]'),
        alertsEnabled: localStorage.getItem('alertsEnabled') !== 'false'
    }),

    getters: {
        getAllAlerts: (state) => state.items,
        getPendingAlerts: (state) => state.items.filter(item => item.status === 'pending'),
        recentAlerts: (state) => state.items.slice(0, 10)
    },

    actions: {
        async fetchAlerts() {
            try {
                const response = await api.http.get('/alerts')
                const resources = Array.isArray(response.data) ? response.data : []
                this.items = resources.map(normalizeAlert)
                this.saveToLocalStorage()
                return this.items
            } catch (error) {
                console.warn('No se pudieron sincronizar las alertas:', error?.response?.data || error.message)
                return this.items
            }
        },

        /**
         * Add a new alert to the system
         * @param {Object} payload - Alert data
         */
        async addAlert(payload) {
            const body = {
                Title: payload.title ?? payload.Title ?? 'Alerta del Sistema',
                Message: payload.message ?? payload.Message ?? payload.details ?? '',
                IsRead: payload.isRead ?? payload.IsRead ?? false,
                BusId: payload.busId ?? payload.BusId ?? null,
                Route: payload.route ?? payload.Route ?? null,
                Severity: payload.severity ?? payload.Severity ?? 'medium',
                Type: payload.type ?? payload.Type ?? 'info'
            }

            try {
                const response = await api.http.post('/alerts', body)
                const alert = normalizeAlert(response.data)
                this.items.unshift(alert)
                this.saveToLocalStorage()
                return alert
            } catch (error) {
                const alert = normalizeAlert({
                    ...payload,
                    id: Date.now(),
                    status: 'pending',
                    timestamp: new Date().toISOString()
                })
                console.warn('No se pudo guardar la alerta en el backend, usando fallback local:', error?.response?.data || error.message)
                this.items.unshift(alert)
                this.saveToLocalStorage()
                return alert
            }
        },

        /**
         * Report a route detour
         * @param {string} busId - Bus identifier
         * @param {string} routeName - Route name
         */
        async reportRouteDetour(busId, routeName) {
            return this.addAlert({
                title: 'Desvío de Ruta Detectado',
                busId: busId,
                route: routeName,
                type: 'detour',
                severity: 'high'
            })
        },

        /**
         * Report heavy traffic
         * @param {string} busId - Bus identifier
         * @param {string} routeName - Route name
         */
        async reportHeavyTraffic(busId, routeName) {
            return this.addAlert({
                title: 'Tráfico Intenso',
                busId: busId,
                route: routeName,
                type: 'traffic',
                severity: 'medium'
            })
        },

        /**
         * Report minor delay
         * @param {string} busId - Bus identifier
         * @param {string} routeName - Route name
         */
        async reportMinorDelay(busId, routeName) {
            return this.addAlert({
                title: 'Retraso Menor',
                busId: busId,
                route: routeName,
                type: 'delay',
                severity: 'low'
            })
        },

        /**
         * US05: Report major delay (>10 minutes)
         * @param {string} busId - Bus identifier
         * @param {string} routeName - Route name
         * @param {number} delayMinutes - Delay in minutes
         * @param {string} stopName - Stop name
         */
        async reportMajorDelay(busId, routeName, delayMinutes, stopName) {
            if (delayMinutes > 10) {
                return this.addAlert({
                    title: `Retraso de ${delayMinutes} minutos`,
                    busId: busId,
                    route: routeName,
                    type: 'delay',
                    severity: 'high',
                    details: `Bus ${busId} tiene un retraso de ${delayMinutes} minutos en ${stopName}`
                })
            }

            return false
        },

        /**
         * US08: Toggle alerts on/off
         * @param {boolean} enabled - Enable or disable alerts
         */
        toggleAlerts(enabled) {
            this.alertsEnabled = enabled
            localStorage.setItem('alertsEnabled', enabled.toString())
            console.log(enabled ? '✅ US08: Alertas activadas' : '❌ US08: Alertas desactivadas')
        },

        /**
         * US08: Report traffic incident (only if alerts are enabled)
         * @param {Object} incidentData - Incident details
         * @returns {boolean} Whether the incident was reported
         */
        reportTrafficIncident(incidentData) {
            const enabled = localStorage.getItem('alertsEnabled')
            const isEnabled = enabled === null || enabled === 'true'

            if (!isEnabled) {
                console.log('❌ US08 Negativo: Alertas desactivadas, no se reportó')
                return false
            }

            const { busId, route, severity, description } = incidentData

            this.addAlert({
                title: 'Incidente de Tráfico',
                busId: busId,
                route: route,
                type: 'traffic',
                severity: severity || 'high',
                details: description || 'Incidente reportado'
            })

            console.log('✅ US08 Positivo: Incidente reportado (alertas activadas)')
            return true
        },

        /**
         * Mark an alert as resolved
         * @param {number} alertId - Alert ID
         */
        async markAsResolved(alertId) {
            const alert = this.items.find(item => item.id === alertId)
            if (alert) {
                try {
                    const response = await api.http.put(`/alerts/${alertId}`, {
                        Title: alert.title,
                        Message: alert.details || alert.message || '',
                        IsRead: true
                    })
                    const updated = normalizeAlert(response.data)
                    const index = this.items.findIndex(item => item.id === alertId)
                    if (index !== -1) this.items[index] = updated
                } catch (error) {
                    alert.status = 'resolved'
                    alert.isRead = true
                    this.saveToLocalStorage()
                    console.warn('No se pudo marcar la alerta como resuelta en el backend:', error?.response?.data || error.message)
                }
            }
        },

        /**
         * Remove an alert
         * @param {number} alertId - Alert ID
         */
        async removeAlert(alertId) {
            try {
                await api.http.delete(`/alerts/${alertId}`)
            } catch (error) {
                console.warn('No se pudo eliminar la alerta en el backend, eliminando localmente:', error?.response?.data || error.message)
            } finally {
                this.items = this.items.filter(item => item.id !== alertId)
                this.saveToLocalStorage()
            }
        },

        /**
         * Clear all alerts
         */
        async clearAll() {
            const items = [...this.items]
            await Promise.all(items.map(item => this.removeAlert(item.id)))
            this.items = []
            this.saveToLocalStorage()
        },

        /**
         * Save alerts to localStorage
         */
        saveToLocalStorage() {
            localStorage.setItem('alerts', JSON.stringify(this.items))
        }
    }
})
