import { type RouteRecordRaw } from 'vue-router'
import {
  ROUTER_INDEX_NAME,
  ROUTER_SETTINGS_NAME,
} from 'src/constants'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: async () => await import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTER_INDEX_NAME,
        component: async () => await import('pages/IndexPage.vue'),
      },
      {
        path: ROUTER_SETTINGS_NAME,
        name: ROUTER_SETTINGS_NAME,
        component: async () => await import('pages/SettingsPage.vue'),
      },
      {
        path: 'dev',
        name: 'dev',
        component: async () => await import('pages/DevPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: async () => await import('pages/ErrorNotFound.vue'),
  },
]

export default routes
