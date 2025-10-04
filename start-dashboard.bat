@echo off
echo ========================================
echo Starting Trading Analytics Dashboard
echo ========================================

echo.
echo 1. Starting Redpanda services...
cd infra
start "Redpanda" cmd /k "docker-compose up"
timeout /t 5 /nobreak > nul

echo.
echo 2. Starting WebSocket server...
cd ..\backend
start "WebSocket Server" cmd /k "node websocket-server.js"
timeout /t 3 /nobreak > nul

echo.
echo 3. Starting RSI processor...
cd ..\ingestion
start "RSI Processor" cmd /k "node rsi-producer.js"
timeout /t 2 /nobreak > nul

echo.
echo 4. Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo 5. Starting NextJS dashboard...
start "NextJS Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ All services started!
echo.
echo 📊 Dashboard: http://localhost:3000
echo 🔧 Redpanda Console: http://localhost:8080
echo 📡 WebSocket Server: ws://localhost:8081
echo.
echo To send test data, run:
echo cd ingestion && node csv-producer.js
echo ========================================
pause