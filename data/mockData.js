/**
 * 워드앤코드 그룹웨어 통합 목업 데이터 모듈
 * 
 * 모든 비즈니스 데이터(임직원, 공지사항, 할일, 일정, 공휴일/절기/기념일, 근태, 경비)를 
 * script.js 로직 코드와 완전 분리하여 독립 관리합니다.
 * 추후 구글 Firebase Firestore 연동 시 이 객체의 바인딩을 Firestore API로 전환하면 됩니다.
 */

window.MockData = {
  // 1. 임직원 주소록
  employees: [
    { id: 1, name: "김경현", dept: "경영지원팀", role: "대표", phone: "010-8885-5177", tel: "070-7711-4823", email: "abc@wordncode.com", avatar: "./resource/image/profile_ghibli_kim_kh.jpg", status: "active", statusText: "" },
    { id: 2, name: "오은주", dept: "경영지원팀", role: "차장", phone: "010-3712-7932", tel: "070-7711-4819", email: "sky@wordncode.com", avatar: "./resource/image/profile_ghibli_oh.jpg", status: "active", statusText: "" },
    { id: 3, name: "김종규", dept: "기획팀", role: "팀장", phone: "010-4781-7808", tel: "070-8805-1647", email: "john@wordncode.com", avatar: "./resource/image/profile_ghibli_john.jpg", status: "active", statusText: "" },
    { id: 4, name: "박규태", dept: "기획팀", role: "대리", phone: "010-3230-1573", tel: "070-8805-1647", email: "green@wordncode.com", avatar: "./resource/image/profile_ghibli_park_gt.jpg", status: "active", statusText: "" },
    { id: 5, name: "한상희", dept: "기획팀", role: "사원", phone: "010-2635-9110", tel: "070-7711-4815", email: "star@wordncode.com", avatar: "./resource/image/profile_ghibli_han.jpg", status: "active", statusText: "" },
    { id: 6, name: "장현아", dept: "기획팀", role: "수습", phone: "010-4562-3633", tel: "070-7711-4809", email: "you@wordncode.com", avatar: "./resource/image/profile_ghibli_jang.jpg", status: "active", statusText: "" },
    { id: 7, name: "윤익수", dept: "디자인팀", role: "부장", phone: "010-2707-5681", tel: "070-8805-1646", email: "blue@wordncode.com", avatar: "./resource/image/profile_ghibli_yoon.jpg", status: "active", statusText: "" },
    { id: 8, name: "최지영", dept: "디자인팀", role: "과장", phone: "010-8632-0944", tel: "070-7711-4821", email: "white@wordncode.com", avatar: "./resource/image/profile_ghibli_choi_jy.jpg", status: "active", statusText: "" },
    { id: 9, name: "신현우", dept: "디자인팀", role: "주임", phone: "010-8337-0176", tel: "070-7711-4810", email: "pink@wordncode.com", avatar: "./resource/image/profile_ghibli_shin.jpg", status: "active", statusText: "" },
    { id: 10, name: "명희진", dept: "디자인팀", role: "주임", phone: "010-2607-5235", tel: "070-7711-4812", email: "gray@wordncode.com", avatar: "./resource/image/profile_ghibli_myeong.jpg", status: "active", statusText: "" },
    { id: 11, name: "이재광", dept: "퍼블리싱팀", role: "차장", phone: "010-5244-1251", tel: "070-7711-4808", email: "yellow@wordncode.com", avatar: "./resource/image/profile_ghibli_lee.jpg", status: "online", statusText: "근무중" },
    { id: 12, name: "조지혜", dept: "퍼블리싱팀", role: "과장", phone: "010-2362-0263", tel: "070-7711-4806", email: "red@wordncode.com", avatar: "./resource/image/profile_ghibli_choi.jpg", status: "active", statusText: "" },
    { id: 13, name: "손석호", dept: "퍼블리싱팀", role: "주임", phone: "010-6565-4215", tel: "070-7711-4811", email: "pub@wordncode.com", avatar: "./resource/image/profile_ghibli_son.jpg", status: "active", statusText: "" },
    { id: 14, name: "최우석", dept: "개발팀", role: "과장", phone: "010-2887-1810", tel: "070-8805-1648", email: "mobile@wordncode.com", avatar: "./resource/image/profile_ghibli_choi_ws.jpg", status: "active", statusText: "" },
    { id: 15, name: "안영재", dept: "개발팀", role: "대리", phone: "010-9776-1309", tel: "070-7711-4805", email: "pro@wordncode.com", avatar: "./resource/image/profile_ghibli_an.jpg", status: "active", statusText: "" },
    { id: 16, name: "곽재훈", dept: "개발팀", role: "대리", phone: "010-8479-8729", tel: "070-7711-1653", email: "spring@wordncode.com", avatar: "./resource/image/profile_ghibli_gwak.jpg", status: "active", statusText: "" },
    { id: 17, name: "유종현", dept: "개발팀", role: "주임", phone: "010-7455-4047", tel: "070-7711-4820", email: "jsp@wordncode.com", avatar: "./resource/image/profile_ghibli_yoo.jpg", status: "active", statusText: "" },
    { id: 18, name: "남기현", dept: "전략본부", role: "본부장", phone: "010-5578-9436", tel: "070-7711-4804", email: "help@wordncode.com", avatar: "./resource/image/profile_ghibli_nam.jpg", status: "active", statusText: "" },
    { id: 19, name: "윤진성", dept: "전략본부", role: "과장", phone: "010-2889-3274", tel: "070-7711-4822", email: "apple@wordncode.com", avatar: "./resource/image/profile_ghibli_yoon_js.jpg", status: "active", statusText: "" },
    { id: 20, name: "김종규", dept: "수행본부", role: "본부장", phone: "010-4781-7808", tel: "070-8805-1647", email: "john@wordncode.com", avatar: "./resource/image/profile_ghibli_john.jpg", status: "active", statusText: "" },
    { id: 21, name: "이채원", dept: "수행본부", role: "사원", phone: "010-3533-1662", tel: "070-4210-6134", email: "cool@wordncode.com", avatar: "./resource/image/profile_ghibli_lee_cw.jpg", status: "active", statusText: "" }
  ],

  // 2. 공지사항
  notices: [
    {
      id: 1,
      title: '2024년 하반기 전사 워크샵 일정 안내',
      category: '인사',
      date: '2024.10.24',
      isPinned: true,
      isNew: true,
      author: '인사팀 (관리자)',
      summary: '2024년 하반기 전사 워크샵 일정을 아래와 같이 안내합니다.',
      content: `<p class="mb-3">안녕하십니까, 임직원 여러분.</p><p class="mb-3">2024년도 하반기 전사 워크샵 일정을 아래와 같이 안내드리오니, 부서별 일정을 확인하시어 준비해 주시기 바랍니다. 소통과 단합을 위한 다양하고 유익한 프로그램이 준비되어 있습니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">워크샵 주요 일정</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li><strong>일시:</strong> 2024년 11월 14일(목) ~ 11월 15일(금) [1박 2일]</li><li><strong>장소:</strong> 강원도 속초 리조트 메인 홀</li><li><strong>참석 대상:</strong> 전 임직원</li><li><strong>집결:</strong> 사옥 전면 주차장 08:30 대형버스 탑승</li></ul></div><p>상세 안내 자료 및 세부 편성표는 첨부파일을 확인해 주시기 바랍니다. 문의사항은 인사팀으로 연락 부탁드립니다.</p>`,
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
      author: '복지팀',
      summary: '2024년 임직원 종합 건강검진 신규 제휴 병원이 추가되었습니다.',
      content: `<p class="mb-3">안녕하세요, 복지팀입니다.</p><p class="mb-3">임직원분들의 편의 증진을 위해 2024년도 종합 건강검진 지정 제휴 병원을 추가 지정하였습니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">신규 제휴 병원 안내</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li>강남 세브란스 검진센터 (서울)</li><li>분당 서울대병원 건강증진센터 (경기)</li><li>예약 방법: 사내 복지 포털 로그인 후 온라인 신청</li></ul></div>`,
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
      author: 'IT지원팀',
      summary: '사내 서버 네트워크 인프라 정기 점검이 진행될 예정입니다.',
      content: `<p class="mb-3">안녕하세요, IT지원팀입니다.</p><p class="mb-3">안정적인 사내 그룹웨어 서비스 제공을 위한 정기 네트워크 점검 작업이 진행됩니다.</p><div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary"><h3 class="font-headline font-bold text-primary mb-2 text-sm">작업 일시 및 영향</h3><ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant"><li><strong>점검 시간:</strong> 2024년 10월 27일(일) 02:00 ~ 06:00 (4시간)</li><li><strong>영향 범위:</strong> 그룹웨어, 전자결재, 출퇴근 관리 서비스 접근 불가</li></ul></div>`,
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
      author: '인사팀',
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
      author: '총무팀',
      summary: '사옥 지하 주차장 등록 차량 주차 수칙 변경 사항입니다.',
      content: `<p class="mb-3">안녕하세요, 총무팀입니다.</p><p class="mb-3">사옥 주차 공간 효율화를 위해 주차등록 수칙이 일부 변경됩니다.</p>`,
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
      author: '관리자',
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
        { name: '이재광', avatar: 'profile.png' },
        { name: '명희진', avatar: 'profile.png' }
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
        { name: '김철수', avatar: 'profile.png' }
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
        { name: '이재광', avatar: 'profile.png' }
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
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" }
    ],
    "2026-8-4": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "최우석 과장", avatar: "./resource/image/profile_mobile.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" }
    ],
    "2026-8-5": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "반반차 [09:00~11:00]", time: "09:00 ~ 11:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" },
      { title: "외근(오후) [건강가정진흥원]", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-6": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "외근(오전) [한국건강가정진흥원] 주간회의", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "이혜림 대리", avatar: "./resource/image/profile_white.png" },
      { title: "외근(오전) [한국건강가정진흥원] 주간회의", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오전) [한가원] 주간보고", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "외근(오전) [한국건강가정진흥원] 주간회의", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(종일) [인천공항테크마켓] API 확인", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "유종현 주임", avatar: "./resource/image/profile_jsp.png" },
      { title: "외근(오전) [한가원] 주간보고", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "연차", time: "종일", type: "error", badge: "연차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" }
    ],
    "2026-8-7": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "error", badge: "반차", author: "이재광 차장", avatar: "profile.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "신현우 주임", avatar: "./resource/image/profile_pink____________.png" },
      { title: "반반차 [16:00~18:00]", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오후) [비트라믹스 외]", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-10": [
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "반반차 [16:00~18:00]", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" }
    ],
    "2026-8-11": [
      { title: "외근(오후) [한국수소연합] 업무미팅", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(오후) [한국수소연합] 큐커넥션 미팅", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "외근(오후) [수소연합] 남기현 오후 수소연합 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-12": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "외근(오전) [건강가정진흥원]", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) [유비디시즌]", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) [한국건강가정진흥원] 월간회의", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "외근(오후) [한국건강가정진흥원] 월간회의", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "이혜림 대리", avatar: "./resource/image/profile_white.png" },
      { title: "외근(오후) [한가원] 월간보고", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "외근(오후) [한국건강가정진흥원] 월간회의", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오후) [한가원] 월간보고", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" },
      { title: "연차", time: "종일", type: "error", badge: "연차", author: "조지혜 과장", avatar: "./resource/image/profile_red_20260602.png" },
      { title: "반반차 [16:00~18:00]", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" }
    ],
    "2026-8-13": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
      { title: "외근(오전) [리마커블 소프트] 남기현 오전 리마커블소프트 방문", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) [퓨처누리] 남기현 오후 퓨처누리 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-14": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
      { title: "외근(오후) [인천공항] 남기현 오후 인천공항 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(종일) [인천공항테크마켓] IDC 센터 방문", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
      { title: "외근(오전) [프로젝트 궁리 방문] 남기현 오전 프로젝트 궁리 방문", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-18": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
      { title: "연차", time: "종일", type: "error", badge: "연차", author: "이재광 차장", avatar: "profile.png" }
    ],
    "2026-8-19": [
      { title: "연차", time: "종일", type: "error", badge: "연차", author: "이재광 차장", avatar: "profile.png" },
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "한상희 사원", avatar: "./resource/image/profile_star_20250326.png" },
      { title: "외근(오전) [한가원] 주간보고", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "손석호 주임", avatar: "./resource/image/profile_pub.png" },
      { title: "외근(오전) [한국건강가정진흥원] 주간회의", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" },
      { title: "외근(오전) [한국건강가정진흥원] 주간회의", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "장현아 수습", avatar: "./resource/image/profile_janghyunah.png" },
      { title: "외근(오전) [한가원] 주간보고", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "윤진성 과장", avatar: "./resource/image/profile_apple_20250611.png" }
    ],
    "2026-8-20": [
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "오은주 차장", avatar: "./resource/image/profile_sky.png" },
      { title: "외근(오전) [에스엠티] 남기현 점심 에스엠티 미팅", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-21": [
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
      { title: "반차(오후)", time: "13:00 ~ 18:00", type: "error", badge: "반차", author: "이재광 차장", avatar: "profile.png" },
      { title: "외근(오후) [시티시큐] 남기현 오후 시티시큐 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "반반차 [16:00~18:00]", time: "16:00 ~ 18:00", type: "warning", badge: "반반차", author: "윤익수 부장", avatar: "./resource/image/profile_blue.png" }
    ],
    "2026-8-24": [
      { title: "반차(오전)", time: "09:00 ~ 13:00", type: "warning", badge: "반차", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
    ],
    "2026-8-25": [
      { title: "외근(오후) [용인문화원] 남기현, 이채원 용인문화원 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
      { title: "외근(오후) [용인디지털기록관] 회의", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "이채원 사원", avatar: "./resource/image/profile_cool_20241224_lee.png" }
    ],
    "2026-8-31": [
      { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "최지영 과장", avatar: "./resource/image/profile_white.png" }
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
  }
};
