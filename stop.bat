@echo off
chcp 65001 >nul
title WnC 그룹웨어 개발 서버 종료기
cd /d "%~dp0"

echo ==========================================================
echo   🛑 WnC 그룹웨어 개발 서버 종료 (Windows)
echo ==========================================================
echo.
echo [정보] 포트 8089(웹 서버) 및 8081(Expo Metro)을 사용하는 프로세스를 정리합니다...

:: 포트 8089 프로세스 종료
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8089" ^| findstr "LISTENING"') do (
  echo   ✓ 웹 서버 (PID: %%a) 종료 중...
  taskkill /F /PID %%a >nul 2>nul
)

:: 포트 8081 프로세스 종료
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081" ^| findstr "LISTENING"') do (
  echo   ✓ Expo 앱 서버 (PID: %%a) 종료 중...
  taskkill /F /PID %%a >nul 2>nul
)

echo.
echo [완료] 모든 WnC 개발 서버가 성공적으로 종료되었습니다.
echo.
pause
