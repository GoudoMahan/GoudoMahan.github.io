@echo off

echo ========================================
echo Frosti Dev Starter
echo ========================================
echo.

echo [1/3] Building search index...
echo Running: pnpm run search:index
echo ----------------------------------------
call pnpm run search:index
if errorlevel 1 (
    echo.
    echo ERROR: Failed to build search index!
    pause
    exit /b 1
)
echo.
echo SUCCESS: Search index built!
echo.

echo [2/3] Starting dev server...
echo Running: pnpm run dev
echo ----------------------------------------

start /b cmd /c "pnpm run dev"

echo Waiting for server to start...
timeout /t 10 /nobreak > NUL

echo.
echo [3/3] Opening browser...
echo Opening: http://localhost:4321/
echo ----------------------------------------
start http://localhost:4321/

echo.
echo ========================================
echo SUCCESS: Dev environment ready!
echo ========================================
echo.
echo Dev server is running...
echo Press any key to close this window
pause > NUL
