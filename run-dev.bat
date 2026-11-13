@echo off
chcp 65001 >nul
title COFFEE SHOP DEV SERVER - PORT 8080
color 0E

echo ===================================================================
echo             KHOI DONG QUARKUS DEV MODE (PORT 8080)
echo ===================================================================

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

net start MySQL80 >nul 2>&1

echo.
echo Dang khoi dong Quarkus tren http://localhost:8080 ...
echo.

call .\mvnw.cmd quarkus:dev
pause
