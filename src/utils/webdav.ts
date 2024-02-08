import {
  createClient,
  type GetFileContentsOptions,
  type WebDAVClient,
} from 'webdav'
import { useMainStore } from 'stores/main'
import { dialogConfirm } from 'src/utils/index'
import {
  Loading, Notify,
} from 'quasar'
import { DEFAULT_FILE } from 'src/constants'
import { useSettingsStore } from 'stores/settings'

export class WebDAVApi {
  constructor (
    public client: WebDAVClient,
    public workingDir: string,
  ) {
  }

  async createNotesFile (
    dialogMessage = `Create default template ?`,
    done?: CallableFunction,
  ) {
    void dialogConfirm(dialogMessage, {
      html: true,
    })
      .then(async () => {
        const status = await this._createNotesFile()

        if (status) {
          if (typeof done === 'function') {
            await done()
          }

          return true
        }
      })

    return false
  }

  async _createNotesFile () {
    Loading.show()

    try {
      await this.writeInFile(JSON.stringify(DEFAULT_FILE))
      return true
    } catch (e) {
      console.error(e)
    }

    Loading.hide()
    return false
  }

  async createNotesFolder (
    dialogMessage = `Create folder ?`,
  ): Promise<boolean> {
    const settingsStore = useSettingsStore()
    const webDAV = settingsStore.webdav

    if (
      typeof webDAV.id === 'undefined' ||
      typeof webDAV.username === 'undefined' ||
      typeof webDAV.password === 'undefined'
    ) {
      Notify.create({
        message: 'kDrive id, username or password not set in settings',
        type: 'negative',
        timeout: 4000,
      })

      return false
    }

    const saveCurrentClient = this.client
    let status = false

    return await new Promise((resolve) => {
      void dialogConfirm(dialogMessage, {
        html: true,
      })
        .then(async () => {
          Loading.show()

          try {
            this.client = createClient(
              `https://${webDAV.id}.connect.kdrive.infomaniak.com`,
              {
                username: webDAV.username,
                password: webDAV.password,
              },
            )

            await this.createDir()

            status = true
          } catch (e) {
            console.error(e)
            status = false
          }
        })
        .finally(() => {
          this.client = saveCurrentClient
          Loading.hide()
          resolve(status)
        })
    })
  }

  async isPathExist (path?: string) {
    const mainStore = useMainStore()
    path ??= mainStore.filePath

    return await this.client.exists(path)
  }

  async writeInFile (content: string): Promise<boolean> {
    const mainStore = useMainStore()

    try {
      return await this.client.putFileContents(mainStore.filePath, content)
    } catch (e) {
      return false
    }
  }

  async createDir (): Promise<void> {
    const settingsStore = useSettingsStore()
    const dir = settingsStore.webdav.dir

    if (typeof dir !== 'string') {
      Notify.create({
        message: 'Directory not set in settings',
        type: 'negative',
        timeout: 4000,
      })
      return
    }

    try {
      const status = await this.isPathExist(dir)

      if (status) {
        return
      }

      await this.client.createDirectory(dir)
    } catch (e) {
      Notify.create({
        message: (e ?? 'Directory not created') as string,
        type: 'negative',
      })
    }
  }

  async getFileContent (
    format: GetFileContentsOptions['format'] = 'text',
  ) {
    const mainStore = useMainStore()

    return await this.client.getFileContents(mainStore.filePath, {
      format,
    })
  }

  getFilePath (file: string) {
    return `${this.workingDir}${file}`
  }
}
