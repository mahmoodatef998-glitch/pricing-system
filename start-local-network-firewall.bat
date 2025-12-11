@echo off

title Pricing System - Firewall Setup

color 0B

echo.
echo ========================================
echo    Opening Firewall Ports
echo ========================================
echo.
echo This script will open ports for:
echo   - 3001 (Frontend)
echo   - 4000 (Backend)
echo   - 8081 (Database Admin)
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Opening ports...
echo.

REM Open Port 3001 (Frontend)
netsh advfirewall firewall add rule name="Pricing System Frontend" dir=in action=allow protocol=TCP localport=3001
if %errorlevel% equ 0 (
    echo ✅ Port 3001 opened (Frontend)
) else (
    echo ⚠️  Port 3001 might already be open
)

REM Open Port 4000 (Backend)
netsh advfirewall firewall add rule name="Pricing System Backend" dir=in action=allow protocol=TCP localport=4000
if %errorlevel% equ 0 (
    echo ✅ Port 4000 opened (Backend)
) else (
    echo ⚠️  Port 4000 might already be open
)

REM Open Port 8081 (Database Admin)
netsh advfirewall firewall add rule name="Pricing System Adminer" dir=in action=allow protocol=TCP localport=8081
if %errorlevel% equ 0 (
    echo ✅ Port 8081 opened (Database Admin)
) else (
    echo ⚠️  Port 8081 might already be open
)

echo.
echo ========================================
echo    ✅ Firewall Rules Added!
echo ========================================
echo.
echo You can now access the system from other
echo computers on the same network.
echo.
pause



