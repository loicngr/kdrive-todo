import type { Todo } from 'src/interfaces/todo'
import { Tag } from 'src/interfaces/tag'

export interface Item {
  id: string
  title: string
  content: string | Todo[]
  createdAt: string
  updatedAt: string
  status: number
  type: number
  color: string | undefined
  tags: Tag[]
}
