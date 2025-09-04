'use client'

import { useState, useEffect } from 'react'
import { TodoList } from '@/components/TodoList'
import { TodoForm } from '@/components/TodoForm'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTodos } from '@/hooks/useTodos'

export default function Home() {
  const { socket, isConnected } = useWebSocket()
  const { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos(socket)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">TODO App</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <TodoForm onSubmit={addTodo} />
          
          <div className="mt-8">
            <TodoList
              todos={todos}
              loading={loading}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
