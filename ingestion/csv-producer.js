import fs from 'fs';
import csv from 'csv-parser';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'csv-producer',
  brokers: ['127.0.0.1:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: false,
  transactionTimeout: 30000
});

async function produceFromCSV() {
  try {
    await producer.connect();
    console.log('✅ Producer connected to Redpanda');

    const results = [];
    
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream('trades_data.csv')
        .pipe(csv())
        .on('data', (row) => {
          results.push({
            token_address: row.token_address,
            price_in_sol: parseFloat(row.price_in_sol),
            timestamp: parseInt(row.block_time) * 1000, // Convert to milliseconds
            volume: Math.random() * 1000, // Simulated volume
            market_cap: Math.random() * 1000000 // Simulated market cap
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Read ${results.length} records from CSV`);

    // Send messages with delay to simulate real-time
    for (const trade of results) {
      await producer.send({
        topic: 'trade-data',
        messages: [{
          key: trade.token_address,
          value: JSON.stringify(trade),
          timestamp: trade.timestamp.toString()
        }]
      });
      
      console.log(`📤 Sent: ${trade.token_address} - ${trade.price_in_sol} SOL`);
      
      // Small delay to simulate real-time streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 Finished streaming CSV to trade-data topic');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await producer.disconnect();
  }
}

produceFromCSV();