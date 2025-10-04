import { Kafka, Consumer } from 'kafkajs';

interface TradeMessage {
  token_address: string;
  price_in_sol: number;
  timestamp: number;
  volume?: number;
  market_cap?: number;
}

interface RSIMessage {
  token_address: string;
  rsi: number;
  timestamp: number;
  signal: string;
}

type KafkaMessage = TradeMessage | RSIMessage;

class KafkaManager {
  private static instance: KafkaManager;
  private consumer: Consumer | null = null;
  private messageBuffers: Map<string, KafkaMessage[]> = new Map();
  private isConnected = false;
  private isInitializing = false;
  private readonly BUFFER_SIZE = 100;

  private constructor() {
    this.messageBuffers.set('trade-data', []);
    this.messageBuffers.set('rsi-data', []);
  }

  static getInstance(): KafkaManager {
    if (!KafkaManager.instance) {
      KafkaManager.instance = new KafkaManager();
    }
    return KafkaManager.instance;
  }

  async initialize() {
    if (this.isConnected || this.isInitializing) return;
    
    this.isInitializing = true;

    try {
      const kafka = new Kafka({
        clientId: 'nextjs-dashboard',
        brokers: ['127.0.0.1:9092'],
        retry: {
          initialRetryTime: 100,
          retries: 8
        }
      });

      this.consumer = kafka.consumer({ 
        groupId: 'dashboard-group',
        sessionTimeout: 30000,
        heartbeatInterval: 3000
      });
      
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');
      
      await this.consumer.subscribe({ 
        topics: ['trade-data', 'rsi-data'], 
        fromBeginning: true
      });
      console.log('✅ Subscribed to topics: trade-data, rsi-data');

      // Run consumer in background without awaiting
      this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (message.value) {
            try {
              const data = JSON.parse(message.value.toString());
              console.log(`📥 Received ${topic}:`, data.token_address);
              this.addMessage(topic, data);
            } catch (error) {
              console.error(`Failed to parse message from ${topic}:`, error);
            }
          }
        },
      }).catch(error => {
        console.error('❌ Consumer run error:', error);
        this.isConnected = false;
        this.isInitializing = false;
      });

      this.isConnected = true;
      this.isInitializing = false;
      console.log('✅ Kafka consumer initialized and running');
    } catch (error) {
      console.error('❌ Failed to initialize Kafka consumer:', error);
      this.isConnected = false;
      this.isInitializing = false;
    }
  }

  private addMessage(topic: string, message: KafkaMessage) {
    const buffer = this.messageBuffers.get(topic);
    if (buffer) {
      buffer.push(message);
      if (buffer.length > this.BUFFER_SIZE) {
        buffer.shift(); // Remove oldest message
      }
    }
  }

  getMessages(topic: string): KafkaMessage[] {
    return this.messageBuffers.get(topic) || [];
  }

  async disconnect() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.isConnected = false;
    }
  }
}

export default KafkaManager;