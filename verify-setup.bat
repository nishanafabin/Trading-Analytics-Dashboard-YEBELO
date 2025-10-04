@echo off
echo ========================================
echo Trading Analytics Setup Verification
echo ========================================

echo.
echo 1. Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop.
    exit /b 1
)

echo.
echo 2. Checking Docker Compose...
docker-compose --version
if %errorlevel% neq 0 (
    echo ❌ Docker Compose not found.
    exit /b 1
)

echo.
echo 3. Starting Redpanda services...
cd infra
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services.
    exit /b 1
)

echo.
echo 4. Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo.
echo 5. Checking service status...
docker-compose ps

echo.
echo ========================================
echo ✅ Setup verification complete!
echo.
echo Next steps:
echo 1. Open http://localhost:8080 for Redpanda Console
echo 2. Create topics: trade-data and rsi-data
echo 3. Run: cd ingestion && node csv-producer.js
echo ========================================