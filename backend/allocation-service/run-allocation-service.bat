@echo off
echo ======================================
echo Starting Allocation Service
echo ======================================
echo.

cd /d "%~dp0"

echo Cleaning and building...
call mvn clean install -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting application on port 8083...
echo.

call mvn spring-boot:run

pause
