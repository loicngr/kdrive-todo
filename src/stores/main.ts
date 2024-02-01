import { defineStore } from 'pinia'
import {
  createClient,
  WebDAVClient
} from 'webdav'
import { WebDAVApi } from 'src/utils/webdav'

interface State {
  client?: WebDAVClient
  workingDir: string
  _api?: WebDAVApi
}

export const useMainStore = defineStore({
  id: 'main',

  state: (): State => ({
    client: undefined,
    workingDir: '/',
    _api: undefined
  }),

  getters: {
    api (): WebDAVApi {
      if (typeof this._api === 'undefined') {
        throw new Error('No api instance found')
      }

      return this._api
    }
  },

  actions: {
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
