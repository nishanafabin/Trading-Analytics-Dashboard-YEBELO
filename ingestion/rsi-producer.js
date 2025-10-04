import { Kafka } from "kafkajs";

// Kafka setup
const kafka = new Kafka({
  clientId: "rsi-processor",
  brokers: ["127.0.0.1:9092"]
});

const consumer = kafka.consumer({ groupId: "rsi-group" });
const producer = kafka.producer();

// Simple RSI calculation helper
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Store prices for each token
const tokenPrices = {};

async function run() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "trade-data", fromBeginning: true });

  console.log("✅ RSI Processor connected. Waiting for trade-data...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const trade = JSON.parse(message.value.toString());
      const { token_address, price_in_sol } = trade;

      console.log(`📥 Received trade for ${token_address}: price ${price_in_sol}`);

      // Initialize price array
      if (!tokenPrices[token_address]) tokenPrices[token_address] = [];
      tokenPrices[token_address].push(price_in_sol);

      // Keep only the last 15 prices for 14-period RSI
      if (tokenPrices[token_address].length > 15) {
        tokenPrices[token_address].shift();
      }

      // Calculate RSI
      const rsi = calculateRSI(tokenPrices[token_address]);
      if (rsi !== null) {
        const rsiMessage = {
          token_address,
          rsi: Number(rsi.toFixed(2)),
          timestamp: Date.now()
        };

        // Send to rsi-data topic
        await producer.send({
          topic: "rsi-data",
          messages: [{ value: JSON.stringify(rsiMessage) }]
        });

        console.log(`📊 Sent RSI for ${token_address}:`, rsiMessage);
      }
    }
  });
}

run().catch(console.error);
