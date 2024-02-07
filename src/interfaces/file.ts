import type { FileStat } from 'webdav'

export interface CustomFileStat extends FileStat {
  isFile: boolean
  isTodo: boolean
  isNote: boolean
  vType: string
  vName: string
}

export interface FileData {
  id: string
  title: string
  content: string
  status: number
  createdAt: string
  updatedAt: string | null
}
