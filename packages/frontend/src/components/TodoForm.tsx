'use client';

import React, { useState } from 'react';
import { CreateTodoInput } from '@todo-app/shared';
import { useTodos } from '../contexts/TodoContext';

interface TodoFormProps {
  onSubmit?: () => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const { createTodo } = useTodos();
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await createTodo({
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
      });
      
      onSubmit?.();
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateTodoInput,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter todo title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter todo description..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!formData.title.trim() || isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating...' : 'Create Todo'}
      </button>
    </form>
  );
}
