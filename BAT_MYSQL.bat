@echo off
chcp 65001 >nul
title BAT DICH VU MYSQL
echo Dang khoi dong MySQL...
net start MySQL80
if %errorlevel% neq 0 (
    net start mysql
)
if %errorlevel% neq 0 (
    echo Khong start duoc qua lenh net. Hay mo Task Manager - Services hoac mo XAMPP bam Start MySQL!
) else (
    echo [THANH CONG] MySQL da bat!
)
pause

