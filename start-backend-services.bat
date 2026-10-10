@echo off
echo ========================================
echo Starting Backend Services
echo ========================================
echo.

echo This script will start all backend services:
echo   - Student Service (port 8081)
echo   - Hostel Service (port 8082)
echo   - Allocation Service (port 8083)
echo.
echo Press Ctrl+C in any window to stop a service
echo ========================================
echo.

start "Student Service" cmd /k "cd backend\student-service && mvn spring-boot:run"
timeout /t 3 /nobreak >nul

start "Hostel Service" cmd /k "cd backend\hostel-service && run-hostel-service.bat"
timeout /t 3 /nobreak >nul

start "Allocation Service" cmd /k "cd backend\allocation-service && run-allocation-service.bat"

echo.
echo All services are starting in separate windows...
echo.
echo Services will be available at:
echo   Student Service:     http://localhost:8081
echo   Hostel Service:      http://localhost:8082
echo   Allocation Service:  http://localhost:8083
echo.
pause
