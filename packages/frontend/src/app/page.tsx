'use client';

import React from 'react';
import { TodoProvider } from '../contexts/TodoContext';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export default function HomePage() {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Todo App
            </h1>
            <p className="text-lg text-gray-600">
              Stay organized with real-time collaboration
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Todo Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Create New Todo
                </h2>
                <TodoForm />
              </div>
            </div>

            {/* Todo List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Todos
              </h2>
              <TodoList />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Built with Next.js, WebSockets, and TypeScript</p>
          </footer>
        </div>
      </div>
    </TodoProvider>
  );
}
