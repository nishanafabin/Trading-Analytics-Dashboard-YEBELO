const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

const wss = new WebSocket.Server({ port: 9001 });
const kafka = new Kafka({
  clientId: 'websocket-server',
  brokers: ['127.0.0.1:9092']
});

const consumer = kafka.consumer({ groupId: 'websocket-group' });

async function startServer() {
  await consumer.connect();
  await consumer.subscribe({ topics: ['trade-data', 'rsi-data'], fromBeginning: false });

  console.log('✅ WebSocket server started on port 9001');

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
}

startServer().catch(console.error);