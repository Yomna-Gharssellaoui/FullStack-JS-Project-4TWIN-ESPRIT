$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backEndDir = Resolve-Path (Join-Path $scriptDir "..")
$mlDir = Resolve-Path (Join-Path $backEndDir "ml\cashflow")
$venvPython = Join-Path $mlDir ".venv\Scripts\python.exe"
$modelPath = Join-Path $mlDir "cashflow_model.json"

Write-Host "[ML] Using ml directory: $mlDir"

if (-not (Test-Path $venvPython)) {
  Write-Host "[ML] Creating venv..."
  Set-Location $mlDir
  python -m venv .venv
  & $venvPython -m pip install --upgrade pip
  & $venvPython -m pip install -r requirements.txt
}

if (-not (Test-Path $modelPath)) {
  Write-Host "[ML] Model not found. Generating dataset + training model..."
  Set-Location $mlDir
  & $venvPython generate_synthetic_multitenant_dataset.py
  & $venvPython train_cashflow_model.py
}

Write-Host "[ML] Starting model server on http://127.0.0.1:8000 ..."
$mlProc = Start-Process -FilePath $venvPython -ArgumentList @(
  "-m",
  "uvicorn",
  "serve_cashflow_model:app",
  "--host",
  "127.0.0.1",
  "--port",
  "8000",
  "--app-dir",
  "$mlDir"
) -WorkingDirectory $mlDir -PassThru

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET -TimeoutSec 2
    if ($health.ok -eq $true) {
      $ready = $true
      break
    }
  } catch {
    # server still booting
  }
  Start-Sleep -Seconds 1
}

if (-not $ready) {
  if ($mlProc -and -not $mlProc.HasExited) {
    Stop-Process -Id $mlProc.Id -Force
  }
  throw "ML server failed to start on port 8000."
}

Write-Host "[ML] Model server ready."
$env:ML_SERVICE_URL = "http://127.0.0.1:8000"

Set-Location $backEndDir
Write-Host "[API] Starting NestJS with ML_SERVICE_URL=$env:ML_SERVICE_URL"

try {
  npm run start:dev
}
finally {
  if ($mlProc -and -not $mlProc.HasExited) {
    Write-Host "[ML] Stopping model server..."
    Stop-Process -Id $mlProc.Id -Force
  }
}
