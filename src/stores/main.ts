import { defineStore } from 'pinia'
import {
  createClient,
  WebDAVClient
} from 'webdav'
import { WebDAVApi } from 'src/utils/webdav'
import { FileData } from 'src/interfaces/file'

interface State {
  ready: boolean
  client?: WebDAVClient
  workingDir: string
  _workingFile?: string
  workingFileContent: FileData[]
  _api?: WebDAVApi
}

export const useMainStore = defineStore({
  id: 'main',

  state: (): State => ({
    ready: false,
    client: undefined,
    workingDir: '/',
    workingFileContent: [],
    _workingFile: undefined,
    _api: undefined
  }),

  getters: {
    workingFile (): string | undefined {
      return this._workingFile
    },
    api (): WebDAVApi {
      if (typeof this._api === 'undefined') {
        throw new Error('No api instance found')
      }

      return this._api
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

      this.client = createClient(
        `https://${process.env.VUE_KDRIVE_ID}.connect.kdrive.infomaniak.com/${process.env.VUE_KDRIVE_WORKING_DIR}`,
        {
          username: process.env.VUE_KDRIVE_EMAIL,
          password: process.env.VUE_KDRIVE_PASSWORD
        }
      )

      this._api = new WebDAVApi(this.client, this.workingDir)
    }
  },
})
