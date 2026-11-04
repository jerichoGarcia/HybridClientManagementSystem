
# Start-Development.ps1
# Starts the ASP.NET Core API and Next.js frontend
# in separate PowerShell windows.

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$apiPath = Join-Path $root "Api\ClientManagement.Api"
$webPath = Join-Path $root "Web\client-management-web"

# Validate project folders.
if (-not (Test-Path (Join-Path $apiPath "ClientManagement.Api.csproj"))) {
    Write-Host "API project not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $webPath "package.json"))) {
    Write-Host "Frontend project not found." -ForegroundColor Red
    exit 1
}

# Validate required tools.
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host ".NET SDK not found." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host "npm not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $webPath "node_modules"))) {
    Write-Host "Frontend dependencies are missing." -ForegroundColor Yellow
    Write-Host "Run npm ci in Web\client-management-web first."
    exit 1
}

# Check both ports before starting either process, so a conflict cannot cause
# a duplicate server or a partial startup.
$occupiedPorts = @(Get-NetTCPConnection -State Listen -ErrorAction Stop |
    Where-Object { $_.LocalPort -in @(5110, 3000) } |
    Select-Object -ExpandProperty LocalPort -Unique)
if ($occupiedPorts.Count -gt 0) {
    Write-Host "Cannot start: port(s) $($occupiedPorts -join ', ') are already in use. Stop the existing service or resolve the conflict first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting HybridClientManagementSystem..." -ForegroundColor Cyan

# Start API in its own PowerShell window.
$apiCommand = "Set-Location -LiteralPath '$($apiPath.Replace("'","''"))'; dotnet run --launch-profile http"

$apiEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($apiCommand))
Start-Process powershell.exe -ArgumentList @("-NoExit", "-EncodedCommand", $apiEncoded)

Start-Sleep -Seconds 2

# Start frontend in its own PowerShell window.
$webCommand = "Set-Location -LiteralPath '$($webPath.Replace("'","''"))'; npm.cmd run dev"

$webEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($webCommand))
Start-Process powershell.exe -ArgumentList @("-NoExit", "-EncodedCommand", $webEncoded)

Write-Host ""
Write-Host "Startup commands launched." -ForegroundColor Green
Write-Host "API:      http://localhost:5110"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Login:    http://localhost:3000/login"
Write-Host ""
Write-Host "Check both terminal windows for Ready messages."
Write-Host "Press Ctrl+C in each window to stop the servers."
