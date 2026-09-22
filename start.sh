#!/usr/bin/env bash
# ==============================================================================
# WnC 그룹웨어 통합 개발 서버 실행 스크립트 (macOS / Linux)
# - 웹 라이브 리로드 개발 서버 (포트 8089, 브라우저 자동 오픈)
# - React Native Expo 모바일 앱 서버 (포트 8081)
# ==============================================================================

set -u
cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info() { printf "${CYAN}[정보]${NC} %s\n" "$1"; }
ok()   { printf "${GREEN}[완료]${NC} %s\n" "$1"; }
warn() { printf "${YELLOW}[주의]${NC} %s\n" "$1"; }
fail() { printf "${RED}[오류]${NC} %s\n" "$1"; }

echo ""
echo "=========================================================="
echo "  🏢 WnC 그룹웨어 통합 개발 서버 (Web & Mobile App)"
echo "=========================================================="
echo ""

# 1) Node.js 설치 확인
if ! command -v node > /dev/null 2>&1; then
  fail "Node.js가 설치되어 있지 않습니다."
  echo "     https://nodejs.org 에서 Node.js LTS 버전을 설치해주세요."
  exit 1
fi
info "Node.js $(node -v) 확인됨"

# 2) react-native-app 의존성 확인
if [ -d "react-native-app" ]; then
  if [ ! -d "react-native-app/node_modules" ]; then
    info "react-native-app 의존성을 설치합니다 (최초 1회)..."
    (cd react-native-app && npm install) || { fail "react-native-app 의존성 설치 실패"; exit 1; }
    ok "react-native-app 의존성 설치 완료"
  else
    info "react-native-app 의존성 확인됨"
  fi
fi

# 3) 기존 포트 점유 프로세스 확인 및 정리 (8089: 웹 서버, 8081: Expo Metro)
for PORT in 8089 8081; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    warn "기존 포트 $PORT 를 사용 중인 프로세스를 종료합니다."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done

# 4) macOS 리소스 포크 (._*) 정리
find . -name "._*" -delete 2>/dev/null || true

# 5) 서버 안내 출력
WEB_PORT=8089
echo ""
echo "----------------------------------------------------------"
echo "  💻 PC 웹 대시보드 : http://localhost:${WEB_PORT}/pc.html"
echo "  📱 모바일 웹 메인 : http://localhost:${WEB_PORT}/index.html"
echo "  📲 Expo 모바일 앱 : Metro 번들러 (포트 8081) 시작 중..."
echo ""
echo "  * 기본 브라우저로 PC 대시보드가 자동으로 열립니다."
echo "  * 아래 Expo QR 코드를 모바일 기기(Expo Go)로 스캔하여 테스트할 수 있습니다."
echo "  * 전체 서버를 종료하려면 언제든 Ctrl + C 를 누르세요."
echo "----------------------------------------------------------"
echo ""

# 6) 프로세스 정리(Cleanup) 트랩 설정
cleaned=0
cleanup() {
  [ "$cleaned" = "1" ] && return 0
  cleaned=1
  echo ""
  info "모든 개발 서버를 안전하게 종료합니다..."
  pkill -P $$ 2>/dev/null || true
  for PORT in 8089 8081; do
    PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
    [ -n "$PIDS" ] && echo "$PIDS" | xargs kill -9 2>/dev/null || true
  done
  find . -name "._*" -delete 2>/dev/null || true
  ok "모든 개발 서버가 정상 종료되었습니다."
}

trap 'cleanup; exit 0' INT TERM
trap cleanup EXIT

# 7) 1. 웹 라이브 리로드 개발 서버 백그라운드 구동 (자동 브라우저 열기)
node dev-server.js --open &
WEB_PID=$!

# 웹 서버 기동 대기 (1.5초)
sleep 1.5

# 8) 2. Expo 앱 개발 서버 구동 (포그라운드 - QR 코드 및 키 입력 지원)
if [ -d "react-native-app" ]; then
  cd react-native-app
  npx expo start
else
  wait $WEB_PID
fi
