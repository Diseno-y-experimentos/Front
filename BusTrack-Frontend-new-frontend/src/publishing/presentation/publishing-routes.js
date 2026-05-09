const publishingRoutes = [
    {
        path: "/profile",
        name: "Profile",
        component: () => import('./views/profile/profile.vue')
    },
    {
        path: "/search-route",
        name: "SearchRout",
        component: () => import('@/publishing/presentation/views/search-route/search-route.vue')
    },
    {
        path: "/notifications",
        name: "Notifications",
        component: () => import('./views/notifications/notifications.vue')
    },
    {
        path: "/bus-stops",
        name: "Bus-Stops",
        component: () => import('./views/bus-stops/bus-stops.vue')
    },
    {
        path: '/profile/favorite-routes',
        name: 'FavoriteRoutes',
        component: () => import('./views/profile/components/favorite-routes.vue')
    },
    {
        path: '/profile/account-settings',
        name: 'AccountSettings',
        component: () => import('./views/profile/components/account-settings.vue')
    },
    {
        path: '/profile/travel-history',
        name: 'TravelHistory',
        component: () => import('./views/profile/components/travel-history.vue')
    },
    {
        path: '/profile/notifications',
        name: 'Notifications',
        component: () => import('./views/profile/components/notifications.vue')
    }
];

export default publishingRoutes;