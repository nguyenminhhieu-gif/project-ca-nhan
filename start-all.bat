@echo off
chcp 65001 >nul
echo ========================================================
echo   KHOI DONG TOAN BO HE THONG COFFEE SHOP
echo ========================================================
echo.

echo [1/3] Dang khoi dong dich vu MySQL...
net start MySQL80
if %errorlevel% neq 0 (
    echo [Luu y] Neu MySQL chua chay, vui long mo Task Manager -> Services -> chuot phai MySQL80 -> Start.
)
echo.

echo [2/3] Cau hinh JDK 21...
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo.
echo [3/3] Dang khoi dong Quarkus Backend tren http://localhost:8080 ...
echo Vui long cho den khi xuat hien: "Listening on: http://0.0.0.0:8080"
echo.
call .\mvnw.cmd quarkus:dev -o
pause

