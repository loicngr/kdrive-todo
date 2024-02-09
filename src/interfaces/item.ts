import type { Todo } from 'src/interfaces/todo'

export interface Item {
  id: string
  title: string
  content: string | Todo[]
  createdAt: string
  updatedAt: string
  status: number
  type: number
}
