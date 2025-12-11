@echo off

title Pricing System - Starting

color 0A

echo.
echo ========================================
echo    Starting Pricing System
echo ========================================
echo.

cd /d "%~dp0"

REM Fixed ports - no conflicts with other projects in mahmood folder
REM ATA CRM: PostgreSQL 5432, Prisma 5556, Frontend 3005
REM AL RABEI: Backend 3050, Frontend 3000, Prisma 5555
REM Pricing System: Fixed ports below
set FRONTEND_PORT=3001
set BACKEND_PORT=4000
set DB_PORT=5433
set PRISMA_PORT=5557
set ADMINER_PORT=8081

echo.
echo ========================================
echo    Fixed Ports Configuration
echo ========================================
echo   Frontend:  %FRONTEND_PORT% (no conflict)
echo   Backend:   %BACKEND_PORT% (no conflict)
echo   PostgreSQL: %DB_PORT% (no conflict)
echo   Prisma:    %PRISMA_PORT% (no conflict)
echo   Adminer:   %ADMINER_PORT% (no conflict)
echo.

REM Save ports to temp file for later use
echo FRONTEND_PORT=%FRONTEND_PORT% > ports.tmp
echo BACKEND_PORT=%BACKEND_PORT% >> ports.tmp
echo DB_PORT=%DB_PORT% >> ports.tmp
echo PRISMA_PORT=%PRISMA_PORT% >> ports.tmp
echo ADMINER_PORT=%ADMINER_PORT% >> ports.tmp

REM Stop old processes
echo Cleaning old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo Done.
echo.

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

REM Use fixed docker-compose.yml (ports are already set)
echo Using fixed port configuration...

REM Stop existing containers first (quick stop, don't remove volumes)
echo Stopping existing containers...
docker-compose stop
timeout /t 2 >nul
echo Containers stopped.
echo.

REM Start Docker Compose services
echo Starting Docker services (PostgreSQL, Backend, Frontend, Adminer)
echo This may take a minute if images need to be built, please wait
echo.

REM Check if images exist - check actual image names
docker images pricingsystem-backend 2>nul | findstr /C:"pricingsystem-backend" >nul
set HAS_BACKEND=%errorlevel%
docker images pricingsystem-frontend 2>nul | findstr /C:"pricingsystem-frontend" >nul
set HAS_FRONTEND=%errorlevel%

REM Start services - only build if images don't exist
if %HAS_BACKEND% neq 0 goto build_images
if %HAS_FRONTEND% neq 0 goto build_images

echo Images found, starting services quickly (no build needed)...
docker-compose up -d
goto docker_check

:build_images
echo Building images (first time only, this may take 5-10 minutes)...
echo This will only happen once. Next time will be fast!
docker-compose up -d --build

:docker_check
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start Docker services!
    echo.
    echo Please check:
    echo   1. Docker Desktop is running
    echo   2. You have enough disk space
    echo   3. No other containers are conflicting
    echo.
    pause
    exit /b 1
)

:docker_ok
timeout /t 5 >nul
echo.

REM Wait for database to be ready (reduced time)
echo Waiting for database to be ready (5 seconds)...
timeout /t 5 >nul

REM Check if containers are running
echo Checking containers status...
docker-compose ps
echo.

REM Wait for services to fully start (reduced time)
echo Waiting for Frontend and Backend to initialize (3 seconds)...
timeout /t 3 >nul
echo Services OK.
echo.

REM Ensure backend/.env exists with correct DATABASE_URL
if not exist backend\.env (
    echo Creating backend/.env from env.example...
    copy backend\env.example backend\.env >nul 2>&1
)

REM Update DATABASE_URL in backend/.env
echo Updating DATABASE_URL in backend/.env...
powershell -NoProfile -Command "$dbPort = '%DB_PORT%'; $envFile = 'backend\.env'; if (Test-Path $envFile) { $content = Get-Content $envFile -Raw; $newUrl = \"postgresql://postgres:postgres@localhost:$dbPort/pricing_db?schema=public\"; if ($content -match 'DATABASE_URL=') { $content = $content -replace 'DATABASE_URL=.*', \"DATABASE_URL=$newUrl\" } else { $content += \"`nDATABASE_URL=$newUrl`n\" }; Set-Content -Path $envFile -Value $content -NoNewline }"

