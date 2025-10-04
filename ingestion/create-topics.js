const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'topic-creator',
  brokers: ['127.0.0.1:9092']
});

const admin = kafka.admin();

async function createTopics() {
  try {
    await admin.connect();
    console.log('✅ Connected to Redpanda');

    const topics = await admin.listTopics();
    console.log('📋 Existing topics:', topics);

    const topicsToCreate = [
      { topic: 'trade-data', numPartitions: 1, replicationFactor: 1 },
      { topic: 'rsi-data', numPartitions: 1, replicationFactor: 1 }
    ];

    const result = await admin.createTopics({
      topics: topicsToCreate
    });

    console.log('🎉 Topics created:', result);
    
    const updatedTopics = await admin.listTopics();
    console.log('📋 All topics:', updatedTopics);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await admin.disconnect();
  }
}

createTopics();