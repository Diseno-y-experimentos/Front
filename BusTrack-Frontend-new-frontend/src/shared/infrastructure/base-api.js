import axios from "axios";

const platformApi = import.meta.env.VITE_API_BASE_URL;

// Ensure base URL doesn't have a trailing slash to prevent duplicate slashes
const normalizedBaseUrl = platformApi?.endsWith('/') ? platformApi.slice(0, -1) : platformApi;

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
            baseURL: normalizedBaseUrl
        });
    }

    /**
     * Gets the Axios HTTP client instance
     * @returns {axios.AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}