import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { useSettingsStore } from 'stores/settings'
import { localStorageResolve } from 'src/utils/storage'
import { type StateStorage } from 'src/interfaces/state'

export const useStorageStore = defineStore({
  id: 'storage',

  state: (): StateStorage => ({
    promises: [],
  }),

  getters: {
    storePromises: (state) => state.promises,
  },

  actions: {
    initStorePromises () {
      const stores = [
        useSettingsStore(),
      ]

      this.promises = stores
        .map(({
          $id: id,
        }) => {
          let resolvePromise: CallableFunction | undefined
          return {
            id,
            promise: new Promise((resolve) => {
              resolvePromise = resolve
            }),
            resolve: resolvePromise,
          }
        })

      void Promise.all(this.promises.map(({
        promise,
      }) => promise))
        .then(() => {
          void nextTick(() => {
            console.log('Store is ready')
            localStorageResolve()
          })
        })
    },
  },
})
