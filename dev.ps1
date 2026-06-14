$root = $PSScriptRoot

Write-Host "Starting DB..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; docker compose up db"

Write-Host "Waiting for DB to be ready..."
Start-Sleep -Seconds 10

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\api'; .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\ui'; npm run dev"

Write-Host "API  -> http://localhost:8000"
Write-Host "UI   -> http://localhost:3000"
Write-Host "Docs -> http://localhost:8000/docs"
