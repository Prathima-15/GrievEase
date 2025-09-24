# Griev-ease Backend Services Startup Script
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Griev-ease Backend Services Startup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "backend\OTP.py") -or !(Test-Path "backend\DataBase\enhanced_main.py")) {
    Write-Host "❌ Error: Please run this script from the Griev-ease project root directory" -ForegroundColor Red
    Write-Host "   Expected files not found:" -ForegroundColor Red
    Write-Host "   - backend\OTP.py" -ForegroundColor Red
    Write-Host "   - backend\DataBase\enhanced_main.py" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/2] Starting OTP Service (Port 7000)..." -ForegroundColor Yellow
Set-Location "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python OTP.py" -WindowStyle Normal

Write-Host "[2/2] Starting Main API Server (Port 8000)..." -ForegroundColor Yellow  
Set-Location "DataBase"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python enhanced_main.py" -WindowStyle Normal

# Return to project root
Set-Location "..\..\"

Write-Host ""
Write-Host "✅ Both backend services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  OTP Service: http://localhost:7000" -ForegroundColor Cyan
Write-Host "  Main API:    http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:8080 (start with 'npm run dev')" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")