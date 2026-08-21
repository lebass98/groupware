---
name: groupware-data-architecture
description: >-
  WnC 그룹웨어의 데이터 아키텍처 및 MockData 모듈 명세, 임직원 21명 마스터 데이터 동기화 규칙,
  동적 날짜 기반 실시간 일정 매핑 알고리즘, 그리고 Google Firebase Firestore 연동 스키마 가이드입니다.
---

# WnC 그룹웨어 데이터 아키텍처 & 데이터 연동 가이드

## 1. 데이터 모듈 구조 (`data/`)

모든 비즈니스 데이터는 UI 렌더링 로직(`script.js`)과 분리되어 `data/` 디렉터리 내 독립 모듈로 관리됩니다.

```
data/
├── mockData.js           # 전사 통합 목업 데이터 객체 (window.MockData)
├── svgIcons.js           # 75종+ 인라인 SVG 패스 및 헬퍼 딕셔너리
├── employees.json        # 임직원 21명 마스터 데이터
├── notices.json          # 사내 공지사항 데이터
├── todos.json            # 할 일 및 태스크 데이터
├── projects.json         # 전사 10대 프로젝트 관리 데이터
├── schedules.json        # 캘린더 일정 맵 (YYYY-M-D)
├── holidays.json         # 공휴일 / 절기 / 기념일 데이터
├── attendance_logs.json  # 근태 및 출퇴근 기록
├── finance.json          # 경비 청구 및 결재 데이터
└── firebase-seed.json    # Firestore 초기 마이그레이션 시드 데이터
```

---

## 2. 임직원 21명 마스터 데이터 동기화 원칙 (★ 핵심)

전사 모든 모듈(공지사항 작성자, 프로젝트 PM/담당자, 할 일 배정자, 캘린더 참석자, 결재선)은 아래 **21명 주소록 마스터 데이터**를 기준으로 성명, 부서, 직급을 100% 일치시켜야 합니다.

| ID | 성명 | 부서 | 직급 | 이메일 | 전화번호 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 김경현 | 경영지원팀 | 대표 | abc@wordncode.com | 010-8885-5177 |
| 2 | 오은주 | 경영지원팀 | 차장 | sky@wordncode.com | 010-3712-7932 |
| 3 | 김종규 | 기획팀 | 팀장 | john@wordncode.com | 010-4781-7808 |
| 4 | 박규태 | 기획팀 | 대리 | green@wordncode.com | 010-3230-1573 |
| 5 | 한상희 | 기획팀 | 사원 | star@wordncode.com | 010-2635-9110 |
| 6 | 장현아 | 기획팀 | 수습 | you@wordncode.com | 010-4562-3633 |
| 7 | 윤익수 | 디자인팀 | 부장 | blue@wordncode.com | 010-2707-5681 |
| 8 | 최지영 | 디자인팀 | 과장 | white@wordncode.com | 010-8632-0944 |
| 9 | 신현우 | 디자인팀 | 주임 | pink@wordncode.com | 010-8337-0176 |
| 10 | 명희진 | 디자인팀 | 주임 | gray@wordncode.com | 010-2607-5235 |
| 11 | 이재광 | 퍼블리싱팀 | 차장 | yellow@wordncode.com | 010-5244-1251 |
| 12 | 조지혜 | 퍼블리싱팀 | 과장 | red@wordncode.com | 010-2362-0263 |
| 13 | 손석호 | 퍼블리싱팀 | 주임 | pub@wordncode.com | 010-6565-4215 |
| 14 | 최우석 | 개발팀 | 과장 | mobile@wordncode.com | 010-2887-1810 |
| 15 | 안영재 | 개발팀 | 대리 | pro@wordncode.com | 010-9776-1309 |
| 16 | 곽재훈 | 개발팀 | 대리 | spring@wordncode.com | 010-8479-8729 |
| 17 | 유종현 | 개발팀 | 주임 | jsp@wordncode.com | 010-7455-4047 |
| 18 | 남기현 | 전략본부 | 본부장 | help@wordncode.com | 010-5578-9436 |
| 19 | 윤진성 | 전략본부 | 과장 | apple@wordncode.com | 010-2889-3274 |
| 20 | 김종규 | 수행본부 | 본부장 | john@wordncode.com | 010-4781-7808 |
| 21 | 이채원 | 수행본부 | 사원 | cool@wordncode.com | 010-3533-1662 |

---

## 3. 동적 날짜 계산 & 실시간 캘린더 매핑 알고리즘

주소록 목록 및 상세 보기의 예정 뱃지(`[예정 : ...]`)는 하드코딩 날짜를 사용하지 않고, 반드시 **현재 실제 날짜(`new Date()`)**를 기준으로 캘린더 일정을 조회해야 합니다.

```javascript
// script.js 내 getEmployeeStatusInfo(emp) 구현 규격
const now = new Date();
const curYear = now.getFullYear();
const curMonth = now.getMonth() + 1;
const curDay = now.getDate();
const todayKey = `${curYear}-${curMonth}-${curDay}`; // e.g. "2026-8-21"

if (window.MockData && window.MockData.schedules) {
  const todayList = window.MockData.schedules[todayKey] || [];
  const match = todayList.find(s => s.author && s.author.includes(emp.name));
  if (match) {
    rawSched = match.title; // e.g. "반차(오후)", "외근"
  }
}
```

---

## 4. Firebase Firestore 마이그레이션 스키마 규격

추후 클라우드 백엔드 연동 시 아래 Firestore 컬렉션 구조로 1:1 전환됩니다.

- `users/{userId}`: 사용자 프로필, 부서, 직급, 근무 상태
- `notices/{noticeId}`: 공지사항 제목, 내용, 작성자, 첨부파일 메타데이터
- `todos/{todoId}`: 할 일 제목, 상태, 마감일, 배정자 배열(`assignees`)
- `projects/{projectId}`: 프로젝트명, 고객사, PM, 상태, 기간
- `schedules/{dateKey}/events/{eventId}`: 날짜별 일정 목록
- `attendance/{userId}/logs/{logId}`: 일자별 출퇴근 타임스탬프 및 위치
