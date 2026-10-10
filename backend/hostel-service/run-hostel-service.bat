@echo off
echo Starting Hostel Service on port 8082...
echo.
echo Make sure:
echo 1. Docker containers are running (postgres-hostel on port 5433)
echo 2. Port 8082 is available
echo.
pause
cd /d %~dp0
mvn spring-boot:run
