import { useEffect, useRef, useState } from 'react';
import type { WSMessage } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        const handlers = messageHandlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const subscribe = (type: string, handler: (data: any) => void) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    messageHandlersRef.current.get(type)!.add(handler);

    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  };

  const send = (message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, subscribe, send };
}
