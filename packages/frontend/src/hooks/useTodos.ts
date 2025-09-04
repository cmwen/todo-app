'use client'

import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { Todo, CreateTodoRequest, UpdateTodoRequest, WebSocketMessage } from '@/types/todo'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export function useTodos(socket: Socket | null) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/todos`)
      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }
      const data = await response.json()
      setTodos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos')
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return

    const handleTodoCreated = (data: Todo) => {
      setTodos(prev => [data, ...prev])
    }

    const handleTodoUpdated = (data: Todo) => {
      setTodos(prev => prev.map(todo => todo.id === data.id ? data : todo))
    }

    const handleTodoDeleted = (data: Todo) => {
      setTodos(prev => prev.filter(todo => todo.id !== data.id))
    }

    const handleTodoToggled = (data: Todo) => {
      setTodos(prev => prev.map(todo => todo.id === data.id ? data : todo))
    }

    socket.on('todo_created', handleTodoCreated)
    socket.on('todo_updated', handleTodoUpdated)
    socket.on('todo_deleted', handleTodoDeleted)
    socket.on('todo_toggled', handleTodoToggled)

    return () => {
      socket.off('todo_created', handleTodoCreated)
      socket.off('todo_updated', handleTodoUpdated)
      socket.off('todo_deleted', handleTodoDeleted)
      socket.off('todo_toggled', handleTodoToggled)
    }
  }, [socket])

  // Load todos on mount
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // API functions
  const addTodo = useCallback(async (todoData: CreateTodoRequest): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        throw new Error('Failed to create todo')
      }

      // The WebSocket will handle updating the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
      throw err
    }
  }, [])

  const updateTodo = useCallback(async (id: string, updates: UpdateTodoRequest): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      // The WebSocket will handle updating the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }, [])

  const deleteTodo = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      // The WebSocket will handle updating the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }, [])

  const toggleTodo = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle todo')
      }

      // The WebSocket will handle updating the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo')
      throw err
    }
  }, [])

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  }
}
