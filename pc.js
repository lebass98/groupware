/**
 * ==========================================================================
 * WnC PC Desktop Groupware Core Controller (pc.js)
 * High-Performance Full-Width Groupware Engine (Figma Bento Grid Inspired)
 * ==========================================================================
 */

const PCApp = {
  state: {
    activeScreen: 'dashboard',
    dashboardTab: 'company', // 'company' (전사 대시보드) | 'my' (내 대시보드)
    theme: 'light',
    user: (window.MockData && window.MockData.user) || {
      name: '이재광',
      role: '차장',
      dept: '퍼블리싱팀',
      email: 'jk.lee@wordncode.com',
      phone: '010-3882-6243',
      avatar: './profile.png',
      location: '서울 금천구 벚꽃로 298'
    },
    isCheckedIn: true,
    checkInTime: '08:55',
    checkOutTime: '--:--',
    currentDate: new Date(2026, 7, 24), // 2026년 8월 24일 (월)
    calYear: 2026,
    calMonth: 8, // 8월 (1-indexed)
    selectedDate: '2026-08-24',
    directoryCategory: 'all',
    directorySearch: '',
    workReportCategory: 'all',
    todos: (window.MockData && window.MockData.todos) || [],
    notices: (window.MockData && window.MockData.notices) || [],
    members: (window.MockData && window.MockData.employees) || [],
    projects: (window.MockData && window.MockData.projects) || [],
    schedules: (window.MockData && window.MockData.schedules) || []
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
      title: n.pinned ? `📌 [필독] ${n.title}` : `📢 ${n.title}`,
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
        <button type="button" class="pc-nav-btn ${this.state.activeScreen === item.id ? 'active' : ''}" 
                data-screen="${item.id}" onclick="PCApp.switchScreen('${item.id}')" title="${item.name}">
          <svg viewBox="0 0 24 24" fill="currentColor">
            ${item.icon}
          </svg>
          <span class="pc-tooltip">${item.name}</span>
        </button>
      </li>
    `).join('');
  },

  // 5. Render Main 3-Column Bento Dashboard
  renderDashboard() {
    this.renderLeftCol();
    this.renderCenterCol();
    this.renderRightCol();
  },

  renderLeftCol() {
    // 1. Profile Widget
    const profileWrap = document.getElementById('pc-widget-profile');
    if (profileWrap) {
      profileWrap.innerHTML = `
        <div class="pc-bento-card pc-profile-widget">
          <div class="pc-profile-avatar-wrap">
            <img src="${this.state.user.avatar}" alt="${this.state.user.name}" class="pc-profile-avatar" />
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
            <button class="pc-card-action" onclick="PCApp.openQuickModal('leave')">신청</button>
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

  renderCenterCol() {
    // 1. Notice Hero Banner
    const noticeWrap = document.getElementById('pc-widget-notice-banner');
    if (noticeWrap) {
      const topNotice = (window.MockData && window.MockData.notices && window.MockData.notices[0]) || { title: '2024년 하반기 전사 워크샵 일정 안내', author: '경영지원팀 오은주 차장', date: '2024.10.24' };
      noticeWrap.innerHTML = `
        <div class="pc-notice-banner">
          <div>
            <span class="pc-notice-tag">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              전사 공지사항
            </span>
            <h3 class="pc-notice-title" onclick="PCApp.switchScreen('notice')">${topNotice.title}</h3>
            <p class="pc-notice-meta">${topNotice.author} · ${topNotice.date}</p>
          </div>
          <button class="pc-quick-write-btn" onclick="PCApp.switchScreen('notice')">
            공지 전체보기
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>
        </div>
      `;
    }

    // 2. Weekly Work Reports (전주 vs 금주 비교 Bento Grid)
    const reportWrap = document.getElementById('pc-widget-work-report');
    if (reportWrap) {
      const reports = (window.MockData && window.MockData.workReports) || [];
      const primaryReport = reports[0] || {
        client: '한국메세나협회',
        title: '2026 한국메세나협회 통합 플랫폼 고도화',
        prevWeekSections: [{ dept: '기획팀', items: ['메인 IA 구조 설계'] }],
        thisWeekSections: [{ dept: '퍼블리싱팀', items: ['반응형 마크업 및 접근성 검수'] }]
      };

      const prevItems = (primaryReport.prevWeekSections && primaryReport.prevWeekSections[0]?.items) || ['기획/디자인 시안 검토 및 승인'];
      const thisItems = (primaryReport.thisWeekSections && primaryReport.thisWeekSections[0]?.items) || ['반응형 웹 UI 퍼블리싱 및 기능 연동'];

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
                  <p class="text-on-surface leading-relaxed">${(reports[1].prevWeekSections && reports[1].prevWeekSections[0]?.items[0]) || '중간 검수 완료'}</p>
                </div>
                <div class="p-3.5 bg-surface-container-lowest rounded-lg border-l-3 border-secondary">
                  <span class="font-bold text-secondary block mb-1.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-secondary"></span>
                    금주 계획
                  </span>
                  <p class="text-on-surface font-semibold leading-relaxed">${(reports[1].thisWeekSections && reports[1].thisWeekSections[0]?.items[0]) || '템플릿 배포 및 검수'}</p>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 3. Monthly Calendar Grid Full View
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
              ${this.state.isCheckedIn ? '근무 중 (정상)' : '출근 전'}
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
            <div class="pc-quick-item" onclick="PCApp.openQuickModal('leave')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/></svg>
              </div>
              <span class="pc-quick-label">휴가신청</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.openQuickModal('outwork')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
              </div>
              <span class="pc-quick-label">외근신청</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.openQuickModal('expense')">
              <div class="pc-quick-icon">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              </div>
              <span class="pc-quick-label">지출결의</span>
            </div>

            <div class="pc-quick-item" onclick="PCApp.switchScreen('work-report')">
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

            <div class="pc-quick-item" onclick="PCApp.switchScreen('todo')">
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
      
      // Filter mock schedules
      const daySchedules = schedulesMap[key] || [];

      html += `
        <div class="pc-cal-cell ${isToday ? 'today' : ''}" onclick="PCApp.openDateDetail('${key}')">
          <div class="pc-cal-header-row">
            <span class="pc-cal-date-num">${d}</span>
            ${daySchedules.length > 1 ? `<span class="pc-cal-count-badge">+${daySchedules.length - 1}</span>` : ''}
          </div>
          <div class="pc-cal-events-wrap">
            ${daySchedules.slice(0, 1).map(s => `
              <span class="pc-cal-event-tag ${s.type === 'primary' ? 'bg-primary/10 text-primary' : s.type === 'error' ? 'bg-error-container text-error' : 'bg-secondary/10 text-secondary'}" title="${s.title || s.badge}">${s.title || s.badge}</span>
            `).join('')}
          </div>
        </div>
      `;
    }

    return html;
  },

  changeCalMonth(offset) {
    this.state.calMonth += offset;
    if (this.state.calMonth > 12) {
      this.state.calMonth = 1;
      this.state.calYear++;
    } else if (this.state.calMonth < 1) {
      this.state.calMonth = 12;
      this.state.calYear--;
    }
    this.renderCenterCol();
    if (this.state.activeScreen === 'calendar') {
      this.renderCalendarView();
    }
  },

  goToTodayCal() {
    this.state.calYear = 2026;
    this.state.calMonth = 8;
    this.state.selectedDate = '2026-8-24';
    this.renderCenterCol();
    if (this.state.activeScreen === 'calendar') {
      this.renderCalendarView();
    }
  },

  selectDate(key) {
    this.state.selectedDate = key;
    this.renderCalendarView();
  },

  // 6. Sub-View Renderers (Full Width Screen Mode)
  renderCalendarView() {
    const titleEl = document.getElementById('pc-full-cal-title');
    if (titleEl) titleEl.textContent = `${this.state.calYear}년 ${this.state.calMonth}월`;

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
              <span class="pc-cal-date-num ${isToday ? 'text-primary font-black' : ''}">${d}</span>
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
        // Fallback for padded or non-padded format
        const altKey = selectedKey.includes('-0') ? selectedKey.replace(/-0([1-9])/g, '-$1') : selectedKey.replace(/-([1-9])(?!\d)/g, '-0$1');
        list = schedulesMap[altKey] || [];
      }
      
      const cleanKey = selectedKey.replace(/-0([1-9])/g, '-$1');
      const parts = cleanKey.split('-');
      const formattedDate = `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;

      dailyPanel.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-outline">
          <div>
            <h4 class="font-bold text-lg text-on-surface">${formattedDate}</h4>
            <p class="text-base text-primary font-bold">일정 ${list.length}건</p>
          </div>
          <button class="pc-card-action" onclick="PCApp.openDateDetail('${cleanKey}')">상세 팝업</button>
        </div>

        <div class="space-y-3 overflow-y-auto max-h-[520px] pr-1">
          ${list.length > 0 ? list.map(item => this.getScheduleCardHtml(item)).join('') : `
            <div class="text-center py-12 text-on-surface-variant">
              <p class="text-base font-bold mb-1">등록된 일정이 없습니다.</p>
              <p class="text-xs">상단 '+ 일정 등록' 버튼으로 등록해보세요.</p>
            </div>
          `}
        </div>
      `;
    }
  },

  getScheduleCardHtml(item) {
    let avatarUrl = item.avatar;
    if (item.author) {
      const authorFirstName = item.author.split(' ')[0];
      const found = (this.state.members || []).find(m => m.name === authorFirstName);
      if (found && found.avatar) avatarUrl = found.avatar;
    }
    if (!avatarUrl) avatarUrl = './profile.png';

    const titleStr = item.title || '';
    const badgeStr = item.badge || '';
    let categoryKey = badgeStr || titleStr;
    let dotClass = 'bg-primary';
    let badgeBg = 'bg-primary-container text-primary border border-primary/20';

    if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) {
      categoryKey = '연차';
      dotClass = 'bg-[#10b981]';
      badgeBg = 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/25';
    } else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) {
      categoryKey = titleStr.includes('반반차') ? '반반차' : '반차';
      dotClass = 'bg-[#f59e0b]';
      badgeBg = 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/25';
    } else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) {
      categoryKey = '외근';
      dotClass = 'bg-[#3b82f6]';
      badgeBg = 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/25';
    } else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) {
      categoryKey = '회의';
      dotClass = 'bg-[#8b5cf6]';
      badgeBg = 'bg-[#f3e8fd] text-[#7627bb] border border-[#7627bb]/25';
    } else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) {
      categoryKey = '공휴일';
      dotClass = 'bg-[#ef4444]';
      badgeBg = 'bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/25';
    }

    const isSpecial = categoryKey === '공휴일' || item.author === '공휴일' || item.author === '대한민국 공휴일' || item.author === '회사공지';
    const avatarHtml = isSpecial ? '' : `<img src="${avatarUrl}" alt="${item.author || '담당자'}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-outline/30 shadow-xs mr-3" />`;
    const authorHtml = isSpecial ? '' : `<span class="font-bold text-sm text-primary whitespace-nowrap">${item.author || '이재광 차장'}</span>`;

    return `
      <div class="flex items-center p-3.5 bg-surface-container-low rounded-2xl border border-outline/70 hover:border-primary transition-all shadow-2xs">
        <div class="w-2.5 h-2.5 rounded-full ${dotClass} shrink-0 mr-2.5"></div>
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1.5 mb-1">
            <div class="flex items-center gap-1.5 shrink-0">
              ${authorHtml}
              <span class="px-2 py-0.5 rounded-md text-xs font-bold ${badgeBg}">${item.badge || categoryKey}</span>
            </div>
            <span class="text-xs text-on-surface-variant font-medium whitespace-nowrap ml-auto">${item.time || '종일'}</span>
          </div>
          <div class="text-base text-on-surface font-bold leading-snug break-words">${item.title}</div>
          ${item.location ? `<p class="text-xs text-primary font-medium mt-1 flex items-center gap-1">📍 ${item.location}</p>` : ''}
        </div>
      </div>
    `;
  },

  openDateDetail(dateStr) {
    const schedulesMap = (window.MockData && window.MockData.schedules) || {};
    let list = schedulesMap[dateStr];
    if (!list) {
      const altKey = (dateStr || '').includes('-0') ? (dateStr || '').replace(/-0([1-9])/g, '-$1') : (dateStr || '').replace(/-([1-9])(?!\d)/g, '-0$1');
      list = schedulesMap[altKey] || [];
    }

    const cleanKey = (dateStr || '2026-8-24').replace(/-0([1-9])/g, '-$1');
    const parts = cleanKey.split('-');
    const formatted = `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;

    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-outline mb-5">
        <div>
          <h3 class="text-2xl font-bold text-on-surface">${formatted} 전체 일정</h3>
          <p class="text-base text-primary font-bold mt-1">총 ${list.length}건의 일정 및 근태 현황</p>
        </div>
        <button class="px-4 py-2 bg-primary text-white font-bold rounded-xl text-base" onclick="PCApp.openQuickModal('leave')">+ 신청 / 추가</button>
      </div>

      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        ${list.length > 0 ? list.map(item => this.getScheduleCardHtml(item)).join('') : `
          <div class="text-center py-12 text-on-surface-variant">
            <p class="text-lg font-bold mb-2">등록된 일정이 없습니다.</p>
            <p class="text-base">휴가, 외근 또는 팀 회의 일정을 등록해보세요.</p>
          </div>
        `}
      </div>

      <div class="flex justify-end pt-6 border-t border-outline mt-5">
        <button class="px-6 py-2.5 bg-surface-container-high text-on-surface font-bold text-base rounded-xl" onclick="PCApp.closeModal()">닫기</button>
      </div>
    `;

    modal.classList.add('active');
  },

  renderDirectoryView() {
    const container = document.getElementById('pc-directory-grid');
    if (!container) return;

    const filtered = (this.state.members || []).filter(m => {
      const matchCat = this.state.directoryCategory === 'all' || m.dept === this.state.directoryCategory;
      const matchSearch = !this.state.directorySearch || m.name.includes(this.state.directorySearch) || m.dept.includes(this.state.directorySearch);
      return matchCat && matchSearch;
    });

    container.innerHTML = filtered.map(m => `
      <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary hover:shadow-md transition-all text-base">
        <div class="flex items-center gap-4 mb-4">
          <img src="${m.avatar || './profile.png'}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
          <div>
            <h4 class="font-bold text-lg text-on-surface">${m.name} <span class="text-base font-normal text-on-surface-variant">${m.role}</span></h4>
            <p class="text-base font-bold text-primary">${m.dept}</p>
          </div>
        </div>
        <div class="space-y-2 text-base text-on-surface-variant pt-3 border-t border-outline">
          <p class="flex items-center gap-2.5">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            ${m.email || 'user@wordncode.com'}
          </p>
          <p class="flex items-center gap-2.5">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            ${m.phone || '010-0000-0000'}
          </p>
        </div>
      </div>
    `).join('');
  },

  renderNoticeView() {
    const listWrap = document.getElementById('pc-notice-full-list');
    if (!listWrap) return;

    listWrap.innerHTML = (this.state.notices || []).map((n, idx) => `
      <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary transition-all cursor-pointer text-base" onclick="PCApp.openNoticeModal(${idx})">
        <div class="flex items-center justify-between mb-3">
          <span class="text-base font-bold px-3 py-1 rounded-full ${n.pinned ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}">
            ${n.pinned ? '필독 공지' : '일반 공지'}
          </span>
          <span class="text-base text-on-surface-variant font-medium">${n.date}</span>
        </div>
        <h3 class="font-bold text-lg text-on-surface mb-2">${n.title}</h3>
        <p class="text-base text-on-surface-variant line-clamp-2 leading-relaxed">${n.preview || '본문 내용을 확인하려면 클릭하세요.'}</p>
        <div class="mt-4 pt-3 border-t border-outline/50 flex items-center justify-between text-base text-on-surface-variant font-medium">
          <span>작성자: ${n.author || '경영지원팀'}</span>
          <span>조회수 ${n.views || 42}</span>
        </div>
      </div>
    `).join('');
  },

  renderWorkReportView() {
    const wrap = document.getElementById('pc-workreport-full-container');
    if (!wrap) return;

    const reports = (window.MockData && window.MockData.workReports) || [];
    wrap.innerHTML = reports.map(r => `
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline mb-6 text-base">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-outline">
          <h3 class="text-xl font-bold text-on-surface flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full bg-primary"></span>
            ${r.dept} 주간 업무보고
          </h3>
          <span class="text-base font-bold px-3.5 py-1 bg-surface-container rounded-full text-on-surface-variant">2026년 8월 4주차</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${(r.projects || []).map(p => `
            <div class="p-5 bg-surface-container-low rounded-xl">
              <h4 class="font-bold text-base text-primary mb-3">${p.name}</h4>
              <div class="space-y-3 text-base">
                <div class="p-3.5 bg-surface-container-lowest rounded-lg">
                  <span class="font-bold text-on-surface-variant block mb-1.5">전주 실적</span>
                  <p class="text-on-surface leading-relaxed">${p.prevWeek || p.lastWeek || '업무 진행'}</p>
                </div>
                <div class="p-3.5 bg-surface-container-lowest rounded-lg border-l-3 border-primary">
                  <span class="font-bold text-primary block mb-1.5">금주 계획</span>
                  <p class="text-on-surface font-semibold leading-relaxed">${p.thisWeek || p.plan || '계획 수립'}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  renderFinanceView() {
    console.log('Finance view rendered');
  },

  renderTodoView() {
    const listEl = document.getElementById('pc-full-todo-list');
    if (!listEl) return;
    listEl.innerHTML = (this.state.todos || []).map((t, idx) => `
      <div class="pc-todo-item">
        <input type="checkbox" class="pc-todo-checkbox" ${t.completed ? 'checked' : ''} onchange="PCApp.toggleTodo(${idx}); PCApp.renderTodoView();">
        <span class="pc-todo-title ${t.completed ? 'line-through opacity-50' : ''}">${t.title}</span>
        <span class="pc-todo-priority ${t.priority === 'high' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}">${t.priority === 'high' ? '높음' : '보통'}</span>
      </div>
    `).join('');
  },

  renderProjectView() {
    console.log('Project view rendered');
  },

  renderCheckinView() {
    console.log('Checkin view rendered');
  },

  // 7. Commute Check In/Out Actions
  handleCheckIn() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = true;
    this.state.checkInTime = timeStr;
    alert(`[출근 완료] ${timeStr} 정상 출근 처리되었습니다.`);
    this.renderRightCol();
  },

  handleCheckOut() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = false;
    this.state.checkOutTime = timeStr;
    alert(`[퇴근 완료] ${timeStr} 정상 퇴근 처리되었습니다. 오늘도 수고하셨습니다!`);
    this.renderRightCol();
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
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">휴가 신청서 기안</h3>
        <div class="space-y-5 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-2">휴가 종류</label>
            <select class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base">
              <option>연차 (종일)</option>
              <option>오전 반차</option>
              <option>오후 반차</option>
              <option>경조 휴가</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-on-surface mb-2">시작일</label>
              <input type="date" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" value="2026-08-24" />
            </div>
            <div>
              <label class="block font-bold text-on-surface mb-2">종료일</label>
              <input type="date" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" value="2026-08-24" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-2">휴가 사유</label>
            <textarea class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" rows="3" placeholder="상세 사유를 입력하세요..."></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="alert('신청이 접수되었습니다.'); PCApp.closeModal();">신청하기</button>
          </div>
        </div>
      `;
    } else if (type === 'outwork') {
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">외근 신청서 기안</h3>
        <div class="space-y-5 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-2">방문처 / 고객사</label>
            <input type="text" placeholder="예: 한국건강가정진흥원 본원" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-2">외근 목적</label>
            <input type="text" placeholder="예: 프로젝트 중간 검수 회의" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="alert('외근 신청이 완료되었습니다.'); PCApp.closeModal();">신청하기</button>
          </div>
        </div>
      `;
    } else if (type === 'expense') {
      modalBody.innerHTML = `
        <h3 class="text-2xl font-bold text-on-surface mb-5">지출결의서 기안</h3>
        <div class="space-y-5 text-base">
          <div>
            <label class="block font-bold text-on-surface mb-2">결의 유형</label>
            <select class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base">
              <option>법인카드 사용 내역</option>
              <option>개인영수증 경비 청구</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-on-surface mb-2">금액</label>
            <input type="text" placeholder="0원" class="w-full p-3 bg-surface-container-low border border-outline rounded-xl text-base" />
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-outline">
            <button class="px-5 py-2.5 rounded-xl border border-outline font-bold text-base" onclick="PCApp.closeModal()">취소</button>
            <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="alert('지출결의서가 기안되었습니다.'); PCApp.closeModal();">기안하기</button>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('pc-global-modal');
    if (modal) modal.classList.remove('active');
  },

  openNoticeModal(idx) {
    const n = this.state.notices[idx];
    if (!n) return;
    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-outline mb-4">
        <h3 class="text-2xl font-bold text-on-surface">${n.title}</h3>
        <span class="text-base text-on-surface-variant font-medium">${n.date} · ${n.author}</span>
      </div>
      <div class="text-base text-on-surface leading-relaxed whitespace-pre-line py-3">
        ${n.content || n.preview || '상세 공지 내용입니다.'}
      </div>
      <div class="flex justify-end pt-6 border-t border-outline mt-4">
        <button class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-base" onclick="PCApp.closeModal()">닫기</button>
      </div>
    `;
    modal.classList.add('active');
  },

  bindGlobalEvents() {
    // Escape key modal close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
};

// Auto boot on DOM load
document.addEventListener('DOMContentLoaded', () => {
  PCApp.init();
});
