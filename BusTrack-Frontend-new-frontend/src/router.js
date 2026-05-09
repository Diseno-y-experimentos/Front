import { createRouter, createWebHistory } from "vue-router";

// Páginas compartidas
import PageNotFound from "./shared/presentation/views/page-not-found.vue";
import SelectRolePage from "./app/presentation/pages/SelectRolePage.vue"

// Auth PASAJERO
import LoginPage from './app/presentation/pages/LoginPage.vue'
import RegisterPage from './app/presentation/pages/RegisterPage.vue'

// Auth EMPRESA
import CompanyLoginPage from "./app/presentation/pages/CompanyLoginPage.vue"
import CompanyRegisterPage from "./app/presentation/pages/CompanyRegisterPage.vue"

// App PASAJERO
import HomePage from './app/presentation/pages/HomePage.vue'
import FavoriteRoutes from "./publishing/presentation/views/passengers/profile/components/favorite-routes.vue";
import AccountSettings from "./publishing/presentation/views/passengers/profile/components/account-settings.vue";
import TravelHistory from "./publishing/presentation/views/passengers/profile/components/travel-history.vue";
import NotificationsList from "./publishing/presentation/views/passengers/notifications/notifications.vue";
import NotificationsSettings from "./publishing/presentation/views/passengers/profile/components/notifications.vue";
import BusStops from "./publishing/presentation/views/passengers/bus-stops/bus-stops.vue";
import Profile from "./publishing/presentation/views/passengers/profile/profile.vue";


// App EMPRESA
import CompanyAlerts from '@/publishing/presentation/views/companies/alerts-company.vue'
import CompanyFleet from '@/publishing/presentation/views/companies/fleet-company.vue'
import CompanySettings from '@/publishing/presentation/views/companies/settings-company.vue'



const routes = [
  // Público
  {path: "/", redirect: "/select-role", meta: { public: true },},
  {path: "/select-role", name: "select-role", component: SelectRolePage, meta: { public: true, hideTopNav: true }},

  // Auth PASAJERO
  { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { public: true }},

  // Auth EMPRESA
  { path: '/company/login', name: 'company-login', component: CompanyLoginPage, meta: { public: true } },
  { path: '/company/register', name: 'company-register', component: CompanyRegisterPage, meta: { public: true } },

  // APP PASAJERO
  { path: '/home', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/search-route', name: 'search-route', component: HomePage, meta: { requiresAuth: true } },
  { path: '/notifications', name: 'notifications', component: NotificationsList, meta: { requiresAuth: true } },
  { path: '/bus-stops', name: 'bus-stops', component: BusStops, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/profile/favorite-routes', name: 'profile-favorite-routes', component: FavoriteRoutes, meta: { requiresAuth: true } },
  { path: '/profile/account-settings', name: 'profile-account-settings', component: AccountSettings, meta: { requiresAuth: true } },
  { path: '/profile/travel-history', name: 'profile-travel-history', component: TravelHistory, meta: { requiresAuth: true } },
  { path: '/profile/notifications', name: 'profile-notifications', component: NotificationsSettings, meta: { requiresAuth: true } },


  // APP EMPRESA
  { path: '/company', redirect: '/company/fleet', meta: { requiresAuth: true, section: 'company' } },
  {path: '/company/alerts', name: 'company-alerts', component: CompanyAlerts, meta: { requiresAuth: true, section: 'company' }},
  {path: '/company/fleet', name: 'company-fleet', component: CompanyFleet, meta: { requiresAuth: true, section: 'company' }},
  {path: '/company/settings', name: 'company-settings', component: CompanySettings, meta: { requiresAuth: true, section: 'company' }},


  // 404
  { path: '/:pathMatch(.*)*', name: 'page-not-found', component: PageNotFound, meta: { public: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})



export default router