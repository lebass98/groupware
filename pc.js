/**
 * ==========================================================================
 * WnC PC Desktop Groupware Core Controller (pc.js)
 * Figma Bento Grid Inspired Full-Width Desktop Engine
 * ==========================================================================
 */

const PCApp = {
  state: {
    activeScreen: 'dashboard',
    theme: 'light',
    user: (window.MockData && window.MockData.user) || {
      name: '이재광',
      role: '차장',
      dept: '퍼블리싱팀',
      email: 'yellow@wordncode.com',
      phone: '010-5244-1251',
      avatar: './profile.png',
      location: '서울 금천구 벚꽃로 298'
    },
    isCheckedIn: true,
    checkInTime: '08:55',
    checkOutTime: '--:--',
    workStatus: '근무중',
    currentDate: new Date(2026, 7, 24), // 2026년 8월 24일 (월)
    calYear: 2026,
    calMonth: 8, // 8월 (1-indexed)
    selectedDate: '2026-8-24',
    directoryCategory: 'all',
    directorySearch: '',
    noticeCategory: 'all',
    noticeSearch: '',
    workReportDept: 'all',
    financeFilter: 'all',
    todoFilter: 'all',
    projectFilter: 'all',
    requestTab: 'leave',
    todos: (window.MockData && window.MockData.todos) ? JSON.parse(JSON.stringify(window.MockData.todos)) : [],
    notices: (window.MockData && window.MockData.notices) ? JSON.parse(JSON.stringify(window.MockData.notices)) : [],
    members: (window.MockData && window.MockData.employees) ? JSON.parse(JSON.stringify(window.MockData.employees)) : [],
    projects: (window.MockData && window.MockData.projects) ? JSON.parse(JSON.stringify(window.MockData.projects)) : [],
    expenses: [
      { id: 1, type: 'corp', typeLabel: '법인카드', date: '2026-08-24 12:30', title: '(주)맛있는식당 가산점', amount: 85000, category: '식대', status: 'unresolved', statusLabel: '결재 대기' },
      { id: 2, type: 'corp', typeLabel: '법인카드', date: '2026-08-23 20:15', title: '카카오T 택시 (야간교통비)', amount: 18500, category: '교통비', status: 'unresolved', statusLabel: '결재 대기' },
      { id: 3, type: 'corp', typeLabel: '법인카드', date: '2026-08-22 14:00', title: '스타벅스 가산디지털점', amount: 21000, category: '음료대', status: 'completed', statusLabel: '승인 완료' },
      { id: 4, type: 'personal', typeLabel: '개인영수증', date: '2026-08-21 10:10', title: '교보문고 (개발 서적 구매)', amount: 34000, category: '도서구입비', status: 'completed', statusLabel: '승인 완료' },
      { id: 5, type: 'personal', typeLabel: '개인영수증', date: '2026-08-20 15:45', title: '알파문구 가산점 (사무용품)', amount: 12500, category: '소모품비', status: 'completed', statusLabel: '승인 완료' }
    ]
  },

  init() {
    this.bindTheme();
    this.startClock();
    this.renderSidebar();
    this.renderDashboard();
    this.startNoticeTicker();
    this.bindGlobalEvents();
    console.log('🚀 WnC PC Groupware Engine Initialized');
  },

  // 1. Theme Management
  bindTheme() {
    const savedTheme = localStorage.getItem('wnc_pc_theme') || 'light';
    this.setTheme(savedTheme);
  },
  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wnc_pc_theme', theme);
    const themeIcon = document.getElementById('pc-theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>'
        : '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';
    }
  },
  toggleTheme() {
    this.setTheme(this.state.theme === 'dark' ? 'light' : 'dark');
  },

  // 2. Real-Time Header Clock
  startClock() {
    const update = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const day = days[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const clockEl = document.getElementById('pc-gnb-clock');
      if (clockEl) {
        clockEl.innerHTML = `<span>${year}.${month}.${date} (${day})</span> <strong class="text-primary ml-1">${hours}:${mins}:${secs}</strong>`;
      }
      const checkinLiveTime = document.getElementById('pc-checkin-live-time');
      if (checkinLiveTime) {
        checkinLiveTime.textContent = `${hours}:${mins}:${secs}`;
      }
    };
    update();
    setInterval(update, 1000);
  },

  // 2-1. Fixed Header Notice Flip Ticker Banner
  startNoticeTicker() {
    const track = document.getElementById('pc-ticker-track');
    if (!track) return;

    this.stopNoticeTicker();

    const notices = (this.state.notices && this.state.notices.length > 0)
      ? this.state.notices
      : (window.MockData && window.MockData.notices) || [];

    if (!notices || notices.length === 0) return;

    const items = notices.slice(0, 6).map((n, idx) => ({
      idx: idx,
      id: n.id || idx + 1,
      title: n.isPinned || n.pinned ? `📌 [필독] ${n.title}` : `📢 ${n.title}`,
      date: n.date || '2026.08.24'
    }));

    track.innerHTML = '';

    let currentIdx = 0;
    const initialEl = document.createElement('div');
    initialEl.className = 'pc-ticker-item static';
    initialEl.textContent = items[0].title;
    initialEl.setAttribute('title', '공지사항 상세 보기');
    initialEl.onclick = () => this.openNoticeModal(items[0].idx);
    track.appendChild(initialEl);

    if (items.length <= 1) return;

    this._pcTickerInterval = setInterval(() => {
      const existingNodes = Array.from(track.querySelectorAll('.pc-ticker-item'));
      if (existingNodes.length > 1) {
        existingNodes.slice(0, existingNodes.length - 1).forEach(el => el.remove());
      }

      const activeEl = track.querySelector('.pc-ticker-item');
      if (!activeEl) return;

      const nextIdx = (currentIdx + 1) % items.length;
      const nextItem = items[nextIdx];

      // 1. 퇴장 애니메이션
      activeEl.className = 'pc-ticker-item flip-out';

      // 2. 신규 등장 노드
      const nextEl = document.createElement('div');
      nextEl.className = 'pc-ticker-item flip-in';
      nextEl.textContent = nextItem.title;
      nextEl.setAttribute('title', '공지사항 상세 보기');
      nextEl.onclick = () => this.openNoticeModal(nextItem.idx);
      track.appendChild(nextEl);

      // 3. 퇴장 노드 안전 제거
      setTimeout(() => {
        if (activeEl && activeEl.parentNode === track) {
          track.removeChild(activeEl);
        }
      }, 450);

      currentIdx = nextIdx;
    }, 3800);
  },

  stopNoticeTicker() {
    if (this._pcTickerInterval) {
      clearInterval(this._pcTickerInterval);
      this._pcTickerInterval = null;
    }
  },

  // 3. Navigation & Screen Switching
  switchScreen(screenId) {
    this.state.activeScreen = screenId;
    
    // Update active class on sidebar buttons
    const navBtns = document.querySelectorAll('.pc-nav-btn');
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-screen') === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update screen views
    const screens = document.querySelectorAll('.pc-screen-view');
    screens.forEach(s => {
      if (s.id === `pc-screen-${screenId}`) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    // Screen specific renderers
    if (screenId === 'dashboard') this.renderDashboard();
    else if (screenId === 'directory') this.renderDirectoryView();
    else if (screenId === 'notice') this.renderNoticeView();
    else if (screenId === 'calendar') this.renderCalendarView();
    else if (screenId === 'finance') this.renderFinanceView();
    else if (screenId === 'todo') this.renderTodoView();
    else if (screenId === 'project') this.renderProjectView();
    else if (screenId === 'work-report') this.renderWorkReportView();
    else if (screenId === 'checkin') this.renderCheckinView();
    else if (screenId === 'request') this.renderRequestView();

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // 4. Render Sidebar
  renderSidebar() {
    const navItems = [
      { id: 'dashboard', name: '대시보드', icon: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>' },
      { id: 'checkin', name: '출/퇴근', icon: '<path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>' },
      { id: 'calendar', name: '근태일지', icon: '<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>' },
      { id: 'request', name: '휴가/외근', icon: '<path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/>' },
      { id: 'directory', name: '주소록', icon: '<path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V17z"/>' },
      { id: 'notice', name: '공지사항', icon: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>' },
      { id: 'finance', name: '재무/경비', icon: '<path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>' },
      { id: 'todo', name: '할 일', icon: '<path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM19.79 10.22C19.92 10.79 20 11.39 20 12c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.66 0 3.2.51 4.48 1.39l1.45-1.45C16.19 2.7 14.19 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z"/>' },
      { id: 'project', name: '프로젝트', icon: '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/>' },
      { id: 'work-report', name: '업무보고', icon: '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>' }
    ];

    const navListEl = document.getElementById('pc-sidebar-nav');
    if (!navListEl) return;

    navListEl.innerHTML = navItems.map(item => `
      <li class="pc-nav-item">
        <button type="button" class="pc-nav-btn ${this.state.activeScreen === item.id ? 'active' : ''}" data-screen="${item.id}" onclick="PCApp.switchScreen('${item.id}')" title="${item.name}">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            ${item.icon}
          </svg>
          <span class="pc-tooltip">${item.name}</span>
        </button>
      </li>
    `).join('');
  },

  // 5. Render Main Full-Width Bento Dashboard
  renderDashboard() {
    this.renderLeftCol();
    this.renderCenterCol();
    this.renderRightCol();
  },

  // 5-1. Left Column
  renderLeftCol() {
    // 1. Profile Card
    const profileWrap = document.getElementById('pc-widget-profile');
    if (profileWrap) {
      profileWrap.innerHTML = `
        <div class="pc-bento-card pc-profile-card">
          <div class="pc-profile-avatar-wrap">
            <img src="${this.state.user.avatar}" class="pc-profile-avatar" alt="사용자 프로필" />
          </div>
          <h2 class="pc-profile-name">${this.state.user.name} ${this.state.user.role}</h2>
          <p class="pc-profile-dept">${this.state.user.dept} | 워드앤코드</p>
          
          <div class="pc-profile-counters">
            <div class="pc-counter-item" onclick="PCApp.switchScreen('calendar')">
              <span class="pc-counter-num">2</span>
              <span class="pc-counter-label">오늘 일정</span>
            </div>
            <div class="pc-counter-item" onclick="PCApp.switchScreen('work-report')">
              <span class="pc-counter-num">1</span>
              <span class="pc-counter-label">작성할 보고</span>
            </div>
            <div class="pc-counter-item" onclick="PCApp.switchScreen('finance')">
              <span class="pc-counter-num">0</span>
              <span class="pc-counter-label">결재 대기</span>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Leave / Vacation Widget
    const leaveWrap = document.getElementById('pc-widget-leave');
    if (leaveWrap) {
      leaveWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title whitespace-nowrap">
              <svg class="w-4.5 h-4.5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/>
              </svg>
              연차 / 휴가 현황
            </span>
            <button class="pc-card-action" onclick="PCApp.switchScreen('request')">신청</button>
          </div>
          
          <div class="pc-leave-stat-grid">
            <div class="pc-leave-stat-box">
              <div class="pc-leave-val text-primary">9.0일</div>
              <div class="pc-leave-lbl">잔여 연차</div>
            </div>
            <div class="pc-leave-stat-box">
              <div class="pc-leave-val text-on-surface">26.0일</div>
              <div class="pc-leave-lbl">사용 연차</div>
            </div>
            <div class="pc-leave-stat-box">
              <div class="pc-leave-val text-on-surface-variant">35.0일</div>
              <div class="pc-leave-lbl">총 연차</div>
            </div>
          </div>

          <div class="pc-leave-history-list">
            <div class="pc-leave-history-item">
              <span class="font-bold text-on-surface">연차 (종일)</span>
              <span class="text-on-surface-variant">2026-08-19</span>
            </div>
            <div class="pc-leave-history-item">
              <span class="font-bold text-secondary">반차 (오후)</span>
              <span class="text-on-surface-variant">2026-08-21</span>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Birthday Widget
    const birthWrap = document.getElementById('pc-widget-birthday');
    if (birthWrap) {
      birthWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title whitespace-nowrap">
              <svg class="w-4.5 h-4.5 text-tertiary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.3-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.64V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.64c-.56.41-1.23.64-1.96.64-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.39.57 1.08 0 1.96-.88 1.96-1.96V12c0-1.66-1.34-3-3-3z"/>
              </svg>
              8월 생일자 🎂
            </span>
            <span class="text-base font-bold text-primary">1명</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img src="./profile.png" class="w-12 h-12 rounded-full object-cover border border-outline" />
            <div>
              <p class="font-bold text-on-surface text-base">이재광 차장 (퍼블리싱팀)</p>
              <p class="text-base text-on-surface-variant">08월 11일 · 축하메시지 전송</p>
            </div>
          </div>
        </div>
      `;
    }
  },

  // 5-2. Center Column
  renderCenterCol() {
    // 1. Notice Hero Banner
    const noticeWrap = document.getElementById('pc-widget-notice-banner');
    if (noticeWrap) {
      const topNotice = (this.state.notices && this.state.notices[0]) || { title: '2024년 하반기 전사 워크샵 일정 안내', author: '경영지원팀 오은주 차장', date: '2024.10.24' };
      noticeWrap.innerHTML = `
        <div class="pc-notice-banner" onclick="PCApp.openNoticeModal(0)">
          <div>
            <span class="pc-notice-tag">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              전사 공지사항
            </span>
            <h3 class="pc-notice-title">${topNotice.title}</h3>
            <p class="pc-notice-meta">${topNotice.author} · ${topNotice.date}</p>
          </div>
          <button class="pc-quick-write-btn" onclick="event.stopPropagation(); PCApp.switchScreen('notice')">
            공지 전체보기
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>
        </div>
      `;
    }

    // 2. Weekly Work Reports
    const reportWrap = document.getElementById('pc-widget-work-report');
    if (reportWrap) {
      const reports = (window.MockData && window.MockData.workReports) || [];
      const primaryReport = reports[0] || {
        client: '한국메세나협회',
        title: '2026 한국메세나협회 문화기업업무추진비 지원사업 시스템 구축',
        prevWeekSections: [{ dept: '기획팀', items: ['관리자 권한별 통계 대시보드 및 엑셀 다운로드 API 구현'] }],
        thisWeekSections: [{ dept: '퍼블리싱팀', items: ['사용자 / 관리자 페이지 전체 구현 완료'] }]
      };

      const prevItems = (primaryReport.prevWeekSections && primaryReport.prevWeekSections[0]?.items) || ['관리자 권한별 통계 대시보드 및 엑셀 다운로드 API 구현'];
      const thisItems = (primaryReport.thisWeekSections && primaryReport.thisWeekSections[0]?.items) || ['사용자 / 관리자 페이지 전체 구현 완료'];

      reportWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title whitespace-nowrap">
              <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              주간 업무보고 (금주 실적 & 전주 대비)
            </span>
            <button class="pc-card-action" onclick="PCApp.switchScreen('work-report')">전체보기</button>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-surface-container-low rounded-xl border border-outline/50">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-on-surface text-base flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary"></span>
                  ${primaryReport.client} - ${primaryReport.title}
                </span>
                <span class="text-base font-bold px-3 py-1 rounded-md bg-primary/10 text-primary">진행중</span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-base">
                <div class="p-3.5 bg-surface-container-lowest rounded-lg">
                  <span class="font-bold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                    전주 실적
                  </span>
                  <p class="text-on-surface leading-relaxed">${prevItems[0]}</p>
                </div>
                <div class="p-3.5 bg-surface-container-lowest rounded-lg border-l-3 border-primary">
                  <span class="font-bold text-primary block mb-1.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    금주 계획
                  </span>
                  <p class="text-on-surface font-semibold leading-relaxed">${thisItems[0]}</p>
                </div>
              </div>
            </div>

            ${reports[1] ? `
            <div class="p-4 bg-surface-container-low rounded-xl border border-outline/50">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-on-surface text-base flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-secondary"></span>
                  ${reports[1].client} - ${reports[1].title}
                </span>
                <span class="text-base font-bold px-3 py-1 rounded-md bg-secondary/10 text-secondary">진행중</span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-base">
                <div class="p-3.5 bg-surface-container-lowest rounded-lg">
                  <span class="font-bold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                    전주 실적
                  </span>
                  <p class="text-on-surface leading-relaxed">${(reports[1].prevWeekSections && reports[1].prevWeekSections[0]?.items[0]) || '사후역량점검 테이블 스키마 최적화 및 인덱스 튜닝'}</p>
                </div>
                <div class="p-3.5 bg-surface-container-lowest rounded-lg border-l-3 border-secondary">
                  <span class="font-bold text-secondary block mb-1.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-secondary"></span>
                    금주 계획
                  </span>
                  <p class="text-on-surface font-semibold leading-relaxed">${(reports[1].thisWeekSections && reports[1].thisWeekSections[0]?.items[0]) || '사후역량점검 완료 분기 로직 추가, 관련 alert 수정'}</p>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 3. Monthly Calendar Grid
    const calWrap = document.getElementById('pc-widget-calendar');
    if (calWrap) {
      calWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-calendar-header">
            <div class="pc-cal-nav-group">
              <button class="pc-cal-nav-btn" onclick="PCApp.changeCalMonth(-1)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <h3 class="pc-cal-title">${this.state.calYear}년 ${this.state.calMonth}월</h3>
              <button class="pc-cal-nav-btn" onclick="PCApp.changeCalMonth(1)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
            <button class="pc-card-action" onclick="PCApp.switchScreen('calendar')">전체 일정표</button>
          </div>

          <div class="pc-cal-weekdays">
            <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
          </div>

          <div class="pc-cal-grid" id="pc-dashboard-cal-grid">
            ${this.generateCalGridHTML()}
          </div>
        </div>
      `;
    }
  },

  // Calendar Grid Generator (Dashboard Widget)
  generateCalGridHTML() {
    const year = this.state.calYear;
    const month = this.state.calMonth - 1; // 0-indexed
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    let html = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="pc-cal-cell empty"></div>`;
    }

    const schedulesMap = (window.MockData && window.MockData.schedules) || {};

    // Days
    for (let d = 1; d <= lastDate; d++) {
      const key = `${year}-${month + 1}-${d}`;
      const isToday = (d === 24 && month === 7 && year === 2026);
      
      const daySchedules = schedulesMap[key] || [];

      html += `
        <div class="pc-cal-cell ${isToday ? 'today' : ''}" onclick="PCApp.selectDate('${key}'); PCApp.switchScreen('calendar');">
          <div class="pc-cal-header-row">
            <span class="pc-cal-date-num">${d}</span>
            ${daySchedules.length > 0 ? `<span class="pc-cal-count-badge">+${daySchedules.length}</span>` : ''}
          </div>
          <div class="pc-cal-events-wrap">
            ${daySchedules.slice(0, 2).map(s => `
              <span class="pc-cal-event-tag ${s.type === 'primary' ? 'bg-primary/10 text-primary' : s.type === 'error' ? 'bg-error-container text-error' : 'bg-secondary/10 text-secondary'}">
                ${s.badge || s.title}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }

    return html;
  },

  // 5-3. Right Column
  renderRightCol() {
    // 1. Check-In & Commute Card (Figma Style)
    const commuteWrap = document.getElementById('pc-widget-commute');
    if (commuteWrap) {
      commuteWrap.innerHTML = `
        <div class="pc-bento-card pc-commute-card">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-base text-on-surface">근태 & 출/퇴근</span>
            <span class="pc-commute-status-pill ${this.state.isCheckedIn ? 'checked-in' : ''}">
              <span class="w-2.5 h-2.5 rounded-full ${this.state.isCheckedIn ? 'bg-secondary' : 'bg-on-surface-variant'}"></span>
              ${this.state.isCheckedIn ? '근무 중 (정상)' : '퇴근 완료'}
            </span>
          </div>

          <div class="pc-commute-time-display">
            <div>
              <span class="text-base text-on-surface-variant block">출근 시간</span>
              <span class="pc-commute-big-time text-primary">${this.state.checkInTime}</span>
            </div>
            <span class="text-on-surface-variant text-2xl font-bold">→</span>
            <div>
              <span class="text-base text-on-surface-variant block">퇴근 시간</span>
              <span class="pc-commute-big-time ${this.state.checkOutTime !== '--:--' ? 'text-secondary' : 'text-on-surface-variant'}">${this.state.checkOutTime}</span>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex justify-between text-base font-bold text-on-surface-variant mb-1.5">
              <span>주 누적 근무시간</span>
              <span class="text-primary font-bold">38시간 45분 / 40시간</span>
            </div>
            <div class="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width: 96%;"></div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-base text-on-surface-variant mb-3">
            <svg class="w-5 h-5 text-secondary shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span class="truncate">위치 인증: <strong>${this.state.user.location}</strong></span>
          </div>

          <div class="pc-commute-btn-group">
            <button class="pc-commute-btn pc-commute-btn-in" onclick="PCApp.handleCheckIn()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
              출근하기
            </button>
            <button class="pc-commute-btn pc-commute-btn-out" onclick="PCApp.handleCheckOut()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
              퇴근하기
            </button>
          </div>
        </div>
      `;
    }

    // 2. Quick Menu Grid (Figma Style)
    const quickWrap = document.getElementById('pc-widget-quick-menu');
    if (quickWrap) {
      quickWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title">
              <svg class="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.5-9 4.77-9 9.95 0 5.52 4.48 10 10 10 2.44 0 4.67-.88 6.43-2.33l-2.02-2.02c-1.25.86-2.77 1.35-4.41 1.35z"/>
              </svg>
              Quick Action
            </span>
          </div>

          <div class="pc-quick-grid">
            <div class="pc-quick-item" onclick="PCApp.switchScreen('request'); PCApp.switchRequestTab('leave');">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/></svg>
              </div>
              <span class="pc-quick-label">휴가신청</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.switchScreen('request'); PCApp.switchRequestTab('outwork');">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>
              </div>
              <span class="pc-quick-label">외근신청</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.openQuickModal('expense')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              </div>
              <span class="pc-quick-label">지출결의</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.openQuickModal('report')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <span class="pc-quick-label">보고작성</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.switchScreen('directory')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V17z"/></svg>
              </div>
              <span class="pc-quick-label">주소록</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.openQuickModal('todo')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <span class="pc-quick-label">할일등록</span>
            </div>
          </div>
        </div>
      `;
    }

    // 3. To-Do Widget
    const todoWrap = document.getElementById('pc-widget-todo');
    if (todoWrap) {
      const topTodos = (this.state.todos || []).slice(0, 3);
      todoWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title">
              <svg class="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM19.79 10.22C19.92 10.79 20 11.39 20 12c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.66 0 3.2.51 4.48 1.39l1.45-1.45C16.19 2.7 14.19 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z"/>
              </svg>
              To-Do 할 일 목록
            </span>
            <button class="pc-card-action" onclick="PCApp.switchScreen('todo')">전체보기</button>
          </div>

          <div class="pc-todo-list">
            ${topTodos.length > 0 ? topTodos.map((t, idx) => `
              <div class="pc-todo-item">
                <input type="checkbox" class="pc-todo-checkbox" ${t.completed ? 'checked' : ''} onchange="PCApp.toggleTodo(${idx})">
                <span class="pc-todo-title ${t.completed ? 'line-through opacity-50' : ''}">${t.title}</span>
                <span class="pc-todo-priority ${t.priority === 'high' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}">${t.priority === 'high' ? '높음' : '보통'}</span>
              </div>
            `).join('') : '<p class="text-xs text-on-surface-variant text-center py-4">등록된 할 일이 없습니다.</p>'}
          </div>
        </div>
      `;
    }
  },

  // 6. Detailed Sub-Screen Renderers

  // 6-1. Directory Screen
  setDirectoryDept(dept, btn) {
    this.state.directoryCategory = dept;
    const tabs = document.querySelectorAll('#pc-dir-dept-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderDirectoryView();
  },

  renderDirectoryView() {
    const container = document.getElementById('pc-directory-grid');
    if (!container) return;

    const filtered = (this.state.members || []).filter(m => {
      const matchCat = this.state.directoryCategory === 'all' || m.dept === this.state.directoryCategory;
      const search = (this.state.directorySearch || '').trim().toLowerCase();
      const matchSearch = !search ||
        (m.name && m.name.toLowerCase().includes(search)) ||
        (m.dept && m.dept.toLowerCase().includes(search)) ||
        (m.role && m.role.toLowerCase().includes(search)) ||
        (m.phone && m.phone.includes(search));
      return matchCat && matchSearch;
    });

    const totalBadge = document.getElementById('pc-dir-total-badge');
    if (totalBadge) totalBadge.textContent = `${filtered.length}명`;

    container.innerHTML = filtered.map(m => {
      const isWork = m.status === 'work' || m.statusText === '근무중';
      const isOff = m.status === 'offwork' || m.statusText === '퇴근';
      const statusClass = isWork ? 'bg-secondary-container text-secondary' : isOff ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-container text-primary';
      const todaySched = m.todaySchedule ? `<span class="px-2 py-0.5 rounded-md text-xs font-bold bg-tertiary-container text-tertiary">[예정: ${m.todaySchedule}]</span>` : '';

      return `
        <div class="p-5 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary hover:shadow-md transition-all text-base flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <img src="${m.avatar || './profile.png'}" alt="${m.name}" class="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-xs" />
                <div>
                  <h4 class="font-bold text-lg text-on-surface">${m.name} <span class="text-sm font-normal text-on-surface-variant">${m.role}</span></h4>
                  <p class="text-sm font-bold text-primary">${m.dept}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}">● ${m.statusText || '근무중'}</span>
            </div>
            ${todaySched ? `<div class="mb-3">${todaySched}</div>` : ''}
            <div class="space-y-1.5 text-sm text-on-surface-variant pt-3 border-t border-outline/70">
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                ${m.email || 'user@wordncode.com'}
              </p>
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                ${m.phone || '010-0000-0000'} ${m.tel ? `<span class="text-xs text-on-surface-variant/70">(내선: ${m.tel})</span>` : ''}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-outline/50">
            <a href="tel:${m.phone || ''}" class="py-2 px-3 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold text-center text-on-surface flex items-center justify-center gap-1">
              📞 전화 걸기
            </a>
            <button onclick="PCApp.openChatModal(${m.id})" class="py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
              💬 사내 메신저
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // 6-2. Notices Screen
  setNoticeCategory(cat, btn) {
    this.state.noticeCategory = cat;
    const tabs = document.querySelectorAll('#pc-notice-category-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderNoticeView();
  },

  renderNoticeView() {
    const listWrap = document.getElementById('pc-notice-full-list');
    if (!listWrap) return;

    const filtered = (this.state.notices || []).filter(n => {
      const matchCat = this.state.noticeCategory === 'all' || n.category === this.state.noticeCategory;
      const search = (this.state.noticeSearch || '').trim().toLowerCase();
      const matchSearch = !search || (n.title && n.title.toLowerCase().includes(search)) || (n.summary && n.summary.toLowerCase().includes(search));
      return matchCat && matchSearch;
    });

    listWrap.innerHTML = filtered.map((n, idx) => `
      <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary hover:shadow-md transition-all cursor-pointer text-base flex flex-col justify-between" onclick="PCApp.openNoticeModal(${idx})">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold px-3 py-1 rounded-full ${n.isPinned || n.pinned ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}">
              ${n.isPinned || n.pinned ? '📌 [필독]' : '📢 [일반]'} ${n.category || '공통'}
            </span>
            <span class="text-sm text-on-surface-variant font-medium">${n.date}</span>
          </div>
          <h3 class="font-bold text-lg text-on-surface mb-2">${n.title}</h3>
          <p class="text-base text-on-surface-variant line-clamp-2 leading-relaxed mb-4">${n.summary || '상세 공지 내용을 확인하려면 클릭하세요.'}</p>
        </div>
        <div class="pt-3 border-t border-outline/50 flex items-center justify-between text-sm text-on-surface-variant">
          <span class="font-bold text-on-surface">작성자: ${n.author || '경영지원팀'}</span>
          ${n.fileName ? `<span class="flex items-center gap-1 text-primary font-bold">📎 ${n.fileName}</span>` : ''}
        </div>
      </div>
    `).join('');
  },

  // 6-3. Work Report Screen
  setWorkReportDept(dept, btn) {
    this.state.workReportDept = dept;
    const tabs = document.querySelectorAll('#pc-workreport-dept-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderWorkReportView();
  },

  renderWorkReportView() {
    const wrap = document.getElementById('pc-workreport-full-container');
    if (!wrap) return;

    const reports = (window.MockData && window.MockData.workReports) || [];
    const filtered = reports.filter(r => {
      return this.state.workReportDept === 'all' || r.primaryDept === this.state.workReportDept;
    });

    wrap.innerHTML = filtered.map(r => `
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline text-base shadow-2xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-outline">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-primary shrink-0"></span>
            <div>
              <h3 class="text-xl font-bold text-on-surface">${r.client} - ${r.title}</h3>
              <p class="text-sm text-on-surface-variant font-medium mt-0.5">기간: ${r.period} · 주관: ${r.primaryDept}</p>
            </div>
          </div>
          <span class="text-sm font-bold px-3.5 py-1 bg-surface-container rounded-full text-on-surface-variant shrink-0 self-start sm:self-auto">${r.weekLabel || '2026년 8월 3주차'}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 bg-surface-container-low rounded-xl">
            <h4 class="font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
              전주 실적 (Last Week)
            </h4>
            <ul class="space-y-2 text-base text-on-surface-variant list-disc list-inside">
              ${(r.prevWeekSections || []).flatMap(s => s.items).map(item => `<li>${item}</li>`).join('') || '<li>업무 정상 진행</li>'}
            </ul>
          </div>

          <div class="p-5 bg-surface-container-low rounded-xl border-l-4 border-primary">
            <h4 class="font-bold text-base text-primary mb-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
              금주 계획 (This Week)
            </h4>
            <ul class="space-y-2 text-base text-on-surface font-semibold list-disc list-inside">
              ${(r.thisWeekSections || []).flatMap(s => s.items).map(item => `<li>${item}</li>`).join('') || '<li>계획 수립 및 실행</li>'}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  },

  // 6-4. Check-in & Logs Screen
  setWorkStatus(status, btn) {
    this.state.workStatus = status;
    const btns = document.querySelectorAll('#pc-work-status-options button');
    btns.forEach(b => {
      b.className = 'py-2.5 px-3 rounded-xl border border-outline bg-surface-container-low text-on-surface-variant font-bold text-base hover:bg-surface-container';
    });
    if (btn) btn.className = 'py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-base';
    this.showToast(`근무 상태가 [${status}] 로 변경되었습니다.`);
  },

  renderCheckinView() {
    const tbody = document.getElementById('pc-checkin-tbody');
    if (!tbody) return;

    const logs = [
      { date: '2026-08-24 (월)', inTime: this.state.checkInTime || '08:55', outTime: this.state.checkOutTime || '18:00 (예정)', duration: '8시간 5분', status: this.state.isCheckedIn ? '근무중' : '정상퇴근', statusType: 'work' },
      { date: '2026-08-21 (금)', inTime: '08:50', outTime: '18:05', duration: '8시간 15분', status: '정상근무', statusType: 'normal' },
      { date: '2026-08-20 (목)', inTime: '08:52', outTime: '18:10', duration: '8시간 18분', status: '정상근무', statusType: 'normal' },
      { date: '2026-08-19 (수)', inTime: '-', outTime: '-', duration: '8시간 00분', status: '연차 휴가', statusType: 'leave' },
      { date: '2026-08-18 (화)', inTime: '08:48', outTime: '18:00', duration: '8시간 12분', status: '정상근무', statusType: 'normal' }
    ];

    tbody.innerHTML = logs.map(l => `
      <tr class="hover:bg-surface-container-low transition-all">
        <td class="p-3.5 font-bold text-on-surface">${l.date}</td>
        <td class="p-3.5 text-primary font-bold">${l.inTime}</td>
        <td class="p-3.5 text-on-surface-variant">${l.outTime}</td>
        <td class="p-3.5 font-medium">${l.duration}</td>
        <td class="p-3.5">
          <span class="px-2.5 py-1 rounded-md font-bold text-xs ${l.statusType === 'leave' ? 'bg-tertiary-container text-tertiary' : 'bg-secondary-container text-secondary'}">${l.status}</span>
        </td>
      </tr>
    `).join('');
  },

  // 6-5. Calendar Screen
  changeCalMonth(delta) {
    this.state.calMonth += delta;
    if (this.state.calMonth > 12) {
      this.state.calMonth = 1;
      this.state.calYear += 1;
    } else if (this.state.calMonth < 1) {
      this.state.calMonth = 12;
      this.state.calYear -= 1;
    }

    const titleEl = document.getElementById('pc-full-cal-title');
    if (titleEl) titleEl.textContent = `${this.state.calYear}년 ${this.state.calMonth}월`;

    this.renderCalendarView();
    this.renderCenterCol();
  },

  goToTodayCal() {
    this.state.calYear = 2026;
    this.state.calMonth = 8;
    this.state.selectedDate = '2026-8-24';
    this.changeCalMonth(0);
  },

  selectDate(key) {
    this.state.selectedDate = key;
    this.renderCalendarView();
  },

  renderCalendarView() {
    const gridEl = document.getElementById('pc-full-calendar-grid');
    if (gridEl) {
      const year = this.state.calYear;
      const month = this.state.calMonth - 1;
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      const schedulesMap = (window.MockData && window.MockData.schedules) || {};

      let html = '';
      for (let i = 0; i < firstDay; i++) {
        html += `<div class="pc-cal-cell empty"></div>`;
      }

      for (let d = 1; d <= lastDate; d++) {
        const key = `${year}-${month + 1}-${d}`;
        const isToday = (d === 24 && month === 7 && year === 2026);
        const isSelected = (this.state.selectedDate === key);
        const daySchedules = schedulesMap[key] || [];

        html += `
          <div class="pc-cal-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" onclick="PCApp.selectDate('${key}')">
            <div class="pc-cal-header-row">
              <span class="pc-cal-date-num ${isToday ? 'text-primary font-bold' : ''}">${d}</span>
              ${daySchedules.length > 0 ? `<span class="pc-cal-count-badge">${daySchedules.length}건</span>` : ''}
            </div>
            <div class="pc-cal-events-wrap">
              ${daySchedules.slice(0, 2).map(s => `
                <span class="pc-cal-event-tag ${s.type === 'primary' ? 'bg-primary/10 text-primary' : s.type === 'error' ? 'bg-error-container text-error' : 'bg-secondary/10 text-secondary'}" title="${s.title || s.badge}">
                  ${s.title || s.badge}
                </span>
              `).join('')}
              ${daySchedules.length > 2 ? `<span class="pc-cal-more-tag">+${daySchedules.length - 2}개 더보기</span>` : ''}
            </div>
          </div>
        `;
      }
      gridEl.innerHTML = html;
    }

    // Side Daily Schedule Panel
    const dailyPanel = document.getElementById('pc-cal-daily-panel');
    if (dailyPanel) {
      let selectedKey = this.state.selectedDate || '2026-8-24';
      const schedulesMap = (window.MockData && window.MockData.schedules) || {};
      let list = schedulesMap[selectedKey];
      if (!list) {
        const altKey = selectedKey.includes('-0') ? selectedKey.replace(/-0([1-9])/g, '-$1') : selectedKey.replace(/-([1-9])(?!\d)/g, '-0$1');
        list = schedulesMap[altKey] || [];
      }

      const parts = selectedKey.split('-');
      const formatted = `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;

      dailyPanel.innerHTML = `
        <div class="flex items-center justify-between pb-4 border-b border-outline mb-4">
          <div>
            <h4 class="font-bold text-lg text-on-surface">${formatted}</h4>
            <p class="text-xs text-primary font-bold mt-0.5">총 ${list.length}건의 일정</p>
          </div>
          <button class="px-3 py-1.5 bg-primary text-white font-bold rounded-xl text-xs" onclick="PCApp.openQuickModal('leave')">+ 추가</button>
        </div>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          ${list.length > 0 ? list.map(item => this.getScheduleCardHtml(item)).join('') : `
            <div class="text-center py-10 text-on-surface-variant">
              <p class="text-base font-bold mb-1">등록된 일정이 없습니다.</p>
              <p class="text-xs">휴가, 외근 또는 팀 회의 일정을 등록해보세요.</p>
            </div>
          `}
        </div>
      `;
    }
  },

  getScheduleCardHtml(item) {
    const avatarUrl = item.avatar || './resource/image/profile_abc.png';
    let dotClass = 'bg-[#00693f]';
    let badgeBg = 'bg-[#e3fcef] text-[#00693f] border border-[#00693f]/25';
    let categoryKey = '연차';

    const titleStr = (item.title || '');
    const badgeStr = (item.badge || '');

    if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) {
      categoryKey = '반차';
      dotClass = 'bg-[#b06000]';
      badgeBg = 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/25';
    } else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) {
      categoryKey = '외근';
      dotClass = 'bg-[#3b82f6]';
      badgeBg = 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/25';
    } else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) {
      categoryKey = '회의';
      dotClass = 'bg-[#8b5cf6]';
      badgeBg = 'bg-[#f3e8fd] text-[#7627bb] border border-[#7627bb]/25';
    }

    const isSpecial = item.author === '공휴일' || item.author === '대한민국 공휴일' || item.author === '회사공지';
    const avatarHtml = isSpecial ? '' : `<img src="${avatarUrl}" alt="${item.author || '담당자'}" class="w-9 h-9 rounded-full object-cover shrink-0 border border-outline/30 shadow-xs mr-2.5" />`;
    const authorHtml = isSpecial ? '' : `<span class="font-bold text-xs text-primary whitespace-nowrap">${item.author || '이재광 차장'}</span>`;

    return `
      <div class="flex items-center p-3 bg-surface-container-low rounded-xl border border-outline/70 hover:border-primary transition-all">
        <div class="w-2 h-2 rounded-full ${dotClass} shrink-0 mr-2"></div>
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-1">
            <div class="flex items-center gap-1.5 shrink-0">
              ${authorHtml}
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeBg}">${item.badge || categoryKey}</span>
            </div>
            <span class="text-[10px] text-on-surface-variant font-medium whitespace-nowrap ml-auto">${item.time || '종일'}</span>
          </div>
          <div class="text-sm text-on-surface font-bold leading-snug break-words">${item.title}</div>
        </div>
      </div>
    `;
  },

  // 6-6. Finance & Expenses Screen
  setFinanceFilter(filter, btn) {
    this.state.financeFilter = filter;
    const tabs = document.querySelectorAll('#pc-finance-filter-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderFinanceView();
  },

  renderFinanceView() {
    // Summary Cards
    const summaryWrap = document.getElementById('pc-finance-summary-cards');
    if (summaryWrap) {
      const totalAmount = (this.state.expenses || []).reduce((acc, cur) => cur.status === 'completed' ? acc + cur.amount : acc, 0);
      const pendingCount = (this.state.expenses || []).filter(e => e.status === 'unresolved').length;

      summaryWrap.innerHTML = `
        <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline shadow-2xs">
          <span class="text-base font-bold text-on-surface-variant block mb-1">8월 승인 총액</span>
          <span class="text-3xl font-bold text-primary">${totalAmount.toLocaleString()}원</span>
        </div>
        <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline shadow-2xs">
          <span class="text-base font-bold text-on-surface-variant block mb-1">결재 대기</span>
          <span class="text-3xl font-bold text-tertiary">${pendingCount}건</span>
        </div>
        <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline shadow-2xs">
          <span class="text-base font-bold text-on-surface-variant block mb-1">반려</span>
          <span class="text-3xl font-bold text-error">0건</span>
        </div>
      `;
    }

    // Expenses Table
    const tbody = document.getElementById('pc-finance-table-tbody');
    if (!tbody) return;

    const filtered = (this.state.expenses || []).filter(e => {
      if (this.state.financeFilter === 'all') return true;
      if (this.state.financeFilter === 'corp') return e.type === 'corp';
      if (this.state.financeFilter === 'personal') return e.type === 'personal';
      if (this.state.financeFilter === 'unresolved') return e.status === 'unresolved';
      if (this.state.financeFilter === 'completed') return e.status === 'completed';
      return true;
    });

    tbody.innerHTML = filtered.map(e => `
      <tr class="hover:bg-surface-container-low transition-all">
        <td class="p-3.5 text-on-surface-variant font-medium">${e.date}</td>
        <td class="p-3.5 font-bold">${e.typeLabel}</td>
        <td class="p-3.5 font-bold text-on-surface">${e.title}</td>
        <td class="p-3.5 text-primary font-bold">${e.amount.toLocaleString()}원</td>
        <td class="p-3.5">
          <span class="px-2.5 py-1 rounded-md font-bold text-xs ${e.status === 'completed' ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'}">${e.statusLabel}</span>
        </td>
        <td class="p-3.5 text-center">
          <button class="text-xs text-error font-bold hover:underline" onclick="PCApp.deleteExpense(${e.id})">삭제</button>
        </td>
      </tr>
    `).join('');
  },

  deleteExpense(id) {
    if (confirm('해당 경비 내역을 삭제하시겠습니까?')) {
      this.state.expenses = this.state.expenses.filter(e => e.id !== id);
      this.renderFinanceView();
      this.showToast('경비 내역이 삭제되었습니다.');
    }
  },

  // 6-7. To-Do Screen
  setTodoFilter(filter, btn) {
    this.state.todoFilter = filter;
    const tabs = document.querySelectorAll('#pc-todo-filter-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderTodoView();
  },

  quickAddTodo(title) {
    if (!title || !title.trim()) return;
    this.state.todos.unshift({
      id: Date.now(),
      title: title.trim(),
      completed: false,
      priority: 'medium',
      status: 'in_progress',
      isMine: true
    });
    this.renderTodoView();
    this.renderRightCol();
    this.showToast('새로운 할 일이 등록되었습니다.');
  },

  deleteTodo(idx) {
    this.state.todos.splice(idx, 1);
    this.renderTodoView();
    this.renderRightCol();
    this.showToast('할 일이 삭제되었습니다.');
  },

  renderTodoView() {
    const listEl = document.getElementById('pc-full-todo-list');
    if (!listEl) return;

    const filtered = (this.state.todos || []).filter(t => {
      if (this.state.todoFilter === 'mine') return t.isMine;
      if (this.state.todoFilter === 'in_progress') return !t.completed && t.status !== 'done';
      if (this.state.todoFilter === 'done') return t.completed || t.status === 'done';
      return true;
    });

    listEl.innerHTML = filtered.map((t, idx) => `
      <div class="flex items-center justify-between p-4 hover:bg-surface-container-low transition-all">
        <div class="flex items-center gap-3 flex-1">
          <input type="checkbox" ${t.completed || t.status === 'done' ? 'checked' : ''} onchange="PCApp.toggleTodo(${idx}); PCApp.renderTodoView();" class="w-5 h-5 accent-primary rounded cursor-pointer" />
          <div>
            <span class="text-base text-on-surface font-bold ${t.completed || t.status === 'done' ? 'line-through opacity-50' : ''}">${t.title}</span>
            ${t.project ? `<span class="text-xs text-on-surface-variant block mt-0.5">${t.project} · ${t.dueDate || '오늘까지'}</span>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded-md text-xs font-bold ${t.priority === 'high' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}">${t.priority === 'high' ? '높음' : '보통'}</span>
          <button class="text-sm text-on-surface-variant hover:text-error" onclick="PCApp.deleteTodo(${idx})">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  // 6-8. Projects Screen
  setProjectFilter(filter, btn) {
    this.state.projectFilter = filter;
    const tabs = document.querySelectorAll('#pc-project-filter-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderProjectView();
  },

  renderProjectView() {
    const grid = document.getElementById('pc-project-grid');
    if (!grid) return;

    const filtered = (this.state.projects || []).filter(p => {
      if (this.state.projectFilter === 'all') return true;
      if (this.state.projectFilter === 'in_progress') return p.status === 'in_progress';
      if (this.state.projectFilter === 'maintenance') return p.status === 'maintenance';
      return true;
    });

    grid.innerHTML = filtered.map(p => `
      <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary hover:shadow-md transition-all text-base flex flex-col justify-between cursor-pointer" onclick="PCApp.openProjectModal(${p.id})">
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">${p.clientName || '고객사'}</span>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-md ${p.status === 'in_progress' ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-on-surface-variant'}">${p.statusText || '진행중'}</span>
          </div>
          <h3 class="font-bold text-lg text-on-surface mb-1 line-clamp-1">${p.title}</h3>
          <p class="text-sm text-on-surface-variant mb-4">기간: ${p.period || '2026-07 ~ 2026-12'}</p>
          
          <div class="mb-4">
            <div class="flex justify-between text-xs text-on-surface-variant mb-1">
              <span>진척도</span>
              <span class="font-bold text-primary">${p.views ? `${p.views}%` : '85%'}</span>
            </div>
            <div class="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width: ${p.views ? `${p.views}%` : '85%'};"></div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-outline/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span>작성자: ${p.author || '기획팀'}</span>
          <span class="font-bold text-primary flex items-center gap-1">상세보기 <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg></span>
        </div>
      </div>
    `).join('');
  },

  // 6-9. Request Screen (Leave & Outwork Form)
  switchRequestTab(tab) {
    this.state.requestTab = tab;
    const leaveBtn = document.getElementById('pc-tab-req-leave');
    const outworkBtn = document.getElementById('pc-tab-req-outwork');
    const leavePanel = document.getElementById('pc-panel-req-leave');
    const outworkPanel = document.getElementById('pc-panel-req-outwork');

    if (tab === 'leave') {
      if (leaveBtn) leaveBtn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-primary text-white shadow-xs';
      if (outworkBtn) outworkBtn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
      if (leavePanel) leavePanel.classList.remove('hidden');
      if (outworkPanel) outworkPanel.classList.add('hidden');
    } else {
      if (leaveBtn) leaveBtn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
      if (outworkBtn) outworkBtn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-secondary text-white shadow-xs';
      if (leavePanel) leavePanel.classList.add('hidden');
      if (outworkPanel) outworkPanel.classList.remove('hidden');
    }
  },

  renderRequestView() {
    this.switchRequestTab(this.state.requestTab || 'leave');
  },

  submitLeaveForm() {
    const selectedRadio = document.querySelector('input[name="pc_leave_type"]:checked');
    const leaveType = selectedRadio ? selectedRadio.value : '연차';
    const startDate = document.getElementById('pc-req-leave-start').value;
    const endDate = document.getElementById('pc-req-leave-end').value;
    const reason = document.getElementById('pc-req-leave-reason').value;

    if (!startDate) {
      alert('시작 일자를 선택해주세요.');
      return;
    }

    // Register to MockData schedules
    const schedulesMap = (window.MockData && window.MockData.schedules) || {};
    const key = startDate.replace(/-0([1-9])/g, '-$1');
    if (!schedulesMap[key]) schedulesMap[key] = [];

    schedulesMap[key].push({
      title: `${leaveType} (${reason || '개인 사유'})`,
      time: leaveType.includes('반차') ? '13:00 ~ 18:00' : '종일',
      type: 'error',
      badge: leaveType,
      author: '이재광 차장',
      avatar: './profile.png'
    });

    this.showToast(`[신청 완료] ${startDate} ${leaveType} 신청서가 정상 접수되었습니다.`);
    this.switchScreen('calendar');
  },

  submitOutworkForm() {
    const date = document.getElementById('pc-req-outwork-date').value;
    const time = document.getElementById('pc-req-outwork-time').value;
    const place = document.getElementById('pc-req-outwork-place').value;
    const title = document.getElementById('pc-req-outwork-title').value;

    if (!date || !place || !title) {
      alert('방문 일자, 방문처 및 외근 제목을 모두 입력해주세요.');
      return;
    }

    // Register to MockData schedules
    const schedulesMap = (window.MockData && window.MockData.schedules) || {};
    const key = date.replace(/-0([1-9])/g, '-$1');
    if (!schedulesMap[key]) schedulesMap[key] = [];

    schedulesMap[key].push({
      title: `외근 [${place}] ${title}`,
      time: time,
      type: 'primary',
      badge: '외근',
      author: '이재광 차장',
      avatar: './profile.png'
    });

    this.showToast(`[신청 완료] ${date} ${place} 외근 신청서가 정상 접수되었습니다.`);
    this.switchScreen('calendar');
  },

  // 7. Commute Check In/Out Actions
  handleCheckIn() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = true;
    this.state.checkInTime = timeStr;
    this.showToast(`[출근 완료] ${timeStr} 정상 출근 처리되었습니다.`);
    this.renderRightCol();
    if (this.state.activeScreen === 'checkin') this.renderCheckinView();
  },

  handleCheckOut() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = false;
    this.state.checkOutTime = timeStr;
    this.showToast(`[퇴근 완료] ${timeStr} 정상 퇴근 처리되었습니다. 수고하셨습니다!`);
    this.renderRightCol();
    if (this.state.activeScreen === 'checkin') this.renderCheckinView();
  },

  toggleTodo(idx) {
    if (this.state.todos[idx]) {
      this.state.todos[idx].completed = !this.state.todos[idx].completed;
      this.renderRightCol();
    }
  },

  // 8. Modals
  openQuickModal(type) {
    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    if (type === 'leave') {
      this.switchScreen('request');
      this.switchRequestTab('leave');
      return;
    } else if (type === 'outwork') {
      this.switchScreen('request');
      this.switchRequestTab('outwork');
      return;
    } else if (type === 'expense') {
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">지출결의서 작성</h3>
        <div class="space-y-4 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-1.5">결의 구분</label>
            <select id="pc-modal-exp-type" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base">
              <option value="corp">법인카드 지출</option>
              <option value="personal">개인영수증 청구</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-1.5">사용처 (상호명)</label>
            <input type="text" id="pc-modal-exp-title" placeholder="예: (주)맛있는식당 가산점" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-1.5">금액 (원)</label>
            <input type="number" id="pc-modal-exp-amount" placeholder="30000" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="PCApp.submitExpenseModal()">기안하기</button>
          </div>
        </div>
      `;
    } else if (type === 'report') {
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">주간 업무보고 작성</h3>
        <div class="space-y-4 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-1.5">소속 부서</label>
            <input type="text" value="퍼블리싱팀" readonly class="w-full p-3 bg-surface-container border border-outline rounded-xl text-base text-on-surface-variant font-bold" />
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-1.5">프로젝트명</label>
            <input type="text" placeholder="예: 워드앤코드 그룹웨어 고도화" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-1.5">금주 실적 및 차주 계획</label>
            <textarea rows="4" placeholder="주요 업무 실적 및 차주 계획을 작성하세요..." class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="PCApp.showToast('주간 업무보고가 등록되었습니다.'); PCApp.closeModal();">등록하기</button>
          </div>
        </div>
      `;
    } else if (type === 'todo') {
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">새로운 할 일 등록</h3>
        <div class="space-y-4 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-1.5">할 일 제목</label>
            <input type="text" id="pc-modal-todo-title" placeholder="업무 내용을 입력하세요..." class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-1.5">우선순위</label>
            <select id="pc-modal-todo-prio" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base">
              <option value="medium">보통</option>
              <option value="high">높음 (긴급)</option>
              <option value="low">낮음</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="const title = document.getElementById('pc-modal-todo-title').value; if(title){ PCApp.quickAddTodo(title); PCApp.closeModal(); }">추가하기</button>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
  },

  submitExpenseModal() {
    const type = document.getElementById('pc-modal-exp-type').value;
    const title = document.getElementById('pc-modal-exp-title').value;
    const amount = parseInt(document.getElementById('pc-modal-exp-amount').value, 10);

    if (!title || isNaN(amount)) {
      alert('사용처와 금액을 올바르게 입력해주세요.');
      return;
    }

    this.state.expenses.unshift({
      id: Date.now(),
      type: type,
      typeLabel: type === 'corp' ? '법인카드' : '개인영수증',
      date: '2026-08-24 14:00',
      title: title,
      amount: amount,
      category: '일반경비',
      status: 'unresolved',
      statusLabel: '결재 대기'
    });

    this.closeModal();
    this.showToast('지출결의서가 성공적으로 기안되었습니다.');
    this.switchScreen('finance');
  },

  openChatModal(memberId) {
    const member = this.state.members.find(m => m.id === memberId);
    if (!member) return;

    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-outline mb-4">
        <div class="flex items-center gap-3">
          <img src="${member.avatar || './profile.png'}" alt="${member.name}" class="w-12 h-12 rounded-full object-cover border" />
          <div>
            <h3 class="text-xl font-bold text-on-surface">${member.name} ${member.role}</h3>
            <p class="text-xs text-primary font-bold">${member.dept}</p>
          </div>
        </div>
        <button class="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg" onclick="PCApp.closeModal()">✕</button>
      </div>

      <div class="h-64 bg-surface-container-low rounded-xl p-4 overflow-y-auto space-y-3 mb-4 text-sm" id="pc-chat-history">
        <div class="flex items-start gap-2">
          <img src="${member.avatar || './profile.png'}" class="w-8 h-8 rounded-full object-cover" />
          <div class="p-3 bg-surface-container-lowest rounded-2xl rounded-tl-none border border-outline">
            안녕하세요 차장님! ${member.name}입니다. 말씀하신 업무 전달드립니다.
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <input type="text" id="pc-chat-input" placeholder="메시지를 입력하세요..." class="flex-1 p-3 bg-surface-container-low border border-outline rounded-xl text-base" onkeyup="if(event.key==='Enter'&&this.value){ const box=document.getElementById('pc-chat-history'); box.innerHTML += '<div class=\\'flex justify-end\\'><div class=\\'p-3 bg-primary text-white rounded-2xl rounded-tr-none text-sm\\">'+this.value+'</div></div>'; this.value=''; box.scrollTop=box.scrollHeight; }" />
        <button class="px-5 py-3 bg-primary text-white font-bold rounded-xl text-base" onclick="const input=document.getElementById('pc-chat-input'); if(input.value){ const box=document.getElementById('pc-chat-history'); box.innerHTML += '<div class=\\'flex justify-end\\'><div class=\\'p-3 bg-primary text-white rounded-2xl rounded-tr-none text-sm\\">'+input.value+'</div></div>'; input.value=''; box.scrollTop=box.scrollHeight; }">전송</button>
      </div>
    `;

    modal.classList.add('active');
  },

  openNoticeModal(idx) {
    const n = this.state.notices[idx];
    if (!n) return;
    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-outline mb-4">
        <div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${n.isPinned || n.pinned ? 'bg-error-container text-error' : 'bg-primary-container text-primary'} mr-2">
            ${n.isPinned || n.pinned ? '필독' : '일반'} · ${n.category || '공통'}
          </span>
          <h3 class="text-2xl font-bold text-on-surface inline align-middle">${n.title}</h3>
        </div>
        <span class="text-sm text-on-surface-variant font-medium">${n.date}</span>
      </div>

      <div class="text-base text-on-surface leading-relaxed max-h-[50vh] overflow-y-auto py-2 space-y-3">
        ${n.content || n.summary || '상세 공지 내용입니다.'}
      </div>

      ${n.fileName ? `
        <div class="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📎</span>
            <div>
              <p class="font-bold text-sm text-on-surface">${n.fileName}</p>
              <p class="text-xs text-on-surface-variant">${n.fileSize || '1.2 MB'}</p>
            </div>
          </div>
          <button class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-xs" onclick="PCApp.showToast('파일 다운로드가 시작되었습니다.')">다운로드</button>
        </div>
      ` : ''}

      <div class="flex justify-end pt-5 border-t border-outline mt-5">
        <button class="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-base" onclick="PCApp.closeModal()">닫기</button>
      </div>
    `;
    modal.classList.add('active');
  },

  openProjectModal(projectId) {
    const p = this.state.projects.find(proj => proj.id === projectId);
    if (!p) return;

    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-outline mb-4">
        <div>
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary mr-2">${p.clientName}</span>
          <h3 class="text-2xl font-bold text-on-surface inline align-middle">${p.title}</h3>
        </div>
        <span class="px-3 py-1 bg-secondary-container text-secondary rounded-full font-bold text-xs">${p.statusText || '진행중'}</span>
      </div>

      <div class="space-y-4 text-base max-h-[60vh] overflow-y-auto pr-1">
        <div class="p-4 bg-surface-container-low rounded-xl">
          <h4 class="font-bold text-sm text-on-surface mb-2">프로젝트 개요</h4>
          <p class="text-sm text-on-surface-variant leading-relaxed">${p.content || '프로젝트 상세 설명 및 구축 범위입니다.'}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="p-3 bg-surface-container-low rounded-xl">
            <span class="text-xs text-on-surface-variant block mb-1">사업 기간</span>
            <strong class="text-on-surface">${p.period || '-'}</strong>
          </div>
          <div class="p-3 bg-surface-container-low rounded-xl">
            <span class="text-xs text-on-surface-variant block mb-1">담당 기획자</span>
            <strong class="text-on-surface">${p.planner || p.author || '-'}</strong>
          </div>
        </div>

        ${p.attachments && p.attachments.length > 0 ? `
          <div>
            <h4 class="font-bold text-sm text-on-surface mb-2">첨부 산출물</h4>
            <div class="space-y-2">
              ${p.attachments.map(att => `
                <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                  <span class="font-medium text-on-surface line-clamp-1">📄 ${att.name} (${att.size})</span>
                  <button class="text-primary font-bold shrink-0 ml-2" onclick="PCApp.showToast('파일 다운로드가 시작되었습니다.')">다운로드</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="flex justify-end pt-5 border-t border-outline mt-5">
        <button class="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-base" onclick="PCApp.closeModal()">닫기</button>
      </div>
    `;

    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('pc-global-modal');
    if (modal) modal.classList.remove('active');
  },

  showToast(msg) {
    let toast = document.getElementById('pc-toast-box');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pc-toast-box';
      toast.className = 'fixed bottom-6 right-6 px-5 py-3.5 bg-on-surface text-surface font-bold text-base rounded-2xl shadow-lg transition-all transform translate-y-20 opacity-0 z-50 flex items-center gap-2';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
    }, 2800);
  },

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
};

// Auto boot on DOM load
document.addEventListener('DOMContentLoaded', () => {
  PCApp.init();
});
