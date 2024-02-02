import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized
} from 'vue-router'
import routes from './routes'
import {
  ROUTER_INDEX_NAME,
  ROUTER_TODO_NAME
} from 'src/constants'
import { useMainStore } from 'stores/main'
import { localStorageReady } from 'src/utils/storage'

async function routerBefore (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  await localStorageReady

  if (to.name === ROUTER_TODO_NAME) {
    const mainStore = useMainStore()
    if (typeof mainStore.workingFile === 'undefined') {
      next({
        name: ROUTER_INDEX_NAME
      })

      return
    }
  }

  next()
}

export default route(function(/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0
    }),

    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  router.beforeEach(routerBefore)

  return router
})
