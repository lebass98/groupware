# 워드앤코드 스마트 그룹웨어 디자인 가이드 (DESIGN.md)

> 워드앤코드(WordnCode) 스마트 그룹웨어 플랫폼의 통합 UI/UX 디자인 시스템, 컬러 토큰, 타이포그래피, 공통 레이아웃 프레임 및 컴포넌트 설계 명세서입니다.

---

## 1. 디자인 철학 및 아키텍처 (Design Philosophy)

본 그룹웨어 시스템은 **Material Design 3 (M3)** 명세를 기반으로 모바일 및 태블릿(768px 너비) 환경에서 최상의 가독성과 직관적인 가치 전달을 목표로 설계되었습니다.

1. **The "No-Line" Rule (경계선 없는 톤 레이어링)**:
   - 인위적인 1px 테두리 선(Border) 대신, Surface 배경의 명암 및 톤 차이(Tonal Surface Layering)를 통해 컨테이너와 구획을 자연스럽게 구분합니다.
2. **Glassmorphism (글래스모피즘)**:
   - 상단 헤더, 공지 티커, 하단 네비게이션 바 등 고정(Fixed) 요소에 `backdrop-filter: blur(20px)` 및 반투명 배경을 적용하여 스크롤 시 깊이감(Depth)을 부여합니다.
3. **모바일-태블릿 퍼스트 768px 반응형 체계**:
   - Galaxy Fold 7, 모바일, 태블릿, PC 브라우저 창 768px 너비까지 1:1 대칭 비율로 일치하도록 프레임 레이아웃을 통일하였습니다.

---

## 2. 컬러 토큰 시스템 (Color Token System)

### 2.1 메인 컬러 토큰 (Default & Dark Mode)

| 토큰명 | 라이트 모드 (Light) | 다크 모드 (Dark) | 설명 / 용도 |
| :--- | :--- | :--- | :--- |
| `--primary` | `#0052d0` | `#5e8bff` | 메인 브랜드 브라이트 블루 / 주요 버튼 및 강조 |
| `--primary-dim` | `#0047b7` | `#3a6ede` | Primary 눌림(Active) / 딥 블루 |
| `--primary-container` | `#799dff` | `#1b3b8c` | 컨테이너 하이라이트 배경 |
| `--on-primary` | `#f1f2ff` | `#ffffff` | Primary 요소 전경 텍스트 |
| `--secondary` | `#00693f` | `#27d085` | 에메랄드 그린 / 출근 및 성공 상태 |
| `--secondary-container`| `#61fbab` | `#004d2e` | 성공 상태 배경 배지 |
| `--tertiary` | `#785500` | `#ecaa00` | 앰버 골드 / 주의, 필독 배지 |
| `--surface` | `#ffffff` | `#0b1120` | 기본 앱 뷰포트 바탕색 (Slate Black) |
| `--surface-container-low`| `#f8fafc` | `#1e293b` | 1단계 카드 배경 |
| `--surface-container` | `#f1f5f9` | `#334155` | 2단계 칩/입력 필드 배경 |
| `--surface-container-high`| `#e2e8f0` | `#475569` | 3단계 선택 박스 및 버튼 |
| `--surface-container-lowest`| `#ffffff` | `#151f32` | 고대비 카드/모달 최상위 배경 |
| `--on-surface` | `#232c51` | `#f1f5f9` | 본문 메인 타이포 텍스트 색상 |
| `--on-surface-variant`| `#515981` | `#94a3b8` | 서브 타이포, 라벨, 캡션 텍스트 |
| `--outline` | `#6c759e` | `#64748b` | 디바이더 및 보조 라인 |
| `--error` | `#b31b25` | `#ff6b6b` | 경고, 퇴근, 삭제 에러 컬러 |

---

### 2.2 동적 6종 테마 팔레트 (Dynamic Theme Palette)

상단 헤더의 팔레트 버튼을 통해 실시간 적용 가능한 메인 포인트 컬러 토큰 세트입니다.

1. **Professional Blue (기본)**: `#0052d0` (신뢰감 높은 글로벌 테크 블루)
2. **Emerald Green**: `#00693f` (생동감 있는 친환경 숲 테마)
3. **Royal Violet**: `#6200ee` (세련된 세미 다이나믹 바이올렛)
4. **Coral Pink**: `#e91e63` (트렌디하고 감각적인 코랄 핑크)
5. **Deep Indigo**: `#3f51b5` (차분하고 안정적인 인디고)
6. **Warm Amber**: `#d97706` (따뜻하고 따사로운 앰버)

---

## 3. 타이포그래피 시스템 (Typography)

| 구분 | 폰트 패밀리 (Font Family) | 가이트 체계 | 적용 요소 |
| :--- | :--- | :--- | :--- |
| **Headline** | `Pretendard`, `sans-serif` | Weight: 700, 800 / Size: 1.5rem ~ 2.25rem | 스크린 타이틀, 대형 타이머 숫자 |
| **Body** | `Pretendard`, `sans-serif` | Weight: 400, 500, 600 / Size: 0.875rem ~ 1rem | 본문 설명, 공지 내용, 입력 폼 |
| **Label / Accent**| `Pretendard`, `sans-serif` | Weight: 600, 700 / Size: 0.75rem ~ 0.85rem | 칩, 탭 라벨, 상태 배지, 숫자 카운터 |

