import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'data-fixer',
  brokers: ['127.0.0.1:9092']
});

const producer = kafka.producer();

async function sendFixedData() {
  await producer.connect();
  
  const trades = [
    { token_address: 'token1', price_in_sol: 1.2, timestamp: Date.now() },
    { token_address: 'token1', price_in_sol: 1.25, timestamp: Date.now() + 1000 },
    { token_address: 'token1', price_in_sol: 1.22, timestamp: Date.now() + 2000 },
    { token_address: 'token2', price_in_sol: 2.34, timestamp: Date.now() + 3000 },
    { token_address: 'token3', price_in_sol: 0.95, timestamp: Date.now() + 4000 },
    { token_address: 'token4', price_in_sol: 3.1, timestamp: Date.now() + 5000 },
    { token_address: 'token5', price_in_sol: 5.25, timestamp: Date.now() + 6000 }
  ];

  for (const trade of trades) {
    await producer.send({
      topic: 'trade-data',
      messages: [{ value: JSON.stringify(trade) }]
    });
    console.log('Sent:', trade);
  }

  await producer.disconnect();
  console.log('✅ Fixed data sent');
}

sendFixedData();