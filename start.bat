@echo off
echo ================================
echo   MeetingAI - Full Stack Startup
echo ================================
echo.
echo Prerequisites:
echo  - MongoDB must be running
echo  - Ollama must be running (ollama run llama3)
echo  - Whisper installed (pip install openai-whisper)
echo.

echo [1/2] Starting Backend (port 5000)...
start "MeetingAI Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (port 3000)...
start "MeetingAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will keep running)
pause > nul
