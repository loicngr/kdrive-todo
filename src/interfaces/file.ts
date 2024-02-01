import type { FileStat } from 'webdav'

export interface CustomFileStat extends FileStat {
  _id: string
  isFile: boolean
}
