import { defineStore } from 'pinia'
import {
  createClient,
  WebDAVClient
} from 'webdav'
import { WebDAVApi } from 'src/utils/webdav'
import { FileData } from 'src/interfaces/file'
import { useSettingsStore } from 'stores/settings'

interface State {
  ready: boolean
  client?: WebDAVClient
  workingDir: string
  _workingFile?: string
  workingFileContent: FileData[]
  api?: WebDAVApi
}

export const useMainStore = defineStore({
  id: 'main',

  state: (): State => ({
    ready: false,
    client: undefined,
    workingDir: '/',
    workingFileContent: [],
    _workingFile: undefined,
    api: undefined
  }),

  getters: {
    apiOrThrow (): WebDAVApi {
      const api = this.api

      if (typeof api === 'undefined') {
        throw new Error('Api not found')
      }

      return api
    },

    workingFile (): string | undefined {
      return this._workingFile
    }
  },

  actions: {
    closeFile () {
      this.workingFileContent = []
      this._workingFile = undefined
    },

    setWorkingFile (file?: string) {
      this._workingFile = file
    },

    async connect() {
      if (typeof this.client !== 'undefined') {
        return
      }

      const settingsStore = useSettingsStore()
      const webDAV = settingsStore.webdav

      if (
        typeof webDAV.id === 'undefined' ||
        typeof webDAV.username === 'undefined' ||
        typeof webDAV.password === 'undefined'
      ) {
        return
      }

      this.client = createClient(
        `https://${webDAV.id}.connect.kdrive.infomaniak.com/${webDAV.dir}`,
        {
          username: webDAV.username,
          password: webDAV.password
        }
      )

      this.api = new WebDAVApi(this.client, this.workingDir)
    }
  },
})
