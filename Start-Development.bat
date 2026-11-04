@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-development.ps1"
if errorlevel 1 (
    echo.
    echo Startup failed. Review the message above and resolve the problem.
    pause
    exit /b 1
)
echo.
pause
