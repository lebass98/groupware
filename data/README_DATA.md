# 📁 데이터 구조 및 Firestore 시딩 가이드

이 문서는 WnC 그룹웨어의 **데이터가 어디에 있고, 어떻게 Firestore로 올라가는지**를 설명합니다.

---

## 1. 단일 원본 원칙

데이터 원본은 **`data/mockData.js` 하나뿐**입니다. 다른 곳에 사본을 만들지 않습니다.

```
data/mockData.js            ← 단일 원본. 데이터 수정은 언제나 여기서.
      │
      │ npm run build:seed        (자동 생성)
      ▼
data/firebase-seed.json     ← 생성물. 직접 수정 금지.
      │
      │ npm run verify:seed       (업로드 전 점검)
      │ firebase/seed.html        (관리자가 수동 실행)
      ▼
   Firestore
```

예전에는 `employees.json`, `notices.json` 등 독립 JSON 사본이 함께 있었지만
**앱이 읽지 않는 죽은 사본**이었고 실제로 시드가 낡는 원인이 되었습니다.
지금은 `data/_legacy/`로 옮겨 두었습니다([사유](_legacy/README.md)).

> ⚠️ **`firebase-seed.json`을 손으로 고치지 마십시오.**
> 다음 `npm run build:seed` 실행 때 덮어써집니다. 항상 `mockData.js`를 고치십시오.

---

## 2. 명령어

| 명령 | 하는 일 |
| :--- | :--- |
| `npm run build:seed` | `mockData.js` → `firebase-seed.json` 생성 (`members` 명부 자동 파생 포함) |
| `npm run check:seed` | 시드가 최신인지만 검사. 파일을 쓰지 않음 |
| `npm run verify:seed` | **업로드 전 종합 점검.** 아래 6가지를 확인 |

`verify:seed` 점검 항목:

1. 시드가 `mockData.js`와 일치하는가
2. 시더가 쓰는 컬렉션이 모두 `firestore.rules`에 열려 있는가 *(가장 중요)*
3. 시더 SPEC이 참조하는 키가 시드에 존재하는가
4. 문서 ID로 쓸 값에 누락·중복이 없는가 *(중복은 데이터 유실로 이어짐)*
5. `members` 접근 명부가 비어 있지 않은가
6. 예상 업로드 문서 수 (무료 할당량 판단)

**2번이 핵심입니다.** 시더와 보안 규칙은 서로 다른 파일이라 한쪽만 고치면
조용히 어긋나고, 업로드 도중에야 `permission-denied`로 터집니다.

---

## 3. Firestore 컬렉션 구조

업로드 대상은 `data/firebase-seeder.js`의 `SPEC` 표에 선언되어 있습니다.
**`SPEC`에 컬렉션을 추가하면 `firestore.rules`에도 반드시 함께 추가해야 합니다.**

| 컬렉션 | 문서 ID | 원본 키 | 내용 |
| :--- | :--- | :--- | :--- |
| `employees` | 임직원 id | `employees` | 임직원 21명 (이름·부서·직급·연락처·이메일·아바타) |
| `members` | 이메일 | *(파생)* | **접근 명부.** 보안 규칙이 임직원 여부를 판별하는 근거 |
| `notices` | 공지 id | `notices` | 사내 공지사항 |
| `todos` | 할일 id | `todos` | 할 일 목록 |
| `trashed_todos` | 할일 id | `trashedTodos` | 할 일 휴지통 |
| `projects` | 프로젝트 id | `projects` | 프로젝트 현황 |
| `notifications` | 알림 id | `notifications` | 알림 목록 |
| `work_reports` | 보고 id | `workReports` | 주간 업무 보고 |
| `daily_work_reports` | 보고 id | `dailyWorkReports` | 일일 업무 보고 |
| `team_work_reports` | 보고 id | `teamWorkReports` | 팀 업무 보고 |
| `schedules` | `YYYY-M-D` | `schedules` | 날짜별 일정 |
| `calendar` | `observances` / `solarTerms` | 동일 | 기념일 36건 / 24절기 |
| `attendance` | `config` | `attendance` | 본사 GPS 좌표 및 인증 반경 |
| `finance` | `expenses` | `finance` | 법인/개인카드 경비 내역 |
| `meta` | `recentProjects` | `recentProjects` | 최근 프로젝트 목록 |

현재 규모: **약 140문서** (Firestore 무료 한도 일 2만 쓰기 대비 충분)

### `members` 접근 명부가 중요한 이유

`firestore.rules`의 `isMember()`가 이 명부를 조회해 접근을 판별합니다.

```
members에 내 이메일이 없다 → 로그인에 성공해도 어떤 데이터도 못 읽음
```

`build-seed.js`가 주소록의 `email` 필드에서 자동으로 만듭니다.
이메일이 없는 임직원은 명부에서 빠지므로 `verify:seed`가 경고합니다.

겸직(동일 이메일이 여러 직책)은 이메일이 문서 ID라 자동 병합되며,
부차 직책은 `alsoKnownAs` 배열에 보존됩니다.
현재 김종규(기획팀 팀장 / 수행본부 본부장) 1건이 해당합니다.

---

## 4. 업로드 절차

```bash
npm run build:seed     # 1. 최신 데이터로 시드 생성
npm run verify:seed    # 2. 점검 — 통과해야 다음 단계로
```

3. Firebase 콘솔 → Firestore → **규칙** 탭에 `firestore.rules` 내용을 붙여넣고 게시
4. Firebase 콘솔 → Firestore → **데이터** 탭에서 `admins/{내 UID}` 문서 생성
   (관리자만 마스터 데이터를 쓸 수 있습니다)
5. `firebase/seed.html`을 브라우저로 열어 관리자 계정으로 로그인 후 실행

> 순서가 중요합니다. 3번(규칙 게시)과 4번(관리자 지정)을 건너뛰면
> 5번에서 `permission-denied`로 실패합니다.

---

## 5. 지금 시딩해도 앱은 달라지지 않습니다

**중요한 사실입니다.** 현재 `script.js` / `pc.js`에는
Firestore 컬렉션을 읽는 코드가 없습니다. 앱이 쓰는 Firestore 경로는
`users/{uid}` 개인 상태 문서 **하나뿐**입니다.

| 구분 | 저장 위치 | 상태 |
| :--- | :--- | :--- |
| 개인 상태 (근태·할일·연차·경비·결재·설정) | `users/{uid}` | ✅ 실시간 동기화 작동 중 |
| 전사 콘텐츠 (주소록·공지·일정·보고서·알림) | `mockData.js` | ⬜ 하드코딩. Firestore 미사용 |

따라서 시딩은 **데이터를 클라우드에 준비해 두는 단계**이며,
화면에 반영하려면 별도로 **로더 구현**이 필요합니다.

로더를 붙일 때 유의할 점:

- `mockData.js`는 `<script>`로 **동기 로드**되고, `script.js` 34곳 · `pc.js` 26곳이
  `window.MockData`가 이미 존재한다는 전제로 작성되어 있습니다.
  Firestore 조회는 비동기라 렌더링 시점 조정이 필요합니다.
- `mockData.js`를 **폴백으로 남겨야** 오프라인·네트워크 실패 시에도 앱이 동작합니다.
- 현재 `firebase/config.js`의 `requireAuth: false`라 미인증 사용자는 데모 모드로 들어옵니다.
  이 상태에서는 인증 토큰이 없어 Firestore 읽기가 전부 거부되므로,
  로더 도입 전에 `members` 시딩과 `requireAuth: true` 전환이 선행되어야 합니다.
