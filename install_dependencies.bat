@echo off
echo ===================================================
echo [PulseFit] Dependency Installer Script
echo ===================================================
echo This script will install Node.js dependencies for backend and frontend.
echo.

echo [1/2] Checking and installing Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Installing Node.js LTS via WinGet...
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] WinGet failed to install Node.js. Please download it manually.
    )
) else (
    echo Node.js is already installed.
)

echo.
echo [2/2] Installing dependencies...
echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend npm install failed!
)

echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend npm install failed!
)
cd ..

echo.
echo ===================================================
echo [SUCCESS] All dependencies have been configured!
echo ===================================================
echo You can now run 'build_and_run.bat' to start the application.
pause
