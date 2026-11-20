@echo off
title Tien Len Tieng Anh - Classroom Baamboozle Edition
cd /d "%~dp0"
echo ===================================================
echo   DANG KHOI DONG TIEN LEN TIENG ANH WEB APP...
echo ===================================================
echo.
echo Dang mo may chu va trinh duyet web...
echo Vui long giu cua so nay trong khi choi game!
echo.

start "" "http://localhost:3000"
call npm.cmd run dev -- --host

pause
