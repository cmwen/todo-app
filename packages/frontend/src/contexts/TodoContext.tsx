'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  Todo, 
  CreateTodoInput, 
  UpdateTodoInput, 
  DeleteTodoInput,
  ServerMessage,
  ConnectionState
} from '@todo-app/shared';
import { useWebSocket } from '../hooks/useWebSocket';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  connectionState: ConnectionState;
}

type TodoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'REMOVE_TODO'; payload: string }
  | { type: 'OPTIMISTIC_ADD'; payload: Todo }
  | { type: 'OPTIMISTIC_UPDATE'; payload: Todo }
  | { type: 'OPTIMISTIC_REMOVE'; payload: string };

const initialState: TodoState = {
  todos: [],
  isLoading: true,
  error: null,
  connectionState: 'disconnected',
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONNECTION_STATE':
      return { ...state, connectionState: action.payload };
    case 'SET_TODOS':
      return { ...state, todos: action.payload, isLoading: false };
    case 'ADD_TODO':
    case 'OPTIMISTIC_ADD':
      return { 
        ...state, 
        todos: [action.payload, ...state.todos.filter(t => t.id !== action.payload.id)]
      };
    case 'UPDATE_TODO':
    case 'OPTIMISTIC_UPDATE':
      return { 
        ...state, 
        todos: state.todos.map(todo => 
          todo.id === action.payload.id ? action.payload : todo
        )
      };
    case 'REMOVE_TODO':
    case 'OPTIMISTIC_REMOVE':
      return { 
        ...state, 
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    default:
      return state;
  }
}

interface TodoContextValue extends TodoState {
  createTodo: (input: CreateTodoInput) => Promise<void>;
  updateTodo: (input: UpdateTodoInput) => Promise<void>;
  deleteTodo: (input: DeleteTodoInput) => Promise<void>;
  toggleTodoComplete: (id: string) => Promise<void>;
  refreshTodos: () => void;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'todos_listed':
        dispatch({ type: 'SET_TODOS', payload: message.payload.todos });
        break;
      case 'todo_created':
        dispatch({ type: 'ADD_TODO', payload: message.payload });
        break;
      case 'todo_updated':
        dispatch({ type: 'UPDATE_TODO', payload: message.payload });
        break;
      case 'todo_deleted':
        dispatch({ type: 'REMOVE_TODO', payload: message.payload.id });
        break;
      case 'error':
        dispatch({ type: 'SET_ERROR', payload: message.payload.message });
        break;
    }
  }, []);

  const handleConnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connected' });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const handleDisconnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'disconnected' });
  }, []);

  const handleError = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'error' });
    dispatch({ type: 'SET_ERROR', payload: 'Connection error' });
  }, []);

  const { sendMessage, connectionState, isConnected } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: connectionState });
  }, [connectionState]);

  const createTodo = useCallback(async (input: CreateTodoInput) => {
    // Optimistic update
    const optimisticTodo: Todo = {
      id: `temp-${Date.now()}`,
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'OPTIMISTIC_ADD', payload: optimisticTodo });
    
    try {
      sendMessage('create_todo', input);
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'OPTIMISTIC_REMOVE', payload: optimisticTodo.id });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create todo' });
    }
  }, [sendMessage]);

  const updateTodo = useCallback(async (input: UpdateTodoInput) => {
    // Find existing todo for optimistic update
    const existingTodo = state.todos.find(t => t.id === input.id);
    if (!existingTodo) return;

    const optimisticTodo: Todo = {
      ...existingTodo,
      ...input,
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: optimisticTodo });
    
    try {
      sendMessage('update_todo', input);
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'OPTIMISTIC_UPDATE', payload: existingTodo });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update todo' });
    }
  }, [sendMessage, state.todos]);

  const deleteTodo = useCallback(async (input: DeleteTodoInput) => {
    // Store for potential rollback
    const todoToDelete = state.todos.find(t => t.id === input.id);
    
    dispatch({ type: 'OPTIMISTIC_REMOVE', payload: input.id });
    
    try {
      sendMessage('delete_todo', input);
    } catch (error) {
      // Revert optimistic update on error
      if (todoToDelete) {
        dispatch({ type: 'OPTIMISTIC_ADD', payload: todoToDelete });
      }
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete todo' });
    }
  }, [sendMessage, state.todos]);

  const toggleTodoComplete = useCallback(async (id: string) => {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    await updateTodo({
      id,
      completed: !todo.completed,
    });
  }, [state.todos, updateTodo]);

  const refreshTodos = useCallback(() => {
    if (isConnected) {
      sendMessage('list_todos', {});
    }
  }, [sendMessage, isConnected]);

  // Request initial todos when connected
  useEffect(() => {
    if (isConnected) {
      refreshTodos();
    }
  }, [isConnected, refreshTodos]);

  const value: TodoContextValue = {
    ...state,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    refreshTodos,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}
