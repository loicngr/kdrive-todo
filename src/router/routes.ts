import { type RouteRecordRaw } from 'vue-router'
import {
  ROUTER_INDEX_NAME, ROUTER_NOTES_NAME,
  ROUTER_SETTINGS_NAME,
  ROUTER_TEXT_NAME,
  ROUTER_TODO_NAME,
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
        path: 'notes',
        name: ROUTER_NOTES_NAME,
        component: async () => await import('pages/NotesPage.vue'),
      },
      {
        path: ROUTER_TODO_NAME,
        name: ROUTER_TODO_NAME,
        component: async () => await import('pages/TodoPage.vue'),
      },
      {
        path: ROUTER_TEXT_NAME,
        name: ROUTER_TEXT_NAME,
        component: async () => await import('pages/TextPage.vue'),
      },
      {
        path: ROUTER_SETTINGS_NAME,
        name: ROUTER_SETTINGS_NAME,
        component: async () => await import('pages/SettingsPage.vue'),
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
