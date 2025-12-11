@echo off

title Pricing System - Local Network Setup

color 0A

echo.
echo ========================================
echo    Pricing System - Local Network
echo ========================================
echo.

cd /d "%~dp0"

REM Check Docker
echo Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo Docker OK.
echo.

REM Start services
echo Starting services...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)

echo.
echo Waiting for services to be ready (10 seconds)...
timeout /t 10 >nul

REM Get local IP address
echo.
echo ========================================
echo    Network Information
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    echo Local IP Address: !IP!
    echo.
    echo Access URLs:
    echo   Frontend:  http://!IP!:3001
    echo   Backend:   http://!IP!:4000
    echo   Database:  http://!IP!:8081
    echo.
    echo Local Access (same computer):
    echo   Frontend:  http://localhost:3001
    echo   Backend:   http://localhost:4000
    echo   Database:  http://localhost:8081
    echo.
)

echo ========================================
echo    ✅ Services Started!
echo ========================================
echo.
echo IMPORTANT: Make sure Windows Firewall allows:
echo   - Port 3001 (Frontend)
echo   - Port 4000 (Backend)
echo   - Port 8081 (Database Admin)
echo.
echo To open ports, run as Administrator:
echo   start-local-network-firewall.bat
echo.
pause



