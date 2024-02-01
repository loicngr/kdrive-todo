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

  async getDirectoryContents(dir?: string) {
    return await this.client.getDirectoryContents(dir ?? this.workingDir, {
      deep: false,
    }) as CustomFileStat[]
  }

  async writeInFile(file: string, content: string) {
    const filePath = this.getFilePath(file)

    // let lock: LockResponse | undefined

    // TODO: check why error 500 ?
    // if (await this.client.exists(filePath)) {
    //   lock = await this.client.lock(filePath)
    // }

    await this.client.putFileContents(filePath, content)

    // if (typeof lock !== 'undefined') {
    //   await this.client.unlock(filePath, lock.token)
    // }
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
