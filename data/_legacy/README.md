# data/_legacy — 사용하지 않는 과거 데이터 사본

이 폴더의 JSON 파일들은 **앱이 읽지 않습니다.** 삭제하지 않고 보관만 합니다.

## 왜 여기로 옮겼나

조사 결과 이 파일들은 `script.js`, `pc.js`, `index.html`, `pc.html`, `dev-server.js`
어디에서도 참조되지 않는 **죽은 사본**이었습니다. 실제 원본은 `data/mockData.js` 하나뿐입니다.

사본이 루트 `data/`에 함께 있으면 어느 쪽이 진짜인지 헷갈리고,
한쪽만 수정해 데이터가 어긋나는 사고가 나기 쉬워 분리했습니다.

## 옮기기 전 대조 결과

| 파일 | mockData.js와 비교 |
|---|---|
| `employees.json` | 동일 (21건) |
| `notices.json` | 동일 (6건) |
| `projects.json` | 동일 (10건) |
| `workReports.json` | 동일 (12건) |
| `schedules.json` | 동일 (28일) |
| `todos.json` | 동일 |
| `attendance_logs.json` | 동일 |
| `finance.json` | UI 필터 상태(`activeTab`·`cardFilter`·`reportFilter`)만 추가로 보유 |
| `holidays.json` | `observances`·`solarTerms`는 mockData와 동일. `nationalHolidaysFixed`·`nationalHolidays2026`은 mockData에 대응 항목이 없으나 앱이 사용하지 않음 |

**어떤 파일도 mockData.js보다 새로운 내용을 갖고 있지 않았습니다.** 즉 옮겨도 유실이 없습니다.

두 가지 예외는 의도적으로 시드에 포함하지 않았습니다.

- `finance.json`의 UI 필터 상태 — 개인 화면 설정이라 전사 마스터 데이터가 아닙니다.
  이 값은 이미 `users/{uid}` 개인 상태 문서로 기기 간 동기화됩니다.
- `holidays.json`의 `nationalHolidays*` — 공휴일은 현재 `schedules`에 `공휴일` 배지로 들어 있어
  별도 목록이 필요 없습니다.

## 지금의 데이터 흐름

```
data/mockData.js  ← 단일 원본. 데이터 수정은 항상 여기서.
      │
      │ npm run build:seed
      ▼
data/firebase-seed.json  ← 자동 생성물. 직접 수정 금지.
      │
      │ firebase/seed.html (관리자 수동 실행)
      ▼
   Firestore
```

## 이 파일들을 지워도 되나

앱 동작에는 지장이 없습니다. 다만 과거 데이터 이력이라 당장 지울 이유도 없어 보관합니다.
정리를 원하시면 폴더째 삭제해도 무방합니다.
