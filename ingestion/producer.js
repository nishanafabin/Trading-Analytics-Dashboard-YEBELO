const fs = require('fs');
const csv = require('csv-parser');
const { Kafka } = require('kafkajs');

// Kafka/Redpanda client
const kafka = new Kafka({
  clientId: 'trading-producer',
  brokers: ['127.0.0.1:9092'], // Redpanda broker
});

const producer = kafka.producer();

async function run() {
  await producer.connect();
  console.log('Producer connected to Redpanda!');

  fs.createReadStream('trades_data.csv')
    .pipe(csv())
    .on('data', async (row) => {
      // Convert CSV row to JSON
      const message = {
        token_address: row.token_address,
        price_in_sol: parseFloat(row.price_in_sol),
        block_time: parseInt(row.block_time),
      };

      try {
        await producer.send({
          topic: 'trade-data',
          messages: [{ value: JSON.stringify(message) }],
        });
        console.log('Sent:', message);
      } catch (err) {
        console.error('Send error:', err);
      }
    })
    .on('end', async () => {
      console.log('CSV file processed.');
      await producer.disconnect();
    });
}

run().catch(console.error);