- **Material Symbols Outlined**:
  - 기본 아이콘 크기: `24px` (소형: `16px`, 대형: `32px`~`40px`)
  - stroke weight (`wght`): 400 / filled 타입 (`FILL`): 1

---

## 4. 라운딩, 그림자 & 모션 토큰 (Elevation & Radius)

### 4.1 곡률 토큰 (Border Radius)
- `--radius-sm`: `0.75rem` (12px) - 소형 입력창, request-chip
- `--radius-md`: `1.25rem` (20px) - 일반 카드, 모달 카드, 칩 배지
- `--radius-lg`: `2.0rem` (32px) - 대형 Bento 카드, 바텀시트 상단 곡률
- `--radius-xl`: `3.0rem` (48px) - `.app-container` 데스크탑 프레임 곡률
- `--radius-full`: `9999px` - 알약(Pill) 버튼, 토스트, 아바타

### 4.2 그림자 토큰 (Box Shadow)
- `--shadow-sm`: `0 4px 12px rgba(35, 44, 81, 0.04)` - 드롭다운, 소형 카드
- `--shadow-md`: `0 8px 24px rgba(35, 44, 81, 0.06)` - Floating 버튼, 토스트
- `--shadow-lg`: `0 16px 36px rgba(0, 82, 208, 0.15)` - 팝업 모달, 하단 탭 바

---

## 5. 공통 레이아웃 프레임 명세 (Layout Architecture)

전체 애플리케이션은 768px 브레이크포인트를 기준으로 정밀하게 맞춰진 통합 구조를 가집니다.

```text
+-----------------------------------------------------------+
| .app-container (width: 100%, max-width: 768px)            |
| +-------------------------------------------------------+ |
| | .top-header (fixed, height: 56px, max-width: 768px)   | |
| +-------------------------------------------------------+ |
| | .notice-ticker (fixed, top: 56px, height: 36px)       | |
| +-------------------------------------------------------+ |
| |                                                       | |
| | .screen-view active (<main class="w-full">)           | |
| |  - screen-today / screen-home / screen-calendar 등     | |
| |                                                       | |
| +-------------------------------------------------------+ |
| | .bottom-nav (fixed, bottom: 0, max-width: 768px)      | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

1. **.app-container**:
   - `width: 100%; max-width: 768px; min-height: 100vh; position: relative;`
   - `@media (min-width: 768px)`: `margin: 20px auto; border-radius: var(--radius-xl);`
2. **.top-header (상단 고정 헤더)**:
   - `position: fixed; top: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 768px; height: 56px; z-index: 40;`
3. **.notice-ticker (플립 공지 티커)**:
   - `position: fixed; top: 56px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 768px; height: 36px; z-index: 39;`
   - `.ticker-viewport`, `.ticker-item`에 `cursor: pointer` 및 hover 색상 강조 적용.
4. **.bottom-nav (하단 고정 독 네비게이션)**:
   - `position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 768px; z-index: 50;`
   - 5개 핵심 탭: **메뉴(`screen-home`)**, **투데이(`screen-today`)**, **주소록(`screen-directory`)**, **공지사항(`screen-notice-list`)**, **내 정보(`screen-profile`)**.

---

## 6. 핵심 UI 컴포넌트 명세 (UI Components)

### 6.1 Interactive Check-In Pulse 버튼
- **구조**: `.pulse-section` > `.pulse-btn`
- **애니메이션**: 펄스 외곽 링(`pulse-ring-outer`, `pulse-ring-inner`)의 무한 핑 애니메이션.
- **인터랙션**: 클릭 시 출/퇴근 2차 Confirm 모달 팝업 띄움.

### 6.2 3단 근태일지 (Segmented Attendance Log)
- **세그먼트 제어**: `월` / `주` / `일` 캡슐 탭 전환.
- **일간 타임라인**: 08:00~18:00 세로 시각 척도 + 동적 타임라인 블록 배치.

### 6.3 재무/경비 & 품의서 카드
- **탭 구분**: 지출결의서(카드 지출 목록) ↔ 품의서(결재 신청 및 상태).
- **상태 배지**: `unresolved`(미결의 - 경고 톤) / `completed`(결의 완료 - 에메랄드 톤).

### 6.4 모달 & 바텀시트 (Modals & Bottom Sheets)
- **바텀시트 모달**: `position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 768px; border-t-radius: 2.5rem;`
- **전체화면 페이지 모달**: `z-index: 80` 이상, `max-width: 768px; height: 100%; overflow: hidden;`

---

## 7. 다크 모드 및 반응형 코드 표준 (Development Standard)

1. 모든 컬러 인라인 지정 시 CSS 전역 토큰 변수(`var(--surface)`, `var(--primary)` 등)를 최우선 사용합니다.
2. 하드코딩된 `max-w-md` (448px) 등의 중첩 제약을 자제하고 `w-full` 및 768px 컨테이너에 맞춰 정밀하게 배치합니다.
3. 고정 위치(fixed) 요소 추가 시 반드시 `left: 50%; transform: translateX(-50%); max-width: 768px; width: 100%;` 기준을 준수합니다.
