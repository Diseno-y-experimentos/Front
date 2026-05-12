import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BaseApi } from '@/shared/infrastructure/base-api.js'

const api = new BaseApi()
const SESSION_KEY = 'bustrack_current_user'

function normalizeUserResource(resource = {}) {
    return {
        id: resource.Id ?? resource.id ?? '',
        username: resource.Username ?? resource.username ?? '',
        email: resource.Email ?? resource.email ?? '',
        createdAt: resource.CreatedAt ?? resource.createdAt ?? null,
        updatedAt: resource.UpdatedAt ?? resource.updatedAt ?? null,
        isAuthenticated: true
    }
}

function getStoredSession() {
    try {
        const session = localStorage.getItem(SESSION_KEY)
        return session ? JSON.parse(session) : null
    } catch {
        return null
    }
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY)
}

function decodeJwtPayload(token) {
    if (!token || typeof token !== 'string') return {}

    try {
        const payload = token.split('.')[1]
        if (!payload) return {}

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
        const json = atob(normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '='))
        return JSON.parse(json)
    } catch {
        return {}
    }
}

function buildAuthPayload(credentials = {}) {
    return {
        Username: credentials.username ?? credentials.email ?? '',
        Password: credentials.password ?? ''
    }
}

function buildCompanyPayload(companyData = {}) {
    return {
        Name: companyData.name ?? companyData.companyName ?? '',
        Email: companyData.email ?? '',
        Ruc: companyData.ruc ?? companyData.Ruc ?? '',
        Phone: companyData.phone ?? companyData.Phone ?? companyData.contactPhone ?? '',
        Address: companyData.address ?? ''
    }
}

