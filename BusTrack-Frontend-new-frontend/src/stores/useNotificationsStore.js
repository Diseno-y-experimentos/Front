import { defineStore } from 'pinia'
import { BaseApi } from '@/shared/infrastructure/base-api.js'

const api = new BaseApi()

function normalizeNotification(resource = {}) {
    return {
        id: resource.Id ?? resource.id ?? Date.now(),
        type: resource.Type ?? resource.type ?? 'info',
        messageKey: resource.MessageKey ?? resource.messageKey ?? null,
        messageParams: resource.MessageParams ?? resource.messageParams ?? {},
        timestamp: resource.CreatedAt ?? resource.createdAt ?? resource.timestamp ?? new Date().toISOString(),
        priority: resource.Priority ?? resource.priority ?? 'medium',
        icon: resource.Icon ?? resource.icon ?? '📍',
        read: resource.IsRead ?? resource.isRead ?? false,
        title: resource.Title ?? resource.title ?? null,
        message: resource.Message ?? resource.message ?? resource.messageKey ?? 'notifications.messages.default'
    }
}

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
        async fetchNotifications() {
            try {
                const response = await api.http.get('/notifications')
                const resources = Array.isArray(response.data) ? response.data : []
                this.items = resources.map(normalizeNotification)
                this.saveToLocalStorage()
                return this.items
            } catch (error) {
                console.warn('No se pudieron sincronizar las notificaciones:', error?.response?.data || error.message)
                return this.items
            }
        },

        /**
         * Add a new notification
         * @param {Object} payload - Notification data
         */
        async addNotification(payload) {
            const body = {
                Title: payload.title ?? payload.Title ?? payload.messageKey ?? 'Notificación',
                Message: payload.message ?? payload.Message ?? payload.messageKey ?? 'notifications.messages.default',
                IsRead: payload.read ?? payload.IsRead ?? false
            }

            try {
                const response = await api.http.post('/notifications', body)
                const notification = normalizeNotification(response.data)
                this.items.unshift(notification)
                this.saveToLocalStorage()
                return notification
            } catch (error) {
                const notification = normalizeNotification({
                    ...payload,
                    id: Date.now(),
                    read: false,
                    timestamp: new Date().toISOString()
                })
                console.warn('No se pudo guardar la notificación en el backend, usando fallback local:', error?.response?.data || error.message)
                this.items.unshift(notification)
                this.saveToLocalStorage()
                return notification
            }
        },

        /**
         * Notify that a route was saved
         * @param {string} routeName - Name of the saved route
         */
        async notifyRouteSaved(routeName) {
            return this.addNotification({
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
        async notifyRouteRemoved(routeName) {
            return this.addNotification({
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
        async notifyBusArriving(busNumber, minutes) {
            return this.addNotification({
                messageKey: 'notifications.messages.busArriving',
                messageParams: { busNumber, minutes },
                icon: '🚌',
                priority: 'high'
            })
        },

        /**
         * Notify that a favorite was added
         */
        async notifyFavoriteAdded() {
            return this.addNotification({
                messageKey: 'notifications.messages.favoriteAdded',
                icon: '⭐',
                priority: 'medium'
            })
        },

        /**
         * Notify that a favorite was removed
         */
        async notifyFavoriteRemoved() {
            return this.addNotification({
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
        async notifyDelay(delayData) {
            const { busNumber, routeName, delayMinutes, stopName } = delayData

            if (delayMinutes <= 10) {
                console.log(`⏱️ Retraso de ${delayMinutes} min no supera el umbral (>10 min)`)
                return false
            }

            return this.addNotification({
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
        async notifyRouteDetour(detourData) {
            const { busNumber, originalRoute, newRoute, reason } = detourData

            return this.addNotification({
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
        },

        /**
         * US06: Notify route detour with connection check
         * @param {Object} detourData - Detour information
         * @returns {boolean} Whether notification was sent
         */
        async notifyRouteDetourWithConnection(detourData) {
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
        async configureStopNotification(stopData) {
            const savedStops = JSON.parse(localStorage.getItem('notificationStops') || '[]')

            const exists = savedStops.some(s => s.id === stopData.id)
            if (exists) {
                return this.addNotification({
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

            return this.addNotification({
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
        async markAsRead(notificationId) {
            const notification = this.items.find(item => item.id === notificationId)
            if (notification) {
                try {
                    const response = await api.http.put(`/notifications/${notificationId}`, {
                        Title: notification.title ?? notification.messageKey ?? 'Notificación',
                        Message: notification.message ?? notification.messageKey ?? 'notifications.messages.default',
                        IsRead: true
                    })
                    const updated = normalizeNotification(response.data)
                    const index = this.items.findIndex(item => item.id === notificationId)
                    if (index !== -1) this.items[index] = updated
                } catch (error) {
                    notification.read = true
                    this.saveToLocalStorage()
                    console.warn('No se pudo marcar la notificación como leída en el backend:', error?.response?.data || error.message)
                }
            }
        },

        /**
         * Remove a notification
         * @param {number} notificationId - Notification ID
         */
        async removeNotification(notificationId) {
            try {
                await api.http.delete(`/notifications/${notificationId}`)
            } catch (error) {
                console.warn('No se pudo eliminar la notificación en el backend, eliminando localmente:', error?.response?.data || error.message)
            } finally {
                this.items = this.items.filter(item => item.id !== notificationId)
                this.saveToLocalStorage()
            }
        },

        /**
         * Clear all notifications
         */
        async clearAll() {
            const items = [...this.items]
            await Promise.all(items.map(item => this.removeNotification(item.id)))
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