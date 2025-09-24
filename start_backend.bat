@echo off
echo Starting GrievEase Backend Services...

echo.
echo Starting OTP Service on port 7000...
start "OTP Service" cmd /k "cd backend && python OTP.py"

timeout /t 3 /nobreak > nul

echo.
echo Starting Main API Service on port 8000...
start "Main API" cmd /k "cd backend\DataBase && python enhanced_main.py"

echo.
echo Both services are starting...
echo OTP Service: http://localhost:7000
echo Main API: http://localhost:8000
echo.
echo Press any key to close this window...
pause > nul