export const useUserStore = defineStore('user', () => {
    // --- ESTADO ---
    const user = ref({
        id: '',
        username: '',
        email: '',
        isAuthenticated: false
    })
    const token = ref(getStoredSession()?.token ?? '')
    const userType = ref(null)
    const profile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // --- GETTERS ---
    const isLoggedIn = computed(() => user.value.isAuthenticated)
    const isPassenger = computed(() => userType.value === 'passenger')
    const isCompany = computed(() => userType.value === 'company')

    const maskedEmail = computed(() => {
        if (!user.value.email) return '••••••••••'
        const [name, domain] = user.value.email.split('@')
        if (!name || !domain) return '••••••••••'
        return `${name.slice(0, 2)}••••@${domain}`
    })
    const maskedPassword = computed(() => '••••••••••')

    function applySession({ user: nextUser, token: nextToken, type, profileResource }) {
        if (nextUser) {
            user.value = {
                id: nextUser.id ?? '',
                username: nextUser.username ?? '',
                email: nextUser.email ?? '',
                isAuthenticated: Boolean(nextUser.isAuthenticated)
            }
        }

        if (nextToken !== undefined) {
            token.value = nextToken || ''
        }

        if (type !== undefined) {
            userType.value = type
        }

        if (profileResource) {
            profile.value = profileResource
        }

        if (user.value.isAuthenticated && token.value) {
            saveSession({
                user: user.value,
                token: token.value,
                type: userType.value
            })
        }
    }

    async function loadCurrentUser() {
        const response = await api.http.get('/user')
        const normalizedUser = normalizeUserResource(response.data)
        applySession({ user: normalizedUser, profileResource: response.data })
        return normalizedUser
    }

    // --- ACCIONES REALES CON LA API ---

    /**
     * PASSENGER registration (Conectado a .NET)
     */
    async function register(userData) {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.http.post('/auth/sign-up', {
                Username: userData.Username ?? userData.username ?? '',
                Email: userData.Email ?? userData.email ?? '',
                Password: userData.Password ?? userData.password ?? ''
            })

            console.log('✅ Usuario registrado en la base de datos:', response.data)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || err.response?.data || err.message
            console.error('❌ Error al registrar en el backend:', error.value)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * PASSENGER login (Conectado a .NET)
     */
    async function login(credentials) {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.http.post('/auth/sign-in', buildAuthPayload(credentials))
            const nextToken = response.data?.token ?? response.data?.Token ?? ''

            if (!nextToken) {
                throw new Error('El backend no devolvió un token')
            }

            applySession({ token: nextToken })

            try {
                await loadCurrentUser()
            } catch {
                const decoded = decodeJwtPayload(nextToken)
                const fallbackUser = {
                    id: decoded.id ?? decoded.Id ?? decoded.userId ?? decoded.sub ?? '',
                    username: credentials.username ?? credentials.email ?? decoded.username ?? '',
                    email: credentials.email ?? decoded.email ?? credentials.username ?? '',
                    isAuthenticated: true
                }

                applySession({ user: fallbackUser, profileResource: null })
            }
            userType.value = 'passenger'
            applySession({ type: 'passenger' })

            console.log('✅ Login exitoso validado por el backend')
            return true
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Credenciales rechazadas por el backend'
            console.error('❌ Credenciales rechazadas por el backend')
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * COMPANY registration (Conectado a .NET)
     */
    async function registerCompany(companyData) {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.http.post('/companies', buildCompanyPayload(companyData))
            console.log('✅ Compañía registrada en la BD:', response.data)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            console.error('❌ Error registrando compañía:', error.value)
            throw new Error('No se pudo registrar la compañía. Verifica los datos.')
        } finally {
            isLoading.value = false
        }
    }

    /**
     * COMPANY login
     */
    async function loginCompany(email, password) {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.http.post('/auth/sign-in', buildAuthPayload({ email, password }))
            const nextToken = response.data?.token ?? response.data?.Token ?? ''

            if (!nextToken) {
                throw new Error('El backend no devolvió un token')
            }

            applySession({ token: nextToken, type: 'company' })

            try {
                await loadCurrentUser()
            } catch {
                const decoded = decodeJwtPayload(nextToken)
                applySession({
                    user: {
                        id: decoded.id ?? decoded.Id ?? decoded.userId ?? decoded.sub ?? '',
                        username: email,
                        email,
                        isAuthenticated: true
                    }
                })
            }

            userType.value = 'company'
            applySession({ type: 'company' })

            return user.value
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Credenciales incorrectas'
            throw new Error(error.value)
        } finally {
            isLoading.value = false
        }
    }

    async function refreshSession() {
        if (!token.value) return false

        try {
            const response = await api.http.post('/auth/refresh')
            const nextToken = response.data?.token ?? response.data?.Token ?? token.value
            applySession({ token: nextToken })
            await loadCurrentUser()
            return true
        } catch (refreshError) {
            console.warn('No se pudo refrescar la sesión:', refreshError?.response?.data || refreshError.message)
            return false
        }
    }

    /**
     * Logout
     */
    function logout() {
        console.log('👋 Cerrando sesión y limpiando datos locales')
        user.value = { id: '', username: '', email: '', isAuthenticated: false }
        token.value = ''
        userType.value = null
        profile.value = null
        error.value = null
        clearSession()
    }

    /**
     * Restore session (Mantiene la sesión si el usuario recarga la página)
     */
    function restoreSession() {
        const session = getStoredSession()

        if (session) {
            const savedUser = session.user ?? null
            const savedType = session.type ?? null

            if (savedUser) {
                user.value = {
                    id: savedUser.id ?? '',
                    username: savedUser.username ?? '',
                    email: savedUser.email ?? '',
                    isAuthenticated: Boolean(savedUser.isAuthenticated)
                }
            }

            token.value = session.token ?? ''
            userType.value = savedType

            if (token.value) {
                void refreshSession()
            }

            return true
        }
        return false
    }

    async function updateUser(updates) {
        isLoading.value = true
        error.value = null

        try {
            const payload = {
                Username: updates.Username ?? updates.username ?? user.value.username,
                Email: updates.Email ?? updates.email ?? user.value.email
            }

            const password = updates.Password ?? updates.password
            if (password) {
                payload.Password = password
            }

            const response = await api.http.put('/user', payload)
            const normalizedUser = normalizeUserResource(response.data)
            applySession({ user: normalizedUser, profileResource: response.data })
            return normalizedUser
        } catch (updateError) {
            error.value = updateError.response?.data?.message || updateError.message
            throw updateError
        } finally {
            isLoading.value = false
        }
    }

    async function updateCompanyInfo(updates) {
        isLoading.value = true
        error.value = null

        try {
            const companyId = updates.id ?? updates.Id ?? profile.value?.Id ?? profile.value?.id

            if (!companyId) {
                throw new Error('No se encontró un id de compañía para actualizar')
            }

            const payload = buildCompanyPayload(updates)
            const response = await api.http.put(`/companies/${companyId}`, payload)
            profile.value = response.data
            return response.data
        } catch (updateError) {
            error.value = updateError.response?.data?.message || updateError.message
            throw updateError
        } finally {
            isLoading.value = false
        }
    }

    return {
        user,
        token,
        userType,
        profile,
        isLoading,
        error,
        isLoggedIn,
        isPassenger,
        isCompany,
        maskedEmail,
        maskedPassword,
        login,
        loginCompany,
        register,
        registerCompany,
        refreshSession,
        logout,
        restoreSession,
        updateUser,
        updateCompanyInfo
    }
})