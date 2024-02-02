import type {
  GetFileContentsOptions,
  WebDAVClient
} from 'webdav'
import { CustomFileStat } from 'src/interfaces/file'

export class WebDAVApi {
  constructor(
    public client: WebDAVClient,
    public workingDir: string
  ) {
  }

  async isPathExist(path: string, addWorkingDir = false) {
    return await this.client.exists(addWorkingDir ? this.getFilePath(path) : path)
  }

  async getDirectoryContents(dir?: string) {
    return await this.client.getDirectoryContents(dir ?? this.workingDir, {
      deep: false,
    }) as CustomFileStat[]
  }

  async writeInFile(file: string, content: string): Promise<boolean> {
    const filePath = this.getFilePath(file)

    // let lock: LockResponse | undefined

    // TODO: check why error 500 ?
    // if (await this.client.exists(filePath)) {
    //   lock = await this.client.lock(filePath)
    // }

    try {
      return await this.client.putFileContents(filePath, content)
    } catch (e) {
      return false
    }

    // if (typeof lock !== 'undefined') {
    //   await this.client.unlock(filePath, lock.token)
    // }
  }

  async deleteFile(file: string) {
    return await this.client.deleteFile(this.getFilePath(file))
  }

  async getFileContents(
    file?: string,
    format: GetFileContentsOptions['format'] = 'text'
  ) {
    if (typeof file === 'undefined') {
      console.error('File is undefined')
      return
    }

    return await this.client.getFileContents(this.getFilePath(file), {
      format,
    })
  }

  getFilePath(file: string) {
    return `${this.workingDir}${file}`
  }
}
