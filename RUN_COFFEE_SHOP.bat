@echo off
chcp 65001 >nul
cd /d "%~dp0"
title COFFEE SHOP SERVER (PORT 8080)
color 0E

echo ===================================================================
echo             KHOI DONG HE THONG COFFEE SHOP (PORT 8080)
echo ===================================================================
echo.

REM 1. Thiet lap moi truong Java 21
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/3] Kiem tra Java:
java -version
echo.

REM 2. Thu khoi dong MySQL Service
echo [2/3] Dang kiem tra va khoi dong MySQL (port 3306)...
net start MySQL80 >nul 2>&1
net start mysql >nul 2>&1

REM Kiem tra port 3306 bang PowerShell
powershell -Command "$t = New-Object Net.Sockets.TcpClient; try { $t.Connect('127.0.0.1', 3306); Write-Host ' [OK] MySQL dang chay tren cong 3306!' -ForegroundColor Green } catch { Write-Host ' [CANH BAO] MySQL (cong 3306) CHUA CHAY! Vui long mo XAMPP hoac Task Manager -> Services -> Start MySQL80' -ForegroundColor Red } finally { $t.Close() }"
echo.

REM 3. Khoi dong Quarkus Backend
echo [3/3] Dang khoi dong Quarkus tren http://localhost:8080 ...
echo -------------------------------------------------------------------
echo Khi nao hien dong: "Listening on: http://0.0.0.0:8080"
echo la da thanh cong! Ban mo trinh duyet vao: http://localhost:8080
echo.
echo * CHU Y: KHONG TAT CUA SO NAY TRONG KHI SU DUNG WEB!
echo -------------------------------------------------------------------
echo.

call .\mvnw.cmd quarkus:dev -Dquarkus.analytics.disabled=true
pause
