---
name: groupware-ui-system
description: >-
  WnC 그룹웨어의 UI/UX 디자인 시스템, Glassmorphism & Bento Grid 레이아웃,
  Tailwind CSS 테마 토큰, 모바일 및 Galaxy Fold 7 반응형 뷰포트 규격,
  그리고 웹폰트 사용을 전면 금지하고 100% 인라인 SVG 벡터 아이콘만을 사용하는 표준 구현 가이드입니다.
---

# WnC 그룹웨어 UI & 디자인 시스템 가이드

## 1. 핵심 디자인 철학 및 원칙

- **Glassmorphism & Bento Grid**: 부드러운 글래스모피즘 블러 효과(`backdrop-blur-md`, 반투명 배경)와 벤토 그리드 카드 UI를 결합하여 프리미엄 엔터프라이즈 모바일 UX 제공.
- **Material 3 (M3) 컬러 팔레트**:
  - `primary`: `#0052D0` (WnC 시그니처 블루)
  - `primary-container`: `#D9E2FF` / `on-primary`: `#FFFFFF`
  - `surface-container-lowest`: `#FFFFFF`
  - `surface-container-low`: `#F3F4F8`
  - `surface-container`: `#EDEEF3`
  - `surface-container-highest`: `#E2E2E8`
  - `on-surface`: `#191C20` / `on-surface-variant`: `#44474F`
  - `outline`: `#74777F` / `outline-variant`: `#C4C6D0`
- **타이포그래피**: 고선명 `Pretendard`, sans-serif 폰트 패밀리 적용 (`font-headline`, `font-body`, `font-label`).

---

## 2. 아이콘 구현 원칙 (★ 절대 준수 규칙)

> [!IMPORTANT]
> **Material Symbols 웹폰트(`<span class="material-symbols-outlined">`) 절대 사용 금지**
> 모든 아이콘은 **100% 인라인 SVG 벡터 태그** 또는 `data/svgIcons.js`의 `getSvgIcon()` 헬퍼를 통해 구현해야 합니다.

### 올바른 인라인 SVG 마크업 예시
```html
<!-- 표준 24x24 인라인 SVG 아이콘 -->
<svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
</svg>
```

### 동적 JS 렌더링 시 `getSvgIcon()` 헬퍼 사용
```javascript
// data/svgIcons.js 연동
const iconHtml = getSvgIcon('notifications', 'w-5 h-5 text-primary');
```

### SVG 크기 오버플로우 방지 규칙
1. 모든 SVG에는 반드시 Tailwind 크기 클래스(`w-4 h-4`, `w-5 h-5`, `w-6 h-6` 등)와 함께 `shrink-0`를 적용합니다.
2. `tailwind.config`에 `spacing: { '4.5': '1.125rem', '5.5': '1.375rem' }`가 등록되어 있어 `w-4.5` 등의 클래스도 안전하게 사용 가능합니다.
3. `style.css`의 전역 SVG 리셋 규칙:
   ```css
   svg {
     display: inline-block;
     vertical-align: middle;
     flex-shrink: 0;
     max-width: 100%;
   }
   ```

---

## 3. 검색창 및 인풋 폼 표준 디자인 규격

모든 화면의 검색창(공지사항, 주소록, 할 일 관리, 프로젝트 관리, 팝업 모달)은 아래 표준 디자인을 100% 동일하게 적용합니다.

```html
<div class="relative w-full">
  <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
  <input class="w-full bg-surface-container-highest rounded-xl py-3.5 pl-12 pr-4 text-sm font-body border-2 border-transparent transition-all duration-300 placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest" placeholder="검색어 입력..." type="text"/>
</div>
```

---

## 4. 하단 고정 독 네비게이션 (Glassmorphism Dock)

하단 독은 5개의 핵심 탭으로 구성되며 활성 상태에 따라 `active` 클래스가 토글됩니다.

1. **메뉴 (`screen-home`)**: `grid_view`
2. **투데이 (`screen-today`)**: `today`
3. **주소록 (`screen-directory`)**: `contact_page`
4. **공지사항 (`screen-notice-list`)**: `notifications` (알림 벨)
5. **내 정보 (`screen-profile`)**: `person`

---

## 5. 반응형 뷰포트 & 폴더블 최적화

- 최상위 컨테이너: `max-w-[768px] mx-auto min-h-screen relative`
- 모바일 세로 모드 및 Galaxy Fold 7 / 태블릿 화면에서 중앙 정렬 및 최적 가독성 폭 유지
- 하단 고정 독 네비게이션 여백 확보를 위해 각 메인 뷰에 `pb-24` 또는 `pb-28` 패딩 적용

---

## 6. PC 메인 대시보드 위젯(Widget) 명칭 체계

PC 메인 대시보드에 배치된 모든 개별 카드 컴포넌트는 **'위젯(Widget)'**으로 공식 명칭을 통일하여 정의하고 관리합니다.

1. **좌측 열 (1열)**:
   - `프로필 위젯` (`#pc-widget-profile`)
   - `연차/휴가 현황 위젯` (`#pc-widget-leave`)
   - `생일자 위젯` (`#pc-widget-birthday`)
2. **상단 Full-Span (2열+3열 통합)**:
   - `전체 일정표 위젯` (`#pc-widget-calendar`)
3. **하단 서브 그리드 (2열)**:
   - `공지사항 위젯` (`#pc-widget-notice-banner`)
   - `주간 업무 보고 위젯` (`#pc-widget-work-report`)
   - `오늘의 일정 위젯` (`#pc-widget-today-schedule`)
4. **하단 서브 그리드 (3열)**:
   - `근태 & 출/퇴근 위젯` (`#pc-widget-commute`)
   - `Quick Action (퀵메뉴) 위젯` (`#pc-widget-quick-menu`)
   - `To-Do List (할 일) 위젯` (`#pc-widget-todo`)

