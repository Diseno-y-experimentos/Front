import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const routesEndpointPath = import.meta.env.VITE_ROUTES_ENDPOINT_PATH || 'routes';

export class SearchRouteApi extends BaseApi {
    #routesEndpoint;

    constructor() {
        super();
        this.#routesEndpoint = new BaseEndpoint(this, routesEndpointPath);
    }

    /**
     * Obtiene rutas. Si se pasa 'searchText', filtra por nombre usando name_like.
     * @param {string} [searchText] - El texto para la búsqueda parcial.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRoutes(searchText = '') {

        if (searchText) {
            return this.http.get(this.#routesEndpoint.endpointPath, { params: { name_like: searchText } });
        }

        return this.#routesEndpoint.getAll();
    }

    getRouteByName(name){
        return this.#routesEndpoint.getByName(name);
    }

    deleteRoute(id){
        return this.#routesEndpoint.delete(id);
    }

    updateRoute(route){
        return this.#routesEndpoint.update(route.id, route);
    }

    createRoute(resource){
        return this.#routesEndpoint.create(resource);
    }
}