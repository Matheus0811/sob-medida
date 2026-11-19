@echo off
chcp 65001 >nul
title Sob Medida
cd /d "%~dp0"
echo ============================================
echo   Sob Medida
echo ============================================
where npm >nul 2>nul
if errorlevel 1 goto :sem_node
if not exist .env.local copy .env.example .env.local >nul
findstr /r /c:"^GEMINI_API_KEY=..*" .env.local >nul
if errorlevel 1 goto :sem_chave
if exist node_modules goto :rodar
echo Instalando dependencias - na primeira vez leva 1 ou 2 minutos...
call npm install
if errorlevel 1 goto :erro
:rodar
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
echo.
echo O site parou. Veja a mensagem acima.
pause
exit /b
:sem_chave
echo [FALTA A CHAVE] Abra o arquivo .env.local nesta pasta e cole sua chave do Gemini
echo depois de GEMINI_API_KEY=   (crie a chave em https://aistudio.google.com/apikey)
start notepad .env.local
pause
exit /b 1
:sem_node
echo [ERRO] Node.js nao encontrado. Instale a versao LTS em https://nodejs.org
start https://nodejs.org/pt
pause
exit /b 1
:erro
echo.
echo [ERRO] Algo deu errado. Tire um print desta janela e mande para o Claude.
pause
exit /b 1
