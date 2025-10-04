import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'data-generator',
  brokers: ['127.0.0.1:9092']
});

const producer = kafka.producer();

async function generateMoreData() {
  await producer.connect();
  console.log('✅ Connected to generate more data');

  const tokens = ['token1', 'token2', 'token3', 'token4', 'token5'];
  const basePrices = [1.2, 2.3, 0.95, 3.1, 5.2];

  // Generate 20 data points per token for RSI calculation
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];
      const basePrice = basePrices[j];
      const price = basePrice + (Math.random() - 0.5) * 0.2;
      
      const trade = {
        token_address: token,
        price_in_sol: price,
        timestamp: Date.now() + (i * 1000) + (j * 100)
      };

      await producer.send({
        topic: 'trade-data',
        messages: [{ 
          key: token,
          value: JSON.stringify(trade) 
        }]
      });

      console.log(`📤 ${token}: ${price.toFixed(4)} SOL`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  await producer.disconnect();
  console.log('🎉 Generated sufficient data for all tokens');
}

generateMoreData();