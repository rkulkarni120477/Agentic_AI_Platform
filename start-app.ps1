$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "services/platform"
$frontendDir = Join-Path $root "apps/web"
$backendVenv = Join-Path $backendDir ".venv"
$backendPython = Join-Path $backendVenv "Scripts\python.exe"

function Ensure-BackendEnvironment {
    if (-not (Test-Path $backendPython)) {
        Write-Host "Creating backend virtual environment..."
        python -m venv $backendVenv
    }

    Write-Host "Installing backend dependencies..."
    Push-Location $backendDir
    try {
        & $backendPython -m pip install -e ".[dev]"
    } finally {
        Pop-Location
    }
}

function Ensure-FrontendEnvironment {
    if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
        Write-Host "Installing frontend dependencies..."
        Push-Location $frontendDir
        try {
            npm install
        } finally {
            Pop-Location
        }
    }
}

function Start-AppProcess {
    param(
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Title
    )

    $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkingDirectory'; $Command" -PassThru
    Write-Host "Started $Title (PID: $($proc.Id))"
    return $proc
}

Ensure-BackendEnvironment
Ensure-FrontendEnvironment

Start-AppProcess -WorkingDirectory $backendDir -Command "& '$backendPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000" -Title "Backend API"
Start-Sleep -Seconds 3
Start-AppProcess -WorkingDirectory $frontendDir -Command "npm run dev" -Title "Frontend Web App"

Write-Host ""
Write-Host "Application URLs:"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  API:      http://localhost:8000"
Write-Host "  Docs:     http://localhost:8000/docs"
Write-Host ""
Write-Host "Use Ctrl+C in each terminal window to stop the services."
