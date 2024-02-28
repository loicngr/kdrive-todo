import { defineStore } from 'pinia'
import {
  createClient,
  type WebDAVClient,
} from 'webdav'
import { WebDAVApi } from 'src/utils/webdav'
import { useSettingsStore } from 'stores/settings'
import cloneDeep from 'lodash/fp/cloneDeep'

interface State {
  ready: boolean
  client?: WebDAVClient
  filePath: string
  api?: WebDAVApi
  firstLaunch: boolean
}

export const WEBDAV_SETTINGS_PATH = '/settings.json'
export const WEBDAV_NOTES_PATH = '/notes.json'

export const useMainStore = defineStore({
  id: 'main',

  state: (): State => ({
    firstLaunch: true,
    ready: false,
    client: undefined,
    filePath: cloneDeep(WEBDAV_NOTES_PATH),
    api: undefined,
  }),

  getters: {
    apiOrThrow (): WebDAVApi {
      const api = this.api

      if (typeof api === 'undefined') {
        throw new Error('Api not found')
      }

      return api
    },
  },

  actions: {
    async connect () {
      this.client = undefined
      this.api = undefined
      this.ready = false

      const settingsStore = useSettingsStore()
      const webDAV = settingsStore.webdav

      if (
        typeof webDAV.id === 'undefined' ||
        typeof webDAV.username === 'undefined' ||
        typeof webDAV.password === 'undefined'
      ) {
        return false
      }

      let baseServer = `https://${webDAV.id}.connect.kdrive.infomaniak.com`

      if (typeof webDAV.customServer === 'string') {
        baseServer = webDAV.customServer
      }

      try {
        this.client = createClient(
          `${baseServer}/${webDAV.dir}`,
          {
            username: webDAV.username,
            password: webDAV.password,
          },
        )

        this.api = new WebDAVApi(this.client, this.filePath)
        this.ready = await this.api.isPathExist('')

        return true
      } catch (e) {
        this.client = undefined
        this.api = undefined
        this.ready = false

        console.error(e)
      }

      return false
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        paths: ['firstLaunch'],
      },
    ],
  },
})
