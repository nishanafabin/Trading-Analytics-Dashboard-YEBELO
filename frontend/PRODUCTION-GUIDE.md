# Production Deployment Guide

## Key Changes Made

### 1. Fixed Kafka Consumer Issue
- **Problem**: Creating new consumer per API request caused hanging requests
- **Solution**: Singleton KafkaManager with single long-running consumer
- **Benefits**: No rebalancing, better performance, proper message buffering

### 2. Memory Buffer System
- Stores last 50 messages per topic in memory
- Fast API responses (no Kafka queries per request)
- Automatic cleanup of old messages

### 3. Error Handling
- Graceful Kafka connection failures
- Topic validation
- JSON parsing error handling

## Production Considerations

### 1. Scaling & Performance
```typescript
// Increase buffer size for high-volume topics
private readonly BUFFER_SIZE = 500; // Instead of 50

// Add Redis for distributed caching
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### 2. Environment Configuration
```bash
# .env.production
KAFKA_BROKERS=kafka1:9092,kafka2:9092,kafka3:9092
KAFKA_CLIENT_ID=trading-dashboard-prod
KAFKA_GROUP_ID=dashboard-prod-group
REDIS_URL=redis://redis-cluster:6379
```

### 3. Health Checks
```typescript
// Add to kafka-manager.ts
getHealthStatus() {
  return {
    connected: this.isConnected,
    messageCount: Array.from(this.messageBuffers.values())
      .reduce((sum, buffer) => sum + buffer.length, 0),
    lastMessageTime: this.lastMessageTime
  };
}
```

### 4. Monitoring & Logging
- Add structured logging (Winston/Pino)
- Monitor consumer lag
- Track API response times
- Set up alerts for connection failures

### 5. Security
- Use SASL/SSL for Kafka connections
- Implement API rate limiting
- Add authentication middleware
- Validate message schemas

### 6. Deployment
- Use PM2 or Docker for process management
- Implement graceful shutdown
- Add circuit breakers for external dependencies
- Use load balancers for multiple instances

## Testing the Fix

1. Start your services:
```bash
# Terminal 1: Kafka
cd infra && docker-compose up

# Terminal 2: Data producers
cd ingestion && node csv-producer.js
cd ingestion && node rsi-producer.js

# Terminal 3: Frontend
cd frontend && npm run dev
```

2. Test API endpoints:
```bash
curl http://localhost:3000/api/kafka?topic=trade-data
curl http://localhost:3000/api/kafka?topic=rsi-data
```

3. Check dashboard: http://localhost:3000

## Migration Notes

- No changes needed to your React components
- `useTradingData` hook now fetches data in parallel
- API responses are now instant (no hanging requests)
- Memory usage is bounded by BUFFER_SIZE