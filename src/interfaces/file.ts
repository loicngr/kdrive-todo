import type { FileStat } from 'webdav'

export interface CustomFileStat extends FileStat {
  _id: string
  isFile: boolean
}
export interface FileData {
  id: string
  title: string
  content: string
  status: number
  createdAt: string
  updatedAt: string | null
}
