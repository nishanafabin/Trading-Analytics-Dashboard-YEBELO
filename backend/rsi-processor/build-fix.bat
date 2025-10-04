@echo off
echo Installing required build tools for Windows...

echo 1. Installing Git for Windows (provides cp command)...
winget install --id Git.Git -e --source winget

echo 2. Installing Visual Studio Build Tools...
winget install Microsoft.VisualStudio.2022.BuildTools

echo 3. Installing CMake...
winget install Kitware.CMake

echo 4. Refreshing PATH...
refreshenv

echo 5. Attempting build again...
cargo build

echo.
echo If build still fails, use the Node.js version instead:
echo cd ..\..\ingestion
echo node rsi-producer.js