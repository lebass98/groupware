#!/usr/bin/env bash
# ==============================================================================
# WnC 그룹웨어 개발 서버 종료 스크립트 (macOS / Linux)
# ==============================================================================

cd "$(dirname "$0")"

echo "WnC 그룹웨어 개발 서버(포트 8089, 8081)를 종료합니다..."

for PORT in 8089 8081; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    echo "  ✓ 포트 $PORT 프로세스 종료 완료"
  fi
done

find . -name "._*" -delete 2>/dev/null || true
echo "모든 개발 서버가 종료되었습니다."
