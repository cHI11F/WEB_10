@echo off
echo ===================================================
echo [PulseFit] Starting Application...
echo ===================================================

echo Starting Node.js Backend Server...
start "PulseFit Node Backend" cmd /c "npm start"
echo Backend server started on port 8000!

echo.
echo ===================================================
echo [PulseFit] Building and Running React Frontend...
echo ===================================================
cd frontend

echo Building React Production App...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed! Exiting.
    pause
    exit /b %ERRORLEVEL%
)

echo Running React App in Production mode...
call npm run preview
pause
