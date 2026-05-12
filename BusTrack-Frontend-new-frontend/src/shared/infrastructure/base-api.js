import axios from 'axios';

const platformApi = import.meta.env.VITE_API_BASE_URL;

// Ensure base URL doesn't have a trailing slash to prevent duplicate slashes
const normalizedBaseUrl = platformApi?.endsWith('/') ? platformApi.slice(0, -1) : platformApi;

function getStoredToken() {
    if (typeof window === 'undefined') return null;

    try {
        const session = localStorage.getItem('bustrack_current_user');
        if (!session) return null;

        const parsed = JSON.parse(session);
        return parsed?.token ?? null;
    } catch {
        return null;
    }
}

/**
 * Usando el base-api trabajado en clase
 * Base API class to handle HTTP requests using Axios
 * @class
 * @example
 * const api = new BaseApi();
 * api.http.get('/endpoint').then(response => console.log(response.data));
 */
export class BaseApi {
    /**
     * @private
     * Axios HTTP client instance
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios HTTP client with the base URL from environment variables
     */
    constructor() {
        this.#http = axios.create({
            baseURL: normalizedBaseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.#http.interceptors.request.use((config) => {
            const token = getStoredToken();

            if (token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (import.meta.env.DEV) {
                const method = String(config.method ?? 'GET').toUpperCase();
                const url = `${config.baseURL ?? normalizedBaseUrl ?? ''}${config.url ?? ''}`;
                console.log(`[HTTP REQUEST] ${method} ${url}`);
            }

            return config;
        });

        this.#http.interceptors.response.use(
            (response) => {
                if (import.meta.env.DEV) {
                    const method = String(response.config.method ?? 'GET').toUpperCase();
                    console.log(`[HTTP RESPONSE] ${method} ${response.config.url} ${response.status}`);
                }

                return response;
            },
            (error) => {
                if (import.meta.env.DEV && error?.config) {
                    const method = String(error.config.method ?? 'GET').toUpperCase();
                    const status = error?.response?.status ?? 'ERR';
                    console.warn(`[HTTP ERROR] ${method} ${error.config.url} ${status}`);
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Gets the Axios HTTP client instance
     * @returns {axios.AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}