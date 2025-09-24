# Griev-ease Complete Application Startup Script
# This script starts both backend services and the frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Griev-ease Application Startup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "package.json") -or !(Test-Path "backend\OTP.py") -or !(Test-Path "backend\DataBase\enhanced_main.py")) {
    Write-Host "❌ Error: Please run this script from the Griev-ease project root directory" -ForegroundColor Red
    Write-Host "   Expected files not found." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/3] Starting OTP Service (Port 7000)..." -ForegroundColor Yellow
Set-Location "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'OTP Service Starting...' -ForegroundColor Green; python OTP.py" -WindowStyle Normal

Write-Host "[2/3] Starting Main API Server (Port 8000)..." -ForegroundColor Yellow  
Set-Location "DataBase"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Main API Server Starting...' -ForegroundColor Green; python enhanced_main.py" -WindowStyle Normal

# Return to project root  
Set-Location "..\..\"

Write-Host "[3/3] Starting Frontend Development Server (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Development Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  🔐 OTP Service: http://localhost:7000" -ForegroundColor Cyan
Write-Host "  🚀 Main API:    http://localhost:8000" -ForegroundColor Cyan  
Write-Host "  🌐 Frontend:    http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 API Documentation:" -ForegroundColor White
Write-Host "  Main API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  OTP API Docs:  http://localhost:7000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for all services to fully start before accessing the application." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")