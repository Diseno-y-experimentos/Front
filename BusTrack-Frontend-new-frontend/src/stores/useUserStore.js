import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// 1. Configuramos Axios para que use la URL de tu archivo .env
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const useUserStore = defineStore('user', () => {
    // --- ESTADO ---
    const user = ref({
        username: '',
        email: '',
        isAuthenticated: false
    })
    const userType = ref(null)

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

    // --- ACCIONES REALES CON LA API ---

    /**
     * PASSENGER registration (Conectado a .NET)
     */
    async function register(userData) {
        try {
            // Hacemos el POST a la ruta que vimos en tu Swagger
            const response = await apiClient.post('/auth/sign-up', {
                username: userData.username,
                email: userData.email,
                password: userData.password
            })

            console.log('✅ Usuario registrado en la base de datos:', response.data)
            return true
        } catch (error) {
            console.error('❌ Error al registrar en el backend:', error.response?.data || error.message)
            throw error
        }
    }

    /**
     * PASSENGER login (Conectado a .NET)
     */
    async function login(credentials) {
        try {
            const response = await apiClient.post('/auth/sign-in', {
                username: credentials.email || credentials.username, // ✅ Cambiado a "username"
                password: credentials.password
            })

            // Si el backend responde 200 OK, actualizamos el estado
            user.value = {
                username: response.data.username || credentials.username,
                email: credentials.email || credentials.username,
                isAuthenticated: true,
                ...response.data
            }
            userType.value = 'passenger'

            // Guardamos la sesión actual para no perderla al refrescar la página
            localStorage.setItem('bustrack_current_user', JSON.stringify({
                user: user.value,
                type: 'passenger'
                // Aquí podrías guardar el JWT si tu backend lo devuelve: token: response.data.token
            }))

            console.log('✅ Login exitoso validado por el backend')
            return true
        } catch (error) {
            console.error('❌ Credenciales rechazadas por el backend')
            return false
        }
    }

    /**
     * COMPANY registration (Conectado a .NET)
     */
    async function registerCompany(companyData) {
        try {
            // Usamos la ruta de companies de tu Swagger
            const response = await apiClient.post('/companies', companyData)
            console.log('✅ Compañía registrada en la BD:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Error registrando compañía:', error.response?.data || error.message)
            throw new Error('No se pudo registrar la compañía. Verifica los datos.')
        }
    }

    /**
     * COMPANY login
     */
    async function loginCompany(email, password) {
        // Asumiendo que usas el mismo endpoint de sign-in o uno específico para compañías
        try {
            const response = await apiClient.post('/auth/sign-in', { email, password })

            user.value = {
                ...response.data,
                email: email,
                isAuthenticated: true
            }
            userType.value = 'company'

            localStorage.setItem('bustrack_current_user', JSON.stringify({
                user: user.value,
                type: 'company'
            }))

            return user.value
        } catch (error) {
            throw new Error('Credenciales incorrectas')
        }
    }

    /**
     * Logout
     */
    function logout() {
        console.log('👋 Cerrando sesión y limpiando datos locales')
        user.value = { username: '', email: '', isAuthenticated: false }
        userType.value = null
        localStorage.removeItem('bustrack_current_user')
    }

    /**
     * Restore session (Mantiene la sesión si el usuario recarga la página)
     */
    function restoreSession() {
        const session = localStorage.getItem('bustrack_current_user')
        if (session) {
            const { user: savedUser, type } = JSON.parse(session)
            user.value = savedUser
            userType.value = type
            return true
        }
        return false
    }

    // Funciones temporales sin backend configurado aún (Deberían usar PUT/PATCH en el futuro)
    async function updateUser(updates) {
        console.warn('⚠️ Falta implementar el endpoint PUT /api/v1/user en el backend para guardar estos cambios')
        // ... lógica local temporal ...
    }

    async function updateCompanyInfo(updates) {
        console.warn('⚠️ Falta implementar el endpoint PUT /api/v1/companies/{id} en el backend')
    }

    return {
        user,
        userType,
        isLoggedIn,
        isPassenger,
        isCompany,
        maskedEmail,
        maskedPassword,
        login,
        loginCompany,
        register,
        registerCompany,
        logout,
        restoreSession,
        updateUser,
        updateCompanyInfo
    }
})