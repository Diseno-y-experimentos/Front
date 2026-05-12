import { defineStore } from 'pinia'
import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { useUserStore } from '@/stores/useUserStore'

const api = new BaseApi()

function normalizeSavedRoute(resource = {}) {
    const route = resource.Route ?? resource.route ?? {}
    const waypoints = route.Waypoints ?? route.waypoints ?? []
    const firstWaypoint = Array.isArray(waypoints) ? waypoints[0] : null
    const lastWaypoint = Array.isArray(waypoints) ? waypoints[waypoints.length - 1] : null

    const routeName = route.Name ?? route.name ?? resource.routeName ?? resource.RouteName ?? ''

    return {
        id: resource.Id ?? resource.id ?? Date.now(),
        userId: resource.UserId ?? resource.userId ?? null,
        routeId: resource.RouteId ?? resource.routeId ?? route.Id ?? route.id ?? null,
        origin: resource.origin ?? resource.Origin ?? firstWaypoint?.Name ?? firstWaypoint?.name ?? routeName,
        destination: resource.destination ?? resource.Destination ?? lastWaypoint?.Name ?? lastWaypoint?.name ?? routeName,
        savedAt: resource.CreatedAt ?? resource.createdAt ?? resource.savedAt ?? new Date().toISOString(),
        updatedAt: resource.UpdatedAt ?? resource.updatedAt ?? null,
        route
    }
}

function getCurrentUserId() {
    const userStore = useUserStore()
    return userStore.user?.id ?? userStore.profile?.Id ?? userStore.profile?.id ?? null
}

/**
 * Saved Routes Store
 * Manages user's saved routes for quick access
 */
export const useSavedRoutesStore = defineStore('savedRoutes', {
    state: () => ({
        routes: JSON.parse(localStorage.getItem('savedRoutes') || '[]')
    }),

    getters: {
        /**
         * Get all saved routes
         * @param {Object} state - Store state
         * @returns {Array} Complete list of saved routes
         */
        getAllRoutes: (state) => state.routes,

        /**
         * Check if a route already exists
         * @param {Object} state - Store state
         * @returns {Function} Function that checks route existence
         */
        routeExists: (state) => (origin, destination, routeId = null) => {
            return state.routes.some(
                route => (routeId !== null && route.routeId === routeId) || (
                    route.origin === origin && route.destination === destination
                )
            )
        }
    },

    actions: {
        async fetchSavedRoutes(userId = getCurrentUserId()) {
            if (!userId) return this.routes

            try {
                const response = await api.http.get(`/users/${userId}/saved-routes`)
                const resources = Array.isArray(response.data) ? response.data : []
                this.routes = resources.map(normalizeSavedRoute)
                this.saveToLocalStorage()
                return this.routes
            } catch (error) {
                console.warn('No se pudieron sincronizar las rutas guardadas:', error?.response?.data || error.message)
                return this.routes
            }
        },

        /**
         * Add a new route to saved routes
         * Only adds if route doesn't already exist
         * @param {Object} route - Route to save
         * @param {string} route.origin - Starting point
         * @param {string} route.destination - End point
         * @returns {boolean} Whether route was added
         */
        async addRoute(route) {
            const userId = route.userId ?? getCurrentUserId()
            const routeId = route.routeId ?? route.routeData?.id ?? route.routeData?.Id ?? route.id ?? null

            if (this.routeExists(route.origin, route.destination, routeId)) {
                return false
            }

            try {
                if (userId && routeId) {
                    const response = await api.http.post(`/users/${userId}/saved-routes`, { RouteId: routeId })
                    const savedRoute = normalizeSavedRoute(response.data)
                    this.routes.unshift(savedRoute)
                    this.saveToLocalStorage()
                    return true
                }

                const newRoute = normalizeSavedRoute({
                    id: Date.now(),
                    userId,
                    routeId,
                    origin: route.origin,
                    destination: route.destination,
                    savedAt: new Date().toISOString(),
                    route: route.routeData ?? route.route ?? null
                })

                this.routes.unshift(newRoute)
                this.saveToLocalStorage()
                return true
            } catch (error) {
                console.warn('No se pudo guardar la ruta en el backend, usando fallback local:', error?.response?.data || error.message)
                const fallbackRoute = normalizeSavedRoute({
                    id: Date.now(),
                    userId,
                    routeId,
                    origin: route.origin,
                    destination: route.destination,
                    savedAt: new Date().toISOString(),
                    route: route.routeData ?? route.route ?? null
                })
                this.routes.unshift(fallbackRoute)
                this.saveToLocalStorage()
                return true
            }
        },

        /**
         * Remove a specific route
         * @param {number} routeId - Route ID to remove
         */
        async removeRoute(routeId) {
            const userId = getCurrentUserId()

            try {
                if (userId) {
                    await api.http.delete(`/users/${userId}/saved-routes/${routeId}`)
                }
            } catch (error) {
                console.warn('No se pudo eliminar la ruta guardada en el backend, eliminando localmente:', error?.response?.data || error.message)
            } finally {
                this.routes = this.routes.filter(route => route.id !== routeId)
                this.saveToLocalStorage()
            }
        },

        /**
         * Save routes to localStorage
         */
        saveToLocalStorage() {
            localStorage.setItem('savedRoutes', JSON.stringify(this.routes))
        }
    }
})
