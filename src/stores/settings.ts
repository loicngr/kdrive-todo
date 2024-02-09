import { defineStore } from 'pinia'
import cloneDeep from 'lodash/fp/cloneDeep'
import { DEFAULT_FOLDER } from 'src/constants'

export const DEFAULT_WEBDAV_STATE: {
  dir?: string
  username?: string
  password?: string
  id?: string
  customServer?: string
} = {
  id: undefined,
  dir: DEFAULT_FOLDER,
  username: undefined,
  password: undefined,
  customServer: undefined,
}

export interface State {
  webdav: typeof DEFAULT_WEBDAV_STATE
}

export const useSettingsStore = defineStore({
  id: 'settings',

  state: (): State => ({
    webdav: cloneDeep(DEFAULT_WEBDAV_STATE),
  }),

  getters: {
    isWebDAVValid (): boolean {
      const webDAV = this.webdav ?? {}

      return typeof webDAV.id === 'string' &&
        typeof webDAV.username === 'string' &&
        typeof webDAV.password === 'string' &&
        typeof webDAV.dir === 'string' &&
        webDAV.id.length > 0 &&
        webDAV.username.length > 0 &&
        webDAV.password.length > 0 &&
        webDAV.dir.length > 0
    },
  },

  actions: {},

  persist: {
    enabled: true,
    strategies: [
      {
        paths: ['webdav'],
      },
    ],
  },
})
