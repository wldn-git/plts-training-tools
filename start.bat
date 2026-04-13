@echo off
TITLE PLTS Training Tools - Launcher
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo    PLTS Training Tools Portable Launcher
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org/
    pause
    exit /b
)

:: Check for node_modules
if not exist "node_modules\" (
    echo [INFO] Folder node_modules tidak ditemukan.
    echo [INFO] Menjalankan 'npm install' untuk pertama kali...
    call npm install
)

echo.
echo [INFO] Menjalankan aplikasi dalam mode Development...
echo [INFO] Silakan buka browser di http://localhost:5173
echo.
call npm run dev

pause
