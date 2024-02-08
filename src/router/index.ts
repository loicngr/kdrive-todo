import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import routes from './routes'
import { localStorageReady } from 'src/utils/storage'

async function routerBefore (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  await localStorageReady

  next()
}

export default route(function (/* { store, ssrContext } */) {
  let createHistory = createMemoryHistory

  if (process.env.SERVER !== null) {
    createHistory = process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory
  }

  const router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),

    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  router.beforeEach(routerBefore)

  return router
})
