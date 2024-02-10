import type {
  _DeepPartial,
  PiniaPluginContext,
  StateTree,
  Store,
} from 'pinia'
import { createInstance } from 'localforage'
import isNil from 'lodash/isNil'
import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'
import set from 'lodash/set'
import get from 'lodash/get'
import { STORAGE_KEY } from 'src/constants/store'
import { useStorageStore } from 'stores/storage'

export interface PersistStrategy {
  key?: string
  paths?: string[]
}

export interface PersistOptions {
  enabled: true
  strategies?: PersistStrategy[]
}

type PartialState = Partial<Store['$state']>

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: PersistOptions
  }
}

// eslint-disable-next-line no-undef
let localForageInstance: LocalForage
const localForageOptions = {
  name: STORAGE_KEY,
}

export const updateStorage = (strategy: PersistStrategy, store: Store) => {
  if (isNil(localForageInstance)) {
    localForageInstance = createInstance(cloneDeep(localForageOptions))
  }

  const storeKey = strategy.key ?? store.$id

  if (isArray(strategy.paths)) {
    const partialState = strategy.paths.reduce<PartialState>((
      finalObj,
      key,
    ) => {
      set(finalObj, key, get(store.$state, key))
      return finalObj
    }, {})

    void localForageInstance.setItem(storeKey, cloneDeep(partialState))
  } else {
    void localForageInstance.setItem(storeKey, cloneDeep(store.$state))
  }
}

export default ({
  options,
  store,
}: PiniaPluginContext): void => {
  const storageStore = useStorageStore()

  const persist: PersistOptions | undefined = options.persist
  const persistEnabled: boolean = get(options, ['persist', 'enabled'], false)

  if (persist === undefined || !persistEnabled) {
    return
  }

  if (isNil(localForageInstance)) {
    localForageInstance = createInstance(cloneDeep(localForageOptions))
  }

  const strategies = get(persist, 'strategies', [{
    key: store.$id,
  }] as PersistStrategy[])

  strategies.forEach((strategy) => {
    const storeId = strategy.key ?? store.$id

    void localForageInstance
      .getItem(storeId)
      .then((storageResult) => {
        if (storageResult !== null) {
          store.$patch(storageResult as _DeepPartial<StateTree>)
          updateStorage(strategy, store)
        }
      })
      .finally(() => {
        const item = storageStore.storePromises.find(({
          id,
        }) => id === storeId)

        if (typeof item?.resolve === 'function') {
          item.resolve()
        }
      })
  })

  store.$subscribe(() => {
    strategies.forEach((strategy) => {
      updateStorage(strategy, store)
    })
  })
}
