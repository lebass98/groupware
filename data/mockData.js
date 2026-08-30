/**
 * WnC 그룹웨어 통합 목업 데이터 모듈
 * 
 * 모든 비즈니스 데이터(임직원, 공지사항, 할일, 일정, 공휴일/절기/기념일, 근태, 경비)를 
 * script.js 로직 코드와 완전 분리하여 독립 관리합니다.
 * 추후 구글 Firebase Firestore 연동 시 이 객체의 바인딩을 Firestore API로 전환하면 됩니다.
 */

window.MockData = {
  // 1. 임직원 주소록
  employees: [
    { id: 1, name: "김경현", dept: "경영지원팀", role: "대표", phone: "010-8885-5177", tel: "070-7711-4823", email: "abc@wordncode.com", avatar: "./resource/image/profile_abc.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 2, name: "오은주", dept: "경영지원팀", role: "차장", phone: "010-3712-7932", tel: "070-7711-4819", email: "sky@wordncode.com", avatar: "./resource/image/profile_sky.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 3, name: "김종규", dept: "기획팀", role: "팀장", phone: "010-4781-7808", tel: "070-8805-1647", email: "john@wordncode.com", avatar: "./resource/image/profile_john.png", status: "business", statusText: "외근중", todaySchedule: "외근", location: "한국건강가정진흥원" },
    { id: 4, name: "박규태", dept: "기획팀", role: "대리", phone: "010-3230-1573", tel: "070-8805-1647", email: "green@wordncode.com", avatar: "./resource/image/profile_green.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 5, name: "한상희", dept: "기획팀", role: "사원", phone: "010-2635-9110", tel: "070-7711-4815", email: "star@wordncode.com", avatar: "./resource/image/profile_star_20250326.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 6, name: "장현아", dept: "기획팀", role: "수습", phone: "010-4562-3633", tel: "070-7711-4809", email: "you@wordncode.com", avatar: "./resource/image/profile_janghyunah.png", status: "business", statusText: "외근중", todaySchedule: "외근", location: "한국건강가정진흥원" },
    { id: 7, name: "윤익수", dept: "디자인팀", role: "부장", phone: "010-2707-5681", tel: "070-8805-1646", email: "blue@wordncode.com", avatar: "./resource/image/profile_blue.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 8, name: "최지영", dept: "디자인팀", role: "과장", phone: "010-8632-0944", tel: "070-7711-4821", email: "white@wordncode.com", avatar: "./resource/image/profile_white.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 9, name: "신현우", dept: "디자인팀", role: "주임", phone: "010-8337-0176", tel: "070-7711-4810", email: "pink@wordncode.com", avatar: "./resource/image/profile_pink____________.png", status: "offwork", statusText: "퇴근", todaySchedule: "", location: "" },
    { id: 10, name: "명희진", dept: "디자인팀", role: "주임", phone: "010-2607-5235", tel: "070-7711-4812", email: "gray@wordncode.com", avatar: "./resource/image/profile_gray_20240502__.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 11, name: "이재광", dept: "퍼블리싱팀", role: "팀장", phone: "010-5244-1251", tel: "070-7711-4808", email: "yellow@wordncode.com", avatar: "profile.png", status: "work", statusText: "근무중", todaySchedule: "", location: "", isBirthdayThisMonth: true, birthday: "08.21" },
    { id: 12, name: "조지혜", dept: "퍼블리싱팀", role: "과장", phone: "010-2362-0263", tel: "070-7711-4806", email: "red@wordncode.com", avatar: "./resource/image/profile_red_20260602.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 13, name: "손석호", dept: "퍼블리싱팀", role: "주임", phone: "010-6565-4215", tel: "070-7711-4811", email: "pub@wordncode.com", avatar: "./resource/image/profile_pub.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 14, name: "최우석", dept: "개발팀", role: "과장", phone: "010-2887-1810", tel: "070-8805-1648", email: "mobile@wordncode.com", avatar: "./resource/image/profile_mobile.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 15, name: "안영재", dept: "개발팀", role: "대리", phone: "010-9776-1309", tel: "070-7711-4805", email: "pro@wordncode.com", avatar: "./resource/image/profile_pro.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 16, name: "곽재훈", dept: "개발팀", role: "대리", phone: "010-8479-8729", tel: "070-7711-1653", email: "spring@wordncode.com", avatar: "./resource/image/profile_spring.png", status: "offwork", statusText: "퇴근", todaySchedule: "", location: "" },
    { id: 17, name: "유종현", dept: "개발팀", role: "주임", phone: "010-7455-4047", tel: "070-7711-4820", email: "jsp@wordncode.com", avatar: "./resource/image/profile_jsp.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 18, name: "남기현", dept: "전략본부", role: "본부장", phone: "010-5578-9436", tel: "070-7711-4804", email: "help@wordncode.com", avatar: "./resource/image/profile_help.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 19, name: "윤진성", dept: "전략본부", role: "과장", phone: "010-2889-3274", tel: "070-7711-4822", email: "apple@wordncode.com", avatar: "./resource/image/profile_apple_20250611.png", status: "business", statusText: "외근중", todaySchedule: "외근", location: "한가원" },
    { id: 20, name: "김종규", dept: "수행본부", role: "본부장", phone: "010-4781-7808", tel: "070-8805-1647", email: "john@wordncode.com", avatar: "./resource/image/profile_john_.png", status: "work", statusText: "근무중", todaySchedule: "", location: "" },
    { id: 21, name: "이채원", dept: "수행본부", role: "사원", phone: "010-3533-1662", tel: "070-4210-6134", email: "cool@wordncode.com", avatar: "./resource/image/profile_cool_20241224_lee.png", status: "business", statusText: "외근중", todaySchedule: "외근", location: "한국건강가정진흥원" }
  ],

  // 2. 공지사항
  notices: [
    {
      id: 1,
      title: '2024년 하반기 워크샵 일정 안내',
      category: '인사',
      date: '2024.10.24',
      isPinned: true,
      isNew: true,
      author: '경영지원팀 오은주 차장',
      summary: '2024년 하반기 워크샵 일정을 아래와 같이 안내합니다.',
      content: `<p class="mb-3">안녕하십니까, 임직원 여러분.</p><p class="mb-3">2024년도 하반기 워크샵 일정을 아래와 같이 안내드리오니, 부서별 일정을 확인하시어 준비해 주시기 바랍니다. 소통과 단합을 위한 다양하고 유익한 프로그램이 준비되어 있습니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">워크샵 주요 일정</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li><strong>일시:</strong> 2024년 11월 14일(목) ~ 11월 15일(금) [1박 2일]</li><li><strong>장소:</strong> 강원도 속초 리조트 메인 홀</li><li><strong>참석 대상:</strong> 전 임직원</li><li><strong>집결:</strong> 사옥 전면 주차장 08:30 대형버스 탑승</li></ul></div><p>상세 안내 자료 및 세부 편성표는 첨부파일을 확인해 주시기 바랍니다. 문의사항은 인사팀으로 연락 부탁드립니다.</p>`,
      fileName: '2024_하반기_워크샵_세부안내.pdf',
      fileSize: '3.8 MB'
    },
    {
      id: 2,
      title: '임직원 건강검진 제휴 병원 추가 안내',
      category: '복지',
      date: '2024.10.22',
      isPinned: false,
      isNew: true,
      author: '경영지원팀 오은주 차장',
      summary: '2024년 임직원 종합 건강검진 신규 제휴 병원이 추가되었습니다.',
      content: `<p class="mb-3">안녕하세요, 경영지원팀입니다.</p><p class="mb-3">임직원분들의 편의 증진을 위해 2024년도 종합 건강검진 지정 제휴 병원을 추가 지정하였습니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">신규 제휴 병원 안내</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li>강남 세브란스 검진센터 (서울)</li><li>분당 서울대병원 건강증진센터 (경기)</li><li>예약 방법: 사내 복지 포털 로그인 후 온라인 신청</li></ul></div>`,
      fileName: '2024_건강검진_제휴병원_목록.pdf',
      fileSize: '1.2 MB'
    },
    {
      id: 3,
      title: '사내 네트워크 정기 점검에 따른 서비스 일시 중단',
      category: '시스템',
      date: '2024.10.20',
      isPinned: false,
      isNew: false,
      author: '개발팀 최우석 과장',
      summary: '사내 서버 네트워크 인프라 정기 점검이 진행될 예정입니다.',
      content: `<p class="mb-3">안녕하세요, 개발팀입니다.</p><p class="mb-3">안정적인 사내 그룹웨어 서비스 제공을 위한 정기 네트워크 점검 작업이 진행됩니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">작업 일시 및 영향</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li><strong>점검 시간:</strong> 2024년 10월 27일(일) 02:00 ~ 06:00 (4시간)</li><li><strong>영향 범위:</strong> 그룹웨어, 전자결재, 출퇴근 관리 서비스 접근 불가</li></ul></div>`,
      fileName: '네트워크_점검_안내.pdf',
      fileSize: '850 KB'
    },
    {
      id: 4,
      title: '10월 우수 사원 포상 결과 발표',
      category: '인사',
      date: '2024.10.15',
      isPinned: false,
      isNew: false,
      author: '경영지원팀 김경현 대표',
      summary: '10월 이달의 우수 사원 수상자를 발표합니다.',
      content: `<p class="mb-3">축하합니다!</p><p class="mb-3">10월 한 달간 뛰어난 성과와 헌신을 보여준 이달의 우수 사원 수상자를 발표합니다.</p><p class="text-xs text-on-surface-variant">수상자 분들께는 개별 소정의 포상금과 수당이 지급됩니다.</p>`,
      fileName: '10월_우수사원_수상자_명단.pdf',
      fileSize: '1.5 MB'
    },
    {
      id: 5,
      title: '사옥 주차장 이용 수칙 변경 안내',
      category: '공통',
      date: '2024.10.10',
      isPinned: false,
      isNew: false,
      author: '경영지원팀 오은주 차장',
      summary: '사옥 지하 주차장 등록 차량 주차 수칙 변경 사항입니다.',
      content: `<p class="mb-3">안녕하세요, 경영지원팀입니다.</p><p class="mb-3">사옥 주차 공간 효율화를 위해 주차등록 수칙이 일부 변경됩니다.</p>`,
      fileName: '주차장_이용수칙_안내문.pdf',
      fileSize: '920 KB'
    },
    {
      id: 6,
      title: '2024년 연말 정산 안내',
      category: '인사',
      date: '2023.12.01',
      isPinned: false,
      isNew: false,
      author: '경영지원팀 오은주 차장',
      summary: '2024년도 귀속 연말정산 일정 및 관련 제출 서류 안내입니다.',
      content: `<p class="mb-3">안녕하십니까, 임직원 여러분.</p><p class="mb-3">2024년도 귀속 연말정산 일정을 아래와 같이 안내드리오니, 기한 내에 관련 서류를 제출하여 주시기 바랍니다. 올해부터 변경되는 세법 적용 사항이 있으니 첨부된 가이드라인을 반드시 확인해주시길 부탁드립니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-semibold text-primary mb-2 text-sm">주요 일정</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li>국세청 간소화 서비스 오픈: 2024.01.15</li><li>서류 제출 마감: 2024.01.31 (수) 18:00까지</li><li>예상 환급금 조회: 2024.02.15 이후</li></ul></div><p>기타 문의사항은 인사팀(내선 1234)으로 연락 주시기 바랍니다. 감사합니다.</p>`,
      fileName: '2024_연말정산_가이드라인.pdf',
      fileSize: '2.4 MB'
    }
  ],

  // 3. 할 일 및 휴지통
  recentProjects: ['그룹웨어 고도화', '근태관리 시스템', '디자인 시스템 (M3)', '경영지원 / 재무'],
  todos: [
    {
      id: 1,
      title: 'Q3 Performance Review UI Updates',
      project: '그룹웨어 고도화',
      status: 'in_progress',
      priority: 'high',
      dueDate: '오늘, 17:00',
      assignees: [
        { name: '이재광', avatar: 'profile.png', dept: '퍼블리싱팀', role: '팀장' },
        { name: '명희진', avatar: './resource/image/profile_gray_20240502__.png', dept: '디자인팀', role: '주임' }
      ],
      isOverdue: false,
      isMine: true,
      notes: '3분기 평가 UI 디자인 시스템 반응형 레이아웃 반영'
    },
    {
      id: 2,
      title: 'API Integration for Attendance Log',
      project: '근태관리 시스템',
      status: 'todo',
      priority: 'medium',
      dueDate: '내일, 12:00',
      assignees: [
        { name: '최우석', avatar: './resource/image/profile_mobile.png', dept: '개발팀', role: '과장' },
        { name: '안영재', avatar: './resource/image/profile_pro.png', dept: '개발팀', role: '대리' }
      ],
      isOverdue: false,
      isMine: false,
      notes: '근태 기록 1초 단위 타이머 백엔드 동기화 API 연동'
    },
    {
      id: 3,
      title: 'Update Weekly Status Report Template',
      project: '경영지원 / 재무',
      status: 'done',
      priority: 'low',
      dueDate: '2026-08-12, 18:00',
      assignees: [
        { name: '이재광', avatar: 'profile.png', dept: '퍼블리싱팀', role: '팀장' }
      ],
      isOverdue: false,
      isMine: true,
      notes: '주간 보고서 신규 템플릿 마크다운 양식 가이드 전달'
    }
  ],
  trashedTodos: [
    {
      id: 101,
      title: 'Q3 Performance Review UI Updates (삭제됨)',
      project: '그룹웨어 고도화',
      status: 'draft',
      priority: 'high',
      deletedAt: '2026-08-12',
      notes: '휴지통 이동 예시 항목'
    },
    {
      id: 102,
      title: 'Finalize Q4 Marketing Assets (삭제됨)',
      project: '경영지원 / 재무',
      status: 'draft',
      priority: 'medium',
      deletedAt: '2026-08-11',
      notes: '마케팅 에셋 최종 검토 예시'
    }
  ],

  // 4. 일정 데이터맵 (YYYY-M-D)
  schedules: {
    "2026-8-3": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" }
    ],
    "2026-8-4": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "최우석 과장", avatar: "./resource/image/profile_mobile.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" }
    ],
    "2026-8-5": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "반반차 [09:00~11:00]", location: "", time: "09:00 ~ 11:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" },
      { title: "외근(오후) 건강가정진흥원 방문", location: "건강가정진흥원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-6": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(종일) API 확인 작업", location: "인천공항테크마켓", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "유종현 주임", avatar: "./resource/image/profile_jsp.png" },
      { title: "외근(오전) 주간보고", location: "한가원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" },
      { title: "연차", location: "", time: "종일", type: "error", badge: "연차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" }
    ],
    "2026-8-7": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "error", badge: "반차", author: "이재광 팀장", avatar: "profile.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "신현우 주임", avatar: "./resource/image/profile_pink____________.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오후) 비트라이스, 고양시스템 외근", location: "비트라이스 외", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-10": [
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" }
    ],
    "2026-8-11": [
      { title: "외근(오후) 수소포탈 업무 미팅", location: "한국수소연합", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(오후) 규제개선 미팅", location: "한국수소연합", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "외근(오후) 수소연합 방문", location: "수소연합", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-12": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "외근(오전) 건강가정진흥원 미팅", location: "건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) 유비디시즌 미팅", location: "유비디시즌", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) 월간회의", location: "한국건강가정진흥원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(오후) 월간회의", location: "한국건강가정진흥원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오후) 월간회의", location: "한국건강가정진흥원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오후) 월간보고", location: "한가원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" },
      { title: "연차", location: "", time: "종일", type: "error", badge: "연차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" }
    ],
    "2026-8-13": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
      { title: "외근(오전) 라마카롱소프트 미팅", location: "라마카롱 소프트", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) 퓨처누리 방문", location: "퓨처누리", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-14": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
      { title: "외근(오후) 인천공항 방문", location: "인천공항", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(종일) IDC 센터 방문", location: "인천공항테크마켓", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
      { title: "외근(오전) 프로젝트 궁리 방문", location: "프로젝트 궁리", time: "09:00 ~ 12:00", "type": "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-18": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "연차", location: "", time: "종일", type: "error", badge: "연차", author: "이재광 팀장", avatar: "profile.png" }
    ],
    "2026-8-19": [
      { title: "연차", location: "", time: "종일", type: "error", badge: "연차", author: "이재광 팀장", avatar: "profile.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "한상희 사원", avatar: "./resource/image/profile_star_20250326.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오전) 주간보고", location: "한가원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" }
    ],
    "2026-8-20": [
      { title: "연차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "외근(오후) 경성 이스엠디 미팅", location: "이스엠디", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "error", badge: "반반차", author: "이재광 팀장", avatar: "profile.png" }
    ],
    "2026-8-21": [
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오후) 지티씨큐 방문", location: "지티시큐", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" }
    ],
    "2026-8-24": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "곽재훈 대리", avatar: "./resource/image/profile_spring.png" },
      { title: "연차", location: "", time: "종일", type: "error", badge: "연차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" },
      { title: "반차(오전)", location: "", time: "09:00 ~ 13:00", type: "warning", badge: "반차", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
      { title: "반차(오후)", location: "", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" }
    ],
    "2026-8-25": [
      { title: "반차(오전)", location: "", time: "09:00 ~ 13:00", type: "warning", badge: "반차", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) 용인문화원 방문", location: "용인문화원", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-26": [
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오전) 주간회의", location: "한국건강가정진흥원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오전) 주간보고", location: "한가원", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" }
    ],
    "2026-8-27": [
      { title: "외근(종일) 업무미팅 (세종)", location: "지역고용정보네트워크", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "반반차 [16:00~18:00]", location: "", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" }
    ],
    "2026-8-28": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "최우석 과장", avatar: "./resource/image/profile_mobile.png" }
    ],
    "2026-8-31": [
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "최지영 과장", avatar: "./resource/image/profile_white.png" },
      { title: "연차", location: "", time: "종일", type: "secondary", badge: "연차", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" },
      { title: "반반차 [09:00~11:00]", location: "", time: "09:00 ~ 11:00", type: "warning", badge: "반반차", author: "신현우 주임", avatar: "./resource/image/profile_pink____________.png" }
    ]
  },

  // 5. 근태 및 출퇴근 기록
  attendance: {
    officeLocation: {
      name: "서울 금천구 벚꽃로 298",
      address: "서울특별시 금천구 벚꽃로 298 (가산동)",
      lat: 37.48120,
      lng: 126.88370,
      allowedRadiusMeters: 500
    },
    logs: [
      { id: 1, monthStr: "10월", dayNum: "24", dayName: "목요일", statusText: "출근 • 8시간 12분", statusType: "normal", checkInTimeStr: "오전 08:54", checkOutTimeStr: "오후 05:06", durationSec: 29520 },
      { id: 2, monthStr: "10월", dayNum: "23", dayName: "수요일", statusText: "출근 • 7시간 45분", statusType: "normal", checkInTimeStr: "오전 09:15", checkOutTimeStr: "오후 05:00", durationSec: 27900 },
      { id: 3, monthStr: "10월", dayNum: "22", dayName: "화요일", statusText: "재택 • 8시간 00분", statusType: "remote", checkInTimeStr: "오전 09:00", checkOutTimeStr: "오후 05:00", durationSec: 28800 },
      { id: 4, monthStr: "10월", dayNum: "21", dayName: "월요일", statusText: "출근 • 9시간 02분", statusType: "normal", checkInTimeStr: "오전 08:48", checkOutTimeStr: "오후 05:50", durationSec: 32520 },
      { id: 5, monthStr: "10월", dayNum: "18", dayName: "금요일", statusText: "연차 • 휴가", statusType: "remote", checkInTimeStr: "-", checkOutTimeStr: "-", durationSec: 28800 }
    ]
  },

  // 6. 경비 및 결재
  finance: {
    expenses: {
      corp: [
        { id: 1, type: "restaurant", date: "11. 24 (금) 12:30", title: "(주)맛있는식당 강남점", amount: 85000, status: "unresolved" },
        { id: 2, type: "taxi", date: "11. 23 (목) 20:15", title: "카카오T택시", amount: 18500, status: "unresolved" },
        { id: 3, type: "coffee", date: "11. 22 (수) 14:00", title: "스타벅스 코엑스점", amount: 21000, status: "completed" }
      ],
      personal: [
        { id: 4, type: "shopping", date: "11. 25 (토) 10:10", title: "교보문고 강남점 (도서)", amount: 34000, status: "unresolved" },
        { id: 5, type: "coffee", date: "11. 21 (화) 15:45", title: "폴바셋 가산점", amount: 6500, status: "completed" }
      ]
    }
  },

  // 7. 기념일 및 24절기 데이터
  observances: {
    "3-3": { title: "정월대보름 (납세자의 날)", name: "정월대보름" },
    "3-18": { title: "상공인의 날", name: "상공인의 날" },
    "3-27": { title: "서해수호의 날", name: "서해수호의 날" },
    "4-5": { title: "식목일 (한식)", name: "식목일" },
    "4-19": { title: "4·19 혁명 기념일", name: "4·19 혁명" },
    "4-20": { title: "장애인의 날", name: "장애인의 날" },
    "4-21": { title: "과학의 날", name: "과학의 날" },
    "4-22": { title: "정보통신의 날 (지구의 날)", name: "정보통신의 날" },
    "4-25": { title: "법의 날", name: "법의 날" },
    "5-1": { title: "근로자의 날", name: "근로자의 날" },
    "5-8": { title: "어버이날", name: "어버이날" },
    "5-15": { title: "스승의 날", name: "스승의 날" },
    "5-18": { title: "5·18 민주화운동 기념일 (성년의 날)", name: "5·18 기념일" },
    "5-20": { title: "세계인의 날", name: "세계인의 날" },
    "5-21": { title: "부부의 날", name: "부부의 날" },
    "5-31": { title: "바다의 날", name: "바다의 날" },
    "6-5": { title: "환경의 날", name: "환경의 날" },
    "6-10": { title: "6·10 민주항쟁 기념일", name: "6·10 항쟁" },
    "6-19": { title: "단오 (음력 5월 5일)", name: "단오" },
    "6-25": { title: "6·25 전쟁 일어난 날", name: "6·25 전쟁" },
    "7-15": { title: "초복", name: "초복" },
    "7-17": { title: "제헌절", name: "제헌절" },
    "7-25": { title: "중복", name: "중복" },
    "8-14": { title: "말복", name: "말복" },
    "8-19": { title: "칠석 (음력 7월 7일)", name: "칠석" },
    "10-1": { title: "국군의 날", name: "국군의 날" },
    "10-15": { title: "체육의 날", name: "체육의 날" },
    "10-21": { title: "경찰의 날", name: "경찰의 날" },
    "10-24": { title: "국제연합(UN)의 날", name: "UN의 날" },
    "10-29": { title: "지방자치의 날", name: "지방자치" },
    "11-3": { title: "학생독립운동의 날", name: "학생독립" },
    "11-9": { title: "소방의 날", name: "소방의 날" },
    "11-11": { title: "농업인의 날", name: "농업인의 날" },
    "11-17": { title: "순국선열의 날", name: "순국선열" },
    "12-5": { title: "무역의 날", name: "무역의 날" },
    "12-10": { title: "세계인권선언 기념일", name: "세계인권" }
  },
  solarTerms: {
    "1-5": { title: "소한 (小寒)", desc: "추위가 시작되는 시기" },
    "1-20": { title: "대한 (大寒)", desc: "가장 큰 추위" },
    "2-4": { title: "입춘 (立春)", desc: "봄의 시작" },
    "2-19": { title: "우수 (雨水)", desc: "눈이 녹아 비가 되고 얼음이 녹는 시기" },
    "3-5": { title: "경칩 (驚蟄)", desc: "겨울잠 자던 개구리가 깨어남" },
    "3-20": { title: "춘분 (春分)", desc: "낮과 밤의 길이가 같아짐" },
    "4-5": { title: "청명 (清明)", desc: "날씨가 맑아져 농사 준비를 하는 시기" },
    "4-20": { title: "곡우 (穀雨)", desc: "봄비가 내려 곡식이 윤택해짐" },
    "5-5": { title: "입하 (立夏)", desc: "여름의 시작" },
    "5-21": { title: "소만 (小滿)", desc: "햇살이 풍부해지고 만물이 자람" },
    "6-6": { title: "망종 (芒種)", desc: "씨뿌리기 시작하는 시기" },
    "6-21": { title: "하지 (夏至)", desc: "1년 중 낮의 길이가 가장 긴 날" },
    "7-7": { title: "소서 (小暑)", desc: "본격적인 더위의 시작" },
    "7-23": { title: "대서 (大暑)", desc: "장마가 끝나고 가장 더운 때" },
    "8-7": { title: "입추 (立秋)", desc: "가을의 시작" },
    "8-23": { title: "처서 (處暑)", desc: "더위가 가시고 선선해짐" },
    "9-8": { title: "백로 (白露)", desc: "이슬이 내리기 시작함" },
    "9-23": { title: "추분 (秋分)", desc: "낮과 밤의 길이가 같아짐" },
    "10-8": { title: "한로 (寒露)", desc: "찬 이슬이 내리기 시작함" },
    "10-23": { title: "상강 (霜降)", desc: "서리가 내리기 시작함" },
    "11-7": { title: "입동 (立冬)", desc: "겨울의 시작" },
    "11-22": { title: "소설 (小雪)", desc: "첫눈이 내리는 시기" },
    "12-7": { title: "대설 (大雪)", desc: "눈이 많이 내리는 시기" },
    "12-22": { title: "동지 (冬至)", desc: "1년 중 밤의 길이가 가장 긴 날" }
  },

  // 7. 전사 프로젝트 관리 데이터 (10개 항목)
  projects: [
    {
      id: 370,
      no: 370,
      title: "2026 한국메세나협회 문화기업업무추진비",
      projectId: "p_mecenat26",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2990",
      clientName: "한국메세나협회",
      clientId: "s_mecenat",
      siteName: "한국메세나협회 문화기업업무추진비",
      siteId: "s_mecenat26",
      bidCount: 0,
      pm: ".",
      planner: "-",
      designer: ".",
      publisher: "-",
      developer: "-",
      period: "2026-07-06 ~ 2026-08-14",
      periodStart: "2026-07-06",
      periodEnd: "2026-08-14",
      devLang: "-",
      author: "장현아",
      authorDept: "기획팀",
      authorRole: "수습",
      date: "2026-08-04",
      dateFull: "2026-08-04 15:23:43",
      views: 32,
      status: "in_progress",
      statusText: "진행 중",
      category: "문화/예술",
      clientContacts: [
        {
          label: "담당자 1",
          date: "2026-08-04",
          name: "김복진",
          position: "선임",
          tel: "02-784-0952",
          fax: "-",
          mobile: "010-5561-5580",
          email: "okjin@mecenat.or.kr"
        }
      ],
      attachments: [
        {
          name: "260804_한국메세나협회_문화기업업무추진비_사용자화면설계서_V1.30.pptx",
          size: "1.4M",
          downloads: 0,
          date: "2026-08-04 15:28:04",
          type: "pptx"
        },
        {
          name: "260804_한국메세나협회_문화기업업무추진비_관리자화면설계서_V1.20.pptx",
          size: "411.5K",
          downloads: 0,
          date: "2026-08-04 15:28:04",
          type: "pptx"
        },
        {
          name: "260813_한국메세나협회_문화기업업무추진비_사용자화면설계서_V1.40.pptx",
          size: "2.1M",
          downloads: 2,
          date: "2026-08-13 10:57:11",
          type: "pptx"
        }
      ],
      content: ".",
      comments: [
        {
          id: 1,
          author: "장현아",
          authorDept: "기획팀",
          date: "26-08-12 10:10",
          content: "유저 메인\nhttps://mecenat.nisus.kr\n\n관리자 메인\nhttps://mecenat.nisus.kr/admin\n\n테스트 관리자 계정\nwordncode\nwc3191353"
        }
      ]
    },
    {
      id: 369,
      no: 369,
      title: "2026 국민취업지원제도 홈페이지 유지보수",
      projectId: "p_2026coaching",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2989",
      clientName: "국민취업지원제도",
      clientId: "s_coaching",
      siteName: "2026 국민취업지원제도 홈페이지 유지보수",
      siteId: "s_2026coaching",
      bidCount: 0,
      pm: "-",
      planner: "한상희",
      designer: "-",
      publisher: "-",
      developer: "-",
      period: "2026-07-28 ~ 2026-12-31",
      periodStart: "2026-07-28",
      periodEnd: "2026-12-31",
      devLang: "PHP / MariaDB",
      author: "한상희",
      authorDept: "기획팀",
      authorRole: "사원",
      date: "2026-07-28",
      dateFull: "2026-07-28 11:15:20",
      views: 19,
      status: "maintenance",
      statusText: "유지보수",
      category: "공공/취업",
      clientContacts: [
        {
          label: "담당자 1",
          date: "2026-07-28",
          name: "박서준",
          position: "주무관",
          tel: "044-202-7300",
          fax: "-",
          mobile: "010-3456-7890",
          email: "coaching@korea.kr"
        }
      ],
      attachments: [
        {
          name: "2026_국민취업지원제도_유지보수_과업지시서.pdf",
          size: "2.8M",
          downloads: 5,
          date: "2026-07-28 11:20:00",
          type: "pdf"
        }
      ],
      content: "2026년도 국민취업지원제도 포털 시스템 운영 및 보안 패치 정기 점검 과업입니다.",
      comments: []
    },
    {
      id: 368,
      no: 368,
      title: "2026 수소기술사업화 지원 플랫폼 구축",
      projectId: "p_h2hubtc",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2988",
      clientName: "수소융합얼라이언스",
      clientId: "s_h2korea",
      siteName: "2026 수소기술사업화 지원 플랫폼 구축",
      siteId: "s_h2hubtc",
      bidCount: 1,
      pm: "남기현",
      planner: "장현아",
      designer: "최지영",
      publisher: "손석호",
      developer: "최우석",
      period: "2026-06-26 ~ 2026-12-11",
      periodStart: "2026-06-26",
      periodEnd: "2026-12-11",
      devLang: "Vue 3 / Node.js / PostgreSQL",
      author: "장현아",
      authorDept: "기획팀",
      authorRole: "수습",
      date: "2026-07-08",
      dateFull: "2026-07-08 14:02:11",
      views: 78,
      status: "build",
      statusText: "구축중",
      category: "에너지/플랫폼",
      clientContacts: [
        {
          label: "담당자 1",
          date: "2026-07-08",
          name: "이정훈",
          position: "팀장",
          tel: "02-6258-7400",
          fax: "02-6258-7409",
          mobile: "010-8821-4920",
          email: "jhlee@h2korea.or.kr"
        }
      ],
      attachments: [
        {
          name: "수소기술사업화지원플랫폼_요구사항정의서_v1.0.xlsx",
          size: "850K",
          downloads: 12,
          date: "2026-07-08 14:10:00",
          type: "xlsx"
        }
      ],
      content: "수소기술 매칭 및 기술사업화 통합 지원 플랫폼 신규 구축 프로젝트입니다.",
      comments: []
    },
    {
      id: 367,
      no: 367,
      title: "2026년 가족서비스방식혁신시스템 고도화 사업",
      projectId: "p_2026fckhf_1",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2987",
      clientName: "한국건강가정진흥원",
      clientId: "s_kihf",
      siteName: "2026 가족서비스방식혁신시스템 고도화",
      siteId: "s_2026fckhf_1",
      bidCount: 0,
      pm: "-",
      planner: "이채원",
      designer: "-",
      publisher: "-",
      developer: "안영재",
      period: "2026-06-30 ~ 2026-12-24",
      periodStart: "2026-06-30",
      periodEnd: "2026-12-24",
      devLang: "Spring Boot / Oracle",
      author: "이채원",
      authorDept: "수행본부",
      authorRole: "사원",
      date: "2026-07-03",
      dateFull: "2026-07-03 16:45:00",
      views: 88,
      status: "build",
      statusText: "고도화",
      category: "가족/공공",
      clientContacts: [
        {
          label: "담당자 1",
          date: "2026-07-03",
          name: "정다운",
          position: "주임",
          tel: "02-3479-7600",
          fax: "-",
          mobile: "010-9182-7364",
          email: "dujeong@kihf.or.kr"
        }
      ],
      attachments: [],
      content: "가족서비스 시스템 업무 프로세스 자동화 및 대민 서비스 반응형 UI 고도화 사업입니다.",
      comments: []
    },
    {
      id: 366,
      no: 366,
      title: "2026년 용인디지털기록관 홈페이지 개선",
      projectId: "p_yiarchive",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2986",
      clientName: "용인시청",
      clientId: "s_yongin",
      siteName: "2026_용인디지털기록관",
      siteId: "s_yiarchive",
      bidCount: 0,
      pm: "남기현",
      planner: "이채원",
      designer: "명희진",
      publisher: "-",
      developer: "-",
      period: "2026-06-26 ~ 2026-09-30",
      periodStart: "2026-06-26",
      periodEnd: "2026-09-30",
      devLang: "-",
      author: "이채원",
      authorDept: "수행본부",
      authorRole: "사원",
      date: "2026-06-26",
      dateFull: "2026-06-26 10:12:00",
      views: 74,
      status: "in_progress",
      statusText: "개선사업",
      category: "지자체/아카이브",
      clientContacts: [],
      attachments: [],
      content: "용인디지털기록관 아카이빙 뷰어 속도 개선 및 접근성 인증 획득 작업입니다.",
      comments: []
    },
    {
      id: 365,
      no: 365,
      title: "가족서비스방식시스템 행복e음 연계데이터 개선",
      projectId: "p_ekihf",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2985",
      clientName: "한국건강가정진흥원",
      clientId: "s_kihf",
      siteName: "가족서비스방식시스템 행복e음 연계데이터 개선",
      siteId: "s_ekihf",
      bidCount: 0,
      pm: "남기현",
      planner: "장현아",
      designer: "-",
      publisher: "-",
      developer: "-",
      period: "2026-05-29 ~ 2026-09-30",
      periodStart: "2026-05-29",
      periodEnd: "2026-09-30",
      devLang: "Java / REST API",
      author: "장현아",
      authorDept: "기획팀",
      authorRole: "수습",
      date: "2026-06-19",
      dateFull: "2026-06-19 17:30:10",
      views: 44,
      status: "in_progress",
      statusText: "연계개선",
      category: "데이터연계",
      clientContacts: [],
      attachments: [],
      content: "행복e음 사회보장정보시스템 실시간 인터페이스 데이터 연계 검증 및 배치 최적화입니다.",
      comments: []
    },
    {
      id: 364,
      no: 364,
      title: "2026 국외소재문화유산재단 홈페이지 유지관리",
      projectId: "s_2026okchf",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2984",
      clientName: "국외소재문화유산재단",
      clientId: "s_okchf",
      siteName: "2026_국외소재문화유산재단",
      siteId: "s_2026okchf",
      bidCount: 0,
      pm: "-",
      planner: "한상희",
      designer: "-",
      publisher: "-",
      developer: "-",
      period: "2025-12-01 ~ 2026-11-30",
      periodStart: "2025-12-01",
      periodEnd: "2026-11-30",
      devLang: "-",
      author: "한상희",
      authorDept: "기획팀",
      authorRole: "사원",
      date: "2026-06-17",
      dateFull: "2026-06-17 09:40:00",
      views: 37,
      status: "maintenance",
      statusText: "유지관리",
      category: "문화유산",
      clientContacts: [],
      attachments: [],
      content: "국외소재문화유산재단 국영문 홈페이지 및 특별 전시 페이지 정기 유지관리입니다.",
      comments: []
    },
    {
      id: 363,
      no: 363,
      title: "2026 서울국제작가축제 웹사이트 유지보수 용역",
      projectId: "p_2026festival",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2983",
      clientName: "한국문학번역원",
      clientId: "s_ltikorea",
      siteName: "2026 서울국제작가축제",
      siteId: "s_2026festival",
      bidCount: 0,
      pm: "남기현",
      planner: "한상희",
      designer: "신현우",
      publisher: "조지혜",
      developer: "-",
      period: "2026-04-22 ~ 2026-12-31",
      periodStart: "2026-04-22",
      periodEnd: "2026-12-31",
      devLang: "HTML5 / SCSS / JS",
      author: "한상희",
      authorDept: "기획팀",
      authorRole: "사원",
      date: "2026-05-14",
      dateFull: "2026-05-14 13:20:00",
      views: 118,
      status: "maintenance",
      statusText: "유지보수",
      category: "문화/축제",
      clientContacts: [],
      attachments: [],
      content: "2026 서울국제작가축제 프로그램 안내, 참가 작가 소개 및 사전 참가신청 기능 운영.",
      comments: []
    },
    {
      id: 362,
      no: 362,
      title: "2026년 장애인문화예술정보시스템 이음 온라인 운영 용역",
      projectId: "p_2026ieum",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2982",
      clientName: "한국장애인문화예술원",
      clientId: "s_ieum",
      siteName: "2025_이음온라인",
      siteId: "s_2025ieum",
      bidCount: 0,
      pm: "-",
      planner: "박규태",
      designer: "-",
      publisher: "-",
      developer: "-",
      period: "2026-04-21 ~ 2026-12-31",
      periodStart: "2026-04-21",
      periodEnd: "2026-12-31",
      devLang: "-",
      author: "박규태",
      authorDept: "기획팀",
      authorRole: "대리",
      date: "2026-05-12",
      dateFull: "2026-05-12 15:50:00",
      views: 51,
      status: "maintenance",
      statusText: "운영용역",
      category: "문화/복지",
      clientContacts: [],
      attachments: [],
      content: "이음 온라인 웹진 콘텐츠 정기 업데이트 및 웹접근성 품질인증 마크 갱신.",
      comments: []
    },
    {
      id: 361,
      no: 361,
      title: "2026년 수소경제 종합정보시스템 유지보수",
      projectId: "p_2026h2hub",
      projectUrl: "http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/2981",
      clientName: "수소융합얼라이언스",
      clientId: "s_h2korea",
      siteName: "2025_수소경제종합정보포털",
      siteId: "s_2025h2hub",
      bidCount: 0,
      pm: "-",
      planner: "박규태",
      designer: "-",
      publisher: "-",
      developer: "-",
      period: "2026-05-07 ~ 2026-12-31",
      periodStart: "2026-05-07",
      periodEnd: "2026-12-31",
      devLang: "-",
      author: "박규태",
      authorDept: "기획팀",
      authorRole: "대리",
      date: "2026-05-12",
      dateFull: "2026-05-12 11:00:00",
      views: 65,
      status: "maintenance",
      statusText: "유지보수",
      category: "에너지/공공",
      clientContacts: [],
      attachments: [],
      content: "수소경제 통계 데이터 연계 및 수소충전소 실시간 현황 모니터링 시스템 유지관리.",
      comments: []
    }
  ],

  // 9-1. 주간 업무보고 (Weekly Work Reports - 주차별 전주/금주)
  workReports: [
    {
      id: 101,
      type: "weekly",
      client: "한국메세나협회",
      title: "2026 한국메세나협회 문화기업업무추진비 지원사업 시스템 구축",
      period: "2026-07-06 ~ 2026-08-14",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 1,
      weekLabel: "2026년 8월 1주차",
      date: "2026-08-07",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_최우석 과장",
          items: [
            "문화기업 지원사업 신청서 접수 및 심사 프로세스 DB 스키마 설계",
            "회원사 인증 및 사업자번호 유효성 검증 API 1차 모듈 개발"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_장현아 수습",
          items: [
            "지원사업 신청 폼 화면설계서(SB) 1차 검수 및 고객사 피드백 취합"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "관리자 심사위원 배정 및 가산점 산출 알고리즘 모듈 구현",
            "첨부 증빙서류 암호화 업로드 및 대용량 PDF 뷰어 연동"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_신현우 주임",
          items: [
            "신청 페이지 메인 그래픽 에셋 및 단계별 인디케이터 UI 시안 도출"
          ]
        }
      ]
    },
    {
      id: 102,
      type: "weekly",
      client: "사단법인 한국능률협회",
      title: "2026 국민취업지원제도 홈페이지 유지보수 및 기능 개선",
      period: "2026-07-28 ~ 2026-12-31",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 1,
      weekLabel: "2026년 8월 1주차",
      date: "2026-08-07",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_유종현 주임",
          items: [
            "7월 정기 보안 취약점 패치 및 웹 방화벽(WAF) 룰셋 갱신 완료",
            "고용노동부 연계 배치 오류 로그 모니터링 및 알림봇 구축"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_유종현 주임",
          items: [
            "사후역량점검 엑셀 일괄 업로드 파서 개발 및 유효성 검사 로직 작성",
            "상담사 배정 페이지 페이징 처리 및 검색 속도 개선"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_박규태 대리",
          items: [
            "8월 기능 개선 요구사항 정의서(SRS) 작성 및 고객사 담당자 확인"
          ]
        }
      ]
    },
    {
      id: 201,
      type: "weekly",
      client: "수소융합얼라이언스",
      title: "2026 수소기술사업화 지원 플랫폼 구축 및 포털 개발",
      period: "2026-06-26 ~ 2026-12-11",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 2,
      weekLabel: "2026년 8월 2주차",
      date: "2026-08-14",
      primaryDept: "디자인팀",
      prevWeekSections: [
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_한상희 사원",
          items: [
            "전국 수소충전소 실시간 현황 맵 요구사항 정의서 작성",
            "기술분류체계(수소생산, 저장, 운송, 모빌리티) 메타데이터 정립"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_최지영 과장",
          items: [
            "포털 메인 비주얼 콘셉트 3종(미래지향, 친환경, 데이터중심) 스케치"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_최지영 과장",
          items: [
            "메인 시안 반응형 웹 디자인 작업 (데스크탑 / 태블릿 / 모바일)",
            "디자인 시안 4종 내부 검토 및 고객사 중간보고자료 작성"
          ]
        },
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_곽재훈 대리",
          items: [
            "공공데이터포털 수소충전소 실시간 API 키 발급 및 연계 테스트 완료"
          ]
        }
      ]
    },
    {
      id: 202,
      type: "weekly",
      client: "한국건강가정진흥원",
      title: "2026 한국건강가정진흥원 통합 포털 사이트 UI/UX 고도화",
      period: "2026-05-02 ~ 2026-10-31",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 2,
      weekLabel: "2026년 8월 2주차",
      date: "2026-08-14",
      primaryDept: "퍼블리싱팀",
      prevWeekSections: [
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_김종규 팀장",
          items: [
            "가족상담 및 교육 신청 프로세스 IA(정보구조) 최종 확정"
          ]
        },
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_조지혜 과장",
          items: [
            "웹표준 및 웹접근성(KWCAG 2.2) 준수 템플릿 베이스라인 수립"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_이재광 팀장, 조지혜 과장",
          items: [
            "가족상담 신청 폼 반응형 웹 마크업 및 접근성 검수",
            "서브페이지 12종 HTML/CSS 템플릿 1차 코딩 완료"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_명희진 주임",
          items: [
            "서브페이지 배너 및 아이콘 에셋 16종 납품 완료"
          ]
        }
      ]
    },
    {
      id: 1,
      type: "weekly",
      client: "한국메세나협회",
      title: "2026 한국메세나협회 문화기업업무추진비 지원사업 시스템 구축",
      period: "2026-07-06 ~ 2026-08-14",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_최우석 과장",
          items: [
            "관리자 권한별 통계 대시보드 및 엑셀 다운로드 API 구현",
            "사용자 지원사업 신청 폼 1차 단위 테스트 및 데이터 검증 로직 작성"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_장현아 수습",
          items: [
            "사용자 / 관리자 시스템 운영 매뉴얼 초안 작성 완료"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_최우석 과장, 안영재 대리",
          items: [
            "사용자 / 관리자 페이지 전체 구현 완료",
            "내부 디버깅 및 보안 취약점 점검 완료",
            "운영 서버 배포 대기 중 (최종 오픈 검수 준비)"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_장현아 수습",
          items: [
            "고객사 실무자 시스템 오픈 일정 조율 및 개발서버 전달 완료 (8/14)"
          ]
        }
      ]
    },
    {
      id: 2,
      type: "weekly",
      client: "사단법인 한국능률협회",
      title: "2026 국민취업지원제도 홈페이지 유지보수 및 기능 개선",
      period: "2026-07-28 ~ 2026-12-31",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "사후역량점검 테이블 스키마 최적화 및 인덱스 튜닝",
            "월간 운영 데이터 통계 보고서 작성 및 고객사 담당자 확인 완료"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "사후역량점검 완료 분기 로직 추가, 관련 alert 수정, 테스트/운영서버 반영",
            "회원가입 본인인증 모듈 취약점 패치 및 예외처리 적용"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_박규태 대리",
          items: [
            "8월 2차 정기 기능 개선 요구사항 접수 및 개발 일정 조율 완료"
          ]
        }
      ]
    },
    {
      id: 3,
      type: "weekly",
      client: "수소융합얼라이언스",
      title: "2026 수소기술사업화 지원 플랫폼 구축 및 포털 개발",
      period: "2026-06-26 ~ 2026-12-11",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "디자인팀",
      prevWeekSections: [
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_한상희 사원",
          items: [
            "수소 충전소 실시간 현황 맵 레이아웃 요구사항 정의",
            "[국내_운영중_수소시험평가센터_조사양식_항목정의.xlsx] DB 양식 정리"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_윤익수 부장, 최지영 과장",
          items: [
            "메인 구성관련 회의 및 정보구조도(IA) 확정",
            "메인시안관련 A, B, C안 스케치 및 레퍼런스 정리"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_최지영 과장, 신현우 주임",
          items: [
            "메인 시안 반응형 웹 디자인 작업 완료 (데스크탑 / 모바일)",
            "디자인 시안 4종 내부 확인 및 피드백 반영 완료"
          ]
        },
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_곽재훈 대리",
          items: [
            "실시간 충전소 유가 및 충전 대기 차량 데이터 연계 API 설계 착수"
          ]
        }
      ]
    },
    {
      id: 4,
      type: "weekly",
      client: "한국건강가정진흥원",
      title: "2026 한국건강가정진흥원 통합 포털 사이트 UI/UX 고도화",
      period: "2026-05-02 ~ 2026-10-31",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "퍼블리싱팀",
      prevWeekSections: [
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_김종규 팀장",
          items: [
            "가족상담 신청 프로세스 IA(정보구조) 설계 및 와이어프레임 작성 완료"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_명희진 주임",
          items: [
            "메인 대시보드 및 서브페이지 UI 스타일 가이드 시안 2종 도출"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_이재광 팀장, 조지혜 과장",
          items: [
            "가족상담 신청 폼 반응형 웹 접근성(A11y) 마크업 가이드 준수 작업",
            "서브페이지 12종 HTML/CSS 템플릿 검수 및 모바일 깨짐 수정"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_명희진 주임",
          items: [
            "메인 배너 및 카드 일러스트 에셋 8종 최종 납품 완료"
          ]
        }
      ]
    },
    {
      id: 5,
      type: "weekly",
      client: "인천국제공항공사",
      title: "2026 인천공항테크마켓 플랫폼 API 연동 및 IDC 작업",
      period: "2026-08-01 ~ 2026-09-30",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "화물 터미널 실시간 반출입 모니터링 웹소켓 세션 안정화",
            "오라클 DB 쿼리 튜닝 및 느린 쿼리 알림 임계치 재설정"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "인천공항 IDC 센터 방문 및 연계 서버 API 프로토콜 점검",
            "인증 토큰 갱신 배치 스케줄러 안정화 및 모니터링 적용"
          ]
        },
        {
          dept: "전략본부",
          deptColor: "text-tertiary",
          label: "전략_남기현 본부장",
          items: [
            "고객사 IT운영팀 실무 미팅 진행 및 3단계 추가 요구사항 조율 완료"
          ]
        }
      ]
    },
    {
      id: 6,
      type: "weekly",
      client: "주식회사 워드앤코드",
      title: "2026 WnC 스마트 그룹웨어 리뉴얼 및 모바일 하이브리드 앱 구축",
      period: "2026-08-01 ~ 2026-08-31",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 3,
      weekLabel: "2026년 8월 3주차",
      date: "2026-08-21",
      primaryDept: "퍼블리싱팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_최우석 과장, 안영재 대리",
          items: [
            "GPS 기반 원클릭 출퇴근 및 오프라인 로컬 캐싱 동기화 구조 개발",
            "전자결재 및 지출결의서/품의서 폼 인터랙션 개발"
          ]
        },
        {
          dept: "디자인팀",
          deptColor: "text-primary-dim",
          label: "디자인_윤익수 부장",
          items: [
            "Glassmorphism & Bento Grid UI 테마 시스템 및 4대 컬러 모드 정립"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_이재광 팀장, 손석호 주임",
          items: [
            "팀별·주간·일간 업무보고 뷰페이지 및 전주/금주 비교 레이아웃 구현",
            "전사 상단 탭 지출결의서 규격 100% 통일화",
            "100% 순수 인라인 SVG 벡터 아이콘 전환 및 최적화"
          ]
        },
        {
          dept: "경영지원팀",
          deptColor: "text-secondary",
          label: "경영지원_오은주 차장",
          items: [
            "전사 임직원 21명 계정 및 8월 근태/휴가 데이터 정합성 검증 완료"
          ]
        }
      ]
    },
    {
      id: 301,
      type: "weekly",
      client: "사단법인 한국능률협회",
      title: "2026 국민취업지원제도 홈페이지 유지보수 및 기능 개선",
      period: "2026-07-28 ~ 2026-12-31",
      status: "in_progress",
      statusColor: "#785500",
      year: 2026,
      month: 8,
      week: 4,
      weekLabel: "2026년 8월 4주차",
      date: "2026-08-28",
      primaryDept: "개발팀",
      prevWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리",
          items: [
            "사후역량점검 분기 로직 및 회원가입 본인인증 예외처리 반영 완료",
            "월간 운영 통계 리포트 생성 스크립트 최적화"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "개발팀",
          deptColor: "text-primary",
          label: "개발_안영재 대리, 유종현 주임",
          items: [
            "상담 이력 관리 데이터 암호화 적용 및 열람 권한 감사 로그 강화",
            "모바일 웹 취약점 대응 및 크로스 브라우징 QA 테스트 진행"
          ]
        },
        {
          dept: "기획팀",
          deptColor: "text-tertiary",
          label: "기획_박규태 대리",
          items: [
            "9월 고용노동부 연계 개편안 검토 및 추가 과업 범위 협의"
          ]
        }
      ]
    },
    {
      id: 302,
      type: "weekly",
      client: "주식회사 워드앤코드",
      title: "2026 WnC 스마트 그룹웨어 리뉴얼 및 모바일 하이브리드 앱 구축",
      period: "2026-08-01 ~ 2026-08-31",
      status: "completed",
      statusColor: "#00693f",
      year: 2026,
      month: 8,
      week: 4,
      weekLabel: "2026년 8월 4주차",
      date: "2026-08-28",
      primaryDept: "퍼블리싱팀",
      prevWeekSections: [
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_이재광 팀장",
          items: [
            "PC 전용 풀 와이드 웹 그룹웨어 포털(pc.html) 독립 신규 구축",
            "모바일 & PC 10대 핵심 서비스 와이드 UI 및 인터랙티브 엔진 연동"
          ]
        }
      ],
      thisWeekSections: [
        {
          dept: "퍼블리싱팀",
          deptColor: "text-primary",
          label: "퍼블리싱_이재광 팀장, 손석호 주임",
          items: [
            "팀별·주간·일간 업무보고 전 디바이스 독립 데이터 및 전용 뷰 렌더러 분리",
            "PC 사이드바 접힘 모드 호버 툴팁 오버플로우 최적화",
            "Android 릴리즈 APK 패키징 및 최종 검수 배포"
          ]
        },
        {
          dept: "수행본부",
          deptColor: "text-tertiary",
          label: "수행_김종규 본부장, 이채원 사원",
          items: [
            "전사 임직원 21명 대상 실서비스 시범 운영 및 UX 사용성 피드백 수렴"
          ]
        }
      ]
    }
  ],

  // 9-2. 일간 업무보고 (Daily Work Reports - 일자별 금일 수행 및 명일 계획)
  dailyWorkReports: [
    {
      id: "d-20260825-1",
      date: "2026-08-25",
      client: "주식회사 워드앤코드",
      project: "2026 WnC 스마트 그룹웨어 리뉴얼 및 모바일 앱 구축",
      primaryDept: "퍼블리싱팀",
      author: "이재광 팀장, 손석호 주임",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "팀별/주간/일간 업무보고 전 디바이스 독립 데이터 및 전용 레이아웃 분리 구현",
        "PC 사이드바 접힘 모드 메뉴 호버 툴팁 가려짐 현상 수정 (overflow 및 z-index 최적화)"
      ],
      tomorrowTasks: [
        "모바일/태블릿/PC 전 디바이스 반응형 뷰포트 및 필터링 동작 실기 테스트"
      ],
      note: "전사 임직원 21명 주소록 마스터 데이터 100% 동기화 유지"
    },
    {
      id: "d-20260825-2",
      date: "2026-08-25",
      client: "사단법인 한국능률협회",
      project: "2026 국민취업지원제도 홈페이지 유지보수 및 기능 개선",
      primaryDept: "개발팀",
      author: "최우석 과장, 안영재 대리",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "사후역량점검 엑셀 일괄 업로드 파서 예외 분기 로직 추가 및 테스트서버 반영",
        "회원가입 본인인증 모듈 보안 취약점 패치 및 에러 핸들러 개선"
      ],
      tomorrowTasks: [
        "상담사 배정 페이징 쿼리 인덱싱 튜닝 및 고객사 QA 지원"
      ],
      note: "고용노동부 연계 배치 오류 없음 확인"
    },
    {
      id: "d-20260825-3",
      date: "2026-08-25",
      client: "수소융합얼라이언스",
      project: "2026 수소기술사업화 지원 플랫폼 구축 및 포털 개발",
      primaryDept: "디자인팀",
      author: "최지영 과장, 신현우 주임",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "수소 충전소 실시간 현황 맵 반응형 UI 시안(데스크탑/모바일) 2차 보완",
        "플랫폼 통계 차트 그래픽 컴포넌트 4종 피그마 에셋 추출 완료"
      ],
      tomorrowTasks: [
        "퍼블리싱팀 핸드오프를 위한 디자인 시스템 가이드 문서 정리"
      ],
      note: "고객사 디자인 피드백 100% 반영"
    },
    {
      id: "d-20260825-4",
      date: "2026-08-25",
      client: "한국메세나협회",
      project: "2026 한국메세나협회 문화기업 지원사업 시스템 구축",
      primaryDept: "기획팀",
      author: "박규태 대리, 장현아 수습",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "관리자/사용자 시스템 운영 매뉴얼 최종본 PDF 배포 완료",
        "오픈 전 최종 사용자 테스트 시나리오 점검"
      ],
      tomorrowTasks: [
        "시스템 오픈 당일 실시간 헬프데스크 모니터링 준비"
      ],
      note: "오후 반차 일정과 연계하여 사전 완료"
    },
    {
      id: "d-20260824-1",
      date: "2026-08-24",
      client: "주식회사 워드앤코드",
      project: "2026 WnC 스마트 그룹웨어 리뉴얼",
      primaryDept: "퍼블리싱팀",
      author: "이재광 팀장, 조지혜 과장",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "PC 전용 풀 와이드 웹 그룹웨어 포털(pc.html) 독립 신규 구축",
        "Figma 스타일의 3단 Bento Grid 대시보드 및 10대 핵심 서비스 와이드 뷰 구현"
      ],
      tomorrowTasks: [
        "사이드바 및 모바일 자동 전환 라우팅 엔진 안정화"
      ],
      note: "모바일 코드 간섭 없이 100% 독립 구성 완료"
    },
    {
      id: "d-20260824-2",
      date: "2026-08-24",
      client: "인천국제공항공사",
      project: "2026 인천공항테크마켓 플랫폼 API 연동",
      primaryDept: "개발팀",
      author: "곽재훈 대리, 유종현 주임",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "인천공항 IDC 센터 방문 및 연계 서버 API 프로토콜 점검 완료",
        "인증 토큰 갱신 배치 스케줄러 안정화 및 모니터링 적용"
      ],
      tomorrowTasks: [
        "고객사 IT운영팀 실무 미팅 피드백 정리"
      ],
      note: "IDC 작업 정상 종료"
    },
    {
      id: "d-20260821-1",
      date: "2026-08-21",
      client: "주식회사 워드앤코드",
      project: "2026 WnC 스마트 그룹웨어 리뉴얼",
      primaryDept: "퍼블리싱팀",
      author: "이재광 팀장, 손석호 주임",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "전사 Material Symbols 웹폰트 100% 인라인 SVG 벡터 전환 완료",
        "주소록 동적 렌더링 및 상태 뱃지 SVG 벡터 적용",
        "Android 릴리즈 APK 패키징 및 빌드 검증 완료"
      ],
      tomorrowTasks: [
        "PC 데스크탑 전용 와이드 뷰 레이아웃 설계"
      ],
      note: "SVG 75종+ 인라인 딕셔너리 구축 완료"
    },
    {
      id: "d-20260821-2",
      date: "2026-08-21",
      client: "한국메세나협회",
      project: "2026 한국메세나협회 문화기업 지원사업",
      primaryDept: "개발팀",
      author: "최우석 과장, 안영재 대리",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "사용자 / 관리자 페이지 전체 구현 완료",
        "내부 디버깅 및 보안 취약점 점검 완료",
        "운영 배포 대기 패키징"
      ],
      tomorrowTasks: [
        "고객사 최종 승인 확인 및 실서버 배포"
      ],
      note: "단위 테스트 전원 통과"
    },
    {
      id: "d-20260821-3",
      date: "2026-08-21",
      client: "주식회사 워드앤코드",
      project: "전사 경영지원 & 인사관리",
      primaryDept: "경영지원팀",
      author: "오은주 차장",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "전사 임직원 21명 계정 및 8월 근태/휴가 데이터 정합성 검증 완료",
        "8월 3주차 주간 업무보고 취합 및 전사 공지"
      ],
      tomorrowTasks: [
        "9월 복지 포인트 정산 및 명절 선물 수요 조사 준비"
      ],
      note: "특이사항 없음"
    },
    {
      id: "d-20260820-1",
      date: "2026-08-20",
      client: "사단법인 한국능률협회",
      project: "2026 국민취업지원제도 홈페이지 유지보수",
      primaryDept: "개발팀",
      author: "최우석 과장, 안영재 대리",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "사후역량점검 테이블 스키마 최적화 및 인덱스 튜닝 완료",
        "월간 운영 데이터 통계 쿼리 최적화"
      ],
      tomorrowTasks: [
        "회원가입 본인인증 모듈 취약점 패치"
      ],
      note: "응답 속도 40% 개선"
    },
    {
      id: "d-20260820-2",
      date: "2026-08-20",
      client: "한국건강가정진흥원",
      project: "2026 한국건강가정진흥원 통합 포털 UI/UX",
      primaryDept: "디자인팀",
      author: "윤익수 부장, 명희진 주임",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "메인 배너 및 카드 일러스트 에셋 8종 최종 납품 완료",
        "서브페이지 UI 스타일 가이드 2차 검수"
      ],
      tomorrowTasks: [
        "퍼블리싱팀 템플릿 검수 지원"
      ],
      note: "고객사 1차 디자인 컨펌 완료"
    },
    {
      id: "d-20260819-1",
      date: "2026-08-19",
      client: "한국메세나협회",
      project: "2026 한국메세나협회 문화기업 지원사업",
      primaryDept: "기획팀",
      author: "박규태 대리, 장현아 수습",
      status: "completed",
      statusLabel: "완료",
      todayTasks: [
        "사용자 / 관리자 시스템 운영 매뉴얼 초안 작성 완료",
        "개발일정 문의 관련 개발서버 전달 완료 (8/14)"
      ],
      tomorrowTasks: [
        "고객사 실무자 피드백 수렴"
      ],
      note: "매뉴얼 초안 작성 완료"
    },
    {
      id: "d-20260819-2",
      date: "2026-08-19",
      client: "한국건강가정진흥원",
      project: "2026 한국건강가정진흥원 통합 포털 UI/UX",
      primaryDept: "퍼블리싱팀",
      author: "조지혜 과장, 손석호 주임",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "가족상담 신청 폼 반응형 웹 접근성(A11y) 마크업 가이드 준수 작업",
        "서브페이지 12종 HTML/CSS 템플릿 모바일 깨짐 수정"
      ],
      tomorrowTasks: [
        "웹표준 접근성 자동화 툴 2차 검수"
      ],
      note: "KWCAG 2.2 표준 준수 진행중"
    },
    {
      id: "d-20260818-1",
      date: "2026-08-18",
      client: "수소융합얼라이언스",
      project: "2026 수소기술사업화 지원 플랫폼",
      primaryDept: "디자인팀",
      author: "최지영 과장, 신현우 주임",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "메인 구성관련 회의 및 정보구조도(IA) 확정",
        "메인시안관련 A, B, C안 스케치 및 레퍼런스 정리"
      ],
      tomorrowTasks: [
        "메인 시안 반응형 웹 디자인 작업 (데스크탑/모바일)"
      ],
      note: "디자인 컨셉 확정"
    },
    {
      id: "d-20260817-1",
      date: "2026-08-17",
      client: "한국메세나협회",
      project: "2026 한국메세나협회 문화기업 지원사업",
      primaryDept: "개발팀",
      author: "최우석 과장, 안영재 대리",
      status: "in_progress",
      statusLabel: "진행중",
      todayTasks: [
        "관리자 권한별 통계 대시보드 및 엑셀 다운로드 API 구현 착수",
        "사용자 지원사업 신청 폼 1차 단위 테스트 및 데이터 검증 로직 작성"
      ],
      tomorrowTasks: [
        "사용자/관리자 페이지 디버깅"
      ],
      note: "금주 중 개발 완료 목표"
    }
  ],

  // 9-3. 팀별 업무보고 (Team Work Reports - 부서별 전담 프로젝트 및 팀원 현황)
  teamWorkReports: [
    {
      id: "team-dev",
      dept: "개발팀",
      deptName: "개발팀",
      deptColor: "text-primary",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      leader: "최우석 과장",
      members: [
        { name: "최우석", role: "과장", currentTask: "한국능률협회 사후역량점검 튜닝 및 총괄 관리" },
        { name: "안영재", role: "대리", currentTask: "한국메세나협회 시스템 배포 및 보안 검수" },
        { name: "곽재훈", role: "대리", currentTask: "수소융합 실시간 충전소 연계 API 설계" },
        { name: "유종현", role: "주임", currentTask: "인천공항 IDC 연계 토큰 갱신 배치 모니터링" }
      ],
      summary: "8월 주요 프로젝트(메세나, 능률협회, 수소융합, 인천공항) 시스템 구축 및 유지보수 정상 진행 중",
      projects: [
        {
          title: "2026 한국메세나협회 문화기업 지원사업 시스템 구축",
          client: "한국메세나협회",
          status: "배포대기",
          progress: "100%",
          tasks: [
            "사용자 / 관리자 페이지 전체 구현 완료",
            "내부 디버깅 및 보안 취약점 점검 완료",
            "운영 서버 배포 대기 중"
          ]
        },
        {
          title: "2026 국민취업지원제도 홈페이지 유지보수 및 기능 개선",
          client: "사단법인 한국능률협회",
          status: "진행중",
          progress: "85%",
          tasks: [
            "사후역량점검 테이블 스키마 최적화 및 인덱스 튜닝",
            "회원가입 본인인증 모듈 취약점 패치 및 예외처리 적용"
          ]
        },
        {
          title: "2026 인천공항테크마켓 플랫폼 API 연동 및 IDC 작업",
          client: "인천국제공항공사",
          status: "완료",
          progress: "100%",
          tasks: [
            "인천공항 IDC 센터 방문 및 연계 서버 API 프로토콜 점검",
            "인증 토큰 갱신 배치 스케줄러 안정화 및 모니터링 적용"
          ]
        }
      ]
    },
    {
      id: "team-pub",
      dept: "퍼블리싱팀",
      deptName: "퍼블리싱팀",
      deptColor: "text-primary",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      leader: "이재광 팀장",
      members: [
        { name: "이재광", role: "팀장", currentTask: "WnC 스마트 그룹웨어 PC/모바일 듀얼 아키텍처 및 총괄 퍼블리싱" },
        { name: "조지혜", role: "과장", currentTask: "한국건강가정진흥원 통합 포털 반응형 웹 접근성(A11y) 마크업" },
        { name: "손석호", role: "주임", currentTask: "WnC 그룹웨어 인라인 SVG 최적화 및 Android APK 패키징" }
      ],
      summary: "WnC 그룹웨어 포털 리뉴얼 퍼블리싱 100% 완료 및 한가원 포털 웹접근성 가이드 준수 작업 순항",
      projects: [
        {
          title: "2026 WnC 스마트 그룹웨어 리뉴얼 및 모바일 하이브리드 앱 구축",
          client: "주식회사 워드앤코드",
          status: "완료",
          progress: "100%",
          tasks: [
            "Figma Bento Grid UI 및 10대 비즈니스 인터랙티브 화면 구현",
            "PC 전용 와이드 뷰(pc.html) 독립 구축 및 라우팅 엔진 연동",
            "100% 순수 인라인 SVG 벡터 아이콘 전환 및 최적화"
          ]
        },
        {
          title: "2026 한국건강가정진흥원 통합 포털 사이트 UI/UX 고도화",
          client: "한국건강가정진흥원",
          status: "진행중",
          progress: "75%",
          tasks: [
            "가족상담 신청 폼 반응형 웹 접근성(A11y) 마크업 가이드 준수",
            "서브페이지 12종 HTML/CSS 템플릿 검수 및 모바일 깨짐 수정"
          ]
        }
      ]
    },
    {
      id: "team-design",
      dept: "디자인팀",
      deptName: "디자인팀",
      deptColor: "text-primary-dim",
      badgeColor: "bg-[#00693f]/10 text-[#00693f] dark:text-emerald-300 border-[#00693f]/20",
      leader: "윤익수 부장",
      members: [
        { name: "윤익수", role: "부장", currentTask: "WnC 그룹웨어 디자인 시스템 및 전사 디자인 총괄 디렉팅" },
        { name: "최지영", role: "과장", currentTask: "수소기술사업화 플랫폼 메인 반응형 웹 UI 디자인" },
        { name: "신현우", role: "주임", currentTask: "수소기술사업화 맵 컴포넌트 및 통계 차트 그래픽 작업" },
        { name: "명희진", role: "주임", currentTask: "한국건강가정진흥원 메인 배너 및 일러스트 에셋 8종 납품" }
      ],
      summary: "수소기술사업화 플랫폼 시안 4종 도출 완료 및 한가원 일러스트 에셋 최종 납품 완료",
      projects: [
        {
          title: "2026 수소기술사업화 지원 플랫폼 구축 및 포털 개발",
          client: "수소융합얼라이언스",
          status: "완료",
          progress: "100%",
          tasks: [
            "메인 시안 반응형 웹 디자인 작업 완료 (데스크탑 / 모바일)",
            "디자인 시안 4종 내부 확인 및 고객사 피드백 반영 완료"
          ]
        },
        {
          title: "2026 한국건강가정진흥원 통합 포털 사이트 UI/UX 고도화",
          client: "한국건강가정진흥원",
          status: "진행중",
          progress: "80%",
          tasks: [
            "메인 배너 및 카드 일러스트 에셋 8종 최종 납품 완료",
            "서브페이지 UI 스타일 가이드 2차 검수"
          ]
        }
      ]
    },
    {
      id: "team-plan",
      dept: "기획팀",
      deptName: "기획팀",
      deptColor: "text-tertiary",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20",
      leader: "김종규 팀장",
      members: [
        { name: "김종규", role: "팀장", currentTask: "전사 기획 총괄 및 한가원 정보구조(IA) 설계" },
        { name: "박규태", role: "대리", currentTask: "메세나협회 시스템 매뉴얼 작성 및 능률협회 8월 SRS 협의" },
        { name: "한상희", role: "사원", currentTask: "수소기술사업화 충전소 맵 요구사항 정의서 작성" },
        { name: "장현아", role: "수습", currentTask: "메세나협회 고객사 오픈 일정 조율 및 개발서버 전달" }
      ],
      summary: "메세나협회 운영 매뉴얼 배포 완료 및 수소기술사업화/능률협회 기능 요구사항 정의 완료",
      projects: [
        {
          title: "2026 한국메세나협회 문화기업 지원사업 시스템 구축",
          client: "한국메세나협회",
          status: "완료",
          progress: "100%",
          tasks: [
            "사용자 / 관리자 시스템 운영 매뉴얼 최종본 작성 및 고객사 전달",
            "오픈 전 최종 검수 시나리오 작성"
          ]
        },
        {
          title: "2026 수소기술사업화 지원 플랫폼 구축 및 포털 개발",
          client: "수소융합얼라이언스",
          status: "진행중",
          progress: "70%",
          tasks: [
            "수소 충전소 실시간 현황 맵 레이아웃 요구사항 정의",
            "기술분류체계 메타데이터 정립 및 DB 양식 정리"
          ]
        }
      ]
    },
    {
      id: "team-admin",
      dept: "경영지원팀",
      deptName: "경영지원팀",
      deptColor: "text-secondary",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
      leader: "김경현 대표",
      members: [
        { name: "김경현", role: "대표", currentTask: "전사 사업 총괄 및 경영 전략 수립" },
        { name: "오은주", role: "차장", currentTask: "전사 21명 근태/휴가 검증 및 8월 재무 결산" }
      ],
      summary: "전사 임직원 21명 근태 및 휴가 데이터 정합성 검증 완료 및 사내 복지 시스템 운영",
      projects: [
        {
          title: "전사 경영지원 & 인사·총무 관리",
          client: "주식회사 워드앤코드",
          status: "완료",
          progress: "100%",
          tasks: [
            "전사 임직원 21명 계정 및 8월 근태/휴가 데이터 정합성 검증 완료",
            "8월 3주차 주간 업무보고 취합 및 사내 복지 포인트 관리",
            "이달의 생일자 축하 프로그램 및 복지 혜택 운영"
          ]
        }
      ]
    },
    {
      id: "team-strategy",
      dept: "전략본부",
      deptName: "전략본부",
      deptColor: "text-tertiary",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",
      leader: "남기현 본부장",
      members: [
        { name: "남기현", role: "본부장", currentTask: "인천공항 테크마켓 고객사 미팅 및 신규 공공사업 수주 전략" },
        { name: "윤진성", role: "과장", currentTask: "2026 하반기 공공기관 제안서 기획 및 사업성 검토" }
      ],
      summary: "인천공항 IT운영팀 실무 협의 완료 및 3단계 추가 과업 수주 전략 추진",
      projects: [
        {
          title: "2026 인천공항테크마켓 플랫폼 API 연동 및 사업 전략",
          client: "인천국제공항공사",
          status: "완료",
          progress: "100%",
          tasks: [
            "고객사 IT운영팀 실무 미팅 진행 및 3단계 추가 요구사항 조율 완료",
            "2026 하반기 신규 사업 제안서 기획 및 발주처 네트워크 관리"
          ]
        }
      ]
    },
    {
      id: "team-exec",
      dept: "수행본부",
      deptName: "수행본부",
      deptColor: "text-tertiary",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/20",
      leader: "김종규 본부장",
      members: [
        { name: "김종규", role: "본부장", currentTask: "전사 수행 프로젝트 감리 및 품질 관리 총괄" },
        { name: "이채원", role: "사원", currentTask: "프로젝트별 단계별 산출물 취합 및 일정 모니터링" }
      ],
      summary: "전사 수행 프로젝트 산출물 품질 관리 및 WnC 그룹웨어 시범 운영 모니터링",
      projects: [
        {
          title: "전사 프로젝트 품질 보증 및 감리 관리",
          client: "주식회사 워드앤코드",
          status: "진행중",
          progress: "90%",
          tasks: [
            "주요 공공사업 단계별 감리 산출물 검수 및 일정 리스크 관리",
            "WnC 스마트 그룹웨어 실서비스 시범 운영 사용자 피드백 수렴"
          ]
        }
      ]
    }
  ],

  // 10. 실시간 알림 데이터 (출근/퇴근/결재/외근/공지 및 팀장 전용 권한)
  notifications: [
    {
      id: 1,
      type: "commute",
      subType: "checkin",
      title: "팀원 출근 알림",
      message: "퍼블리싱팀 조지혜 과장님이 정상 출근했습니다. (08:52)",
      time: "방금 전",
      date: "08:52",
      sender: { name: "조지혜", role: "과장", dept: "퍼블리싱팀", avatar: "./resource/image/profile_red_20260602.png" },
      targetScreen: "screen-calendar",
      pcScreen: "checkin",
      managerOnly: true, // 팀장/부서장급만 열람 가능
      isRead: false
    },
    {
      id: 2,
      type: "approval",
      subType: "request",
      title: "전자결재 승인 요청",
      message: "손석호 주임님이 제출한 [하반기 연차 휴가원] 결재 승인 대기 중입니다.",
      time: "15분 전",
      date: "08:40",
      sender: { name: "손석호", role: "주임", dept: "퍼블리싱팀", avatar: "./resource/image/profile_pub.png" },
      targetScreen: "screen-request",
      pcScreen: "request",
      managerOnly: false,
      isRead: false
    },
    {
      id: 3,
      type: "business",
      subType: "trip",
      title: "외근 출발 알림",
      message: "기획팀 김종규 팀장님이 외부 미팅(한국건강가정진흥원)으로 외근 출발했습니다.",
      time: "30분 전",
      date: "08:25",
      sender: { name: "김종규", role: "팀장", dept: "기획팀", avatar: "./resource/image/profile_john.png" },
      targetScreen: "screen-directory",
      pcScreen: "directory",
      managerOnly: false,
      isRead: false
    },
    {
      id: 4,
      type: "commute",
      subType: "checkin",
      title: "팀원 출근 알림",
      message: "개발팀 최우석 과장님이 정상 출근했습니다. (08:35)",
      time: "45분 전",
      date: "08:35",
      sender: { name: "최우석", role: "과장", dept: "개발팀", avatar: "./resource/image/profile_mobile.png" },
      targetScreen: "screen-calendar",
      pcScreen: "checkin",
      managerOnly: true, // 팀장/부서장급만 열람 가능
      isRead: false
    },
    {
      id: 5,
      type: "approval",
      subType: "approved",
      title: "지출결의서 승인 완료",
      message: "8월 프로젝트 운영비 지출결의서(350,000원) 결재가 최종 승인되었습니다.",
      time: "1시간 전",
      date: "08:00",
      sender: { name: "오은주", role: "차장", dept: "경영지원팀", avatar: "./resource/image/profile_sky.png" },
      targetScreen: "screen-finance",
      pcScreen: "finance",
      managerOnly: false,
      isRead: true
    },
    {
      id: 6,
      type: "business",
      subType: "trip",
      title: "외근 일정 등록",
      message: "수행본부 이채원 사원님이 고객사 실무 미팅(판교) 외근 일정을 등록했습니다.",
      time: "2시간 전",
      date: "07:15",
      sender: { name: "이채원", role: "사원", dept: "수행본부", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      targetScreen: "screen-directory",
      pcScreen: "directory",
      managerOnly: false,
      isRead: true
    },
    {
      id: 7,
      type: "notice",
      subType: "notice",
      title: "신규 공지사항 등록",
      message: "[필독] 2024년 하반기 워크샵 일정 및 세부 편성 안내가 등록되었습니다.",
      time: "어제",
      date: "10.24",
      sender: { name: "오은주", role: "차장", dept: "경영지원팀", avatar: "./resource/image/profile_sky.png" },
      targetScreen: "screen-notice-list",
      pcScreen: "notice",
      managerOnly: false,
      isRead: true
    },
    {
      id: 8,
      type: "commute",
      subType: "checkout",
      title: "팀원 퇴근 알림",
      message: "디자인팀 신현우 주임님이 일일 업무를 마치고 퇴근 체크했습니다.",
      time: "어제 18:30",
      date: "18:30",
      sender: { name: "신현우", role: "주임", dept: "디자인팀", avatar: "./resource/image/profile_pink____________.png" },
      targetScreen: "screen-calendar",
      pcScreen: "checkin",
      managerOnly: true, // 팀장/부서장급만 열람 가능
      isRead: true
    }
  ]
};
