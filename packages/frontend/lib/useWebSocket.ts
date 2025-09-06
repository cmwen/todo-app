"use client";
import { useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timeout: any;
    let retry = 0;

    const connect = () => {
      setStatus('connecting');
      ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        retry = 0;
        setStatus('connected');
      };
      ws.onclose = () => {
        setStatus('disconnected');
        const delay = Math.min(1000 * Math.pow(2, retry++), 10000);
        timeout = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      clearTimeout(timeout);
      ws?.close();
    };
  }, [url]);

  return { status, socket: wsRef.current };
}
