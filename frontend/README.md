# Trading Analytics Dashboard

A real-time NextJS dashboard for monitoring SOL token prices and RSI indicators.

## Features

- 🔄 Real-time data streaming from Kafka via WebSocket
- 📊 Interactive price and RSI charts with Recharts
- 🎯 Token selector for 5 different tokens
- 📈 RSI overbought/oversold indicators (70/30 levels)
- 📱 Responsive design with Tailwind CSS
- ⚡ TypeScript for type safety

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Running Redpanda/Kafka** with topics: `trade-data`, `rsi-data`
3. **Backend RSI processor** running (Node.js version from ingestion folder)

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the WebSocket Server
```bash
# In a new terminal, from the backend directory
cd ../backend
node websocket-server.js
```

### 3. Start the Frontend
```bash
# Back in the frontend directory
npm run dev
```

### 4. Start Data Producers (if not running)
```bash
# In another terminal, from ingestion directory
cd ../ingestion
node csv-producer.js

# In another terminal
node rsi-producer.js
```

## Access the Dashboard

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   CSV Data      │───▶│   Redpanda   │───▶│  RSI Processor  │
│   Producer      │    │   Kafka      │    │   (Node.js)     │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌──────────────┐    ┌─────────────────┐
                       │  WebSocket   │───▶│   NextJS        │
                       │   Server     │    │  Dashboard      │
                       └──────────────┘    └─────────────────┘
```

## Components

- **TokenSelector**: Dropdown to select between 5 tokens
- **PriceChart**: Real-time price visualization
- **RSIChart**: RSI with overbought/oversold lines
- **MetricsDisplay**: Current price and RSI values
- **useTradingData**: Hook for data management
- **useWebSocket**: Hook for real-time connections

## Configuration

### WebSocket Server Port
Default: `8080` (configured in `backend/websocket-server.js`)

### Kafka Brokers
Default: `127.0.0.1:9092` (configured in API routes and hooks)

### Data Retention
Charts show last 50 data points per token

## Troubleshooting

### WebSocket Connection Issues
1. Ensure WebSocket server is running on port 8080
2. Check if Kafka topics have data
3. Verify Redpanda is running

### No Data Showing
1. Start the CSV producer: `node csv-producer.js`
2. Start the RSI processor: `node rsi-producer.js`
3. Check browser console for errors

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Development

### Adding New Tokens
1. Update `TOKENS` array in `app/types/index.ts`
2. Add token data to initial state in `useTradingData.ts`

### Customizing Charts
- Modify chart colors in component files
- Adjust data retention in `useTradingData.ts`
- Change RSI thresholds in `RSIChart.tsx`

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Configure environment variables for production Kafka brokers