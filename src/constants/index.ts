import { FileData } from 'src/interfaces/file'

export const DEFAULT_FOLDER = 'WebDAVJS'

export const ROUTER_INDEX_NAME = 'index'

export const ROUTER_TODO_NAME = 'todo'

export const ROUTER_TEXT_NAME = 'text'

export const ROUTER_SETTINGS_NAME = 'settings'

export const FILE_DATA_STATUS_TODO = 100

export const FILE_DATA_STATUS_DONE = 200

export const FILE_DATA_STATUS_ARCHIVED = 300

export const DEFAULT_TODOS = {
  todos: []
}

export const DEFAULT_TODO: FileData = {
  id: '',
  title: '',
  content: '',
  status: FILE_DATA_STATUS_TODO,
  createdAt: '',
  updatedAt: null,
}
