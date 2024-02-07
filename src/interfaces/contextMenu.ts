import { type CustomFileStat } from 'src/interfaces/file'

export interface ContextMenuOption {
  label: string
  value: string
  if: ((ctx: CustomFileStat | undefined) => boolean) | boolean
  callback: (ctx: CustomFileStat | undefined) => void
}
