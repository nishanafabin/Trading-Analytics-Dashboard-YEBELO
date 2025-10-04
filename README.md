# Trading Analytics Dashboard - YEBELO

A real-time trading analytics dashboard for SOL tokens with price monitoring and RSI analysis.

## Features

- Real-time price tracking for multiple SOL tokens
- RSI (Relative Strength Index) calculation and visualization
- Interactive charts with live data updates
- Token selection and comparison
- WebSocket-based data streaming

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, WebSocket
- **Data Processing**: Rust, Kafka
- **Infrastructure**: Docker, Docker Compose

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nishanafabin/Trading-Analytics-Dashboard-YEBELO.git
   cd Trading-Analytics-Dashboard-YEBELO
   ```

2. **Start the system**
   ```bash
   # Windows
   start-system.bat
   
   # Or manually start services
   docker-compose up -d
   ```

3. **Start the dashboard**
   ```bash
   # Windows
   start-dashboard.bat
   
   # Or manually
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the dashboard**
   Open http://localhost:3001 in your browser

## Project Structure

```
├── frontend/          # Next.js dashboard application
├── backend/           # WebSocket server and API
├── ingestion/         # Data ingestion and Kafka producers
├── rust-processor/    # Rust-based data processing
├── infra/            # Infrastructure configuration
└── docker-compose.yml # Container orchestration
```

## Development

See [PRODUCTION-GUIDE.md](PRODUCTION-GUIDE.md) for detailed setup and deployment instructions.

## License

MIT License