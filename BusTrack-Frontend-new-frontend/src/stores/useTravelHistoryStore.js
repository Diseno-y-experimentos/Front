import { defineStore } from 'pinia'
import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { useUserStore } from '@/stores/useUserStore'

const api = new BaseApi()

function normalizeTripResource(resource = {}) {
    return {
        id: resource.Id ?? resource.id ?? Date.now(),
        userId: resource.UserId ?? resource.userId ?? null,
        routeId: resource.RouteId ?? resource.routeId ?? null,
        origin: resource.Origin ?? resource.origin ?? '',
        destination: resource.Destination ?? resource.destination ?? '',
        timestamp: resource.StartedAt ?? resource.startedAt ?? resource.CreatedAt ?? resource.createdAt ?? resource.timestamp ?? new Date().toISOString(),
        startedAt: resource.StartedAt ?? resource.startedAt ?? null,
        endedAt: resource.EndedAt ?? resource.endedAt ?? null,
        notes: resource.Notes ?? resource.notes ?? '',
        steps: resource.steps ?? [],
        duration: resource.duration ?? null,
        distance: resource.distance ?? null,
        createdAt: resource.CreatedAt ?? resource.createdAt ?? null,
        updatedAt: resource.UpdatedAt ?? resource.updatedAt ?? null
    }
}

function getCurrentUserId() {
    const userStore = useUserStore()
    return userStore.user?.id ?? userStore.profile?.Id ?? userStore.profile?.id ?? null
}

