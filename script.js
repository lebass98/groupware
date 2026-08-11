// Fluid Attendant Application Core Logic

const App = {
  state: {
    isLoggedIn: false, // Default to FALSE so user starts on Login screen
    activeTab: 'screen-home',
    isCheckedIn: false,
    checkInTime: null,
    todaySeconds: 0,
    timerInterval: null,
    clockInterval: null,
    currentLocation: '서울 본사 테크 파크 B동',
    currentFilter: 'all',
    settings: {
      notif: true,
      dark: false,
      gps: true
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
    calYear: 2023,
    calMonth: 10,
    calSelectedDay: 5,
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_abc.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_sky.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_john.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_green.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_star_20250326.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_janghyunah.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_blue.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_white.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_pink____________.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_gray_20240502__.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_red_20260602.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_pub.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_mobile.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_pro.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_spring.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_jsp.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_help.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_apple_20250611.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_john_.png',
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
        avatar: 'http://m16.co.kr/phone/resource/image/profile_cool_20241224_lee.png',
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
    this.startLiveClock();
    
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

    this.renderUI();
  },

  loadState() {
    try {
      const saved = localStorage.getItem('fluid_attendant_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.isLoggedIn = parsed.isLoggedIn ?? false;
        this.state.isCheckedIn = parsed.isCheckedIn ?? false;
        this.state.checkInTime = parsed.checkInTime ? new Date(parsed.checkInTime) : null;
        this.state.settings = { ...this.state.settings, ...parsed.settings };
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
      localStorage.setItem('fluid_attendant_state', JSON.stringify({
        isLoggedIn: this.state.isLoggedIn,
        isCheckedIn: this.state.isCheckedIn,
        checkInTime: this.state.checkInTime,
        settings: this.state.settings,
        logs: this.state.logs
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

  // Called when user clicks "확인" in Confirm Modal
  executeToggleCheckIn() {
    this.closeConfirmModal();

    if (!this.state.isCheckedIn) {
      // EXECUTE CHECK IN
      this.state.isCheckedIn = true;
      this.state.checkInTime = new Date();
      this.startWorkTimer();
      this.showToast('🎉 출근 체크가 완료되었습니다! 좋은 하루 되세요.');
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

  // Auth Handlers (Transition from Login to Main App)
  login() {
    this.state.isLoggedIn = true;
    this.saveState();
    this.showAppShell();
    this.showToast(`🎉 ${this.state.user.name}님, 환영합니다! 출결 관리 화면으로 이동합니다.`);
  },

  loginDemo(provider) {
    this.state.isLoggedIn = true;
    this.saveState();
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
    
    this.hideAppShell();
    this.showScreen('screen-login');
    this.showToast('로그아웃 되었습니다.');
  },

  hideAppShell() {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';
  },

  showAppShell() {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    if (header) header.style.display = 'flex';
    if (nav) nav.style.display = 'flex';

    this.switchTab('screen-home');
  },

  // Navigation
  switchTab(targetId, navEl) {
    this.state.activeTab = targetId;
    this.showScreen(targetId);

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
    }
  },

  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  },

  // Attendance Calendar Methods
  prevMonth() {
    if (this.state.calMonth === 1) {
      this.state.calMonth = 12;
      this.state.calYear--;
    } else {
      this.state.calMonth--;
    }
    this.renderCalendar();
  },

  nextMonth() {
    if (this.state.calMonth === 12) {
      this.state.calMonth = 1;
      this.state.calYear++;
    } else {
      this.state.calMonth++;
    }
    this.renderCalendar();
  },

  resetCalendarToToday() {
    const today = new Date();
    this.state.calYear = today.getFullYear();
    this.state.calMonth = today.getMonth() + 1;
    this.state.calSelectedDay = today.getDate();
    this.renderCalendar();
  },

  selectCalendarDate(day) {
    this.state.calSelectedDay = day;
    this.renderCalendar();
  },

  renderCalendar() {
    const yearEl = document.getElementById('cal-header-year');
    const monthEl = document.getElementById('cal-header-month');
    const gridEl = document.getElementById('cal-grid');

    if (!gridEl) return;

    if (yearEl) yearEl.innerText = `${this.state.calYear}년`;
    if (monthEl) monthEl.innerText = `${this.state.calMonth}월`;

    const year = this.state.calYear;
    const month = this.state.calMonth;
    const selectedDay = this.state.calSelectedDay;

    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    let gridHtml = '';

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      gridHtml += `
        <div class="text-on-surface-variant/40 flex flex-col items-center gap-1">
          <span class="w-8 h-8 flex items-center justify-center">${pDay}</span>
        </div>
      `;
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay();
      const isSelected = (d === selectedDay);

      let textClass = 'text-on-surface';
      if (dayOfWeek === 0) textClass = 'text-error-dim';
      else if (dayOfWeek === 6) textClass = 'text-primary-dim';

      let dotHtml = '';
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        if (d === 5 && month === 10) {
          dotHtml = '<div class="w-1.5 h-1.5 rounded-full bg-tertiary mt-1"></div>';
        } else if (d <= 14) {
          dotHtml = '<div class="w-1.5 h-1.5 rounded-full bg-secondary mt-1"></div>';
        }
      }

      if (isSelected) {
        gridHtml += `
          <div class="flex flex-col items-center gap-1 relative cursor-pointer" onclick="App.selectCalendarDate(${d})">
            <span class="w-9 h-9 flex items-center justify-center bg-primary text-on-primary rounded-full font-bold shadow-[0_4px_12px_rgba(0,82,208,0.3)] active:scale-95 transition-transform">${d}</span>
            ${dotHtml}
          </div>
        `;
      } else {
        gridHtml += `
          <div class="flex flex-col items-center gap-1 cursor-pointer hover:bg-surface-container-high/50 rounded-full p-1 transition-colors" onclick="App.selectCalendarDate(${d})">
            <span class="w-8 h-8 flex items-center justify-center ${textClass} font-semibold">${d}</span>
            ${dotHtml}
          </div>
        `;
      }
    }

    const totalCellsRendered = firstDayOfWeek + totalDaysInMonth;
    const remainingCells = (totalCellsRendered > 35 ? 42 : 35) - totalCellsRendered;

    for (let n = 1; n <= remainingCells; n++) {
      gridHtml += `
        <div class="text-on-surface-variant/40 flex flex-col items-center gap-1">
          <span class="w-8 h-8 flex items-center justify-center">${n}</span>
        </div>
      `;
    }

    gridEl.innerHTML = gridHtml;
    this.renderCalendarLogs();
  },

  renderCalendarLogs() {
    const selectedDateStrEl = document.getElementById('cal-selected-date-str');
    const selectedDateStatusEl = document.getElementById('cal-selected-date-status');
    const logsContainer = document.getElementById('cal-daily-logs-container');

    if (!logsContainer) return;

    const year = this.state.calYear;
    const month = this.state.calMonth;
    const day = this.state.calSelectedDay;

    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[dateObj.getDay()];

    if (selectedDateStrEl) {
      selectedDateStrEl.innerText = `${month}월 ${day}일 ${dayName}`;
    }

    const isWeekend = (dateObj.getDay() === 0 || dateObj.getDay() === 6);

    if (isWeekend) {
      if (selectedDateStatusEl) {
        selectedDateStatusEl.innerText = '주말';
        selectedDateStatusEl.className = 'text-xs font-bold text-outline px-3 py-1 bg-surface-container rounded-full';
      }
      logsContainer.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium shadow-[0_2px_12px_rgba(35,44,81,0.04)]">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">weekend</span>
          <p class="font-bold text-on-surface text-base">주말 휴무일입니다.</p>
          <p class="text-xs text-text-muted mt-1">지정된 근무 일정이 없습니다.</p>
        </div>
      `;
      return;
    }

    let isLate = (day === 5 && month === 10);
    
    if (selectedDateStatusEl) {
      if (isLate) {
        selectedDateStatusEl.innerText = '지각';
        selectedDateStatusEl.className = 'text-xs font-bold text-tertiary px-3 py-1 bg-tertiary/15 rounded-full';
      } else {
        selectedDateStatusEl.innerText = '정상 출근';
        selectedDateStatusEl.className = 'text-xs font-bold text-secondary px-3 py-1 bg-secondary/15 rounded-full';
      }
    }

    const checkInTime = isLate ? '09:15 AM' : '08:54 AM';
    const checkOutTime = '18:00 PM';

    logsContainer.innerHTML = `
      <!-- Log Card 1: Check In -->
      <div class="bg-surface-container-lowest rounded-2xl p-5 flex flex-col gap-3.5 relative overflow-hidden shadow-[0_2px_12px_rgba(35,44,81,0.04)]">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">login</span>
            </div>
            <div>
              <p class="font-body text-xs text-on-surface-variant font-medium">출근 시간</p>
              <p class="font-headline text-lg font-extrabold text-on-surface">${checkInTime}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant">본사</span>
        </div>
        <div class="h-[1px] w-full bg-outline-variant/15"></div>
        <p class="font-body text-xs text-on-surface-variant flex items-center gap-2">
          <span class="material-symbols-outlined text-base text-primary" style="font-variation-settings: 'FILL' 0;">location_on</span>
          <span>서울시 강남구 테헤란로 123 (본사 사옥)</span>
        </p>
      </div>

      <!-- Log Card 2: Check Out -->
      <div class="bg-surface-container-lowest rounded-2xl p-5 flex flex-col gap-3.5 relative overflow-hidden shadow-[0_2px_12px_rgba(35,44,81,0.04)]">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">logout</span>
            </div>
            <div>
              <p class="font-body text-xs text-on-surface-variant font-medium">퇴근 시간 (예정)</p>
              <p class="font-headline text-lg font-extrabold text-on-surface">${checkOutTime}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">8시간 45분 근무</span>
        </div>
      </div>
    `;
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

    // Render Dark Mode
    if (this.state.settings.dark) {
      document.body.classList.add('dark');
      const darkToggle = document.getElementById('dark-toggle');
      if (darkToggle) darkToggle.checked = true;
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.innerText = 'light_mode';
    } else {
      document.body.classList.remove('dark');
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
    const locations = [
      '서울 본사 테크 파크 B동',
      '강남 R&D 센터 4층',
      '판교 스마트 타워 8층',
      '성수 팝업 오피스 2동'
    ];
    const next = locations[Math.floor(Math.random() * locations.length)];
    this.state.currentLocation = next;

    const locEl = document.getElementById('location-text');
    if (locEl) locEl.innerText = next;

    this.showToast(`📍 GPS 위치 인증 완료: ${next}`);
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
