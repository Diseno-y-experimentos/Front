/**
 * Usando el base-endpoint trabajado en clase
 * BaseEndpoint class to handle common API endpoint operations.
 * @class
 * @example
 * const api = new BaseApi();
 * const usersEndpoint = new BaseEndpoint(api, '/users');
 * usersEndpoint.getAll().then(response => console.log(response.data));
 */
export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    getByName(name) {
        return this.http.get(`${this.endpointPath}/${name}`);
    }

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}