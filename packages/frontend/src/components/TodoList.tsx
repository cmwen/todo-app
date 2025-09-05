'use client';

import React, { useState } from 'react';
import { Todo } from '@todo-app/shared';
import { useTodos } from '../contexts/TodoContext';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  className?: string;
}

export function TodoList({ className = '' }: TodoListProps) {
  const { todos, isLoading, error, connectionState } = useTodos();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'title'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'created':
      default:
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting to server...';
      case 'disconnected':
        return 'Disconnected from server';
      case 'error':
        return 'Connection error';
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const activeTodos = totalTodos - completedTodos;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>Loading todos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Bar */}
      {statusMessage && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm">{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-4">
            <span>Total: {totalTodos}</span>
            <span>Active: {activeTodos}</span>
            <span>Completed: {completedTodos}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} title={`Connection: ${connectionState}`}></div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Created Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      {/* Todo List */}
      {sortedTodos.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-gray-500">
            {totalTodos === 0 ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg">No todos yet</p>
                <p className="text-sm">Create your first todo to get started!</p>
              </>
            ) : (
              <>
                <p className="text-lg">No todos match your filter</p>
                <p className="text-sm">Try changing the filter or create a new todo.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
