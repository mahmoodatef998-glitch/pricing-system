@echo off

title Pricing System - Stopping

color 0C

echo.
echo ========================================
echo    Stopping Pricing System
echo ========================================
echo.

cd /d "%~dp0"

REM Stop Node processes (including Prisma Studio)
echo Stopping Node processes (including Prisma Studio)...
taskkill /F /FI "WINDOWTITLE eq Prisma Studio*" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo Done.
echo.

REM Stop Docker Compose services
echo Stopping Docker services...
docker-compose down >nul 2>&1
if exist docker-compose-ports.yml (
    docker-compose -f docker-compose-ports.yml down >nul 2>&1
    del docker-compose-ports.yml >nul 2>&1
)
echo Done.
echo.

REM Clean up temp files
if exist ports.tmp del ports.tmp >nul 2>&1
echo.

echo.
echo ========================================
echo    All services stopped!
echo ========================================
echo.
pause