export const useTravelHistoryStore = defineStore('travelHistory', {
    state: () => ({
        /**
         * Predefined demo trips for demonstration purposes.
         * These trips cannot be deleted by users and serve as examples.
         * @type {Array<Trip>}
         */
        demoTrips: [
            {
                id: 'demo-1',
                origin: 'UPC - San Miguel Campus',
                destination: 'UPC - San Isidro Campus',
                timestamp: new Date('2024-11-20T14:30:00').toISOString(),
                steps: [
                    { type: 'walk', name: 'On foot', mode: 'walking' },
                    { type: 'stop', name: 'Rafael Escardó Stop', mode: 'stop' },
                    { type: 'bus', name: 'Santa María', busNumber: 'OM22', mode: 'transit' },
                    { type: 'stop', name: 'Cádiz', mode: 'stop' },
                    { type: 'walk', name: 'On foot', mode: 'walking' },
                ],
                duration: '45 min',
                distance: '12.5 km'
            },
            {
                id: 'demo-2',
                origin: 'UPC - San Isidro Campus',
                destination: 'UPC - Monterrico Campus',
                timestamp: new Date('2024-11-19T09:15:00').toISOString(),
                steps: [
                    { type: 'walk', name: 'On foot', mode: 'walking' },
                    { type: 'stop', name: 'Cádiz', mode: 'stop' },
                    { type: 'bus', name: 'San Ignacio', busNumber: '1272', mode: 'transit' },
                    { type: 'stop', name: 'La Encalada', mode: 'stop' },
                    { type: 'walk', name: 'On foot', mode: 'walking' },
                ],
                duration: '38 min',
                distance: '10.2 km'
            }
        ],

        /**
         * Array of user-created trips loaded from localStorage.
         * Each trip contains id, origin, destination, steps, timestamp, duration, and distance.
         * @type {Array<Trip>}
         */
        userTrips: JSON.parse(localStorage.getItem('travelHistory') || '[]'),
    }),
    getters: {
        /**
         * Returns all trips (user trips + demo trips combined).
         * User trips appear first, followed by demo trips.
         * @param {Object} state - The store state
         * @returns {Array<Trip>} Complete list of all trips
         */
        getAllTrips: (state) => {
            return [...state.userTrips, ...state.demoTrips]
        },

        /**
         * Returns the 10 most recent trips from the combined list.
         * @param {Object} state - The store state
         * @returns {Array<Trip>} Array of up to 10 recent trips
         */
        recentTrips: (state) => {
            const allTrips = [...state.userTrips, ...state.demoTrips]
            return allTrips.slice(0, 10)
        },

        /**
         * Returns all trips that occurred on a specific date.
         * @param {Object} state - The store state
         * @returns {function(string|Date): Array<Trip>} Function that takes a date and returns matching trips
         */
        tripsByDate: (state) => (date) => {
            const allTrips = [...state.userTrips, ...state.demoTrips]
            return allTrips.filter(trip => {
                const tripDate = new Date(trip.timestamp).toDateString()
                return tripDate === new Date(date).toDateString()
            })
        }
    },
    actions: {
        async fetchTrips(userId = getCurrentUserId()) {
            if (!userId) return this.getAllTrips

            try {
                const response = await api.http.get(`/users/${userId}/trips`)
                const resources = Array.isArray(response.data) ? response.data : []
                this.userTrips = resources.map(normalizeTripResource)
                this.saveToLocalStorage()
                return this.getAllTrips
            } catch (error) {
                console.warn('No se pudo sincronizar el historial de viajes:', error?.response?.data || error.message)
                return this.getAllTrips
            }
        },

        /**
         * Adds a new trip to the user's travel history.
         * Automatically assigns an ID (timestamp) and current timestamp, then persists to localStorage.
         *
         * @param {TripPayload} tripData - Trip object to save
         * @param {string} tripData.origin - Starting point/origin location of the trip
         * @param {string} tripData.destination - End point/destination location of the trip
         * @param {Array<TripStep>} [tripData.steps=[]] - Array of trip steps (walk, bus, stop)
         * @param {string} [tripData.duration=null] - Total trip duration (e.g., "45 min")
         * @param {string} [tripData.distance=null] - Total trip distance (e.g., "12.5 km")
         * @returns {void}
         */
        async addTrip(tripData) {
            const userId = tripData.userId ?? getCurrentUserId()
            const body = {
                RouteId: tripData.routeId ?? tripData.routeData?.id ?? tripData.routeData?.Id ?? null,
                Origin: tripData.origin,
                Destination: tripData.destination,
                StartedAt: tripData.startedAt ?? tripData.timestamp ?? new Date().toISOString(),
                EndedAt: tripData.endedAt ?? null,
                Notes: tripData.notes ?? ''
            }

            try {
                if (userId) {
                    const response = await api.http.post(`/users/${userId}/trips`, body)
                    const createdTrip = normalizeTripResource({
                        ...response.data,
                        steps: tripData.steps || response.data?.steps || [],
                        duration: tripData.duration || null,
                        distance: tripData.distance || null
                    })

                    this.userTrips.unshift(createdTrip)
                    this.saveToLocalStorage()
                    return createdTrip
                }

                const fallbackTrip = normalizeTripResource({
                    id: Date.now(),
                    userId,
                    routeId: body.RouteId,
                    Origin: body.Origin,
                    Destination: body.Destination,
                    StartedAt: body.StartedAt,
                    EndedAt: body.EndedAt,
                    Notes: body.Notes,
                    steps: tripData.steps || [],
                    duration: tripData.duration || null,
                    distance: tripData.distance || null
                })

                this.userTrips.unshift(fallbackTrip)
                this.saveToLocalStorage()
                return fallbackTrip
            } catch (error) {
                console.warn('No se pudo guardar el viaje en el backend, usando fallback local:', error?.response?.data || error.message)
                const fallbackTrip = normalizeTripResource({
                    id: Date.now(),
                    userId,
                    routeId: body.RouteId,
                    Origin: body.Origin,
                    Destination: body.Destination,
                    StartedAt: body.StartedAt,
                    EndedAt: body.EndedAt,
                    Notes: body.Notes,
                    steps: tripData.steps || [],
                    duration: tripData.duration || null,
                    distance: tripData.distance || null
                })

                this.userTrips.unshift(fallbackTrip)
                this.saveToLocalStorage()
                return fallbackTrip
            }
        },

        /**
         * Removes a specific trip from the user's travel history.
         * Demo trips (IDs starting with 'demo-') cannot be deleted and will trigger an alert.
         *
         * @param {number|string} tripId - Unique identifier of the trip to remove
         * @returns {void}
         */
        async removeTrip(tripId) {
            // Prevent deletion of demo trips
            if (typeof tripId === 'string' && tripId.startsWith('demo-')) {
                alert('No puedes eliminar las rutas de ejemplo')
                return
            }

            const userId = getCurrentUserId()

            try {
                if (userId) {
                    await api.http.delete(`/users/${userId}/trips/${tripId}`)
                }
            } catch (error) {
                console.warn('No se pudo eliminar el viaje en el backend, eliminando localmente:', error?.response?.data || error.message)
            } finally {
                this.userTrips = this.userTrips.filter(trip => trip.id !== tripId)
                this.saveToLocalStorage()
            }
        },

        /**
         * Clears all user trips from the history.
         * Demo trips are preserved and remain intact.
         * @returns {void}
         */
        async clearHistory() {
            const trips = [...this.userTrips]
            await Promise.all(trips.map(trip => this.removeTrip(trip.id)))
            this.userTrips = []
            this.saveToLocalStorage()
        },

        /**
         * Clears ALL trips including demo trips.
         * This is a destructive action that removes both user and demo data.
         * @returns {void}
         */
        clearAllIncludingDemo() {
            this.userTrips = []
            this.demoTrips = []
            this.saveToLocalStorage()
        },

        /**
         * Persists the current user trips array to localStorage.
         * Called automatically after every modification to maintain data consistency.
         * Note: Demo trips are not persisted as they are hardcoded.
         * @returns {void}
         */
        saveToLocalStorage() {
            localStorage.setItem('travelHistory', JSON.stringify(this.userTrips))
        }
    },
})