import type { Item } from 'src/interfaces/item'

export interface NotesFile {
  items: Item[]
  version: string
}
