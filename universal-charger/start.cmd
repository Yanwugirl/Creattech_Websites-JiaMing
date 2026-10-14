@echo off
setlocal
cd /d "%~dp0"
if not exist "server.js" goto missing_files

set "charger_node="
where node >nul 2>nul
if not errorlevel 1 set "charger_node=node"
if not defined charger_node if exist "%ProgramFiles%\nodejs\node.exe" set "charger_node=%ProgramFiles%\nodejs\node.exe"
if not defined charger_node if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "charger_node=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined charger_node goto missing_node
"%charger_node%" -e "if(Number(process.versions.node.split('.')[0])<18)process.exit(1)" >nul 2>nul
if errorlevel 1 goto old_node

set "charger_ollama="
where ollama >nul 2>nul
if not errorlevel 1 set "charger_ollama=ollama"
if not defined charger_ollama if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" set "charger_ollama=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
if not defined charger_ollama goto ollama_unavailable
"%charger_ollama%" list >nul 2>nul
if errorlevel 1 goto ollama_unavailable
"%charger_ollama%" show gemma3:1b >nul 2>nul
if not errorlevel 1 goto run_server
echo Downloading gemma3:1b for the first model call. This can take a few minutes.
"%charger_ollama%" pull gemma3:1b
if errorlevel 1 echo Model download failed. The page will still open; check Ollama and try again.
goto run_server

:ollama_unavailable
echo Open the Ollama app to enable AI replies, then click Check connection on the page.
echo If the page reports a missing model, run: ollama pull gemma3:1b

:run_server
echo Starting the project. Your browser will open when the server is ready.
echo Keep this window open while using the page.
"%charger_node%" server.js --open
set "charger_exit=%errorlevel%"
if not "%charger_exit%"=="0" pause
exit /b %charger_exit%

:missing_files
echo Extract the complete ZIP first. Keep start.cmd beside server.js and charger.html.
pause
exit /b 1

:missing_node
echo Node.js was not found. Install the Windows LTS installer from:
echo https://nodejs.org/en/download
echo After installing, double-click start.cmd again.
pause
exit /b 1

:old_node
echo This project needs Node.js 18 or newer. Install the current LTS version from:
echo https://nodejs.org/en/download
pause
exit /b 1
