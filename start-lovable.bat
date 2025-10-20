@echo off
cd /d "%~dp0"
echo Starting Lovable App...
start "" http://localhost:8080
npm run dev
pause
