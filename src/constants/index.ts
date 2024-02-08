import { type Todo } from 'src/interfaces/todo'
import { type Item } from 'src/interfaces/item'
import { version } from '../../package.json'
import { type NotesFile } from 'src/interfaces/file'

export const DEFAULT_FOLDER = 'WebDAVJS'

export const ROUTER_INDEX_NAME = 'index'

export const ROUTER_NOTES_NAME = 'notes'

export const ROUTER_TODO_NAME = 'todo'

export const ROUTER_TEXT_NAME = 'text'

export const ROUTER_SETTINGS_NAME = 'settings'

export const ITEM_TYPE_NOTE = 100

export const ITEM_TYPE_TODO = 200

export const ITEM_STATUS_DEFAULT = 100

export const DEFAULT_TODO: Todo = {
  id: '',
  content: '',
  done: false,
}

export const DEFAULT_NOTE: Item = {
  id: '',
  title: '',
  content: '',
  createdAt: '',
  updatedAt: '',
  status: ITEM_STATUS_DEFAULT,
  type: ITEM_TYPE_NOTE,
}

export const DEFAULT_FILE: NotesFile = {
  items: [],
  version,
}
