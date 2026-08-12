// 워드앤코드 그룹웨어 애플리케이션 코어 로직

const App = {
  state: {
    isLoggedIn: false, // Default to FALSE so user starts on Login screen
    activeTab: 'screen-home',
    finance: {
      activeTab: 'expense', // 'expense' or 'report'
      cardFilter: 'corp',   // 'corp' or 'personal'
      reportFilter: 'all',  // 'all', 'draft', 'pending', 'approved'
      expenses: {
        corp: [
          { id: 1, type: 'restaurant', date: '11. 24 (금) 12:30', title: '(주)맛있는식당 강남점', amount: 85000, status: 'unresolved' },
          { id: 2, type: 'taxi', date: '11. 23 (목) 20:15', title: '카카오T택시', amount: 18500, status: 'unresolved' },
          { id: 3, type: 'coffee', date: '11. 22 (수) 14:00', title: '스타벅스 코엑스점', amount: 21000, status: 'completed' }
        ],
        personal: [
          { id: 4, type: 'shopping', date: '11. 25 (토) 10:10', title: '교보문고 강남점 (도서)', amount: 34000, status: 'unresolved' },
          { id: 5, type: 'coffee', date: '11. 21 (화) 15:45', title: '폴바셋 가산점', amount: 6500, status: 'completed' }
        ]
      }
    },
    isCheckedIn: false,
    checkInTime: null,
    todaySeconds: 0,
    timerInterval: null,
    clockInterval: null,
    currentLocation: '서울 금천구 벚꽃로 298',
    gpsLat: null,
    gpsLng: null,
    officeLocation: {
      name: '서울 금천구 벚꽃로 298',
      address: '서울특별시 금천구 벚꽃로 298 (가산동)',
      lat: 37.48120,
      lng: 126.88370,
      allowedRadiusMeters: 500
    },
    currentFilter: 'all',
    settings: {
      notif: true,
      dark: false,
      gps: true,
      themeIdx: 3
    },
    user: {
      name: '이재광',
      fullName: '이재광',
      email: 'jaegwang@company.com',
      role: '시니어 운영 관리자',
      id: 'FA-99283'
    },
    currentNoticeCategory: 'all',
    currentNoticeId: 1,
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
        content: `
          <p class="mb-3">안녕하십니까, 임직원 여러분.</p>
          <p class="mb-3">2024년도 하반기 전사 워크샵 일정을 아래와 같이 안내드리오니, 부서별 일정을 확인하시어 준비해 주시기 바랍니다. 소통과 단합을 위한 다양하고 유익한 프로그램이 준비되어 있습니다.</p>
          <div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary">
            <h3 class="font-headline font-bold text-primary mb-2 text-sm">워크샵 주요 일정</h3>
            <ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant">
              <li><strong>일시:</strong> 2024년 11월 14일(목) ~ 11월 15일(금) [1박 2일]</li>
              <li><strong>장소:</strong> 강원도 속초 리조트 메인 홀</li>
              <li><strong>참석 대상:</strong> 전 임직원</li>
              <li><strong>집결:</strong> 사옥 전면 주차장 08:30 대형버스 탑승</li>
            </ul>
          </div>
          <p>상세 안내 자료 및 세부 편성표는 첨부파일을 확인해 주시기 바랍니다. 문의사항은 인사팀으로 연락 부탁드립니다.</p>
        `,
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
        content: `
          <p class="mb-3">안녕하세요, 복지팀입니다.</p>
          <p class="mb-3">임직원분들의 편의 증진을 위해 2024년도 종합 건강검진 지정 제휴 병원을 추가 지정하였습니다.</p>
          <div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary">
            <h3 class="font-headline font-bold text-primary mb-2 text-sm">신규 제휴 병원 안내</h3>
            <ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant">
              <li>강남 세브란스 검진센터 (서울)</li>
              <li>분당 서울대병원 건강증진센터 (경기)</li>
              <li>예약 방법: 사내 복지 포털 로그인 후 온라인 신청</li>
            </ul>
          </div>
        `,
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
        content: `
          <p class="mb-3">안녕하세요, IT지원팀입니다.</p>
          <p class="mb-3">안정적인 사내 그룹웨어 서비스 제공을 위한 정기 네트워크 점검 작업이 진행됩니다.</p>
          <div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary">
            <h3 class="font-headline font-bold text-primary mb-2 text-sm">작업 일시 및 영향</h3>
            <ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant">
              <li><strong>점검 시간:</strong> 2024년 10월 27일(일) 02:00 ~ 06:00 (4시간)</li>
              <li><strong>영향 범위:</strong> 그룹웨어, 전자결재, 출퇴근 관리 서비스 접근 불가</li>
            </ul>
          </div>
        `,
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
        content: `
          <p class="mb-3">축하합니다!</p>
          <p class="mb-3">10월 한 달간 뛰어난 성과와 헌신을 보여준 이달의 우수 사원 수상자를 발표합니다.</p>
          <p class="text-xs text-on-surface-variant">수상자 분들께는 개별 소정의 포상금과 수당이 지급됩니다.</p>
        `,
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
        content: `
          <p class="mb-3">안녕하세요, 총무팀입니다.</p>
          <p class="mb-3">사옥 주차 공간 효율화를 위해 주차등록 수칙이 일부 변경됩니다.</p>
        `,
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
        content: `
          <p class="mb-3">안녕하십니까, 임직원 여러분.</p>
          <p class="mb-3">2024년도 귀속 연말정산 일정을 아래와 같이 안내드리오니, 기한 내에 관련 서류를 제출하여 주시기 바랍니다. 올해부터 변경되는 세법 적용 사항이 있으니 첨부된 가이드라인을 반드시 확인해주시길 부탁드립니다.</p>
          <div class="bg-surface-container rounded-2xl overflow-hidden p-5 my-5 border-l-[5px] border-primary">
            <h3 class="font-headline font-semibold text-primary mb-2 text-sm">주요 일정</h3>
            <ul class="list-disc list-inside space-y-1.5 text-xs text-on-surface-variant">
              <li>국세청 간소화 서비스 오픈: 2024.01.15</li>
              <li>서류 제출 마감: 2024.01.31 (수) 18:00까지</li>
              <li>예상 환급금 조회: 2024.02.15 이후</li>
            </ul>
          </div>
          <p>기타 문의사항은 인사팀(내선 1234)으로 연락 주시기 바랍니다. 감사합니다.</p>
        `,
        fileName: '2024_연말정산_가이드라인.pdf',
        fileSize: '2.4 MB'
      }
    ],
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth() + 1,
    calSelectedDay: new Date().getDate(),
    currentDirectoryCategory: 'all',
    currentEmployeeId: 1,
    employees: [
      {
        id: 1,
        name: '김경현',
        dept: '경영지원팀',
        role: '대표',
        phone: '010-8885-5177',
        tel: '070-7711-4823',
        email: 'abc@wordncode.com',
        avatar: './resource/image/profile_abc.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 2,
        name: '오은주',
        dept: '경영지원팀',
        role: '차장',
        phone: '010-3712-7932',
        tel: '070-7711-4819',
        email: 'sky@wordncode.com',
        avatar: './resource/image/profile_sky.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 3,
        name: '김종규',
        dept: '기획팀',
        role: '팀장',
        phone: '010-4781-7808',
        tel: '070-8805-1647',
        email: 'john@wordncode.com',
        avatar: './resource/image/profile_john.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 4,
        name: '박규태',
        dept: '기획팀',
        role: '대리',
        phone: '010-3230-1573',
        tel: '070-8805-1647',
        email: 'green@wordncode.com',
        avatar: './resource/image/profile_green.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 5,
        name: '한상희',
        dept: '기획팀',
        role: '사원',
        phone: '010-2635-9110',
        tel: '070-7711-4815',
        email: 'star@wordncode.com',
        avatar: './resource/image/profile_star_20250326.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 6,
        name: '장현아',
        dept: '기획팀',
        role: '수습',
        phone: '010-4562-3633',
        tel: '070-7711-4809',
        email: 'you@wordncode.com',
        avatar: './resource/image/profile_janghyunah.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 7,
        name: '윤익수',
        dept: '디자인팀',
        role: '부장',
        phone: '010-2707-5681',
        tel: '070-8805-1646',
        email: 'blue@wordncode.com',
        avatar: './resource/image/profile_blue.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 8,
        name: '최지영',
        dept: '디자인팀',
        role: '과장',
        phone: '010-8632-0944',
        tel: '070-7711-4821',
        email: 'white@wordncode.com',
        avatar: './resource/image/profile_white.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 9,
        name: '신현우',
        dept: '디자인팀',
        role: '주임',
        phone: '010-8337-0176',
        tel: '070-7711-4810',
        email: 'pink@wordncode.com',
        avatar: './resource/image/profile_pink____________.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 10,
        name: '명희진',
        dept: '디자인팀',
        role: '주임',
        phone: '010-2607-5235',
        tel: '070-7711-4812',
        email: 'gray@wordncode.com',
        avatar: './resource/image/profile_gray_20240502__.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 11,
        name: '이재광',
        dept: '퍼블리싱팀',
        role: '차장',
        phone: '010-5244-1251',
        tel: '070-7711-4808',
        email: 'yellow@wordncode.com',
        avatar: 'profile.png',
        status: 'online',
        statusText: '근무중'
      },
      {
        id: 12,
        name: '조지혜',
        dept: '퍼블리싱팀',
        role: '과장',
        phone: '010-2362-0263',
        tel: '070-7711-4806',
        email: 'red@wordncode.com',
        avatar: './resource/image/profile_red_20260602.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 13,
        name: '손석호',
        dept: '퍼블리싱팀',
        role: '주임',
        phone: '010-6565-4215',
        tel: '070-7711-4811',
        email: 'pub@wordncode.com',
        avatar: './resource/image/profile_pub.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 14,
        name: '최우석',
        dept: '개발팀',
        role: '과장',
        phone: '010-2887-1810',
        tel: '070-8805-1648',
        email: 'mobile@wordncode.com',
        avatar: './resource/image/profile_mobile.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 15,
        name: '안영재',
        dept: '개발팀',
        role: '대리',
        phone: '010-9776-1309',
        tel: '070-7711-4805',
        email: 'pro@wordncode.com',
        avatar: './resource/image/profile_pro.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 16,
        name: '곽재훈',
        dept: '개발팀',
        role: '대리',
        phone: '010-8479-8729',
        tel: '070-7711-1653',
        email: 'spring@wordncode.com',
        avatar: './resource/image/profile_spring.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 17,
        name: '유종현',
        dept: '개발팀',
        role: '주임',
        phone: '010-7455-4047',
        tel: '070-7711-4820',
        email: 'jsp@wordncode.com',
        avatar: './resource/image/profile_jsp.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 18,
        name: '남기현',
        dept: '전략본부',
        role: '본부장',
        phone: '010-5578-9436',
        tel: '070-7711-4804',
        email: 'help@wordncode.com',
        avatar: './resource/image/profile_help.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 19,
        name: '윤진성',
        dept: '전략본부',
        role: '과장',
        phone: '010-2889-3274',
        tel: '070-7711-4822',
        email: 'apple@wordncode.com',
        avatar: './resource/image/profile_apple_20250611.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 20,
        name: '김종규',
        dept: '수행본부',
        role: '본부장',
        phone: '010-4781-7808',
        tel: '070-8805-1647',
        email: 'john@wordncode.com',
        avatar: './resource/image/profile_john_.png',
        status: 'active',
        statusText: ''
      },
      {
        id: 21,
        name: '이채원',
        dept: '수행본부',
        role: '사원',
        phone: '010-3533-1662',
        tel: '070-4210-6134',
        email: 'cool@wordncode.com',
        avatar: './resource/image/profile_cool_20241224_lee.png',
        status: 'active',
        statusText: ''
      }
    ],
    logs: [
      {
        id: 1,
        monthStr: '10월',
        dayNum: '24',
        dayName: '목요일',
        statusText: '출근 • 8시간 12분',
        statusType: 'normal',
        checkInTimeStr: '오전 08:54',
        checkOutTimeStr: '오후 05:06',
        durationSec: 29520
      },
      {
        id: 2,
        monthStr: '10월',
        dayNum: '23',
        dayName: '수요일',
        statusText: '출근 • 7시간 45분',
        statusType: 'normal',
        checkInTimeStr: '오전 09:15',
        checkOutTimeStr: '오후 05:00',
        durationSec: 27900
      },
      {
        id: 3,
        monthStr: '10월',
        dayNum: '22',
        dayName: '화요일',
        statusText: '재택 • 8시간 00분',
        statusType: 'remote',
        checkInTimeStr: '오전 09:00',
        checkOutTimeStr: '오후 05:00',
        durationSec: 28800
      },
      {
        id: 4,
        monthStr: '10월',
        dayNum: '21',
        dayName: '월요일',
        statusText: '출근 • 9시간 02분',
        statusType: 'normal',
        checkInTimeStr: '오전 08:48',
        checkOutTimeStr: '오후 05:50',
        durationSec: 32520
      },
      {
        id: 5,
        monthStr: '10월',
        dayNum: '18',
        dayName: '금요일',
        statusText: '연차 • 휴가',
        statusType: 'remote',
        checkInTimeStr: '-',
        checkOutTimeStr: '-',
        durationSec: 28800
      }
    ]
  },

  init() {
    this.loadState();
    this.applyTheme(this.state.settings.themeIdx || 3);
    this.startLiveClock();
    
    // 브라우저 뒤로가기(popstate) 발생 시 탭 전환 연동
    window.addEventListener('popstate', (event) => {
      if (this.state.isLoggedIn) {
        if (event.state && event.state.activeTab) {
          this.switchTab(event.state.activeTab, null, true);
        } else {
          this.switchTab('screen-home', null, true);
        }
      }
    });

    // Initialize SortableJS for Home Menu Grid
    const menuGrid = document.getElementById('home-menu-grid');
    if (menuGrid && typeof Sortable !== 'undefined') {
      const savedOrder = JSON.parse(localStorage.getItem('wordncode_menu_order'));
      if (savedOrder && Array.isArray(savedOrder)) {
        savedOrder.reverse().forEach(id => {
          const el = menuGrid.querySelector(`[data-id="${id}"]`);
          if (el) menuGrid.prepend(el);
        });
      }
      Sortable.create(menuGrid, {
        animation: 0,
        handle: '.drag-handle',
        ghostClass: 'opacity-30',
        forceFallback: true,
        fallbackClass: 'shadow-2xl !transition-none',
        onEnd: () => {
          const newOrder = Array.from(menuGrid.children).map(el => el.getAttribute('data-id'));
          localStorage.setItem('wordncode_menu_order', JSON.stringify(newOrder));
        }
      });
    }
    
    // 탭/창 백그라운드 전환 시 공지 티커 중지/재개 (타이머 중첩 & 텍스트 겹침 완벽 방지)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopNoticeTicker();
      } else if (this.state.isLoggedIn) {
        this.startNoticeTicker();
      }
    });

    // Check initial logged in state
    if (this.state.isLoggedIn) {
      this.showAppShell();
    } else {
      this.hideAppShell();
      this.showScreen('screen-login');
    }

    if (this.state.isCheckedIn && this.state.checkInTime) {
      this.startWorkTimer();
    }

    // Auto-fetch real GPS location on init
    this.updateRealGPSLocation(false);

    this.renderUI();
  },

  // Real GPS Geolocation & Reverse Geocoding
  updateRealGPSLocation(showNotice = true) {
    if (!navigator.geolocation) {
      if (showNotice) this.showToast('⚠️ 기기에서 GPS 지오로케이션을 지원하지 않습니다.');
      return;
    }

    if (showNotice) {
      this.showToast('📡 현재 실시간 GPS 위치를 수신 중입니다...');
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko`);
          const data = await res.json();
          let addr = '';
          if (data && data.address) {
            const a = data.address;
            const city = a.province || a.city || a.county || '';
            const district = a.borough || a.suburb || a.district || a.quarter || '';
            const road = a.road || a.neighbourhood || '';
            addr = `${city} ${district} ${road}`.trim();
          }
          if (!addr && data.display_name) {
            addr = data.display_name.split(',')[0];
          }
          const locStr = addr ? `${addr} (GPS ${lat}, ${lng})` : `위도: ${lat}, 경도: ${lng}`;
          this.state.currentLocation = locStr;
          if (showNotice) {
            this.showToast(`📍 실시간 GPS 연동 성공: ${addr || lat + ', ' + lng}`);
          }
        } catch (err) {
          this.state.currentLocation = `실시간 좌표 (위도: ${lat}, 경도: ${lng})`;
          if (showNotice) {
            this.showToast(`📍 GPS 좌표 수신 완료 (${lat}, ${lng})`);
          }
        }

        this.saveState();
        this.renderUI();
      },
      (err) => {
        console.warn('GPS Error:', err);
        if (showNotice) {
          this.showToast('⚠️ GPS 수신 실패: 기기 위치 접근 권한을 허용해 주세요.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  },

  loadState() {
    try {
      const saved = localStorage.getItem('wordncode_groupware_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.isLoggedIn = parsed.isLoggedIn ?? false;
        this.state.isCheckedIn = parsed.isCheckedIn ?? false;
        this.state.checkInTime = parsed.checkInTime ? new Date(parsed.checkInTime) : null;
        this.state.settings = { ...this.state.settings, ...parsed.settings };
        this.state.activeTab = parsed.activeTab ?? 'screen-home';
        if (parsed.logs && parsed.logs.length) {
          this.state.logs = parsed.logs;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  saveState() {
    try {
      localStorage.setItem('wordncode_groupware_state', JSON.stringify({
        isLoggedIn: this.state.isLoggedIn,
        isCheckedIn: this.state.isCheckedIn,
        checkInTime: this.state.checkInTime,
        settings: this.state.settings,
        logs: this.state.logs,
        activeTab: this.state.activeTab
      }));
    } catch (e) {
      console.warn('Save error:', e);
    }
  },

  // Live Clock Engine
  startLiveClock() {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampmStr = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours ? hours : 12;

      const clockEl = document.getElementById('live-clock');
      const ampmEl = document.getElementById('live-ampm');
      const dayEl = document.getElementById('live-day');
      const dateEl = document.getElementById('live-date');

      if (clockEl) clockEl.innerText = `${String(hours).padStart(2, '0')}:${minutes}`;
      if (ampmEl) ampmEl.innerText = ampmStr;

      const daysArr = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      if (dayEl) dayEl.innerText = daysArr[now.getDay()];
      if (dateEl) dateEl.innerText = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
    };

    updateClock();
    this.state.clockInterval = setInterval(updateClock, 1000);
  },

  // Live Work Timer
  startWorkTimer() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);

    const updateTimer = () => {
      if (!this.state.checkInTime) return;
      const now = Date.now();
      const diffSec = Math.floor((now - new Date(this.state.checkInTime).getTime()) / 1000);
      this.state.todaySeconds = Math.max(0, diffSec);

      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      const timerEl = document.getElementById('today-work-time');
      if (timerEl) {
        timerEl.innerText = `${hours}시간 ${mins}분 ${String(secs).padStart(2, '0')}초`;
      }
    };

    updateTimer();
    this.state.timerInterval = setInterval(updateTimer, 1000);
  },

  stopWorkTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  },

  // Called when user clicks Pulse Button (Open Confirm Modal)
  toggleCheckIn() {
    const iconWrap = document.getElementById('confirm-modal-icon-wrap');
    const icon = document.getElementById('confirm-modal-icon');
    const title = document.getElementById('confirm-modal-title');
    const msg = document.getElementById('confirm-modal-msg');
    const btn = document.getElementById('confirm-modal-btn');

    if (!this.state.isCheckedIn) {
      // PREPARE CHECK-IN CONFIRM MODAL
      if (iconWrap) {
        iconWrap.style.background = 'rgba(0, 82, 208, 0.1)';
        iconWrap.style.color = 'var(--primary)';
      }
      if (icon) icon.innerText = 'touch_app';
      if (title) title.innerText = '출근 등록 확인';
      if (msg) {
        msg.innerHTML = `현재 위치(<strong>${this.state.currentLocation}</strong>)에서<br><strong>출근</strong> 처리를 진행하시겠습니까?`;
      }
      if (btn) {
        btn.innerText = '출근하기';
        btn.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dim))';
      }
    } else {
      // PREPARE CHECK-OUT CONFIRM MODAL
      const now = Date.now();
      const diffSec = Math.floor((now - new Date(this.state.checkInTime).getTime()) / 1000);
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);

      if (iconWrap) {
        iconWrap.style.background = 'rgba(0, 105, 63, 0.15)';
        iconWrap.style.color = 'var(--secondary)';
      }
      if (icon) icon.innerText = 'logout';
      if (title) title.innerText = '퇴근 처리 확인';
      if (msg) {
        msg.innerHTML = `오늘 업무를 종료하고 <strong>퇴근</strong> 처리하시겠습니까?<br><span style="font-size: 0.8rem; color: var(--on-surface-variant); display: inline-block; margin-top: 0.35rem;">⏱ 오늘 근무 시간: <strong>${hours}시간 ${mins}분</strong></span>`;
      }
      if (btn) {
        btn.innerText = '퇴근하기';
        btn.style.background = 'linear-gradient(135deg, #00693f, #27d085)';
      }
    }

    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('active');
  },

  closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('active');
  },

  // Geofencing Location Calculation & Distance Checking
  calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  checkIsAtOffice() {
    const target = this.state.officeLocation;
    const locStr = this.state.currentLocation || '';

    // Check by string address keyword
    if (locStr.includes('금천구') || locStr.includes('벚꽃로') || locStr.includes('가산')) {
      return { isAllowed: true, distanceMeter: 0, reason: '지정 오피스 주소 매칭 성공' };
    }

    // Check by real GPS coordinates
    if (this.state.gpsLat && this.state.gpsLng) {
      const dist = this.calculateDistanceMeters(
        parseFloat(this.state.gpsLat),
        parseFloat(this.state.gpsLng),
        target.lat,
        target.lng
      );
      if (dist <= target.allowedRadiusMeters) {
        return { isAllowed: true, distanceMeter: dist, reason: `지정 반경 내 위치 (${dist}m)` };
      } else {
        return { isAllowed: false, distanceMeter: dist, reason: `지정 장소 반경 초과 (${dist}m 이탈)` };
      }
    }

    // Default fallback when GPS permission denied or address unverified
    return { isAllowed: false, distanceMeter: null, reason: 'GPS 위치 미확인' };
  },

  // Called when user clicks "확인" in Confirm Modal
  executeToggleCheckIn() {
    this.closeConfirmModal();

    if (!this.state.isCheckedIn) {
      // GEOFENCE VALIDATION
      const geo = this.checkIsAtOffice();

      if (!geo.isAllowed) {
        const distInfo = geo.distanceMeter !== null ? ` (현재 이탈 거리: 약 ${geo.distanceMeter >= 1000 ? (geo.distanceMeter / 1000).toFixed(1) + 'km' : geo.distanceMeter + 'm'})` : '';
        
        this.showToast(`⛔ 출근 거부: 지정 장소(서울 금천구 벚꽃로 298) 반경 500m 이내에서만 출근이 가능합니다.`);
        
        setTimeout(() => {
          alert(`⛔ 출근 체크 실패 (위치 제한)\n\n지정된 출근 가능 장소:\n• 서울 금천구 벚꽃로 298 (가산동)\n• 허용 반경: 500m 이내\n\n현재 수신된 위치:\n• ${this.state.currentLocation}${distInfo}\n\n회사 지정 출근 지역으로 이동하신 후 다시 시도해 주세요.`);
        }, 100);
        return;
      }

      // EXECUTE CHECK IN
      this.state.isCheckedIn = true;
      this.state.checkInTime = new Date();
      this.startWorkTimer();
      this.showToast('🎉 서울 금천구 벚꽃로 298 출근 체크 성공! 좋은 하루 되세요.');
    } else {
      // EXECUTE CHECK OUT
      const now = new Date();
      const checkInDate = new Date(this.state.checkInTime);
      const diffSec = Math.floor((now.getTime() - checkInDate.getTime()) / 1000);
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);

      const formatTime = (d) => {
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ap = h >= 12 ? '오후' : '오전';
        h = h % 12 || 12;
        return `${ap} ${String(h).padStart(2, '0')}:${m}`;
      };

      const daysArr = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

      // Add Log
      const newLog = {
        id: Date.now(),
        monthStr: `${now.getMonth() + 1}월`,
        dayNum: String(now.getDate()),
        dayName: daysArr[now.getDay()],
        statusText: `출근 • ${hours}시간 ${mins}분`,
        statusType: 'normal',
        checkInTimeStr: formatTime(checkInDate),
        checkOutTimeStr: formatTime(now),
        durationSec: diffSec
      };

      this.state.logs.unshift(newLog);
      this.state.isCheckedIn = false;
      this.state.checkInTime = null;
      this.stopWorkTimer();

      const timerEl = document.getElementById('today-work-time');
      if (timerEl) timerEl.innerText = `${hours}시간 ${mins}분 (완료)`;

      this.showToast('👏 오늘 업무가 종료되었습니다. 수고하셨습니다!');
    }

    this.saveState();
    this.renderUI();
  },

  login() {
    this.state.isLoggedIn = true;
    this.state.activeTab = 'screen-home';
    this.saveState();
    history.replaceState({ activeTab: 'screen-home' }, '', '#screen-home');
    this.showAppShell();
    this.showToast(`🎉 ${this.state.user.name}님, 환영합니다! 워드앤코드 그룹웨어를 시작합니다.`);
  },

  loginDemo(provider) {
    this.state.isLoggedIn = true;
    this.state.activeTab = 'screen-home';
    this.saveState();
    history.replaceState({ activeTab: 'screen-home' }, '', '#screen-home');
    this.showAppShell();
    const msg = provider 
      ? `🎉 ${provider} 계정으로 로그인되었습니다.` 
      : `🎉 ${this.state.user.name}님, 로그인 완료! 출결 관리 화면으로 이동합니다.`;
    this.showToast(msg);
  },

  logout() {
    this.state.isLoggedIn = false;
    this.state.isCheckedIn = false;
    this.stopWorkTimer();
    this.saveState();
    history.replaceState(null, '', '#login');
    
    this.hideAppShell();
    this.showScreen('screen-login');
    this.showToast('로그아웃 되었습니다.');
  },

  hideAppShell() {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    const ticker = document.getElementById('notice-ticker');
    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';
    if (ticker) ticker.style.display = 'none';
    this.stopNoticeTicker();
  },

  showAppShell() {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    const ticker = document.getElementById('notice-ticker');
    if (header) header.style.display = 'flex';
    if (nav) nav.style.display = 'flex';
    if (ticker) ticker.style.display = 'flex';
    this.startNoticeTicker();

    const startTab = this.state.activeTab || 'screen-home';
    history.replaceState({ activeTab: startTab }, '', `#${startTab}`);
    this.switchTab(startTab, null, true);
  },

  // =========================================
  // 플립형 공지 티커 (텍스트 겹침 오류 완벽 방지)
  // =========================================
  startNoticeTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    // 기존 실행 중인 타이머 확실히 정지
    this.stopNoticeTicker();

    // 공지사항 목록에서 제목 추출 (최신 순, 최대 6개)
    const items = (this.state.notices || [])
      .slice(0, 6)
      .map(n => (n.isPinned ? `📌 ${n.title}` : n.title));

    if (items.length === 0) return;

    // DOM 완전 초기화 (누적 찌꺼기 노드 즉시 삭제)
    track.innerHTML = '';

    let currentIdx = 0;
    const initialEl = document.createElement('div');
    initialEl.className = 'ticker-item static';
    initialEl.textContent = items[0];
    track.appendChild(initialEl);

    if (items.length <= 1) return;

    this._tickerInterval = setInterval(() => {
      // 1. 찌꺼기 노드 정리 (DOM 상에 1개 초과 노드가 존재하면 최신 노드 제외 즉시 삭제)
      const existingNodes = Array.from(track.querySelectorAll('.ticker-item'));
      if (existingNodes.length > 1) {
        existingNodes.slice(0, existingNodes.length - 1).forEach(el => el.remove());
      }

      const activeEl = track.querySelector('.ticker-item');
      if (!activeEl) return;

      const nextIdx = (currentIdx + 1) % items.length;

      // 2. 현재 노드 퇴장 애니메이션
      activeEl.className = 'ticker-item flip-out';

      // 3. 신규 노드 생성 및 등장 애니메이션
      const nextEl = document.createElement('div');
      nextEl.className = 'ticker-item flip-in';
      nextEl.textContent = items[nextIdx];
      track.appendChild(nextEl);

      // 4. 퇴장 노드 안전하게 제거
      setTimeout(() => {
        if (activeEl && activeEl.parentNode === track) {
          track.removeChild(activeEl);
        }
      }, 450);

      currentIdx = nextIdx;
    }, 4000);
  },

  stopNoticeTicker() {
    if (this._tickerInterval) {
      clearInterval(this._tickerInterval);
      this._tickerInterval = null;
    }
  },

  // Navigation
  switchTab(targetId, navEl, isPopState = false) {
    this.state.activeTab = targetId;
    this.showScreen(targetId);
    this.saveState(); // 탭 이동 시 상태를 저장하여 새로고침 시 화면 복원

    // popstate(뒤로가기)에 의한 탭 전환이 아닐 때만 히스토리 스택에 push
    if (!isPopState) {
      history.pushState({ activeTab: targetId }, '', `#${targetId}`);
    }

    // Update bottom nav active state
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (targetId === 'screen-logs') {
      this.renderLogs();
    } else if (targetId === 'screen-notice-list') {
      this.renderNotices();
    } else if (targetId === 'screen-directory') {
      this.renderDirectory();
    } else if (targetId === 'screen-calendar') {
      this.renderCalendar();
    } else if (targetId === 'screen-calendar-weekly') {
      this.renderWeeklyCalendar();
    } else if (targetId === 'screen-finance') {
      this.renderExpenses();
    }
  },

  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  },

  // Finance / Expense & Report Methods
  switchFinanceTab(tabType) {
    this.state.finance.activeTab = tabType;
    
    const tabExpense = document.getElementById('finance-tab-expense');
    const tabReport = document.getElementById('finance-tab-report');
    const contentExpense = document.getElementById('finance-expense-content');
    const contentReport = document.getElementById('finance-report-content');
    const titleEl = document.getElementById('finance-main-title');
    const subEl = document.getElementById('finance-main-sub');

    if (tabType === 'expense') {
      titleEl.innerText = '지출결의서';
      subEl.innerText = '미결의 내역 및 결의서를 관리하세요.';
      
      tabExpense.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center';
      tabReport.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center';
      
      contentExpense.classList.remove('hidden');
      contentReport.classList.add('hidden');
      this.renderExpenses();
    } else {
      titleEl.innerText = '품의서';
      subEl.innerText = '최근 문서 진행 현황을 확인하세요.';

      tabReport.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center';
      tabExpense.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center';

      contentReport.classList.remove('hidden');
      contentExpense.classList.add('hidden');
      this.filterReportStatus(this.state.finance.reportFilter);
    }
  },

  filterCardType(cardType) {
    this.state.finance.cardFilter = cardType;
    
    const filterCorp = document.getElementById('card-filter-corp');
    const filterPersonal = document.getElementById('card-filter-personal');

    if (cardType === 'corp') {
      filterCorp.className = 'py-1.5 px-4 rounded-lg text-xs font-label font-bold text-on-primary bg-primary transition-all';
      filterPersonal.className = 'py-1.5 px-4 rounded-lg text-xs font-label font-medium text-on-surface-variant hover:bg-surface-container-low transition-all';
    } else {
      filterPersonal.className = 'py-1.5 px-4 rounded-lg text-xs font-label font-bold text-on-primary bg-primary transition-all';
      filterCorp.className = 'py-1.5 px-4 rounded-lg text-xs font-label font-medium text-on-surface-variant hover:bg-surface-container-low transition-all';
    }
    
    this.renderExpenses();
  },

  filterReportStatus(status) {
    this.state.finance.reportFilter = status;
    
    const filters = ['all', 'draft', 'pending', 'approved'];
    filters.forEach(f => {
      const el = document.getElementById(`report-filter-${f}`);
      if (el) {
        if (f === status) {
          el.className = 'whitespace-nowrap px-4 py-2 bg-primary text-on-primary rounded-full font-label text-xs font-semibold shadow-sm transition-transform active:scale-95';
        } else {
          el.className = 'whitespace-nowrap px-4 py-2 bg-surface-container-lowest text-on-surface-variant rounded-full font-label text-xs font-semibold hover:bg-surface-container-low transition-colors active:scale-95';
        }
      }
    });

    const articles = document.querySelectorAll('#report-list-container article');
    articles.forEach(article => {
      const artStatus = article.getAttribute('data-status');
      if (status === 'all' || artStatus === status) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  },

  // Close finance modals
  closeFinanceModal(type) {
    const modalId = type === 'expense' ? 'modal-expense-write' : 'modal-report-write';
    const modalEl = document.getElementById(modalId);
    if (modalEl) modalEl.classList.add('hidden');
    
    // Reset forms
    const formId = type === 'expense' ? 'form-expense-write' : 'form-report-write';
    const formEl = document.getElementById(formId);
    if (formEl) {
      formEl.reset();
      if (type === 'expense') {
        const fileLabel = document.getElementById('expense-receipt-name');
        if (fileLabel) fileLabel.innerText = '첨부된 파일 없음';
      }
    }
  },

  // Mock Receipt attachment simulation
  attachMockReceipt() {
    const fileLabel = document.getElementById('expense-receipt-name');
    if (fileLabel) {
      fileLabel.innerText = 'receipt_2026_08_11.png';
      this.showToast('📎 가상의 영수증 이미지 파일이 첨부되었습니다.');
    }
  },

  writeExpenseResolve(title, amount) {
    this.openNewFinanceRequest('expense');
    
    // Prefill vendor and amount
    const storeInput = document.getElementById('expense-input-store');
    const amountInput = document.getElementById('expense-input-amount');
    
    if (storeInput) storeInput.value = title;
    if (amountInput) amountInput.value = amount;
  },

  continueReportDraft() {
    this.openNewFinanceRequest('report');
    
    // Prefill draft info
    const titleInput = document.getElementById('report-input-title');
    const contentInput = document.getElementById('report-input-content');
    
    if (titleInput) titleInput.value = '사내 복지 포인트 지급 기준 변경';
    if (contentInput) contentInput.value = '사내 복지 포인트 지급 한도 및 사용처 다양화에 따른 지급 세부 기준 개선 품의서 초안입니다.';
  },

  openNewFinanceRequest(forcedType = null) {
    const activeTab = forcedType || this.state.finance.activeTab;
    const modalId = activeTab === 'expense' ? 'modal-expense-write' : 'modal-report-write';
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    modalEl.classList.remove('hidden');
    
    // Set default today date for expense input
    if (activeTab === 'expense') {
      const today = new Date().toISOString().substring(0, 10);
      const dateEl = document.getElementById('expense-input-date');
      if (dateEl) dateEl.value = today;
    }
  },

  submitExpenseWrite() {
    const store = document.getElementById('expense-input-store').value;
    const amount = parseInt(document.getElementById('expense-input-amount').value, 10) || 0;
    const dateInput = document.getElementById('expense-input-date').value;
    const category = document.getElementById('expense-input-category').value;
    
    // Format date string (e.g., "11. 24 (금) 12:30")
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const formattedDate = `${dateObj.getMonth() + 1}. ${dateObj.getDate()} (${days[dateObj.getDay()]}) 12:00`;

    const cardFilter = this.state.finance.cardFilter;
    const newExpense = {
      id: Date.now(),
      type: category || 'restaurant',
      date: formattedDate,
      title: store,
      amount: amount,
      status: 'unresolved'
    };

    // Add to state
    this.state.finance.expenses[cardFilter].unshift(newExpense);
    
    // Re-render
    this.renderExpenses();
    this.closeFinanceModal('expense');
    this.showToast('🎉 지출결의서 작성이 정상적으로 처리되었습니다!');
  },

  submitReportWrite(isDraft = false) {
    const title = document.getElementById('report-input-title').value;
    const approver = document.getElementById('report-input-approver').value;
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const status = isDraft ? 'draft' : 'pending';
    const badgeClass = isDraft ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container/20 text-tertiary-dim';
    const badgeIcon = isDraft ? 'edit_document' : 'pending_actions';
    const badgeText = isDraft ? '임시저장' : '결재대기';

    const article = document.createElement('article');
    article.setAttribute('data-status', status);
    article.className = `bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_16px_rgba(35,44,81,0.02)] flex flex-col gap-4 border border-outline-variant/10 ${isDraft ? 'opacity-80' : ''}`;

    let bottomHtml = '';
    if (isDraft) {
      bottomHtml = `
        <div class="flex items-center justify-between mt-1">
          <span class="font-body text-xs text-outline">초안 작성 중...</span>
          <button onclick="App.continueReportDraft()" class="text-primary font-label text-xs font-semibold hover:text-primary-dim transition-colors">이어서 작성</button>
        </div>
      `;
    } else {
      bottomHtml = `
        <div class="flex items-center gap-2 mt-1">
          <div class="w-6 h-6 rounded-full bg-surface-container-high overflow-hidden">
            <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5_BB-f_CanzBEINseddRGKGqWJ6aZuuNAPdBYGwLWebeCwIIolqmbs-JJm6YhqQedc-a2tGm-Q8tPlwGMQojb0_Vig-VX2IqCvCt9a0dTVxVTteKBWVVPycibFv_g_ppThLHac-PjJqjcb1Rue4IBNM_qNfaylqNKJRkrNGwwxFbtYwSVXIXYm-a65-TBSKXLejl8yvtvdUhHMZTF3pJdiTF2siD8GCwoFHNhBDMSLZ1u8NfG3WcKyA" alt="Avatar">
          </div>
          <span class="font-body text-xs text-on-surface-variant">결재자: ${approver}</span>
        </div>
      `;
    }

    article.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1 text-left">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm ${badgeClass} font-label text-[10px] font-bold w-fit">
            <span class="material-symbols-outlined text-[12px]">${badgeIcon}</span>
            ${badgeText}
          </span>
          <h3 class="font-headline text-base font-bold text-on-surface mt-2 leading-tight">${title}</h3>
        </div>
        <span class="text-on-surface-variant font-body text-xs">${todayStr}</span>
      </div>
      ${bottomHtml}
    `;

    const container = document.getElementById('report-list-container');
    if (container) {
      container.insertBefore(article, container.firstChild);
    }

    // Refresh view
    this.filterReportStatus(this.state.finance.reportFilter);
    this.closeFinanceModal('report');
    this.showToast(isDraft ? '💾 품의서가 임시저장되었습니다.' : '🚀 결재 요청 품의서가 성공적으로 등록되었습니다.');
  },

  renderExpenses() {
    const listContainer = document.getElementById('expense-list-container');
    if (!listContainer) return;

    const currentFilter = this.state.finance.cardFilter;
    const items = this.state.finance.expenses[currentFilter];

    // 미결의 건수 집계
    const unresolvedCount = items.filter(i => i.status === 'unresolved').length;
    const countEl = document.getElementById('expense-summary-count');
    if (countEl) countEl.innerText = `${unresolvedCount}건`;

    const subEl = document.getElementById('expense-summary-sub');
    if (subEl) {
      subEl.innerText = `이번 달 ${currentFilter === 'corp' ? '법인카드' : '개인카드'} 사용 내역 중 아직 결의되지 않은 항목들입니다.`;
    }

    let html = '';
    items.forEach(item => {
      let icon = 'receipt_long';
      let iconColor = 'text-primary';
      if (item.type === 'restaurant') { icon = 'restaurant'; }
      else if (item.type === 'taxi') { icon = 'local_taxi'; iconColor = 'text-tertiary'; }
      else if (item.type === 'coffee') { icon = 'coffee'; iconColor = 'text-outline'; }
      else if (item.type === 'shopping') { icon = 'shopping_bag'; iconColor = 'text-secondary'; }

      if (item.status === 'unresolved') {
        html += `
          <article class="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_16px_rgba(35,44,81,0.02)] flex flex-col gap-4 border border-outline-variant/10">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center ${iconColor} shrink-0">
                  <span class="material-symbols-outlined filled">${icon}</span>
                </div>
                <div class="flex flex-col text-left">
                  <span class="font-body text-xs text-on-surface-variant mb-0.5">${item.date}</span>
                  <strong class="font-headline text-base text-on-surface leading-tight">${item.title}</strong>
                </div>
              </div>
              <div class="text-right flex flex-col items-end">
                <span class="font-headline text-lg font-bold text-on-surface">${item.amount.toLocaleString()}원</span>
                <span class="text-[10px] font-label font-bold px-2 py-0.5 rounded-full bg-error-container/20 text-error-dim mt-1">미결의</span>
              </div>
            </div>
            <button onclick="App.writeExpenseResolve('${item.title}', ${item.amount})" class="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-label text-xs font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">edit_document</span>
              결의서 작성
            </button>
          </article>
        `;
      } else {
        html += `
          <article class="bg-surface-container-lowest/60 rounded-2xl p-5 flex flex-col gap-3 border border-outline-variant/10 opacity-70">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center ${iconColor} shrink-0">
                  <span class="material-symbols-outlined filled">${icon}</span>
                </div>
                <div class="flex flex-col text-left">
                  <span class="font-body text-xs text-outline mb-0.5">${item.date}</span>
                  <strong class="font-headline text-base text-on-surface-variant leading-tight">${item.title}</strong>
                </div>
              </div>
              <div class="text-right flex flex-col items-end">
                <span class="font-headline text-base font-bold text-on-surface-variant">${item.amount.toLocaleString()}원</span>
                <span class="text-[10px] font-label font-bold px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary-dim mt-1">완료</span>
              </div>
            </div>
          </article>
        `;
      }
    });

    listContainer.innerHTML = html;
  },

  // Attendance Calendar Methods
  prevMonth() {
    if (this.state.calMonth === 1) {
      this.state.calMonth = 12;
      this.state.calYear--;
    } else {
      this.state.calMonth--;
    }
    this.state.clickedTooltipDay = null;
    this.renderCalendar();
  },

  nextMonth() {
    if (this.state.calMonth === 12) {
      this.state.calMonth = 1;
      this.state.calYear++;
    } else {
      this.state.calMonth++;
    }
    this.state.clickedTooltipDay = null;
    this.renderCalendar();
  },

  resetCalendarToToday() {
    const today = new Date();
    this.state.calYear = today.getFullYear();
    this.state.calMonth = today.getMonth() + 1;
    this.state.calSelectedDay = today.getDate();
    this.state.clickedTooltipDay = null;
    this.renderCalendar();
  },

  openScheduleModal(selectedDate = null) {
    const modalEl = document.getElementById('modal-schedule-write');
    if (!modalEl) return;
    
    modalEl.classList.remove('hidden');
    
    const startDateEl = document.getElementById('schedule-input-start-date');
    const endDateEl = document.getElementById('schedule-input-end-date');
    
    const year = this.state.calYear || 2026;
    const month = String(this.state.calMonth || 8).padStart(2, '0');
    const day = String(this.state.calSelectedDay || 12).padStart(2, '0');
    const dateStr = selectedDate || `${year}-${month}-${day}`;
    
    if (startDateEl) startDateEl.value = dateStr;
    if (endDateEl) endDateEl.value = dateStr;
  },

  closeScheduleModal() {
    const modalEl = document.getElementById('modal-schedule-write');
    if (modalEl) modalEl.classList.add('hidden');
    
    const formEl = document.getElementById('form-schedule-write');
    if (formEl) formEl.reset();
  },

  openDirectoryPicker(targetType = 'schedule') {
    this.state.directoryPickerTarget = targetType;
    const modalEl = document.getElementById('modal-directory-picker');
    if (!modalEl) return;
    
    const searchInput = document.getElementById('directory-picker-search');
    if (searchInput) searchInput.value = '';
    
    modalEl.classList.remove('hidden');
    this.renderDirectoryPickerList();
  },

  closeDirectoryPicker() {
    const modalEl = document.getElementById('modal-directory-picker');
    if (modalEl) modalEl.classList.add('hidden');
  },

  filterDirectoryPicker() {
    this.renderDirectoryPickerList();
  },

  renderDirectoryPickerList() {
    const container = document.getElementById('directory-picker-list');
    if (!container) return;

    const query = (document.getElementById('directory-picker-search')?.value || '').toLowerCase().trim();
    const filtered = (this.state.employees || []).filter(emp => 
      !query || 
      emp.name.toLowerCase().includes(query) || 
      emp.dept.toLowerCase().includes(query) || 
      emp.role.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-on-surface-variant text-xs font-medium">
          검색 조건에 맞는 임직원이 없습니다.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(emp => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors">
        <div class="flex items-center gap-3">
          <img src="${emp.avatar || 'profile.png'}" alt="${emp.name}" class="w-9 h-9 rounded-full object-cover"/>
          <div>
            <div class="font-bold text-xs text-on-surface">${emp.name} ${emp.role}</div>
            <div class="text-[11px] text-on-surface-variant">${emp.dept}</div>
          </div>
        </div>
        <button type="button" onclick="App.selectDirectoryPickerMember('${emp.name} ${emp.role}')" class="px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-dim transition-colors active:scale-95">
          + 선택
        </button>
      </div>
    `).join('');
  },

  selectDirectoryPickerMember(memberLabel) {
    if (this.state.directoryPickerTarget === 'schedule') {
      const container = document.getElementById('schedule-participants-chips');
      if (container) {
        const chip = document.createElement('span');
        chip.className = 'inline-flex items-center gap-1 bg-surface-container-lowest text-primary text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm';
        chip.innerHTML = `${memberLabel} <button type="button" onclick="this.parentElement.remove()" class="w-4 h-4 flex items-center justify-center rounded-full hover:bg-error-container hover:text-error transition-colors"><span class="material-symbols-outlined text-[12px]">close</span></button>`;
        container.appendChild(chip);
      }
    } else if (this.state.directoryPickerTarget === 'approver') {
      const selectEl = document.getElementById('report-input-approver');
      if (selectEl) {
        let matchedOpt = Array.from(selectEl.options).find(opt => opt.value.includes(memberLabel.split(' ')[0]));
        if (matchedOpt) {
          selectEl.value = matchedOpt.value;
        }
      }
    }
    
    this.showToast(`👤 ${memberLabel} 님이 주소록에서 선택되었습니다.`);
    this.closeDirectoryPicker();
  },

  addScheduleParticipant() {
    this.openDirectoryPicker('schedule');
  },

  addExternalParticipant() {
    const input = document.getElementById('schedule-input-external');
    if (input && input.value.trim()) {
      this.showToast(`✉️ 외부 참석자 (${input.value.trim()}) 초대가 발송되었습니다.`);
      input.value = '';
    } else {
      this.showToast('외부 참석자 이메일을 입력해주세요.');
    }
  },

  selectRoomReservation(roomName) {
    this.showToast(`🏢 ${roomName} 예약 신청이 지정되었습니다.`);
  },

  submitScheduleModal() {
    const titleEl = document.getElementById('schedule-input-title');
    const startDateEl = document.getElementById('schedule-input-start-date');
    const startTimeEl = document.getElementById('schedule-input-start-time');
    const typeEl = document.getElementById('schedule-input-type');
    const isAllDayEl = document.getElementById('schedule-input-allday');
    
    const title = (titleEl?.value || '').trim() || '신규 일정';
    const startDate = startDateEl?.value || '2026-08-12';
    const startTime = startTimeEl?.value || '14:00';
    const isAllDay = isAllDayEl?.checked;
    
    const [year, month, day] = startDate.split('-').map(Number);
    const timeStr = isAllDay ? '종일' : `${startTime} ~ 1시간`;
    
    if (!this.mockDynamicSchedules) {
      this.mockDynamicSchedules = {};
    }
    const key = `${year}-${month}-${day}`;
    if (!this.mockDynamicSchedules[key]) {
      this.mockDynamicSchedules[key] = [];
    }
    
    this.mockDynamicSchedules[key].push({
      title: title,
      time: timeStr,
      type: typeEl?.value || 'primary',
      badge: '일정',
      author: '이재광',
      avatar: 'profile.png'
    });
    
    this.showToast(`✨ 일정 '${title}' 등록이 완료되었습니다!`);
    this.closeScheduleModal();
    
    this.renderCalendar();
  },

  selectCalendarDate(day) {
    if (this.state.calSelectedDay === day) {
      this.state.clickedTooltipDay = (this.state.clickedTooltipDay === day) ? null : day;
    } else {
      this.state.calSelectedDay = day;
      this.state.clickedTooltipDay = day;
    }
    this.renderCalendar();
  },

  getMockSchedules(year, month, day) {
    const key = `${year}-${month}-${day}`;
    const defaultData = {
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
        { title: "외근(오후) [한국수소연합] 미팅", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "박규태 대리", avatar: "./resource/image/profile_green.png" },
        { title: "외근(오후) [수소연합] 방문", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
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
        { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" }
      ],
      "2026-8-14": [
        { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "명희진 주임", avatar: "./resource/image/profile_gray_20240502__.png" },
        { title: "외근(오후) [인천공항]", time: "13:00 ~ 18:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" },
        { title: "외근(종일) [인천공항테크마켓] IDC센터", time: "09:00 ~ 18:00", type: "primary", badge: "외근", author: "안영재 대리", avatar: "./resource/image/profile_pro.png" },
        { title: "외근(오전) [프로젝트 공리]", time: "09:00 ~ 12:00", type: "primary", badge: "외근", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
      ],
      "2026-8-15": [
        { title: "광복절 (공휴일)", time: "종일", type: "error", badge: "공휴일", author: "회사공지", avatar: "./resource/image/profile_abc.png" }
      ],
      "2026-8-18": [
        { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "김종규 팀장", avatar: "./resource/image/profile_john.png" },
        { title: "연차", time: "종일", type: "error", badge: "연차", author: "이재광 차장", avatar: "profile.png" }
      ],
      "2026-8-19": [
        { title: "연차", time: "종일", type: "error", badge: "연차", author: "이재광 차장", avatar: "profile.png" }
      ],
      "2026-8-21": [
        { title: "반차(오후)", time: "13:00 ~ 18:00", type: "warning", badge: "반차", author: "박규태 대리", avatar: "./resource/image/profile_green.png" }
      ],
      "2026-8-24": [
        { title: "연차", time: "종일", type: "secondary", badge: "연차", author: "남기현 본부장", avatar: "./resource/image/profile_help.png" }
      ]
    };
    const defaults = defaultData[key] || [];
    const userAdded = (this.mockDynamicSchedules && this.mockDynamicSchedules[key]) || [];
    const combined = [...defaults, ...userAdded];
    if (combined.length > 0) {
      return combined.map(s => ({
        ...s,
        time: this.formatConciseTime(s.time),
        title: (s.title || '')
          .replace(/\[09:00~11:00\]/g, '[AM 9 ~ AM 11]')
          .replace(/\[16:00~18:00\]/g, '[PM 4 ~ PM 6]')
          .replace(/\[13:00~18:00\]/g, '[PM 1 ~ PM 6]')
          .replace(/\[09:00~12:00\]/g, '[AM 9 ~ PM 12]')
          .replace(/\[09:00~18:00\]/g, '[AM 9 ~ PM 6]')
      }));
    }
    return null;
  },

  formatConciseTime(timeStr) {
    if (!timeStr || timeStr === '종일') return '종일';

    const convertSingleTime = (t) => {
      if (!t) return '';
      t = t.trim();
      
      const match = t.match(/(\d{1,2}):(\d{2})/);
      if (!match) return t;

      let hour = parseInt(match[1], 10);
      let min = parseInt(match[2], 10);
      if (isNaN(hour)) return t;

      let period = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;

      let minStr = min > 0 ? `:${String(min).padStart(2, '0')}` : '';
      return `${period} ${displayHour}${minStr}`;
    };

    if (timeStr.includes('~')) {
      const rangeParts = timeStr.split('~');
      return `${convertSingleTime(rangeParts[0])} ~ ${convertSingleTime(rangeParts[1])}`;
    }

    return convertSingleTime(timeStr);
  },

  selectCalendarDate(day) {
    this.state.calSelectedDay = day;
    this.renderCalendar();
    this.openDateDetailModal(day);
  },

  getCategoryColorStyle(category) {
    switch (category) {
      case '휴가':
      case '연차':
        return {
          chipClass: 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 font-bold shadow-xs',
          badgeHtml: '<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/25 whitespace-nowrap shrink-0">연차</span>',
          dotClass: 'bg-[#137333]',
          cardBgClass: 'bg-[#f2f9f4] border-[#137333]/25 hover:bg-[#e6f4ea]/60'
        };
      case '외근':
      case '출장':
      case '미팅':
        return {
          chipClass: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 font-bold shadow-xs',
          badgeHtml: '<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/25 whitespace-nowrap shrink-0">외근</span>',
          dotClass: 'bg-[#1a73e8]',
          cardBgClass: 'bg-[#f0f5fe] border-[#1a73e8]/25 hover:bg-[#e8f0fe]/60'
        };
      case '반차':
      case '반반차':
        return {
          chipClass: 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 font-bold shadow-xs',
          badgeHtml: `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/25 whitespace-nowrap shrink-0">${category}</span>`,
          dotClass: 'bg-[#b06000]',
          cardBgClass: 'bg-[#fffdf5] border-[#b06000]/25 hover:bg-[#fef7e0]/60'
        };
      case '회의':
      case '보고':
        return {
          chipClass: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/30 font-bold shadow-xs',
          badgeHtml: `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/25 whitespace-nowrap shrink-0">${category}</span>`,
          dotClass: 'bg-[#6b21a8]',
          cardBgClass: 'bg-[#fbf7ff] border-[#6b21a8]/25 hover:bg-[#f3e8ff]/60'
        };
      case '공휴일':
        return {
          chipClass: 'bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/30 font-bold shadow-xs',
          badgeHtml: '<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/25 whitespace-nowrap shrink-0">공휴일</span>',
          dotClass: 'bg-[#c5221f]',
          cardBgClass: 'bg-[#fff5f5] border-[#c5221f]/25 hover:bg-[#fce8e6]/60'
        };
      default:
        return {
          chipClass: 'bg-primary/15 text-primary border border-primary/25 font-bold shadow-xs',
          badgeHtml: `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/15 text-primary border border-primary/20 whitespace-nowrap shrink-0">${category || '일정'}</span>`,
          dotClass: 'bg-primary',
          cardBgClass: 'bg-surface-container-low border-outline-variant/15 hover:bg-surface-container-high'
        };
    }
  },

  renderScheduleCardItem(s) {
    let avatarUrl = s.avatar;
    let deptName = '';
    if (s.author) {
      const authorFirstName = s.author.split(' ')[0];
      const emp = (this.state.employees || []).find(e => e.name === authorFirstName);
      if (emp) {
        if (emp.avatar) avatarUrl = emp.avatar;
        deptName = emp.dept || '';
      }
    }
    if (!avatarUrl) avatarUrl = 'profile.png';

    const titleStr = s.title || '';
    const badgeStr = s.badge || '';
    let categoryKey = badgeStr || titleStr;
    if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) categoryKey = '휴가';
    else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) categoryKey = '외근';
    else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) categoryKey = titleStr.includes('반반차') ? '반반차' : '반차';
    else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) categoryKey = '회의';
    else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) categoryKey = '공휴일';

    const colorInfo = this.getCategoryColorStyle(categoryKey);
    let categoryBadgeHtml = colorInfo.badgeHtml;

    return `
      <div class="flex items-center ${colorInfo.cardBgClass} p-3.5 rounded-2xl border shadow-2xs transition-all">
        <div class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass} shrink-0 mr-2.5"></div>
        <img src="${avatarUrl}" alt="${s.author || '프로필'}" class="w-9 h-9 rounded-full object-cover shrink-0 mr-3 border border-outline-variant/15 shadow-2xs" />
        <div class="flex-1 text-left min-w-0">
          <div class="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
            <div class="flex items-center gap-1.5 flex-wrap shrink-0">
              <span class="font-bold text-xs text-primary whitespace-nowrap">${s.author || '이재광 차장'}</span>
              ${categoryBadgeHtml}
            </div>
            <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap shrink-0 ml-auto">${s.time}</span>
          </div>
          <div class="text-sm text-on-surface font-bold font-headline leading-snug break-words">${s.title}</div>
        </div>
      </div>
    `;
  },

  openDateDetailModal(day) {
    const modalEl = document.getElementById('modal-date-detail');
    const titleEl = document.getElementById('modal-date-detail-title');
    const chipsEl = document.getElementById('modal-date-detail-chips');

    if (!modalEl) return;

    const year = this.state.calYear || 2026;
    const month = this.state.calMonth || 8;
    this.state.calSelectedDay = day;

    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dateObj.getDay()];

    if (titleEl) {
      titleEl.innerText = `${year}년 ${month}월 ${day}일 (${dayName})`;
    }

    const schedules = this.getMockSchedules(year, month, day) || [];

    // 해당 날짜에 실제 존재하는 구분(카테고리) 감지
    const availableCategories = new Set();
    schedules.forEach(s => {
      const titleStr = s.title || '';
      const badgeStr = s.badge || '';
      if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) {
        availableCategories.add('휴가');
      }
      if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) {
        availableCategories.add('외근');
      }
      if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) {
        availableCategories.add('반차');
      }
      if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) {
        availableCategories.add('회의');
      }
      if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) {
        availableCategories.add('공휴일');
      }
    });

    // 구분 칩 동적 생성 (각 구분 고유 색상 적용)
    if (chipsEl) {
      let chipsHtml = `<button type="button" onclick="App.filterDateDetailCategory('all', this)" class="date-detail-chip px-4 py-1.5 rounded-full font-bold bg-primary text-on-primary shadow-xs transition-all active:scale-95 whitespace-nowrap active">전체</button>`;
      
      const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일'];
      categoryOrder.forEach(cat => {
        if (availableCategories.has(cat)) {
          const colorInfo = this.getCategoryColorStyle(cat);
          chipsHtml += `<button type="button" onclick="App.filterDateDetailCategory('${cat}', this)" class="date-detail-chip px-4 py-1.5 rounded-full ${colorInfo.chipClass} transition-all active:scale-95 whitespace-nowrap">${cat}</button>`;
        }
      });

      chipsEl.innerHTML = chipsHtml;
    }

    this.state.dateDetailCategory = 'all';
    this.renderDateDetailList(day);
    modalEl.classList.remove('hidden');
  },

  filterDateDetailCategory(category, chipEl) {
    this.state.dateDetailCategory = category || 'all';
    const chips = document.querySelectorAll('.date-detail-chip');
    chips.forEach(c => {
      c.classList.remove('border-2', 'border-primary', 'font-black', 'shadow-xs');
      c.classList.add('opacity-75');
    });
    if (chipEl) {
      chipEl.classList.remove('opacity-75');
      chipEl.classList.add('border-2', 'border-primary', 'font-black', 'shadow-xs');
    }
    this.renderDateDetailList(this.state.calSelectedDay);
  },

  renderDateDetailList(day) {
    const listEl = document.getElementById('modal-date-detail-list');
    if (!listEl) return;

    const year = this.state.calYear || 2026;
    const month = this.state.calMonth || 8;
    const cat = this.state.dateDetailCategory || 'all';

    let schedules = this.getMockSchedules(year, month, day) || [];

    if (schedules.length === 0) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant font-medium bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
          <p class="font-bold text-on-surface text-sm">지정된 일정이 없습니다.</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">새로운 일정을 추가해 보세요.</p>
        </div>
      `;
      return;
    }

    if (cat === 'all') {
      // '전체' 보기: 구분별 그룹화 + 구분이 잘 되도록 그룹 헤더 & 서피스 구분선 추가
      const groupMap = {};
      const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '기타'];

      schedules.forEach(s => {
        const titleStr = s.title || '';
        const badgeStr = s.badge || '';
        let key = '기타';
        if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) key = '휴가';
        else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) key = '외근';
        else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) key = '반차';
        else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) key = '회의';
        else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) key = '공휴일';

        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(s);
      });

      let finalHtml = '';
      let groupCount = 0;

      categoryOrder.forEach(gKey => {
        const items = groupMap[gKey];
        if (items && items.length > 0) {
          groupCount++;
          const colorInfo = this.getCategoryColorStyle(gKey);
          let sectionDivider = groupCount > 1 ? '<div class="my-2.5 border-t border-outline-variant/20"></div>' : '';

          finalHtml += `
            ${sectionDivider}
            <div class="flex items-center justify-between pt-1 pb-1 text-xs font-bold text-on-surface select-none">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass}"></span>
                <span class="font-headline font-bold text-sm">${gKey === '휴가' ? '연차/휴가' : gKey}</span>
              </div>
              <span class="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">${items.length}건</span>
            </div>
            <div class="flex flex-col gap-2">
              ${items.map(item => this.renderScheduleCardItem(item)).join('')}
            </div>
          `;
        }
      });

      listEl.innerHTML = finalHtml;
    } else {
      // 개별 구분 필터 보기
      const filtered = schedules.filter(s => {
        const titleStr = s.title || '';
        const badgeStr = s.badge || '';
        if (cat === '휴가') {
          return titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차');
        } else if (cat === '외근') {
          return titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근');
        } else if (cat === '반차') {
          return titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차');
        } else if (cat === '회의') {
          return titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의');
        } else if (cat === '공휴일') {
          return titleStr.includes('공휴일') || badgeStr.includes('공휴일');
        }
        return titleStr.includes(cat) || badgeStr.includes(cat);
      });

      if (filtered.length > 0) {
        listEl.innerHTML = filtered.map(item => this.renderScheduleCardItem(item)).join('');
      } else {
        listEl.innerHTML = `
          <div class="p-8 text-center text-on-surface-variant font-medium bg-surface-container-low rounded-2xl border border-outline-variant/10">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
            <p class="font-bold text-on-surface text-sm">선택한 구분 조건에 일치하는 일정이 없습니다.</p>
            <p class="text-xs text-on-surface-variant/70 mt-1">상단 '전체' 또는 다른 구분을 클릭해 보세요.</p>
          </div>
        `;
      }
    }
  },

  closeDateDetailModal() {
    const modalEl = document.getElementById('modal-date-detail');
    if (modalEl) modalEl.classList.add('hidden');
  },

  prevDateDetailDay() {
    if (this.state.calSelectedDay > 1) {
      this.state.calSelectedDay--;
    } else {
      if (this.state.calMonth === 1) {
        this.state.calMonth = 12;
        this.state.calYear--;
      } else {
        this.state.calMonth--;
      }
      const prevTotalDays = new Date(this.state.calYear, this.state.calMonth, 0).getDate();
      this.state.calSelectedDay = prevTotalDays;
    }
    this.renderCalendar();
    this.openDateDetailModal(this.state.calSelectedDay);
  },

  nextDateDetailDay() {
    const totalDaysInMonth = new Date(this.state.calYear, this.state.calMonth, 0).getDate();
    if (this.state.calSelectedDay < totalDaysInMonth) {
      this.state.calSelectedDay++;
    } else {
      if (this.state.calMonth === 12) {
        this.state.calMonth = 1;
        this.state.calYear++;
      } else {
        this.state.calMonth++;
      }
      this.state.calSelectedDay = 1;
    }
    this.renderCalendar();
    this.openDateDetailModal(this.state.calSelectedDay);
  },

  renderCalendar() {
    const monthHeaderEl = document.getElementById('cal-header-month-text');
    const gridEl = document.getElementById('cal-grid');

    if (!gridEl) return;

    const year = this.state.calYear;
    const month = this.state.calMonth;
    const selectedDay = this.state.calSelectedDay;

    if (monthHeaderEl) {
      monthHeaderEl.innerText = `${year}년 ${month}월`;
    }

    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    let gridHtml = '';

    // Prev month days padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      gridHtml += `
        <div class="text-on-surface-variant/30 flex flex-col items-center justify-start p-1 min-h-[58px] select-none">
          <span class="w-7 h-7 flex items-center justify-center text-xs">${pDay}</span>
        </div>
      `;
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay();
      const isSelected = (d === selectedDay);
      const schedules = this.getMockSchedules(year, month, d);

      let textClass = 'text-on-surface font-medium';
      if (dayOfWeek === 0) textClass = 'text-error font-semibold';
      else if (dayOfWeek === 6) textClass = 'text-primary font-semibold';

      let barsHtml = '';
      if (schedules && schedules.length > 0) {
        barsHtml = '<div class="w-full flex flex-col gap-1 mt-1 z-10">';
        schedules.slice(0, 2).forEach(s => {
          let colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          if (s.title.includes('휴가') || s.title.includes('연차')) {
            colorClass = (s.type === 'error' || s.author?.includes('이재광') || s.author?.includes('조지혜')) ? 'bg-[#ffdad6] text-[#410002]' : 'bg-[#61fbab] text-[#004729]';
          } else if (s.title.includes('반차') || s.title.includes('반반차')) {
            colorClass = 'bg-[#ffe088] text-[#533a00]';
          } else if (s.title.includes('외근') || s.title.includes('미팅') || s.title.includes('회의')) {
            colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          } else if (s.title.includes('공휴일')) {
            colorClass = 'bg-[#ffdad6] text-[#410002]';
          }

          let spanStyle = 'rounded-md w-full';
          let labelText = s.author && !s.title.includes('공휴일') ? `[${s.author.split(' ')[0]}] ${s.title}` : s.title;

          barsHtml += `
            <div class="text-[10px] font-bold px-1 py-0.5 ${spanStyle} ${colorClass} truncate text-center leading-tight shadow-2xs">
              ${labelText}
            </div>
          `;
        });
        if (schedules.length > 2) {
          barsHtml += `<div class="text-[10px] font-black text-on-surface-variant/70 text-center leading-none mt-0.5 tracking-widest select-none">...</div>`;
        }
        barsHtml += '</div>';
      }

      gridHtml += `
        <div class="flex flex-col items-center justify-start min-h-[58px] relative cursor-pointer group py-1 px-0.5 rounded-xl hover:bg-surface-container-high/40 transition-colors" onclick="App.selectCalendarDate(${d})">
          <span class="w-7 h-7 flex items-center justify-center rounded-full text-xs ${isSelected ? 'bg-primary text-on-primary font-bold shadow-md' : textClass}">${d}</span>
          ${barsHtml}
        </div>
      `;
    }

    // Remaining cells padding
    const totalCellsRendered = firstDayOfWeek + totalDaysInMonth;
    const remainingCells = (totalCellsRendered > 35 ? 42 : 35) - totalCellsRendered;

    for (let n = 1; n <= remainingCells; n++) {
      gridHtml += `
        <div class="text-on-surface-variant/30 flex flex-col items-center justify-start p-1 min-h-[58px] select-none">
          <span class="w-7 h-7 flex items-center justify-center text-xs">${n}</span>
        </div>
      `;
    }

    gridEl.innerHTML = gridHtml;
    this.renderCalendarLogs();
  },

  renderCalendarLogs() {
    const titleEl = document.getElementById('cal-schedule-title');
    const logsContainer = document.getElementById('cal-daily-logs-container');

    if (!logsContainer) return;

    const year = this.state.calYear;
    const month = this.state.calMonth;
    const day = this.state.calSelectedDay;

    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dateObj.getDay()];

    if (titleEl) {
      titleEl.innerText = `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${dayName}) 일정`;
    }

    const schedules = this.getMockSchedules(year, month, day);

    if (schedules && schedules.length > 0) {
      const groupMap = {};
      const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '기타'];

      schedules.forEach(s => {
        const titleStr = s.title || '';
        const badgeStr = s.badge || '';
        let key = '기타';
        if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) key = '휴가';
        else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) key = '외근';
        else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) key = '반차';
        else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) key = '회의';
        else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) key = '공휴일';

        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(s);
      });

      let finalHtml = '';
      let groupCount = 0;

      categoryOrder.forEach(gKey => {
        const items = groupMap[gKey];
        if (items && items.length > 0) {
          groupCount++;
          const colorInfo = this.getCategoryColorStyle(gKey);
          let sectionDivider = groupCount > 1 ? '<div class="my-2.5 border-t border-outline-variant/20"></div>' : '';

          finalHtml += `
            ${sectionDivider}
            <div class="flex items-center justify-between pt-1 pb-1 text-xs font-bold text-on-surface select-none">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass}"></span>
                <span class="font-headline font-bold text-sm">${gKey === '휴가' ? '연차/휴가' : gKey}</span>
              </div>
              <span class="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">${items.length}건</span>
            </div>
            <div class="flex flex-col gap-2.5">
              ${items.map(item => this.renderScheduleCardItem(item)).join('')}
            </div>
          `;
        }
      });

      logsContainer.innerHTML = finalHtml;
    } else {
      logsContainer.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium border border-outline-variant/10 shadow-xs">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
          <p class="font-bold text-on-surface text-sm">선택한 날짜에 등록된 일정이 없습니다.</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">상단 달력에서 다른 날짜를 선택해 보세요.</p>
        </div>
      `;
    }
  },

  // Weekly Calendar Methods
  prevWeeklyMonth() {
    if (!this.state.weeklyMonth) {
      this.state.weeklyYear = this.state.calYear || 2026;
      this.state.weeklyMonth = this.state.calMonth || 8;
      this.state.weeklyDay = this.state.calSelectedDay || 12;
    }
    if (this.state.weeklyMonth === 1) {
      this.state.weeklyMonth = 12;
      this.state.weeklyYear--;
    } else {
      this.state.weeklyMonth--;
    }
    this.renderWeeklyCalendar();
  },

  nextWeeklyMonth() {
    if (!this.state.weeklyMonth) {
      this.state.weeklyYear = this.state.calYear || 2026;
      this.state.weeklyMonth = this.state.calMonth || 8;
      this.state.weeklyDay = this.state.calSelectedDay || 12;
    }
    if (this.state.weeklyMonth === 12) {
      this.state.weeklyMonth = 1;
      this.state.weeklyYear++;
    } else {
      this.state.weeklyMonth++;
    }
    this.renderWeeklyCalendar();
  },

  resetWeeklyToToday() {
    const today = new Date();
    this.state.weeklyYear = today.getFullYear();
    this.state.weeklyMonth = today.getMonth() + 1;
    this.state.weeklyDay = today.getDate();
    this.renderWeeklyCalendar();
  },

  selectWeeklyDate(day) {
    this.state.weeklyDay = day;
    this.renderWeeklyCalendar();
  },

  renderWeeklyCalendar() {
    const headerTitleEl = document.getElementById('weekly-header-title');
    const stripEl = document.getElementById('weekly-date-strip');
    const timelineTitleEl = document.getElementById('weekly-timeline-title');
    const eventsContainer = document.getElementById('weekly-timeline-events');

    if (!stripEl) return;

    const year = this.state.weeklyYear || this.state.calYear || 2026;
    const month = this.state.weeklyMonth || this.state.calMonth || 8;
    const selectedDay = this.state.weeklyDay || this.state.calSelectedDay || 12;

    this.state.weeklyYear = year;
    this.state.weeklyMonth = month;
    this.state.weeklyDay = selectedDay;

    if (headerTitleEl) {
      headerTitleEl.innerText = `${year}년 ${month}월`;
    }

    const totalDays = new Date(year, month, 0).getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    let stripHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay();
      const dayName = dayNames[dayOfWeek];
      const isSelected = (d === selectedDay);

      let textClass = 'text-on-surface-variant';
      if (dayOfWeek === 0) textClass = 'text-error font-semibold';
      else if (dayOfWeek === 6) textClass = 'text-primary font-semibold';

      const schedules = this.getMockSchedules(year, month, d);
      let hasDot = schedules && schedules.length > 0;

      if (isSelected) {
        stripHtml += `
          <div id="weekly-date-pill-${d}" onclick="App.selectWeeklyDate(${d})" class="flex-shrink-0 w-12 flex flex-col items-center justify-center py-2.5 rounded-xl snap-center bg-primary text-on-primary shadow-md cursor-pointer transition-transform active:scale-95">
            <span class="text-[11px] font-bold text-on-primary/90 mb-0.5">${dayName}</span>
            <span class="text-base font-bold">${d}</span>
            ${hasDot ? '<div class="w-1.5 h-1.5 rounded-full bg-on-primary mt-1"></div>' : ''}
          </div>
        `;
      } else {
        stripHtml += `
          <div id="weekly-date-pill-${d}" onclick="App.selectWeeklyDate(${d})" class="flex-shrink-0 w-12 flex flex-col items-center justify-center py-2.5 rounded-xl snap-center bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-colors active:scale-95">
            <span class="text-[11px] font-semibold ${textClass} mb-0.5">${dayName}</span>
            <span class="text-base font-semibold text-on-surface">${d}</span>
            ${hasDot ? '<div class="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>' : ''}
          </div>
        `;
      }
    }

    stripEl.innerHTML = stripHtml;

    // Scroll active date pill to center smoothly
    setTimeout(() => {
      const activePill = document.getElementById(`weekly-date-pill-${selectedDay}`);
      if (activePill) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);

    // Timeline section title
    const selectedDateObj = new Date(year, month - 1, selectedDay);
    const selectedDayName = dayNames[selectedDateObj.getDay()];
    if (timelineTitleEl) {
      timelineTitleEl.innerText = `${String(month).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')} (${selectedDayName}) 타임라인 일정`;
    }

    // Render timeline events
    if (eventsContainer) {
      const schedules = this.getMockSchedules(year, month, selectedDay);

      if (schedules && schedules.length > 0) {
        let eventsHtml = '';
        schedules.forEach(s => {
          let bgStyle = 'bg-primary-container/30 text-on-primary-container border-l-4 border-l-primary';
          if (s.title.includes('휴가')) {
            bgStyle = 'bg-[#61fbab]/20 text-[#004729] border-l-4 border-l-[#005c37]';
          } else if (s.title.includes('원격접속') || s.type === 'error' || s.title.includes('공휴일')) {
            bgStyle = 'bg-[#ffdad6]/40 text-[#410002] border-l-4 border-l-[#b31b25]';
          } else if (s.title.includes('미팅') || s.title.includes('회의')) {
            bgStyle = 'bg-[#ffe088]/30 text-[#533a00] border-l-4 border-l-[#785500]';
          }

          eventsHtml += `
            <div class="mb-3 ${bgStyle} rounded-2xl p-4 shadow-xs flex justify-between items-center transition-all border border-outline-variant/10">
              <div class="flex-1">
                <span class="text-xs font-bold font-label text-primary">${s.time} • ${s.badge}</span>
                <h4 class="text-base font-bold font-headline text-on-surface mt-1">${s.title}</h4>
                <p class="text-xs text-on-surface-variant mt-1">작성자: ${s.author || '이재광'}</p>
              </div>
              <button onclick="App.showToast('${s.title} 상세 보기')" class="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors shadow-2xs">
                <span class="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          `;
        });
        eventsContainer.innerHTML = eventsHtml;
      } else {
        eventsContainer.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant font-medium border border-outline-variant/10 shadow-xs">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
            <p class="font-bold text-on-surface text-base">지정된 타임라인 일정이 없습니다.</p>
            <p class="text-xs text-on-surface-variant/70 mt-1">새로운 일정을 등록할 수 있습니다.</p>
          </div>
        `;
      }
    }
  },

  // Employee Directory Methods
  renderDirectory() {
    const container = document.getElementById('directory-list-container');
    const totalCountEl = document.getElementById('directory-total-count');
    if (!container) return;

    const query = (document.getElementById('directory-search-input')?.value || '').toLowerCase().trim();
    const cat = this.state.currentDirectoryCategory || 'all';

    let filtered = this.state.employees.filter(emp => {
      const matchCat = cat === 'all' || emp.dept === cat;
      const matchQuery = !query || 
        emp.name.toLowerCase().includes(query) || 
        emp.dept.toLowerCase().includes(query) || 
        emp.role.toLowerCase().includes(query) ||
        emp.phone.includes(query);
      return matchCat && matchQuery;
    });

    if (totalCountEl) totalCountEl.innerText = `총 ${filtered.length}명`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">person_search</span>
          <p>검색 조건에 맞는 임직원이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(emp => {
      const isVacation = emp.status === 'vacation';
      const opacityClass = isVacation ? 'opacity-65' : '';
      
      let avatarHtml = '';
      if (emp.avatar) {
        avatarHtml = `
          <div class="h-14 w-14 rounded-full overflow-hidden bg-surface-container-low relative flex-shrink-0 cursor-pointer" onclick="App.openDirectoryDetail(${emp.id})">
            ${emp.status === 'online' ? '<div class="absolute bottom-0 right-0 h-3 w-3 bg-secondary rounded-full border-2 border-surface-container-lowest z-10"></div>' : ''}
            ${emp.status === 'vacation' ? '<div class="absolute bottom-0 right-0 h-3 w-3 bg-tertiary rounded-full border-2 border-surface-container-lowest z-10"></div>' : ''}
            <img alt="${emp.name}" class="w-full h-full object-cover hover:scale-105 transition-transform" src="${emp.avatar}" />
          </div>
        `;
      } else {
        avatarHtml = `
          <div class="h-14 w-14 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center text-primary-dim font-headline font-bold text-xl flex-shrink-0 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.openDirectoryDetail(${emp.id})">
            ${emp.avatarInitial || emp.name.charAt(0)}
          </div>
        `;
      }

      const statusBadgeHtml = emp.statusText ? `<p class="font-body text-xs text-tertiary mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">event_busy</span> ${emp.statusText}</p>` : '';

      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(35,44,81,0.04)] transition-all duration-200 hover:-translate-y-0.5 ${opacityClass} text-left">
          <div class="flex items-center space-x-4">
            ${avatarHtml}
            <div class="cursor-pointer" onclick="App.openDirectoryDetail(${emp.id})">
              <h3 class="font-headline font-bold text-on-surface text-base hover:text-primary transition-colors">${emp.name}</h3>
              <p class="font-body text-xs text-on-surface-variant mt-0.5">${emp.dept} • ${emp.role}</p>
              ${statusBadgeHtml}
            </div>
          </div>
          <div class="flex space-x-2">
            <button onclick="App.callEmployee('${emp.phone}')" class="h-10 w-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary/10 transition-colors active:scale-95">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">call</span>
            </button>
            <button onclick="App.chatEmployee('${emp.name}')" class="h-10 w-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary/10 transition-colors active:scale-95">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">chat</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  selectDirectoryCategory(dept, chipEl) {
    this.state.currentDirectoryCategory = dept;
    const chips = document.querySelectorAll('.dir-chip');
    chips.forEach(c => {
      c.classList.remove('bg-primary', 'text-on-primary', 'active');
      c.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    if (chipEl) {
      chipEl.classList.remove('bg-surface-container', 'text-on-surface-variant');
      chipEl.classList.add('bg-primary', 'text-on-primary', 'active');
    }
    this.renderDirectory();
  },

  filterDirectory() {
    this.renderDirectory();
  },

  openDirectoryDetail(empId) {
    const emp = this.state.employees.find(e => e.id === empId) || this.state.employees[0];
    this.state.currentEmployeeId = emp.id;

    const nameEl = document.getElementById('dir-detail-name');
    const roleEl = document.getElementById('dir-detail-role');
    const phoneEl = document.getElementById('dir-detail-phone');
    const telEl = document.getElementById('dir-detail-tel');
    const emailEl = document.getElementById('dir-detail-email');
    const deptEl = document.getElementById('dir-detail-dept');
    const avatarWrap = document.getElementById('dir-detail-avatar-wrap');

    if (nameEl) nameEl.innerText = emp.name;
    if (roleEl) roleEl.innerText = `${emp.dept} / ${emp.role}`;
    if (phoneEl) phoneEl.innerText = emp.phone;
    if (telEl) telEl.innerText = emp.tel;
    if (emailEl) emailEl.innerText = emp.email;
    if (deptEl) deptEl.innerText = emp.dept;

    if (avatarWrap) {
      if (emp.avatar) {
        avatarWrap.innerHTML = `<img class="w-full h-full object-cover" id="dir-detail-avatar-img" src="${emp.avatar}" alt="${emp.name}" />`;
      } else {
        avatarWrap.innerHTML = `<div class="font-headline font-bold text-3xl text-primary">${emp.avatarInitial || emp.name.charAt(0)}</div>`;
      }
    }

    this.switchTab('screen-directory-detail');
  },

  callEmployee(phone) {
    const emp = this.state.employees.find(e => e.id === this.state.currentEmployeeId) || this.state.employees[0];
    const num = phone || emp.phone;
    this.showToast(`📞 ${emp.name} (${num}) 통화 연결을 시작합니다.`);
  },

  chatEmployee(name) {
    const emp = this.state.employees.find(e => e.id === this.state.currentEmployeeId) || this.state.employees[0];
    const empName = name || emp.name;
    this.showToast(`💬 ${empName} 님과의 사내 메신저 대화방이 생성되었습니다.`);
  },

  emailEmployee() {
    const emp = this.state.employees.find(e => e.id === this.state.currentEmployeeId) || this.state.employees[0];
    this.showToast(`✉️ ${emp.name} (${emp.email}) 메일 작성 창을 엽니다.`);
  },

  // Notice Methods
  renderNotices() {
    const container = document.getElementById('notice-list-container');
    if (!container) return;

    const query = (document.getElementById('notice-search-input')?.value || '').toLowerCase().trim();
    const cat = this.state.currentNoticeCategory || 'all';

    let filtered = this.state.notices.filter(item => {
      const matchCat = cat === 'all' || item.category === cat;
      const matchQuery = !query || item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
          <p>검색 조건에 맞는 공지사항이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const bgClass = item.isPinned ? 'bg-surface-container-lowest border border-primary/20 shadow-sm' : 'bg-surface-container-low';
      const pinnedBadge = item.isPinned ? `<span class="px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary-fixed-dim font-label text-xs font-bold">[필독]</span>` : '';
      const newBadge = item.isNew ? `<span class="px-2 py-0.5 bg-error text-on-error rounded text-[10px] font-bold uppercase tracking-wider">New</span>` : '';

      return `
        <article onclick="App.openNoticeDetail(${item.id})" class="${bgClass} rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer active:scale-95 text-left">
          <div class="flex items-center justify-between">
            <div class="flex gap-2 items-center">
              ${pinnedBadge}
              <span class="px-2.5 py-1 rounded-full bg-surface-container font-label text-xs text-on-surface-variant font-semibold">${item.category}</span>
            </div>
            ${newBadge}
          </div>
          <div>
            <h2 class="font-headline text-base font-bold text-on-surface leading-snug mb-1">${item.title}</h2>
            <p class="font-body text-xs text-on-surface-variant">${item.date}</p>
          </div>
        </article>
      `;
    }).join('');
  },

  selectNoticeCategory(cat, chipEl) {
    this.state.currentNoticeCategory = cat;
    const chips = document.querySelectorAll('.notice-chip');
    chips.forEach(c => {
      c.classList.remove('bg-primary', 'text-on-primary', 'active');
      c.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    if (chipEl) {
      chipEl.classList.remove('bg-surface-container', 'text-on-surface-variant');
      chipEl.classList.add('bg-primary', 'text-on-primary', 'active');
    }
    this.renderNotices();
  },

  filterNotices() {
    this.renderNotices();
  },

  openNoticeDetail(noticeId) {
    const notice = this.state.notices.find(n => n.id === noticeId) || this.state.notices[0];
    this.state.currentNoticeId = notice.id;

    const catEl = document.getElementById('notice-detail-cat');
    const dateEl = document.getElementById('notice-detail-date');
    const titleEl = document.getElementById('notice-detail-title');
    const authorEl = document.getElementById('notice-detail-author');
    const bodyEl = document.getElementById('notice-detail-body');
    const fileNameEl = document.getElementById('notice-attachment-name');
    const fileSizeEl = document.getElementById('notice-attachment-size');

    if (catEl) catEl.innerText = notice.category;
    if (dateEl) dateEl.innerText = notice.date;
    if (titleEl) titleEl.innerText = notice.title;
    if (authorEl) authorEl.innerText = notice.author;
    if (bodyEl) bodyEl.innerHTML = notice.content;
    if (fileNameEl) fileNameEl.innerText = notice.fileName || '첨부파일.pdf';
    if (fileSizeEl) fileSizeEl.innerText = notice.fileSize || '1.5 MB';

    this.switchTab('screen-notice-detail');
  },

  downloadAttachment() {
    const notice = this.state.notices.find(n => n.id === this.state.currentNoticeId) || this.state.notices[0];
    this.showToast(`📥 첨부파일 [${notice.fileName || '첨부파일.pdf'}] 다운로드가 시작되었습니다.`);
  },

  // UI Renderer
  renderUI() {
    // Render Status Card & Pulse Button
    const statusCard = document.getElementById('status-card');
    const statusIconWrap = document.getElementById('status-icon-wrap');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusBadge = document.getElementById('status-badge');

    const homeStatusTitle = document.getElementById('home-status-title');
    const homeStatusBadge = document.getElementById('home-status-badge');
    const homeStatusDot = document.getElementById('home-status-dot');

    const pulseBtn = document.getElementById('pulse-btn');
    const pulseIcon = document.getElementById('pulse-icon');
    const pulseText = document.getElementById('pulse-text');
    const pulseSubtext = document.getElementById('pulse-subtext');

    if (this.state.isCheckedIn) {
      if (homeStatusTitle) homeStatusTitle.innerText = '근무 중';
      if (homeStatusBadge) homeStatusBadge.innerText = '09:00 출근';
      if (homeStatusDot) homeStatusDot.style.background = 'var(--secondary-container)';

      if (statusCard) statusCard.classList.add('active');
      if (statusIconWrap) statusIconWrap.style.background = 'rgba(0, 105, 63, 0.15)';
      if (statusIcon) {
        statusIcon.innerText = 'directions_run';
        statusIcon.style.color = 'var(--secondary)';
      }
      if (statusTitle) statusTitle.innerText = '현재 근무 중입니다';
      if (statusBadge) {
        statusBadge.innerText = '근무 중';
        statusBadge.style.background = 'var(--secondary-container)';
        statusBadge.style.color = 'var(--secondary)';
      }

      if (pulseBtn) pulseBtn.classList.add('checked-in');
      if (pulseIcon) pulseIcon.innerText = 'logout';
      if (pulseText) pulseText.innerText = '퇴근 하기';
      if (pulseSubtext) pulseSubtext.innerText = '업무 종료 체크';
    } else {
      if (homeStatusTitle) homeStatusTitle.innerText = '아직 출근 전입니다';
      if (homeStatusBadge) homeStatusBadge.innerText = '원클릭 출근';
      if (homeStatusDot) homeStatusDot.style.background = 'var(--tertiary-container)';

      if (statusCard) statusCard.classList.remove('active');
      if (statusIconWrap) statusIconWrap.style.background = 'rgba(120, 85, 0, 0.1)';
      if (statusIcon) {
        statusIcon.innerText = 'pending_actions';
        statusIcon.style.color = 'var(--tertiary)';
      }
      if (statusTitle) statusTitle.innerText = '아직 출근 전입니다';
      if (statusBadge) {
        statusBadge.innerText = '업무 종료';
        statusBadge.style.background = 'var(--surface-container)';
        statusBadge.style.color = 'var(--on-surface-variant)';
      }

      if (pulseBtn) pulseBtn.classList.remove('checked-in');
      if (pulseIcon) pulseIcon.innerText = 'touch_app';
      if (pulseText) pulseText.innerText = '출석 체크';
      if (pulseSubtext) pulseSubtext.innerText = '원클릭 출근';
    }

    // Render Location & Geofence Badge Tag
    const locTextEl = document.getElementById('location-text');
    if (locTextEl) {
      locTextEl.innerText = this.state.currentLocation || '서울 금천구 벚꽃로 298';
    }

    const geoCheck = this.checkIsAtOffice();
    const matchBadge = document.getElementById('location-match-badge');
    const matchIcon = document.getElementById('location-match-icon');
    const matchText = document.getElementById('location-match-text');

    if (matchBadge && matchIcon && matchText) {
      if (geoCheck.isAllowed) {
        // Location MATCHED: 출근 체크 가능
        matchBadge.style.background = 'rgba(0, 82, 208, 0.1)';
        matchBadge.style.color = '#0052d0';
        matchBadge.style.border = '1px solid rgba(0, 82, 208, 0.25)';
        matchIcon.innerText = 'check_circle';
        matchText.innerText = '출근 체크 가능 (서울 금천구 벚꽃로 298)';
      } else {
        // Location MISMATCHED: 위치가 맞지 않음 (출근 불가)
        matchBadge.style.background = 'rgba(179, 27, 37, 0.1)';
        matchBadge.style.color = '#b31b25';
        matchBadge.style.border = '1px solid rgba(179, 27, 37, 0.25)';
        matchIcon.innerText = 'cancel';
        matchText.innerText = '위치가 맞지 않음 (출근 불가)';
      }
    }

    // Render Dark Mode (body.dark CSS 변수 + Tailwind dark: prefix 동시 적용)
    if (this.state.settings.dark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark'); // Tailwind dark: prefix 지원
      const darkToggle = document.getElementById('dark-toggle');
      if (darkToggle) darkToggle.checked = true;
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.innerText = 'light_mode';
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark'); // Tailwind dark: prefix 지원
      const darkToggle = document.getElementById('dark-toggle');
      if (darkToggle) darkToggle.checked = false;
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.innerText = 'dark_mode';
    }
  },

  // Logs Rendering
  renderLogs() {
    const container = document.getElementById('logs-list-container');
    if (!container) return;

    let filtered = [...this.state.logs];
    if (this.state.currentFilter === 'week') {
      filtered = filtered.slice(0, 4);
    } else if (this.state.currentFilter === 'month') {
      filtered = filtered.slice(0, 10);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--on-surface-variant);">
          <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">history</span>
          <p style="margin-top: 0.5rem;">기록된 출퇴근 내역이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(log => `
      <div class="log-item">
        <div class="log-date-circle">
          <span class="log-month">${log.monthStr}</span>
          <span class="log-day">${log.dayNum}</span>
        </div>

        <div class="log-details">
          <h4 class="log-day-name">${log.dayName}</h4>
          <div class="log-status-line">
            <span class="log-badge-dot ${log.statusType}"></span>
            <span>${log.statusText}</span>
          </div>
        </div>

        <div class="log-times">
          <div class="log-time-col">
            <span class="log-time-label">출근 시각</span>
            <span class="log-time-val">${log.checkInTimeStr}</span>
          </div>
          <div class="log-time-col">
            <span class="log-time-label">퇴근 시각</span>
            <span class="log-time-val">${log.checkOutTimeStr}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  setLogFilter(filterType, pillEl) {
    this.state.currentFilter = filterType;
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(p => p.classList.remove('active'));
    if (pillEl) pillEl.classList.add('active');
    this.renderLogs();
  },

  // Location Refreshing
  refreshLocation() {
    this.updateRealGPSLocation(true);
  },

  // Request Screen / Tab Handlers
  openRequestModal() {
    this.calculateLeaveDays();
    this.switchTab('screen-request');
  },

  closeRequestModal() {
    this.switchTab('screen-checkin');
  },

  onLeaveTypeChange(typeVal) {
    this.state.currentLeaveType = typeVal;
    this.calculateLeaveDays();
  },

  calculateLeaveDays() {
    const startEl = document.getElementById('leave-start-date');
    const endEl = document.getElementById('leave-end-date');
    const countEl = document.getElementById('leave-days-count');

    if (!startEl || !endEl || !countEl) return;

    const selectedType = document.querySelector('input[name="leave_type"]:checked')?.value || '연차';
    if (selectedType === '반차') {
      countEl.innerText = '총 0.5일';
      return;
    }

    const startDate = new Date(startEl.value);
    const endDate = new Date(endEl.value);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      countEl.innerText = '총 1일';
      return;
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    countEl.innerText = `총 ${diffDays}일`;
  },

  submitRequest() {
    const selectedType = document.querySelector('input[name="leave_type"]:checked')?.value || '연차';
    const startDate = document.getElementById('leave-start-date')?.value || '';
    const endDate = document.getElementById('leave-end-date')?.value || '';
    const reason = document.getElementById('leave-reason-text')?.value || '개인 사유';
    const countText = document.getElementById('leave-days-count')?.innerText || '총 1일';

    const now = new Date();
    const daysArr = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    const newLog = {
      id: Date.now(),
      monthStr: `${now.getMonth() + 1}월`,
      dayNum: String(now.getDate()),
      dayName: daysArr[now.getDay()],
      statusText: `${selectedType} • ${countText} (${reason})`,
      statusType: 'remote',
      checkInTimeStr: '승인 대기',
      checkOutTimeStr: '-',
      durationSec: 28800
    };

    this.state.logs.unshift(newLog);
    this.saveState();
    this.closeRequestModal();
    this.showToast(`✅ [${selectedType}] ${countText} 신청서가 성공적으로 제출되었습니다.`);
    
    if (this.state.activeTab === 'screen-logs') {
      this.renderLogs();
    }
  },

  // Settings & Theme
  toggleDarkMode(isDark) {
    if (isDark === undefined) {
      isDark = !this.state.settings.dark;
    }
    this.state.settings.dark = isDark;
    this.saveState();
    this.renderUI();
    this.showToast(isDark ? '🌙 다크 모드가 적용되었습니다.' : '☀️ 라이트 모드가 적용되었습니다.');
  },

  toggleSetting(key, isChecked) {
    this.state.settings[key] = isChecked;
    this.saveState();
    this.showToast('설정이 변경되었습니다.');
  },

  editProfilePhoto() {
    this.showToast('📷 프로필 사진 변경 모달 (준비 완료)');
  },

  // Palette Theme Select Methods
  openPaletteModal() {
    const modal = document.getElementById('modal-theme-select');
    const panel = document.getElementById('theme-select-panel');
    if (modal && panel) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
      }, 10);
    }
  },

  closePaletteModal() {
    const modal = document.getElementById('modal-theme-select');
    const panel = document.getElementById('theme-select-panel');
    if (modal && panel) {
      panel.classList.remove('scale-100', 'opacity-100');
      panel.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  },

  selectColorTheme(themeIdx) {
    this.applyTheme(themeIdx);
    
    // Save to state & LocalStorage
    this.state.settings.themeIdx = themeIdx;
    this.saveState();
    
    this.closePaletteModal();
    this.showToast(`🎨 테마 ${themeIdx}(으)로 사이트 포인트 색상이 변경되었습니다.`);
  },

  applyTheme(themeIdx) {
    const themes = {
      1: {
        '--primary': '#FFBE8D',
        '--primary-dim': '#E6A775',
        '--primary-container': '#FF8A8C',
        '--primary-gradient': 'linear-gradient(135deg, #FFBE8D 0%, #FF8A8C 100%)'
      },
      2: {
        '--primary': '#FF8A8C',
        '--primary-dim': '#E06D70',
        '--primary-container': '#5871F3',
        '--primary-gradient': 'linear-gradient(135deg, #FF8A8C 0%, #5871F3 100%)'
      },
      3: {
        '--primary': '#5871F3',
        '--primary-dim': '#3F58DA',
        '--primary-container': '#799DFF',
        '--primary-gradient': 'linear-gradient(135deg, #5871F3 0%, #799DFF 100%)'
      },
      4: {
        '--primary': '#5345BA',
        '--primary-dim': '#3D30A0',
        '--primary-container': '#8D7EF2',
        '--primary-gradient': 'linear-gradient(135deg, #5345BA 0%, #8D7EF2 100%)'
      },
      5: {
        '--primary': '#0E0548',
        '--primary-dim': '#07022D',
        '--primary-container': '#3323A5',
        '--primary-gradient': 'linear-gradient(135deg, #0E0548 0%, #3323A5 100%)'
      },
      6: {
        '--primary': '#0E0548',
        '--primary-dim': '#07022D',
        '--primary-container': '#FFBE8D',
        '--primary-gradient': 'linear-gradient(135deg, #0E0548 0%, #FFBE8D 100%)'
      }
    };

    const selectedTheme = themes[themeIdx] || themes[3];
    const root = document.documentElement;
    
    // Set custom CSS variables on documentElement
    for (const [key, value] of Object.entries(selectedTheme)) {
      root.style.setProperty(key, value);
    }

    // Update header palette button gradient
    const paletteBtn = document.getElementById('palette-btn');
    if (paletteBtn && selectedTheme['--primary-gradient']) {
      paletteBtn.style.background = selectedTheme['--primary-gradient'];
    }
  },

  // Toast System
  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 20px;">info</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
