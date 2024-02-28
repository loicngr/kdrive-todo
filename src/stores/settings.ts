import { defineStore } from 'pinia'
import cloneDeep from 'lodash/fp/cloneDeep'
import { DEFAULT_FOLDER } from 'src/constants'
import { Tag } from 'src/interfaces/tag'
import {
  useMainStore, WEBDAV_SETTINGS_PATH,
} from 'stores/main'
import { Loading } from 'quasar'
import { SettingsFile } from 'src/interfaces/settings'

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

export const DEFAULT_AUTO_SYNC: number = 5
export const DEFAULT_TAGS: Tag[] = [
  {
    id: '-1',
    name: 'important',
    color: '#c62828',
  },
  {
    id: '-2',
    name: 'warning',
    color: '#ffeb3b',
  },
]

export interface State {
  webdav: typeof DEFAULT_WEBDAV_STATE
  language: string,
  autoSync: number,
  tags: typeof DEFAULT_TAGS,
}

export const useSettingsStore = defineStore({
  id: 'settings',

  state: (): State => ({
    webdav: cloneDeep(DEFAULT_WEBDAV_STATE),
    language: 'en-US',
    autoSync: cloneDeep(DEFAULT_AUTO_SYNC),
    tags: cloneDeep(DEFAULT_TAGS),
  }),

  getters: {
    autoSyncInterval (): number {
      return this.autoSync * 60 * 1000
    },

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

  actions: {
    async isFileExist (): Promise<boolean> {
      const api = useMainStore().api

      if (typeof api === 'undefined') {
        return false
      }

      return new Promise((resolve) => {
        api?.isPathExist(WEBDAV_SETTINGS_PATH)
          .then((e) => {
            resolve(e)
          })
          .catch(() => {
            resolve(false)
          })
      })
    },
    async getFile (): Promise<undefined | { tags: Tag[] }> {
      const mainStore = useMainStore()
      const api = mainStore.api

      if (typeof api === 'undefined') {
        console.error('Api not found')
        return
      }

      Loading.show()
      let fileContent: string

      try {
        fileContent = await api.getFileContent('text', WEBDAV_SETTINGS_PATH) as string
      } catch (e) {
        const settingsFile: SettingsFile = {
          tags: DEFAULT_TAGS,
        }
        fileContent = JSON.stringify({
          ...settingsFile,
        })

        const ifFileExist = await this.isFileExist()

        // Create file
        if (!ifFileExist) {
          await this.saveFile({
            ...settingsFile,
          })
        }
      }

      fileContent = fileContent.trim()
      const fileJson = JSON.parse(fileContent)

      Loading.hide()

      return fileJson
    },
    async saveFile (settings: SettingsFile) {
      const api = useMainStore().api

      if (typeof api === 'undefined') {
        return false
      }

      Loading.show()
      const status = await api.writeInFile(JSON.stringify(settings), WEBDAV_SETTINGS_PATH)
      Loading.hide()

      return status
    },
    async getTags (): Promise<Tag[]> {
      const fileJson = await this.getFile()

      if (typeof fileJson === 'undefined') {
        return []
      }

      return fileJson.tags
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        paths: [
          'webdav',
          'language',
          'autoSync',
        ],
      },
    ],
  },
})
