import { useState, useEffect, useRef } from 'react';

interface WebSocketData {
  feeds: any[];
  categories: any[];
  stories: any[];
  apiKeys: any[];
  reactions: any[];
}

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<WebSocketData>({
    feeds: [],
    categories: [],
    stories: [],
    apiKeys: [],
    reactions: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        setError('WebSocket error occurred');
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const handleMessage = (message: any) => {
    const { type, data: messageData } = message;

    switch (type) {
      case 'initial_data':
        setData(messageData);
        break;
      case 'feeds_updated':
        setData(prev => ({ ...prev, feeds: messageData }));
        break;
      case 'categories_updated':
        setData(prev => ({ ...prev, categories: messageData }));
        break;
      case 'stories_updated':
        setData(prev => ({ ...prev, stories: messageData }));
        break;
      case 'api_keys_updated':
        setData(prev => ({ ...prev, apiKeys: messageData }));
        break;
      case 'reactions_updated':
        setData(prev => ({ ...prev, reactions: messageData }));
        break;
      case 'refresh_started':
      case 'refresh_completed':
        // These are handled in the App component
        break;
      case 'error':
        setError(message.message);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    data,
    isConnected,
    error,
    sendMessage
  };
};