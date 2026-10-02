# WnC 그룹웨어 브랜드 리소스

두 개의 체크가 하나의 W로 이어지는 심벌입니다. 출근 확인과 업무 완료, 동료 간 연결을 표현합니다.
굵고 둥근 단일 획과 상승하는 오른쪽 끝으로 작은 아이콘에서도 형태를 유지합니다.
워드앤코드의 블루와 넉넉한 여백으로 간결한 한국형 SaaS 인상을 만듭니다.

## 색상 및 서체

- 브랜드 블루: `#0346FF` — 심벌, 앱 아이콘 배경, Expo 시작 화면 배경.
- 딥 블루: `#002B99` — 전체 시작 화면의 하단 그라데이션.
- 화이트: `#FFFFFF` — 어두운 배경 위 심벌과 문구.
- SVG 문구: `Pretendard, 'Apple SD Gothic Neo', sans-serif`, 굵기 700. 문구는 편집 가능한 텍스트이며 아웃라인이 아닙니다.
- PNG 문구: macOS Apple SD Gothic Neo Bold. 다른 환경에서는 한국어 Bold 폰트 경로를 지정합니다.

## 파일 및 용도

| 파일 | 크기 | 용도 |
| --- | --- | --- |
| `logo-symbol.svg` | 1024×1024 viewBox | 투명 배경의 블루 심벌 |
| `logo-horizontal.svg` | 1760×400 | 밝은 배경의 헤더·문서용 심벌 + WnC 그룹웨어 |
| `app-icon.svg` | 1024×1024 | 블루 배경 + 흰색 심벌 원본 |
| `splash.svg` | 1284×2778 | 그라데이션 배경의 전체 시작 화면 원본 |
| `icon-1024.png` | 1024×1024 | 앱 아이콘 |
| `adaptive-foreground-1024.png` | 1024×1024 | Android adaptive icon 전경, 흰색·투명 배경 |
| `adaptive-monochrome-1024.png` | 1024×1024 | Android 테마 아이콘용 단색 전경 |
| `splash-icon-1024.png` | 1024×1024 | Expo splash 플러그인용 흰색·투명 심벌 |
| `splash-1284x2778.png` | 1284×2778 | 전체 시작 화면 시안·고정 비율 화면용 |
| `favicon-48.png` | 48×48 | 브라우저 파비콘 |
| `favicon-192.png` | 192×192 | 웹 앱 아이콘 |
| `apple-touch-icon-180.png` | 180×180 | iOS 웹 홈 화면 아이콘 |
| `render.py` | Python | 전체 SVG·PNG 재생성 및 크기·투명도 검사 |
| `README.md` | 문서 | 디자인 및 사용 안내 |

앱 아이콘과 Apple 터치 아이콘은 모서리를 미리 자르지 않은 불투명 정사각형입니다. 운영체제가 기기별 둥근 모서리 마스크를 적용합니다.
Adaptive 전경은 중앙 66% 안전 영역 안에 배치했으며, 배경색은 `#0346FF`로 설정합니다. 두 adaptive 파일은 동일한 흰색 단색 심벌입니다.
Expo에는 `splash-icon-1024.png`와 배경색 `#0346FF`를 사용합니다. 심벌 폭은 캔버스의 약 60%입니다. 전체 시작 화면 PNG는 별도 시안으로, 다양한 화면 비율에는 중앙 정렬과 하단 WordnCode의 안전 여백을 유지합니다.

## 재생성

저장소 루트에서 실행합니다. Pillow가 필요하며 모든 출력은 이 폴더에만 저장합니다.

```sh
python3 resource/brand/render.py
# 다른 운영체제 또는 Pretendard Bold 사용 시
python3 resource/brand/render.py --font /path/to/Pretendard-Bold.ttf
```

동일한 좌표로 SVG와 Pillow 도형을 만들고, PNG는 3배 해상도에서 그린 뒤 LANCZOS로 축소합니다. 실행 마지막에 PNG 8개의 크기·모드와 adaptive 안전 영역을 검사합니다. SVG 문구는 사용 환경의 설치 폰트에 따라 미세하게 달라질 수 있습니다.
