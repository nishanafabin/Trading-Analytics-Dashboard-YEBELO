@echo off
echo ========================================
echo 🚀 Trading Analytics System Startup
echo ========================================

echo 📦 Step 1: Starting Docker containers...
docker-compose up -d
timeout /t 10 /nobreak > nul

echo 🎯 Step 2: Creating Kafka topics...
docker exec redpanda rpk topic create trade-data --partitions 3 --replicas 1 2>nul
docker exec redpanda rpk topic create rsi-data --partitions 3 --replicas 1 2>nul

echo 📊 Step 3: Installing dependencies...
cd ingestion && call npm install
cd ..\frontend && call npm install

echo 🦀 Step 4: Building Rust processor...
cd ..\rust-processor
cargo build --release
if %errorlevel% neq 0 (
    echo ⚠️ Rust build failed, using Node.js fallback
    cd ..\ingestion
    start "RSI Processor" cmd /k "node rsi-producer.js"
) else (
    start "Rust RSI Processor" cmd /k "cargo run --release"
)

echo 🚀 Step 5: Starting services...
cd ..\ingestion
start "Data Producer" cmd /k "node csv-producer.js"
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo ========================================
echo ✅ System Started!
echo 🌐 Dashboard: http://localhost:3000
echo 🔧 Console: http://localhost:8080
echo ========================================