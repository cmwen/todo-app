'use client';

import React, { useState } from 'react';
import { Todo } from '@todo-app/shared';
import { useTodos } from '../contexts/TodoContext';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { updateTodo, deleteTodo, toggleTodoComplete } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    try {
      await updateTodo({
        id: todo.id,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo({ id: todo.id });
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleToggleComplete = async () => {
    try {
      await toggleTodoComplete(todo.id);
    } catch (error) {
      console.error('Failed to toggle todo completion:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Todo title..."
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={3}
            placeholder="Todo description..."
          />
          
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ${
      todo.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-medium ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {todo.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
              {todo.priority}
            </span>
          </div>
          
          {todo.description && (
            <p className={`text-sm mb-2 ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
            }`}>
              {todo.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {formatDate(todo.createdAt)}</span>
            {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
              <span>Updated: {formatDate(todo.updatedAt)}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50"
            title="Edit todo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
            title="Delete todo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
