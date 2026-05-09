import { defineStore } from 'pinia'

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
        routeExists: (state) => (origin, destination) => {
            return state.routes.some(
                route => route.origin === origin && route.destination === destination
            )
        }
    },

    actions: {
        /**
         * Add a new route to saved routes
         * Only adds if route doesn't already exist
         * @param {Object} route - Route to save
         * @param {string} route.origin - Starting point
         * @param {string} route.destination - End point
         * @returns {boolean} Whether route was added
         */
        addRoute(route) {
            if (!this.routeExists(route.origin, route.destination)) {
                const newRoute = {
                    id: Date.now(),
                    origin: route.origin,
                    destination: route.destination,
                    savedAt: new Date().toISOString()
                }
                this.routes.unshift(newRoute)
                this.saveToLocalStorage()
                return true
            }
            return false
        },

        /**
         * Remove a specific route
         * @param {number} routeId - Route ID to remove
         */
        removeRoute(routeId) {
            this.routes = this.routes.filter(route => route.id !== routeId)
            this.saveToLocalStorage()
        },

        /**
         * Save routes to localStorage
         */
        saveToLocalStorage() {
            localStorage.setItem('savedRoutes', JSON.stringify(this.routes))
        }
    }
})
