import { defineStore } from 'pinia'

/**
 * Notifications Store
 * Manages user notifications including delays, route detours, and stop configurations
 */
export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        items: JSON.parse(localStorage.getItem('notifications') || '[]')
    }),

    getters: {
        /**
         * Get all notifications
         * @param {Object} state - Store state
         * @returns {Array} Complete list of notifications
         */
        getAllNotifications: (state) => state.items,

        /**
         * Get the 10 most recent notifications
         * @param {Object} state - Store state
         * @returns {Array} Array of up to 10 recent notifications
         */
        recentNotifications: (state) => state.items.slice(0, 10)
    },

    actions: {
        /**
         * Add a new notification
         * @param {Object} payload - Notification data
         */
        addNotification(payload) {
            const notification = {
                id: Date.now(),
                type: payload.type || 'info',
                messageKey: payload.messageKey || payload.message || 'notifications.messages.default',
                messageParams: payload.messageParams || {},
                timestamp: new Date().toISOString(),
                priority: payload.priority || 'medium',
                icon: payload.icon || '📍',
                read: false,
                ...payload,
            }
            this.items.unshift(notification)
            this.saveToLocalStorage()
        },

        /**
         * Notify that a route was saved
         * @param {string} routeName - Name of the saved route
         */
        notifyRouteSaved(routeName) {
            this.addNotification({
                messageKey: 'notifications.messages.routeSaved',
                messageParams: { routeName },
                icon: '⭐',
                priority: 'medium'
            })
        },

        /**
         * Notify that a route was removed
         * @param {string} routeName - Name of the removed route
         */
        notifyRouteRemoved(routeName) {
            this.addNotification({
                messageKey: 'notifications.messages.routeRemoved',
                messageParams: { routeName },
                icon: '🗑️',
                priority: 'low'
            })
        },

        /**
         * Notify that a bus is arriving
         * @param {string} busNumber - Bus identifier
         * @param {number} minutes - Minutes until arrival
         */
        notifyBusArriving(busNumber, minutes) {
            this.addNotification({
                messageKey: 'notifications.messages.busArriving',
                messageParams: { busNumber, minutes },
                icon: '🚌',
                priority: 'high'
            })
        },

        /**
         * Notify that a favorite was added
         */
        notifyFavoriteAdded() {
            this.addNotification({
                messageKey: 'notifications.messages.favoriteAdded',
                icon: '⭐',
                priority: 'medium'
            })
        },

        /**
         * Notify that a favorite was removed
         */
        notifyFavoriteRemoved() {
            this.addNotification({
                messageKey: 'notifications.messages.favoriteRemoved',
                icon: '🗑️',
                priority: 'low'
            })
        },

        /**
         * US05: Notify bus delay (only if > 10 minutes)
         * @param {Object} delayData - Delay information
         * @param {string} delayData.busNumber - Bus identifier
         * @param {string} delayData.routeName - Route name
         * @param {number} delayData.delayMinutes - Delay in minutes
         * @param {string} delayData.stopName - Stop name
         * @returns {boolean} Whether notification was sent
         */
        notifyDelay(delayData) {
            const { busNumber, routeName, delayMinutes, stopName } = delayData

            if (delayMinutes <= 10) {
                console.log(`⏱️ Retraso de ${delayMinutes} min no supera el umbral (>10 min)`)
                return false
            }

            this.addNotification({
                messageKey: 'notifications.messages.busDelayed',
                messageParams: {
                    busNumber,
                    routeName,
                    delayMinutes,
                    stopName
                },
                icon: '⏰',
                priority: 'high',
                type: 'delay'
            })

            console.log(`✅ US05 Positivo: Notificación enviada (${delayMinutes} min > 10 min)`)
            return true
        },

        /**
         * US06: Notify route detour
         * @param {Object} detourData - Detour information
         * @param {string} detourData.busNumber - Bus identifier
         * @param {string} detourData.originalRoute - Original route
         * @param {string} detourData.newRoute - New route
         * @param {string} detourData.reason - Reason for detour
         * @returns {boolean} Whether notification was sent
         */
        notifyRouteDetour(detourData) {
            const { busNumber, originalRoute, newRoute, reason } = detourData

            this.addNotification({
                messageKey: 'notifications.messages.routeDetour',
                messageParams: {
                    busNumber,
                    originalRoute,
                    newRoute,
                    reason: reason || 'Desviación detectada'
                },
                icon: '⚠️',
                priority: 'high',
                type: 'detour'
            })

            console.log(`✅ US06 Positivo: Alerta de desvío enviada para bus ${busNumber}`)
            return true
        },

        /**
         * US06: Notify route detour with connection check
         * @param {Object} detourData - Detour information
         * @returns {boolean} Whether notification was sent
         */
        notifyRouteDetourWithConnection(detourData) {
            const isOnline = navigator.onLine

            if (!isOnline) {
                console.log('❌ US06 Negativo: Sin conexión, no se envió la alerta')
                return false
            }

            return this.notifyRouteDetour(detourData)
        },

        /**
         * Configure notification for a specific stop
         * @param {Object} stopData - Stop information
         */
        configureStopNotification(stopData) {
            const savedStops = JSON.parse(localStorage.getItem('notificationStops') || '[]')

            const exists = savedStops.some(s => s.id === stopData.id)
            if (exists) {
                this.addNotification({
                    messageKey: 'notifications.messages.alreadyConfigured',
                    messageParams: { stopName: stopData.name },
                    icon: 'ℹ️',
                    priority: 'low'
                })
                return
            }

            savedStops.push({
                id: stopData.id,
                name: stopData.name,
                configuredAt: new Date().toISOString()
            })
            localStorage.setItem('notificationStops', JSON.stringify(savedStops))

            this.addNotification({
                messageKey: 'notifications.messages.notificationConfigured',
                messageParams: { stopName: stopData.name },
                icon: '🔔',
                priority: 'medium'
            })
        },

        /**
         * Check if notifications are enabled
         * @returns {boolean} Whether notifications are enabled
         */
        areNotificationsEnabled() {
            const enabled = localStorage.getItem('notificationsEnabled')
            return enabled === null || enabled === 'true'
        },

        /**
         * Mark a notification as read
         * @param {number} notificationId - Notification ID
         */
        markAsRead(notificationId) {
            const notification = this.items.find(item => item.id === notificationId)
            if (notification) {
                notification.read = true
                this.saveToLocalStorage()
            }
        },

        /**
         * Remove a notification
         * @param {number} notificationId - Notification ID
         */
        removeNotification(notificationId) {
            this.items = this.items.filter(item => item.id !== notificationId)
            this.saveToLocalStorage()
        },

        /**
         * Clear all notifications
         */
        clearAll() {
            this.items = []
            this.saveToLocalStorage()
        },

        /**
         * Save notifications to localStorage
         */
        saveToLocalStorage() {
            localStorage.setItem('notifications', JSON.stringify(this.items))
        }
    }
})