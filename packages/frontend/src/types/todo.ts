export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoRequest {
  title: string
  description?: string
}

export interface UpdateTodoRequest {
  title?: string
  description?: string
}

export interface WebSocketMessage {
  type: 'todo_created' | 'todo_updated' | 'todo_deleted' | 'todo_toggled'
  data: Todo
}

export interface TodoFilter {
  status: 'all' | 'pending' | 'completed'
}
