import { RouteRecordRaw } from 'vue-router'
import {
  ROUTER_INDEX_NAME,
  ROUTER_SETTINGS_NAME,
  ROUTER_TODO_NAME
} from 'src/constants'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTER_INDEX_NAME,
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: ROUTER_TODO_NAME,
        name: ROUTER_TODO_NAME,
        component: () => import('pages/TodoPage.vue')
      },
      {
        path: ROUTER_SETTINGS_NAME,
        name: ROUTER_SETTINGS_NAME,
        component: () => import('pages/SettingsPage.vue')
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes
