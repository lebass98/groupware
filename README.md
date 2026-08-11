# 📱 Fluid Attendant (유동 출결 관리 시스템)

> Google Stitch 디자인 시스템 사양(**Project #11493204596936626116**)을 기반으로 제작된 모바일 퍼스트 프론트엔드 유동 출결(출퇴근) 관리 웹 애플리케이션입니다.

![Fluid Attendant Banner](https://img.shields.io/badge/Design-Stitch_Material_3-0052d0?style=for-the-badge&logo=google)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-SPA-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-222222?style=for-the-badge&logo=github)

---

## 🌟 라이브 데모 (Live Demo)

- 🌐 **GitHub Pages 배포 주소**: [https://lebass98.github.io/groupware/](https://lebass98.github.io/groupware/)

---

## 🚀 주요 기능 (Key Features)

### 1. 🔒 독립적인 로그인 화면 (Login Screen)
- 앱 진입 시 헤더 및 하단 네비게이션이 숨겨진 **독립적 로그인 카드**만 단독 표시
- 이메일/비밀번호 로그인 Form
- **원클릭 데모 로그인** 버튼 및 **Google**, **Naver** 소셜 로그인 UI 지원
- 로그인 성공 시 상단 헤더, 하단 네비게이션 및 메인 출결 관리 화면으로 매끄럽게 전환

### 2. ⏱️ 실시간 출퇴근 관리 홈 (Check-In Home)
- **라이브 시계 & 동적 인사말**: 1초 단위 실시간 시계, 오전/오후 및 한국어 날짜 자동 갱신
- **Bento 스타일 상태 카드**: "아직 출근 전입니다" ↔ "현재 근무 중입니다" 상태 직관적 시각화
- **Interactive Check-In Pulse 버튼**:
  - 대형 원형 펄스(Ripple) 애니메이션 버튼으로 출근/퇴근 토글
  - **출근/퇴근 2차 확인 모달 (Confirm Dialog)**: 버튼 클릭 시 실수 방지를 위한 **[확인 / 취소]** 팝업 모달 제공
- **실시간 근무 시간 타이머**: 출근 시 1초 단위로 오늘 근무 시간(`HH:MM:SS`)을 자동 계산
- **GPS 위치 인증**: "서울 본사 테크 파크 B동" 등 현재 오피스 위치 표시 및 위치 갱신 기능
- **일정 & 통계 Grid**: 오늘 오전/오후 근무 일정 및 주간 평균 근무시간 통계

### 3. 📊 출석 기록 관리 (Attendance Logs)
- **근태 요약 카드**: 이번 주 총 근무시간("38시간 45분") 및 근태 점수("98%") 요약
- **기간별 필터링**: `전체`, `이번 주`, `이번 달` 탭 버튼으로 간편한 조회
- **상세 기록 리스트**: 날짜별 출근/퇴근 시각, 총 근무 시간, 재택/연차/정상 상태 바이브 지표 표시
- **수동 근태/휴가 신청 모달**: 연차, 반차, 외근, 재택 근무 수동 신청 및 사유 제출

### 4. 👤 사용자 프로필 & 설정 (User Profile)
- **히어로 프로필 바**: 사용자 이름, 직책(시니어 운영 관리자), 사번(FA-99283), 근무 상태 태그
- **야간 모드 (Dark Theme)**: 다크 모드 토글 스위치 지원 (어두운 환경에서 눈의 피로 감소)
- **알림 & GPS 자동 체크인**: 알림 핑 수신 및 반경 100m 자동 체크인 설정 토글
- **로그아웃**: 원클릭 로그아웃 처리 후 초기 로그인 화면으로 복귀

### 5. 💾 상태 지속성 (LocalStorage Integration)
- 출퇴근 상태, 출근 시각, 수동 신청 기록, 다크 모드 설정 등이 브라우저 `LocalStorage`에 자동 저장되어 페이지 새로고침 시에도 기존 데이터가 안전하게 유지됩니다.

---

## 🎨 디자인 사양 (Design Architecture)

Stitch **"The Fluid Attendant"** 전략 가이드라인을 100% 준수하여 디자인되었습니다:

- **Color Palette**:
  - `Primary`: `#0052d0` (Professional Blue)
  - `Primary Container`: `#799dff`
  - `Surface Base`: `#f7f5ff` (Soft Alabaster Gray)
  - `Secondary (Status)`: `#00693f` (Emerald Green Dot)
  - `Dark Surface`: `#0b1120` (Slate Dark Mode)
- **Typography**: `Pretendard`, `Plus Jakarta Sans`, `Manrope` 폰트 혼용으로 가독성 및 권위 극대화
- **The "No-Line" Rule**: 1px 테두리 선을 지양하고 Surface 배경 명암 차이(Tonal Layering)로 컨테이너 구획
- **Glassmorphism**: 상단 헤더 및 하단 네비게이션 바에 `backdrop-filter: blur(20px)` 적용

---

## 📂 프로젝트 구조 (Directory Structure)

```text
Pool/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포 CI/CD 워크플로우
├── index.html                  # 앱 전체 SPA 레이아웃 및 4대 화면 구조
├── style.css                   # Stitch 디자인 토큰, 애니메이션, 다크모드 CSS
├── script.js                   # SPA 상태 관리, 타이머, 모달, LocalStorage 엔진
├── .gitignore                  # 불필요한 OS 및 임시 파일 제외
└── README.md                   # 프로젝트 상세 한글 설명서
```

---

## 🛠️ 로컬 실행 방법 (Local Setup)

별도의 패키지 설치 없이 표준 웹 브라우저에서 바로 실행이 가능합니다.

1. **리포지토리 클론**:
   ```bash
   git clone https://github.com/lebass98/groupware.git
   cd groupware
   ```

2. **로컬 웹 서버 실행** (택1):
   - **Python 사용 시**:
     ```bash
     python3 -m http.server 8089
     ```
     브라우저에서 `http://localhost:8089` 접속
   - **VS Code 사용 시**:
     `index.html` 우클릭 후 `Live Server로 열기` 클릭

---

## 🔄 CI/CD 자동 배포 (GitHub Actions)

본 프로젝트는 `.github/workflows/deploy.yml` 설정을 포함하고 있어, `main` 브랜치에 신규 코드가 Push되면 **GitHub Actions**가 자동으로 빌드하여 **GitHub Pages**로 실시간 배포합니다.

- **GitHub Pages 활성화 방법**:
  1. GitHub 저장소의 `Settings` > `Pages` 이동
  2. `Source` 항목을 **GitHub Actions**로 지정
