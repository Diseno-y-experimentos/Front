import {Route} from '../domain/model/route.entity.js';

export class RouteAssembler {
    /**
     * Converts a plain resource object to a Route entity.
     * @param {Object} resource
     * @returns {Route}
     */
    static toEntityFromResource(resource) {
        return new Route(resource.id, resource.name, resource.estimatedTime, resource.frequency);
    }

    /**
     * Converts an array of data resources into an array of Route entities.
     * @param {Object[]} resources - El array de datos de la API (lo que antes era response.data).
     * @returns {Route[]} Array of Route entities.
     */
    static toEntitiesFromResponse(resources) {

        if (!Array.isArray(resources)) {
            console.error("Error en el ensamblador: se esperaba un array, pero se recibió:", resources);
            return [];
        }

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
