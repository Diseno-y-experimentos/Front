import { defineStore } from 'pinia'

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
        /**
         * Add a new alert to the system
         * @param {Object} payload - Alert data
         */
        addAlert(payload) {
            const alert = {
                id: Date.now(),
                title: payload.title || 'Alerta del Sistema',
                busId: payload.busId || 'N/A',
                route: payload.route || 'Sin Ruta',
                type: payload.type || 'info',
                severity: payload.severity || 'medium',
                status: 'pending',
                timestamp: new Date().toISOString(),
                ...payload,
            }
            this.items.unshift(alert)
            this.saveToLocalStorage()
        },

        /**
         * Report a route detour
         * @param {string} busId - Bus identifier
         * @param {string} routeName - Route name
         */
        reportRouteDetour(busId, routeName) {
            this.addAlert({
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
        reportHeavyTraffic(busId, routeName) {
            this.addAlert({
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
        reportMinorDelay(busId, routeName) {
            this.addAlert({
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
        reportMajorDelay(busId, routeName, delayMinutes, stopName) {
            if (delayMinutes > 10) {
                this.addAlert({
                    title: `Retraso de ${delayMinutes} minutos`,
                    busId: busId,
                    route: routeName,
                    type: 'delay',
                    severity: 'high',
                    details: `Bus ${busId} tiene un retraso de ${delayMinutes} minutos en ${stopName}`
                })
            }
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
        markAsResolved(alertId) {
            const alert = this.items.find(item => item.id === alertId)
            if (alert) {
                alert.status = 'resolved'
                this.saveToLocalStorage()
            }
        },

        /**
         * Remove an alert
         * @param {number} alertId - Alert ID
         */
        removeAlert(alertId) {
            this.items = this.items.filter(item => item.id !== alertId)
            this.saveToLocalStorage()
        },

        /**
         * Clear all alerts
         */
        clearAll() {
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
