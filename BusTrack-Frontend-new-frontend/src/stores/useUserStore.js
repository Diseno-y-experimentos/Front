import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    /**
     * Current authenticated user.
     * @type {import('vue').Ref<User>}
     */
    const user = ref({
        username: '',
        email: '',
        password: '',
        isAuthenticated: false
    })

    /**
     * User type: 'passenger' or 'company'
     */
    const userType = ref(null)

    /**
     * List of registered passenger users.
     */
    const registeredUsers = ref([])

    /**
     * List of registered companies.
     */
    const registeredCompanies = ref([])

    /**
     * Indicates if there is an active session.
     */
    const isLoggedIn = computed(() => user.value.isAuthenticated)

    /**
     * Checks if user is a passenger
     */
    const isPassenger = computed(() => userType.value === 'passenger')

    /**
     * Checks if user is a company
     */
    const isCompany = computed(() => userType.value === 'company')

    /**
     * Masked email for UI display.
     */
    const maskedEmail = computed(() => {
        if (!user.value.email) return '••••••••••'
        const [name, domain] = user.value.email.split('@')
        if (!name || !domain) return '••••••••••'
        return `${name.slice(0, 2)}••••@${domain}`
    })

    /**
     * Masked password for UI display.
     */
    const maskedPassword = computed(() => '••••••••••')

    /**
     * PASSENGER login
     * Authenticates a passenger user by username/email and password.
     *
     * @param {Object} credentials - User credentials
     * @param {string} credentials.username - Username or email
     * @param {string} credentials.email - Email address
     * @param {string} credentials.password - User password
     * @returns {boolean} True if login successful, false otherwise
     */
    function login(credentials) {
        const foundUser = registeredUsers.value.find(u => {
            const matchesUsername = u.username === credentials.username
            const matchesEmail = u.email === credentials.email || u.email === credentials.username
            const matchesPassword = u.password === credentials.password

            return (matchesUsername || matchesEmail) && matchesPassword
        })

        if (foundUser) {
            user.value = {
                username: foundUser.username,
                email: foundUser.email,
                password: foundUser.password,
                isAuthenticated: true
            }
            userType.value = 'passenger'

            // Save session
            localStorage.setItem('bustrack_current_user', JSON.stringify({
                user: user.value,
                type: 'passenger'
            }))

            console.log('✅ Passenger login successful:', { username: foundUser.username, email: foundUser.email })
            return true
        } else {
            console.log('❌ Login failed: User not found or incorrect password')
            return false
        }
    }

    /**
     * COMPANY login
     * Authenticates a company user by email and password.
     *
     * @param {string} email - Company email address
     * @param {string} password - Company password
     * @returns {Object} Authenticated company user object
     * @throws {Error} If credentials are incorrect
     */
    function loginCompany(email, password) {
        const foundCompany = registeredCompanies.value.find(c =>
            c.email === email && c.password === password
        )

        if (!foundCompany) {
            throw new Error('Incorrect credentials')
        }

        user.value = {
            username: foundCompany.companyName,
            email: foundCompany.email,
            password: foundCompany.password,
            isAuthenticated: true,
            ...foundCompany
        }
        userType.value = 'company'

        // Save session
        localStorage.setItem('bustrack_current_user', JSON.stringify({
            user: user.value,
            type: 'company'
        }))

        console.log('✅ Company login successful:', foundCompany.companyName)
        return user.value
    }

    /**
     * PASSENGER registration
     * Registers a new passenger user or updates existing one.
     *
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Password
     */
    function register(userData) {
        const newUser = {
            username: userData.username,
            email: userData.email,
            password: userData.password
        }

        const existingIndex = registeredUsers.value.findIndex(
            u => u.username === userData.username || u.email === userData.email
        )

        if (existingIndex !== -1) {
            registeredUsers.value[existingIndex] = newUser
            console.log('⚠️ User updated:', newUser)
        } else {
            registeredUsers.value.push(newUser)
            console.log('✅ User registered:', newUser)
        }

        localStorage.setItem('bustrack_passenger_users', JSON.stringify(registeredUsers.value))
        console.log('📦 Total registered users:', registeredUsers.value.length)
    }

    /**
     * COMPANY registration
     * Registers a new company.
     *
     * @param {Object} companyData - Company registration data
     * @param {string} companyData.companyName - Company name
     * @param {string} companyData.ruc - Company tax ID (RUC)
     * @param {string} companyData.email - Company email
     * @param {string} companyData.address - Company address
     * @param {string} companyData.password - Company password
     * @param {string} companyData.fleetSize - Fleet size
     * @returns {Object} Newly registered company object
     * @throws {Error} If email is already registered
     */
    function registerCompany(companyData) {
        const companies = registeredCompanies.value

        // Check if already exists
        const exists = companies.find(c => c.email === companyData.email)
        if (exists) {
            throw new Error('This email is already registered')
        }

        const newCompany = {
            id: Date.now().toString(),
            ...companyData,
            createdAt: new Date().toISOString()
        }

        companies.push(newCompany)
        registeredCompanies.value = companies
        localStorage.setItem('bustrack_company_users', JSON.stringify(companies))

        console.log('✅ Company registered:', newCompany.companyName)
        return newCompany
    }

    /**
     * Logout
     * Closes the current user session and clears localStorage.
     */
    function logout() {
        console.log('👋 Logging out user:', user.value.username)

        user.value = {
            username: '',
            email: '',
            password: '',
            isAuthenticated: false
        }
        userType.value = null

        localStorage.removeItem('bustrack_current_user')
    }

    /**
     * Load user data from localStorage
     * Loads the current session and registered users/companies from localStorage.
     * Idempotent: can be called on app startup.
     */
    function loadUserFromStorage() {
        // Load current session
        const savedSession = localStorage.getItem('bustrack_current_user')
        if (savedSession) {
            const { user: savedUser, type } = JSON.parse(savedSession)
            user.value = savedUser
            userType.value = type
            console.log('📂 User loaded from storage:', user.value.username, 'Type:', type)
        }

        // Load passenger users
        const savedUsers = localStorage.getItem('bustrack_passenger_users')
        if (savedUsers) {
            registeredUsers.value = JSON.parse(savedUsers)
            console.log('📂 Passenger users loaded:', registeredUsers.value.length)
        }

        // Load companies
        const savedCompanies = localStorage.getItem('bustrack_company_users')
        if (savedCompanies) {
            registeredCompanies.value = JSON.parse(savedCompanies)
            console.log('📂 Companies loaded:', registeredCompanies.value.length)
        }
    }

    /**
     * Restore session
     * Attempts to restore user session from localStorage.
     * Used in router guard to check authentication.
     *
     * @returns {boolean} True if session restored, false otherwise
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

    /**
     * Update passenger user data
     * Updates the authenticated passenger user's information.
     *
     * @param {Object} updates - Fields to update
     * @param {string} [updates.username] - New username
     * @param {string} [updates.email] - New email
     * @param {string} [updates.password] - New password
     */
    function updateUser(updates) {
        const oldEmail = user.value.email

        user.value = {
            ...user.value,
            username: updates.username || user.value.username,
            email: updates.email || user.value.email,
            password: updates.password || user.value.password
        }

        if (userType.value === 'passenger') {
            const userIndex = registeredUsers.value.findIndex(u => u.email === oldEmail)
            if (userIndex !== -1) {
                registeredUsers.value[userIndex] = {
                    username: user.value.username,
                    email: user.value.email,
                    password: user.value.password
                }
                localStorage.setItem('bustrack_passenger_users', JSON.stringify(registeredUsers.value))
            }
        }

        // Update session
        localStorage.setItem('bustrack_current_user', JSON.stringify({
            user: user.value,
            type: userType.value
        }))

        console.log('✏️ User updated:', user.value.username)
    }

    /**
     * Update company information
     * Updates the authenticated company's information.
     *
     * @param {Object} updates - Fields to update
     * @param {string} [updates.companyName] - New company name
     * @param {string} [updates.ruc] - New RUC
     * @param {string} [updates.address] - New address
     * @throws {Error} If user is not a company
     */
    function updateCompanyInfo(updates) {
        if (userType.value !== 'company') {
            throw new Error('Only companies can update this information')
        }

        // Update current user
        user.value = {
            ...user.value,
            companyName: updates.companyName || user.value.companyName,
            ruc: updates.ruc || user.value.ruc,
            address: updates.address || user.value.address
        }

        // Update in companies list
        const companyIndex = registeredCompanies.value.findIndex(c => c.id === user.value.id)
        if (companyIndex !== -1) {
            registeredCompanies.value[companyIndex] = {
                ...registeredCompanies.value[companyIndex],
                companyName: updates.companyName || registeredCompanies.value[companyIndex].companyName,
                ruc: updates.ruc || registeredCompanies.value[companyIndex].ruc,
                address: updates.address || registeredCompanies.value[companyIndex].address
            }
            localStorage.setItem('bustrack_company_users', JSON.stringify(registeredCompanies.value))
        }

        // Update session
        localStorage.setItem('bustrack_current_user', JSON.stringify({
            user: user.value,
            type: userType.value
        }))

        console.log('✅ Company information updated')
    }

    /**
     * Update password
     * Changes the password for the current authenticated user (passenger or company).
     *
     * @param {string} newPassword - New password
     */
    function updatePassword(newPassword) {
        user.value.password = newPassword

        // Update in corresponding list
        if (userType.value === 'company') {
            const companyIndex = registeredCompanies.value.findIndex(c => c.id === user.value.id)
            if (companyIndex !== -1) {
                registeredCompanies.value[companyIndex].password = newPassword
                localStorage.setItem('bustrack_company_users', JSON.stringify(registeredCompanies.value))
            }
        } else if (userType.value === 'passenger') {
            const userIndex = registeredUsers.value.findIndex(u => u.email === user.value.email)
            if (userIndex !== -1) {
                registeredUsers.value[userIndex].password = newPassword
                localStorage.setItem('bustrack_passenger_users', JSON.stringify(registeredUsers.value))
            }
        }

        // Update session
        localStorage.setItem('bustrack_current_user', JSON.stringify({
            user: user.value,
            type: userType.value
        }))

        console.log('✅ Password updated')
    }

    return {
        // State
        user,
        userType,
        registeredUsers,
        registeredCompanies,

        // Getters
        isLoggedIn,
        isPassenger,
        isCompany,
        maskedEmail,
        maskedPassword,

        // Actions - Authentication
        login,
        loginCompany,
        register,
        registerCompany,
        logout,

        // Actions - Session Management
        loadUserFromStorage,
        restoreSession,

        // Actions - User Updates
        updateUser,
        updateCompanyInfo,
        updatePassword
    }
})