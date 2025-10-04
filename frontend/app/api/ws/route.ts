import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import KafkaManager from '../../lib/kafka-manager';

let wss: WebSocketServer | null = null;

export async function GET(request: NextRequest) {
  if (!wss) {
    wss = new WebSocketServer({ port: 8081 });
    const kafkaManager = KafkaManager.getInstance();
    
    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      // Send initial data
      const tradeData = kafkaManager.getMessages('trade-data');
      const rsiData = kafkaManager.getMessages('rsi-data');
      
      ws.send(JSON.stringify({ type: 'initial', tradeData, rsiData }));
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
  }

  return new Response('WebSocket server running on port 8081', { status: 200 });
}