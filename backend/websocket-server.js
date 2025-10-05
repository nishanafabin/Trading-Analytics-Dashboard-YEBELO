const WebSocket = require('ws');
const { Kafka } = require('kafkajs');
const http = require('http');

const PORT = process.env.PORT || 8080;
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || '127.0.0.1:9092';

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });
const kafka = new Kafka({
  clientId: 'websocket-server',
  brokers: [KAFKA_BROKERS]
});

const consumer = kafka.consumer({ groupId: 'websocket-group' });

async function startServer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topics: ['trade-data', 'rsi-data'], fromBeginning: false });

    server.listen(PORT, () => {
      console.log(`✅ WebSocket server started on port ${PORT}`);
    });

    wss.on('connection', (ws) => {
      console.log('📱 Client connected');
      ws.on('close', () => console.log('📱 Client disconnected'));
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (message.value) {
          const data = JSON.parse(message.value.toString());
          const wsMessage = {
            type: topic === 'trade-data' ? 'trade' : 'rsi',
            payload: data
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(wsMessage));
            }
          });

          console.log(`📡 Broadcasted ${topic}:`, data.token_address);
        }
      }
    });
  } catch (error) {
    throw error;
  }
}

// Mock data for demo when Kafka is not available
function startMockData() {
  const tokens = ['token1', 'token2', 'token3', 'token4', 'token5'];
  
  setInterval(() => {
    tokens.forEach(token => {
      const price = (Math.random() * 5 + 1).toFixed(4);
      const rsi = Math.random() * 100;
      
      const tradeData = {
        type: 'trade',
        payload: {
          token_address: token,
          price_in_sol: parseFloat(price),
          timestamp: Date.now()
        }
      };
      
      const rsiData = {
        type: 'rsi',
        payload: {
          token_address: token,
          rsi: parseFloat(rsi.toFixed(2)),
          timestamp: Date.now(),
          signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'
        }
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(tradeData));
          client.send(JSON.stringify(rsiData));
        }
      });
    });
  }, 2000);
}

// Try Kafka first, fallback to mock data
startServer().catch(() => {
  console.log('⚠️ Kafka not available, using mock data');
  server.listen(PORT, () => {
    console.log(`✅ WebSocket server with mock data started on port ${PORT}`);
  });
  
  wss.on('connection', (ws) => {
    console.log('📱 Client connected');
    ws.on('close', () => console.log('📱 Client disconnected'));
  });
  
  startMockData();
});