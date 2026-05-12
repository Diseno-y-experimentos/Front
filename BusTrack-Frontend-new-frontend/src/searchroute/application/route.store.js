
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { SearchRouteApi } from '../infrastructure/route-api.js';
import { RouteAssembler } from '../infrastructure/route.assembler.js';

const searchRouteApi = new SearchRouteApi();

function matchesRouteSearch(route, searchText = '') {
    const normalizedSearch = String(searchText).trim().toLowerCase();

    if (!normalizedSearch) {
        return true;
    }

    const haystack = [
        route?.name ?? route?.Name ?? '',
        route?.id ?? route?.Id ?? '',
        route?.estimatedTime ?? route?.EstimatedTime ?? '',
        route?.frequency ?? route?.Frequency ?? ''
    ]
        .map(value => String(value).toLowerCase())
        .join(' ');

    return haystack.includes(normalizedSearch);
}

const useRouteStore = defineStore('searchroute', () => {
    /**
     * Lista de rutas.
     * @type {import('vue').Ref<Route[]>}
     */
    const routes = ref([]);

    /**
     * Errores de operaciones API.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Indicador de carga.
     * @type {import('vue').Ref<boolean>}
     */
    const routesLoaded = ref(false);

    /**
     * Cantidad de rutas.
     * @type {import('vue').ComputedRef<number>}
     */

    const isLoading = ref(false);

    const routesCount = computed(() => (routesLoaded.value ? routes.value.length : 0));

    async function fetchRoutes(searchText = '') {
        isLoading.value = true;
        errors.value = [];

        try {
            const response = await searchRouteApi.getRoutes();
            const allRoutes = RouteAssembler.toEntitiesFromResponse(response.data);
            routes.value = allRoutes.filter(route => matchesRouteSearch(route, searchText));
            routesLoaded.value = true;
            return routes.value;
        } catch (error) {
            errors.value.push(error);
            return [];
        } finally {
            isLoading.value = false;
        }
    }

    function getRouteByName(name) {
        const target = String(name).trim().toLowerCase();
        return routes.value.find(r =>
            String(r?.name ?? r['name']).trim().toLowerCase() === target
        );
    }

    async function addRoute(route) {
        try {
            const response = await searchRouteApi.createRoute(route);
            const resource = response.data;
            const newRoute = RouteAssembler.toEntityFromResource(resource);
            routes.value.push(newRoute);
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function updateRoute(route) {
        try {
            const response = await searchRouteApi.updateRoute(route);
            const resource = response.data;
            const updatedRoute = RouteAssembler.toEntityFromResource(resource);
            const index = routes.value.findIndex(r => (r?.id ?? r['id']) === updatedRoute.id);
            if (index !== -1) routes.value[index] = updatedRoute;
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function deleteRoute(route) {
        try {
            await searchRouteApi.deleteRoute(route.id);
            const index = routes.value.findIndex(r => (r?.id ?? r['id']) === route.id);
            if (index !== -1) routes.value.splice(index, 1);
        } catch (error) {
            errors.value.push(error);
        }
    }

    return {
        routes,
        errors,
        routesLoaded,
        routesCount,
        isLoading,
        fetchRoutes,
        getRouteByName,
        addRoute,
        updateRoute,
        deleteRoute
    }
});

export default useRouteStore;




