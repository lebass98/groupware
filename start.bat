@echo off
chcp 65001 >nul
title WnC 그룹웨어 통합 개발 서버 실행기
cd /d "%~dp0"

echo ==========================================================
echo   🏢 WnC 그룹웨어 통합 개발 서버 (Windows)
echo ==========================================================
echo.

:: 1. Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [오류] Node.js가 설치되어 있지 않습니다.
  echo        https://nodejs.org 에서 Node.js LTS 버전을 설치해주세요.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [정보] Node.js %NODE_VER% 확인됨

:: 2. react-native-app 의존성 확인
if exist react-native-app (
  if not exist react-native-app\node_modules (
    echo [정보] react-native-app 의존성을 설치합니다 (최초 1회, 수 분 소요)...
    cd react-native-app
    call npm install
    cd ..
    echo [완료] react-native-app 의존성 설치 완료
  ) else (
    echo [정보] react-native-app 의존성 확인됨
  )
)

echo.
echo ----------------------------------------------------------
echo   💻 PC 웹 대시보드 : http://localhost:8089/pc.html
echo   📱 모바일 웹 메인 : http://localhost:8089/index.html
echo   📲 Expo 모바일 앱 : Metro 번들러 (포트 8081)
echo.
echo   * 새 창에서 웹 서버와 Expo 앱 서버가 각각 실행됩니다.
echo   * 기본 브라우저로 PC 대시보드가 자동으로 열립니다.
echo   * 서버를 종료하려면 각 서버 창을 닫거나 stop.bat을 실행하세요.
echo ----------------------------------------------------------
echo.

:: 3. 웹 라이브 리로드 개발 서버 실행 (별도 창)
echo [실행] 웹 라이브 리로드 개발 서버 시작 중... (포트 8089)
start "WnC 그룹웨어 - 웹 개발 서버 (포트 8089)" cmd /k "title WnC 웹 서버 (8089) & node dev-server.js --open"

:: 4. Expo 모바일 앱 서버 실행 (별도 창)
if exist react-native-app (
  echo [실행] Expo 모바일 앱 서버 시작 중... (포트 8081)
  start "WnC 그룹웨어 - Expo 모바일 앱 (포트 8081)" cmd /k "title WnC Expo 앱 (8081) & cd react-native-app && npx expo start"
)

echo.
echo [완료] 모든 개발 서버가 백그라운드 창에서 성공적으로 실행되었습니다!
echo        이 창을 닫으셔도 서버는 계속 작동합니다.
echo.
timeout /t 5 >nul
exit /b 0
