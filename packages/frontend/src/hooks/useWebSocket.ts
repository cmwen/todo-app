'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ClientMessage, 
  ServerMessage, 
  ConnectionState,
  generateId,
  generateTimestamp,
  ClientMessageType 
} from '@todo-app/shared';

export interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: ServerMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    reconnectAttempts = 5,
    reconnectInterval = 1000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const messageQueueRef = useRef<ClientMessage[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        reconnectCountRef.current = 0;
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            ws.send(JSON.stringify(message));
          }
        }
        
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        wsRef.current = null;
        onDisconnect?.();
        
        // Attempt to reconnect
        if (reconnectCountRef.current < reconnectAttempts) {
          setConnectionState('reconnecting');
          reconnectCountRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * Math.pow(2, reconnectCountRef.current - 1)); // Exponential backoff
        }
      };

      ws.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
      };

    } catch (error) {
      setConnectionState('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, reconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((type: ClientMessageType, payload: unknown = {}) => {
    const message: ClientMessage = {
      id: generateId(),
      type,
      payload,
      timestamp: generateTimestamp(),
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
    }

    return message.id;
  }, []);

  const ping = useCallback(() => {
    return sendMessage('ping');
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping periodically to keep connection alive
  useEffect(() => {
    if (connectionState === 'connected') {
      const pingInterval = setInterval(ping, 30000); // Every 30 seconds
      return () => clearInterval(pingInterval);
    }
  }, [connectionState, ping]);

  return {
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    ping,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isReconnecting: connectionState === 'reconnecting',
  };
}
