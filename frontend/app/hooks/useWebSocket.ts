'use client';

import { useEffect, useRef, useState } from 'react';
import { TradeData, RSIData } from '../types';

interface UseWebSocketReturn {
  tradeData: TradeData | null;
  rsiData: RSIData | null;
  isConnected: boolean;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [rsiData, setRsiData] = useState<RSIData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'trade') {
              setTradeData(data.payload);
            } else if (data.type === 'rsi') {
              setRsiData(data.payload);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { tradeData, rsiData, isConnected };
}