REM Wait for services to be ready before opening browsers
echo.
echo Waiting for servers to be ready (10 seconds)...
timeout /t 10 >nul

REM Test Cloudinary connection (if configured)
echo.
echo ========================================
echo    Testing Cloudinary Connection
echo ========================================
echo.

REM Check if Cloudinary is configured in backend/.env
findstr /C:"STORAGE_PROVIDER=hybrid" backend\.env >nul 2>&1
set IS_HYBRID=%errorlevel%
findstr /C:"STORAGE_PROVIDER=cloudinary" backend\.env >nul 2>&1
set IS_CLOUDINARY=%errorlevel%

if %IS_HYBRID% equ 0 goto test_cloudinary
if %IS_CLOUDINARY% equ 0 goto test_cloudinary
goto skip_cloudinary_test

:test_cloudinary
echo Cloudinary is configured, testing connection...
echo This may take a few seconds...
echo.

REM Wait a bit more for backend to be fully ready
timeout /t 3 >nul

REM Check backend logs for Cloudinary test result
docker-compose logs backend --tail 50 | findstr /C:"Cloudinary connection test" >nul 2>&1
if %errorlevel% equ 0 (
    echo Checking Cloudinary test result...
    docker-compose logs backend --tail 50 | findstr /C:"Cloudinary connection test: SUCCESS" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Cloudinary connection: SUCCESS
    ) else (
        docker-compose logs backend --tail 50 | findstr /C:"Cloudinary connection test: FAILED" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ⚠️  Cloudinary connection: FAILED
            echo    Check backend logs for details
            echo    Server will continue with local storage fallback
        ) else (
            echo ⏳ Cloudinary test in progress...
            echo    Check logs: docker-compose logs backend
        )
    )
) else (
    echo ⏳ Cloudinary test not found in logs yet
    echo    This is normal if backend just started
    echo    Check logs: docker-compose logs backend
)
echo.

:skip_cloudinary_test

REM Start Prisma Studio in background
cd backend
if exist .env (
    start "Prisma Studio" cmd /k "npx dotenv-cli -e .env -- npx prisma studio --port %PRISMA_PORT%"
) else (
    start "Prisma Studio" cmd /k "npx prisma studio --port %PRISMA_PORT%"
)
cd ..

REM Open browsers: Frontend and Database
echo.
echo ========================================
echo    Opening Browsers
echo ========================================
echo.

REM Wait a bit more to ensure services are fully ready
echo Waiting for services to be fully ready (3 seconds)...
timeout /t 3 >nul

echo [1/3] Opening Frontend: http://localhost:%FRONTEND_PORT%
powershell -Command "Start-Process 'http://localhost:%FRONTEND_PORT%'"
timeout /t 2 >nul

echo [2/3] Opening Adminer: http://localhost:%ADMINER_PORT%
powershell -Command "Start-Process 'http://localhost:%ADMINER_PORT%'"
timeout /t 1 >nul

echo [3/3] Opening Backend API Health Check: http://localhost:%BACKEND_PORT%/health
powershell -Command "Start-Process 'http://localhost:%BACKEND_PORT%/health'"
timeout /t 1 >nul

echo.
echo ✅ Browsers opened!
echo.

echo.
echo ========================================
echo    ✅ SUCCESS!
echo ========================================
echo.
echo Services:
echo   Frontend:  http://localhost:%FRONTEND_PORT%
echo   Database:  http://localhost:%ADMINER_PORT%
echo   Prisma:    http://localhost:%PRISMA_PORT%
echo.
echo Admin Login:
echo   Username: admin
echo   Password: ChangeMe123!
echo.
echo Database (Adminer):
echo   System: PostgreSQL | Server: db
echo   Username: postgres | Password: postgres
echo   Database: pricing_db
echo.
echo ========================================
echo.
pause

