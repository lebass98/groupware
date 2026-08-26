// WnC 그룹웨어 애플리케이션 코어 로직

// Framer Motion & Spring Physics 모션 엔진 (Web Animations API 120fps 네이티브 가속)
const FramerMotion = {
  // 물리 스프링 수식으로 정밀 탄성 곡선 계산
  generateSpringKeyframes(from, to, config = { stiffness: 280, damping: 24, mass: 1, samples: 40 }) {
    const { stiffness: k = 280, damping: c = 24, mass: m = 1, samples = 40 } = config;
    const gamma = c / (2 * m);
    const omega0 = Math.sqrt(k / m);
    const omegaD = Math.sqrt(Math.max(0, omega0 * omega0 - gamma * gamma));

    const frames = [];
    const delta = to - from;

    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * (config.duration || 0.45);
      let progress = 1;
      if (omegaD > 0) {
        progress = 1 - Math.exp(-gamma * t) * (Math.cos(omegaD * t) + (gamma / omegaD) * Math.sin(omegaD * t));
      } else {
        progress = 1 - Math.exp(-gamma * t) * (1 + gamma * t);
      }
      frames.push(from + delta * progress);
    }
    return frames;
  },

  spring(config = { stiffness: 320, damping: 26 }) {
    return 'cubic-bezier(0.16, 1, 0.3, 1)';
  },

  animate(element, keyframes, options = {}) {
    if (!element || typeof element.animate !== 'function') return null;
    const duration = (options.duration || 0.42) * 1000;
    const easing = options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)';

    // Keyframes 객체 형식 ({ opacity: [0, 1], transform: [...] }) -> Web Animations API 배열 포맷 변환
    let waKeyframes = keyframes;
    if (typeof keyframes === 'object' && !Array.isArray(keyframes)) {
      const keys = Object.keys(keyframes);
      const len = Math.max(...keys.map(k => Array.isArray(keyframes[k]) ? keyframes[k].length : 1));
      waKeyframes = [];
      for (let i = 0; i < len; i++) {
        const frame = {};
        for (const k of keys) {
          const val = keyframes[k];
          frame[k] = Array.isArray(val) ? val[i] : val;
        }
        waKeyframes.push(frame);
      }
    }

    try {
      const anim = element.animate(waKeyframes, {
        duration: duration,
        easing: easing,
        fill: options.fill || 'none'
      });
      return anim;
    } catch (e) {
      console.warn('Animation error:', e);
      return null;
    }
  },

  // 내부 하위 Bento 카드들을 0.035초 시차를 두고 순차 등장시키는 Stagger 모션
  staggerChildren(container, selector = '.bento-card, .stat-card, .project-card, .emp-item-card, .board-card, .nav-card, header, .chip-bar', delayStep = 32) {
    if (!container) return;
    const items = container.querySelectorAll(selector);
    items.forEach((el, idx) => {
      if (idx > 10) return; // 상위 10개 핵심 컴포넌트에 적용
      try {
        el.animate([
          { opacity: 0, transform: 'translateY(22px) scale(0.96)', filter: 'blur(6px)' },
          { opacity: 0.92, transform: 'translateY(-3px) scale(1.008)', filter: 'blur(0px)', offset: 0.65 },
          { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)', offset: 1.0 }
        ], {
          duration: 450,
          delay: idx * delayStep,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both'
        });
      } catch (e) { }
    });
  }
};

// 전체 독 메뉴 메타데이터 정의 (100% SVG 벡터 아이콘 - Outlined & Filled 동적 변환)
const ALL_DOCK_MENU_ITEMS = [
  { id: 'screen-home', name: '메뉴', iconName: 'grid_view' },
  { id: 'screen-today', name: '투데이', iconName: 'today' },
  { id: 'screen-checkin', name: '출/퇴근', iconName: 'login' },
  { id: 'screen-calendar', name: '근태일지', iconName: 'calendar_month' },
  { id: 'screen-request', name: '휴가/외근', iconName: 'flight_takeoff' },
  { id: 'screen-notice-list', name: '공지사항', iconName: 'campaign' },
  { id: 'screen-directory', name: '주소록', iconName: 'contact_page' },
  { id: 'screen-todo', name: '할 일', iconName: 'task_alt' },
  { id: 'screen-project-list', name: '프로젝트', iconName: 'folder_managed' },
  { id: 'screen-finance', name: '재무/경비', iconName: 'account_balance_wallet' },
  { id: 'screen-work-report', name: '업무보고', iconName: 'assignment' }
];

const App = {
  state: {
    isLoggedIn: false, // Default to FALSE so user starts on Login screen
    activeTab: 'screen-today',
    dockMenus: ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'], // 4 core slots + 1 add custom button
    todosFilter: 'all',
    todosSearchQuery: '',
    selectedProject: null,
    todoFormPriority: 'medium',
    todoViewMode: 'card',
    recentProjects: (window.MockData && window.MockData.recentProjects) || ['그룹웨어 고도화', '근태관리 시스템', '디자인 시스템 (M3)', '경영지원 / 재무'],
    pendingDeleteTodoId: null,
    currentDetailTodoId: null,
    selectedTrashIds: [],
    trashedTodos: (window.MockData && window.MockData.trashedTodos) || [],
    todos: (window.MockData && window.MockData.todos) || [],
    finance: (window.MockData && window.MockData.finance) || { activeTab: 'expense', cardFilter: 'corp', reportFilter: 'all', expenses: { corp: [], personal: [] } },
    commuteTab: 'checkin',
    isCheckedIn: false,
    checkInTime: null,
    todaySeconds: 0,
    timerInterval: null,
    clockInterval: null,
    currentLocation: '서울 금천구 벚꽃로 298',
    gpsLat: null,
    gpsLng: null,
    officeLocation: (window.MockData && window.MockData.attendance && window.MockData.attendance.officeLocation) || {
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
    notifications: (window.MockData && window.MockData.notifications) ? JSON.parse(JSON.stringify(window.MockData.notifications)) : [],
    notificationFilter: 'all',
    user: {
      id: 11,
      name: '이재광',
      fullName: '이재광',
      dept: '퍼블리싱팀',
      role: '팀장',
      email: 'yellow@wordncode.com',
      phone: '010-5244-1251',
      avatar: 'profile.png'
    },
    currentNoticeCategory: 'all',
    currentNoticeId: 1,
    notices: (window.MockData && window.MockData.notices) || [],
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth() + 1,
    calSelectedDay: new Date().getDate(),
    currentDirectoryCategory: 'all',
    currentEmployeeId: 1,
    employees: (window.MockData && window.MockData.employees) || [],
    logs: (window.MockData && window.MockData.attendance && window.MockData.attendance.logs) || [],
    // Projects State
    projects: (window.MockData && window.MockData.projects) || [],
    projectsFilter: 'all',
    projectsSearchQuery: '',
    projectViewMode: 'card',
    // Work Reports State
    workReports: (window.MockData && window.MockData.workReports) || [],
    workReportTab: 'weekly',
    workReportYear: 2026,
    workReportMonth: 8,
    workReportWeek: 3,
    workReportDate: '2026-08-21',
    workReportTeam: 'all',
    // Menu Grid Columns (2 or 3)
    menuColumns: 2
  },

  init() {
    this.loadState();
    this.applyTheme(this.state.settings.themeIdx || 3);
    this.startLiveClock();
    this.updateNotificationBadge();

    // Initialize Home Menu Columns (2열 or 3열)
    const savedCols = parseInt(localStorage.getItem('wordncode_menu_columns'), 10) || this.state.menuColumns || 2;
    this.setMenuColumns(savedCols);

    // 브라우저 뒤로가기(popstate) 발생 시 탭 전환 연동
    window.addEventListener('popstate', (event) => {
      if (this.state.isLoggedIn) {
        if (event.state && event.state.activeTab) {
          this.switchTab(event.state.activeTab, null, true);
        } else {
          this.switchTab('screen-today', null, true);
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

    // Initialize Scroll Effects (Header Notice & Dock Menu)
    this.initScrollEffects();

    // Initialize Global Modal Background Scroll Lock Engine
    this.initModalScrollObserver();

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
        this.state.checkInTimeStr = parsed.checkInTimeStr || (this.state.checkInTime ? this.formatCheckInTime(this.state.checkInTime) : null);
        this.state.settings = { ...this.state.settings, ...parsed.settings };
        this.state.activeTab = parsed.activeTab ?? 'screen-today';
        if (parsed.logs && parsed.logs.length) {
          this.state.logs = parsed.logs;
        }
        if (parsed.todos && parsed.todos.length) {
          this.state.todos = parsed.todos;
        }
        if (parsed.recentProjects && parsed.recentProjects.length) {
          this.state.recentProjects = parsed.recentProjects;
        }
        if (parsed.trashedTodos && parsed.trashedTodos.length) {
          this.state.trashedTodos = parsed.trashedTodos;
        }
        if (parsed.menuColumns) {
          this.state.menuColumns = parsed.menuColumns;
        }
        if (parsed.dockMenus && Array.isArray(parsed.dockMenus) && parsed.dockMenus.length) {
          const validIds = ALL_DOCK_MENU_ITEMS.map(item => item.id);
          const sanitized = parsed.dockMenus.filter(id => validIds.includes(id) && id !== 'screen-profile');
          this.state.dockMenus = sanitized.length > 0 ? sanitized.slice(0, 4) : ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'];
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
        checkInTimeStr: this.state.checkInTimeStr,
        settings: this.state.settings,
        dockMenus: this.state.dockMenus,
        logs: this.state.logs,
        todos: this.state.todos,
        recentProjects: this.state.recentProjects,
        trashedTodos: this.state.trashedTodos,
        activeTab: this.state.activeTab,
        menuColumns: this.state.menuColumns
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

      const summaryWorkTime = document.getElementById('today-summary-work-time');
      if (summaryWorkTime) {
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(mins).padStart(2, '0');
        summaryWorkTime.innerHTML = `${hStr}<span class="text-2xl text-on-surface-variant font-semibold">h</span> ${mStr}<span class="text-2xl text-on-surface-variant font-semibold">m</span>`;
      }
      const summaryProgressBar = document.getElementById('today-summary-progress-bar');
      if (summaryProgressBar) {
        const pct = Math.min(100, Math.round((diffSec / 28800) * 100));
        summaryProgressBar.style.width = `${pct}%`;
      }
      const summaryRemaining = document.getElementById('today-summary-remaining-time');
      if (summaryRemaining) {
        const remSecs = Math.max(0, 28800 - diffSec);
        const remH = Math.floor(remSecs / 3600);
        const remM = Math.floor((remSecs % 3600) / 60);
        summaryRemaining.innerText = `퇴근까지 ${remH}h ${remM}m`;
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

  formatCheckInTime(d) {
    if (!d) return '오전 08:45';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    let h = dateObj.getHours();
    const m = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? '오후' : '오전';
    h = h % 12 || 12;
    return `${ampm} ${String(h).padStart(2, '0')}:${m}`;
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
      this.state.checkInTimeStr = this.formatCheckInTime(this.state.checkInTime);
      this.startWorkTimer();
      this.showToast(`🎉 서울 금천구 벚꽃로 298 출근 체크 성공! (${this.state.checkInTimeStr})`);
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
      this.state.checkInTimeStr = null;
      this.stopWorkTimer();

      const timerEl = document.getElementById('today-work-time');
      if (timerEl) timerEl.innerText = `${hours}시간 ${mins}분 (완료)`;

      this.showToast('👏 오늘 업무가 종료되었습니다. 수고하셨습니다!');
    }

    this.saveState();
    this.renderUI();
  },

  executeLoginTransition(onComplete) {
    const loginScreen = document.getElementById('screen-login');
    const startTab = 'screen-today';
    const targetScreen = document.getElementById(startTab);
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    const ticker = document.getElementById('notice-ticker');

    this.state.isLoggedIn = true;
    this.state.activeTab = startTab;
    this.saveState();
    history.replaceState({ activeTab: startTab }, '', `#${startTab}`);

    // 로그인 화면 숨김 및 활성 스크린 전환
    if (loginScreen) {
      loginScreen.classList.remove('active');
    }

    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // 상단 헤더, 티커, 하단 독 노출
    if (header) {
      header.style.display = 'flex';
    }
    if (nav) {
      nav.style.display = 'flex';
      nav.classList.remove('nav-hidden');
    }
    if (ticker) {
      ticker.style.display = 'flex';
      ticker.classList.remove('ticker-hidden');
    }

    this.startNoticeTicker();
    this.resetScrollEffects();
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 하단 독 활성 탭 갱신 및 알림 뱃지 갱신
    this.renderBottomNav();
    this.updateNotificationBadge();

    if (typeof onComplete === 'function') onComplete();
  },

  // ==========================================================================
  // 실시간 알림 센터 시스템 (Notification Center)
  // ==========================================================================
  isManagerRole(roleOrUser) {
    const role = typeof roleOrUser === 'string' ? roleOrUser : (roleOrUser?.role || this.state.user?.role || '');
    const managerRoles = ['대표', '이사', '본부장', '부장', '팀장', '차장'];
    return managerRoles.some(r => role.includes(r));
  },

  getVisibleNotifications() {
    const isManager = this.isManagerRole(this.state.user);
    let list = this.state.notifications || [];
    
    // 팀장/부서장이 아닌 경우 팀원 출퇴근 알림(managerOnly) 필터링
    if (!isManager) {
      list = list.filter(n => !n.managerOnly);
    }
    
    // 필터 탭 적용
    if (this.state.notificationFilter && this.state.notificationFilter !== 'all') {
      list = list.filter(n => n.type === this.state.notificationFilter);
    }
    return list;
  },

  getUnreadNotificationCount() {
    const isManager = this.isManagerRole(this.state.user);
    const list = (this.state.notifications || []).filter(n => isManager || !n.managerOnly);
    return list.filter(n => !n.isRead).length;
  },

  updateNotificationBadge() {
    const unreadCount = this.getUnreadNotificationCount();
    const badgeEl = document.getElementById('mobile-notification-badge');
    const modalBadgeEl = document.getElementById('notification-unread-count-badge');
    const todaySummaryBadgeEl = document.getElementById('today-summary-noti-badge');
    
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (modalBadgeEl) {
      modalBadgeEl.textContent = unreadCount;
      modalBadgeEl.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (todaySummaryBadgeEl) {
      todaySummaryBadgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
      todaySummaryBadgeEl.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  },

  openNotificationModal() {
    const modalEl = document.getElementById('notification-modal');
    if (!modalEl) return;

    // 팀장 권한 라벨 업데이트
    const roleLabel = document.getElementById('notification-role-label');
    if (roleLabel) {
      const isManager = this.isManagerRole(this.state.user);
      roleLabel.textContent = isManager 
        ? `팀장 권한 (${this.state.user.role || '팀장'}): 팀원 출퇴근 알림 연동됨` 
        : `일반 권한 (${this.state.user.role || '팀원'}): 개인 결재/외근/공지 알림 연동됨`;
    }

    this.renderNotifications();
    modalEl.classList.add('active');
  },

  closeNotificationModal() {
    const modalEl = document.getElementById('notification-modal');
    if (modalEl) {
      modalEl.classList.remove('active');
    }
  },

  filterNotifications(filterType, tabEl) {
    this.state.notificationFilter = filterType || 'all';
    
    const tabs = document.querySelectorAll('#notification-filter-tabs button');
    tabs.forEach(btn => {
      if (btn.getAttribute('data-filter') === this.state.notificationFilter) {
        btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-primary text-on-primary shadow-sm';
      } else {
        btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
      }
    });

    this.renderNotifications();
  },

  markAllNotificationsRead() {
    const isManager = this.isManagerRole(this.state.user);
    (this.state.notifications || []).forEach(n => {
      if (isManager || !n.managerOnly) {
        n.isRead = true;
      }
    });
    this.updateNotificationBadge();
    this.renderNotifications();
    this.renderTodayData();
    this.showToast('✅ 모든 알림을 읽음 처리했습니다.');
  },

  onNotificationClick(id) {
    const notif = (this.state.notifications || []).find(n => n.id === id);
    if (!notif) return;

    notif.isRead = !notif.isRead;
    this.updateNotificationBadge();
    this.renderNotifications();
    this.renderTodayData();
  },

  renderNotifications() {
    const container = document.getElementById('notification-list-container');
    if (!container) return;

    const list = this.getVisibleNotifications();
    this.updateNotificationBadge();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
          <div class="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/50 mb-3">
            <svg class="w-7 h-7" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
            </svg>
          </div>
          <p class="text-sm font-bold text-on-surface">새로운 알림이 없습니다.</p>
          <p class="text-xs text-on-surface-variant mt-1">새로운 업무 변동사항이 생기면 바로 알려드릴게요.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      let typeBadge = '';
      if (item.type === 'commute') {
        typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">출/퇴근</span>';
      } else if (item.type === 'approval') {
        typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300">전자결재</span>';
      } else if (item.type === 'business') {
        typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-300">외근/출장</span>';
      } else {
        typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300">공지/일정</span>';
      }

      const unreadBadge = !item.isRead
        ? '<span class="w-2.5 h-2.5 rounded-full bg-[#e83538] shrink-0" title="읽지 않음"></span>'
        : '';

      const unreadBg = !item.isRead
        ? 'bg-primary/5 border border-primary/20'
        : 'bg-surface-container-low hover:bg-surface-container border border-transparent';

      const avatarSrc = item.sender?.avatar || './resource/image/profile_abc.png';

      return `
        <div class="p-3.5 rounded-2xl ${unreadBg} transition-all active:scale-[0.98] cursor-pointer flex items-start gap-3 relative" onclick="App.onNotificationClick(${item.id})">
          <img src="${avatarSrc}" alt="${item.sender?.name || '임직원'}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-outline/30 mt-0.5" onerror="this.src='./resource/image/profile_abc.png'" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                ${typeBadge}
                <span class="font-bold text-xs text-on-surface truncate">${item.title}</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[11px] text-on-surface-variant font-medium">${item.time}</span>
                ${unreadBadge}
              </div>
            </div>
            <p class="text-xs text-on-surface font-medium leading-relaxed mb-1.5 break-words">${item.message}</p>
            <div class="text-[11px] text-on-surface-variant font-medium">
              <span>${item.sender?.dept || ''} ${item.sender?.name || ''} ${item.sender?.role || ''}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  login() {
    this.executeLoginTransition(() => {
      this.showToast(`🎉 ${this.state.user.name}님, 환영합니다! WnC 그룹웨어를 시작합니다.`);
    });
  },

  loginDemo(provider) {
    this.executeLoginTransition(() => {
      const msg = provider
        ? `🎉 ${provider} 계정으로 로그인되었습니다.`
        : `🎉 ${this.state.user.name}님, 로그인 완료! 출결 관리 화면으로 이동합니다.`;
      this.showToast(msg);
    });
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
    if (nav) {
      nav.style.display = 'none';
      nav.classList.remove('nav-hidden');
    }
    if (ticker) {
      ticker.style.display = 'none';
      ticker.classList.remove('ticker-hidden');
    }
    this.stopNoticeTicker();
  },

  showAppShell() {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('bottom-nav');
    const ticker = document.getElementById('notice-ticker');
    if (header) header.style.display = 'flex';
    if (nav) {
      this.renderDockNav();
      nav.style.display = 'flex';
      nav.classList.remove('nav-hidden');
    }
    if (ticker) {
      ticker.style.display = 'flex';
      ticker.classList.remove('ticker-hidden');
    }
    this.startNoticeTicker();

    const startTab = this.state.activeTab || 'screen-today';
    history.replaceState({ activeTab: startTab }, '', `#${startTab}`);
    this.switchTab(startTab, null, true);
  },

  // =========================================
  // 스크롤 인터랙션: 최상단 공지 노출 / 아래 스크롤 숨김 & 독메뉴 위/아래 방향 슬라이드
  // =========================================
  initScrollEffects() {
    let lastScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    let isTicking = false;
    const SCROLL_THRESHOLD = 5; // 스크롤 감도 임계값

    const handleScroll = () => {
      if (!this.state.isLoggedIn) {
        isTicking = false;
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
      const ticker = document.getElementById('notice-ticker');
      const nav = document.getElementById('bottom-nav');
      const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const isAtBottom = (currentScrollY + clientHeight) >= (scrollHeight - 25);

      // 1. 공지사항 티커: 스크롤이 최상단(<= 15px)에 닿았을 때만 나타나고, 아래로 내리면 오른쪽으로 슬라이드 아웃
      if (ticker && ticker.style.display !== 'none') {
        if (currentScrollY <= 15) {
          ticker.classList.remove('ticker-hidden');
        } else {
          ticker.classList.add('ticker-hidden');
        }
      }

      // 2. 하단 독 메뉴: 스크롤을 위로 올릴 때 나타나고, 아래로 내릴 때는 아래로 슬라이드 다운되어 숨김
      if (nav && nav.style.display !== 'none') {
        if (currentScrollY <= 15 || isAtBottom) {
          // 최상단 또는 페이지 맨 끝에 도달했을 때는 항상 독메뉴 표시
          nav.classList.remove('nav-hidden');
        } else if (Math.abs(currentScrollY - lastScrollY) >= SCROLL_THRESHOLD) {
          if (currentScrollY > lastScrollY) {
            // 아래로 스크롤 (Scroll Down) -> 독메뉴 숨김
            nav.classList.add('nav-hidden');
          } else {
            // 위로 스크롤 (Scroll Up) -> 독메뉴 표시
            nav.classList.remove('nav-hidden');
          }
        }
      }

      lastScrollY = currentScrollY;
      isTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(handleScroll);
        isTicking = true;
      }
    }, { passive: true });

    document.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(handleScroll);
        isTicking = true;
      }
    }, { passive: true });
  },

  resetScrollEffects() {
    const ticker = document.getElementById('notice-ticker');
    const nav = document.getElementById('bottom-nav');
    if (ticker) ticker.classList.remove('ticker-hidden');
    if (nav) nav.classList.remove('nav-hidden');
  },

  // =========================================
  // 모달 팝업 오픈 시 배경 스크롤 차단 엔진
  // position:fixed 방식 — 가장 확실한 크로스브라우저 구현
  // =========================================
  _scrollLockY: 0,

  syncModalScrollLock() {
    const topLevelModalIds = [
      'confirm-modal',
      'request-modal',
      'modal-expense-write',
      'modal-report-write',
      'modal-theme-select',
      'modal-dock-customizer',
      'modal-schedule-write',
      'modal-directory-picker',
      'modal-todo-write',
      'modal-date-detail',
      'modal-todo-detail',
      'modal-project-detail',
      'modal-todo-delete-confirm',
      'modal-todo-trash',
      'drawer-settings'
    ];

    const hasOpenModal = topLevelModalIds.some(id => {
      const el = document.getElementById(id);
      if (!el) return false;
      if (el.classList.contains('active')) return true;
      if (!el.classList.contains('hidden') && el.offsetWidth > 0) return true;
      return false;
    });

    const isLocked = document.body.classList.contains('modal-open');

    if (hasOpenModal && !isLocked) {
      // 스크롤 차단: 현재 스크롤 위치 저장 후 body를 fixed로 고정
      this._scrollLockY = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${this._scrollLockY}px`;
      document.body.classList.add('modal-open');
    } else if (!hasOpenModal && isLocked) {
      // 스크롤 복원: body fixed 해제 후 원래 위치로 복귀
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, this._scrollLockY);
    }
  },

  lockScroll() {
    if (!document.body.classList.contains('modal-open')) {
      this._scrollLockY = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${this._scrollLockY}px`;
      document.body.classList.add('modal-open');
    }
  },

  unlockScroll() {
    setTimeout(() => {
      this.syncModalScrollLock();
    }, 50);
  },

  initModalScrollObserver() {
    // MutationObserver로 모달/드로어 class 변경 감지
    try {
      const observer = new MutationObserver(() => {
        this.syncModalScrollLock();
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true
      });
    } catch (e) {
      console.warn('MutationObserver not available:', e);
    }

    // 초기 상태 점검
    this.syncModalScrollLock();
  },


  // =========================================
  // 독 메뉴 동적 렌더링 및 커스터마이징 모달 (Dock Menu Customizer)
  // =========================================
  renderDockNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    const currentTab = this.state.activeTab || 'screen-today';
    const validDockMenus = (this.state.dockMenus && Array.isArray(this.state.dockMenus) && this.state.dockMenus.length)
      ? this.state.dockMenus
      : ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'];

    let html = '';
    validDockMenus.forEach(menuId => {
      const item = ALL_DOCK_MENU_ITEMS.find(m => m.id === menuId);
      if (!item) return;
      const isActive = (currentTab === item.id);
      const iconSvg = typeof getSvgIcon === 'function'
        ? getSvgIcon(item.iconName, 'w-6 h-6', '', isActive)
        : `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>`;

      html += `
        <a class="nav-item ${isActive ? 'active' : ''}" data-target="${item.id}" onclick="App.switchTab('${item.id}', this)" title="${item.name}">
          ${iconSvg}
          <span>${item.name}</span>
        </a>
      `;
    });

    // 독 마지막 슬롯: 설정 버튼 고정 렌더링
    html += `
      <a class="nav-item nav-item-add" id="nav-item-dock-add" onclick="App.openSettingsDrawer()" title="환경설정">
        ${typeof getSvgIcon === 'function' ? getSvgIcon('settings', 'w-6 h-6') : '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'}
        <span>설정</span>
      </a>
    `;

    nav.innerHTML = html;
  },

  openDockCustomizerModal() {
    const modal = document.getElementById('modal-dock-customizer');
    if (!modal) return;
    this.renderDockCustomizer();
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
    });
  },

  closeDockCustomizerModal() {
    const modal = document.getElementById('modal-dock-customizer');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  },

  // 고정 독 슬롯 (제거/변경 불가)
  FIXED_DOCK_MENUS: ['screen-home', 'screen-today'],

  renderDockCustomizer() {
    const currentContainer = document.getElementById('dock-current-slots');
    const availableContainer = document.getElementById('dock-available-menus');
    const slotCountEl = document.getElementById('dock-slot-count');
    const availableCountEl = document.getElementById('dock-available-count');

    const currentMenus = (this.state.dockMenus && Array.isArray(this.state.dockMenus) && this.state.dockMenus.length)
      ? this.state.dockMenus
      : ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'];

    if (slotCountEl) slotCountEl.textContent = currentMenus.length;

    // 1. 현재 독 메뉴 슬롯 렌더링
    if (currentContainer) {
      let currentHtml = '';
      currentMenus.forEach(menuId => {
        const item = ALL_DOCK_MENU_ITEMS.find(m => m.id === menuId);
        if (!item) return;
        const isFixed = this.FIXED_DOCK_MENUS.includes(menuId);
        const iconSvg = typeof getSvgIcon === 'function'
          ? getSvgIcon(item.iconName, 'w-4 h-4')
          : '<circle cx="12" cy="12" r="8"/>';

        currentHtml += `
          <div class="flex items-center justify-between p-2.5 rounded-2xl ${isFixed ? 'bg-primary/5 border border-primary/25' : 'bg-surface-container-low dark:bg-[#1f2937] border border-outline-variant/20'} shadow-2xs transition-all">
            <div class="flex items-center gap-2 text-on-surface font-label text-xs font-bold truncate">
              <div class="w-7 h-7 rounded-xl ${isFixed ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0">
                ${iconSvg}
              </div>
              <span class="truncate">${item.name}</span>
              ${isFixed ? `<span class="flex items-center gap-0.5 text-[10px] font-semibold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                고정
              </span>` : ''}
            </div>
            ${isFixed
            ? `<div class="p-1.5 rounded-lg text-primary/30 shrink-0 cursor-not-allowed" title="고정 메뉴는 변경할 수 없습니다">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                </div>`
            : `<button type="button" onclick="App.removeDockMenu('${item.id}')" class="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0 cursor-pointer" title="독 메뉴에서 제거">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>`
          }
          </div>
        `;
      });

      // 빈 슬롯 표시 (최대 4개 슬롯)
      const emptySlots = 4 - currentMenus.length;
      for (let i = 0; i < emptySlots; i++) {
        currentHtml += `
          <div class="flex items-center justify-center p-2.5 rounded-2xl border-2 border-dashed border-outline-variant/25 text-on-surface-variant/40 text-xs font-medium bg-surface-container-lowest/50">
            빈 슬롯
          </div>
        `;
      }
      currentContainer.innerHTML = currentHtml;
    }

    // 2. 추가 가능한 메뉴 (현재 독에 없고 고정 메뉴도 아닌 것만 노출)
    const availableMenus = ALL_DOCK_MENU_ITEMS.filter(item =>
      !currentMenus.includes(item.id) && !this.FIXED_DOCK_MENUS.includes(item.id)
    );
    if (availableCountEl) availableCountEl.textContent = availableMenus.length;

    if (availableContainer) {
      if (availableMenus.length === 0) {
        availableContainer.innerHTML = `
          <div class="col-span-full py-8 text-center text-xs text-on-surface-variant bg-surface-container-low dark:bg-[#1f2937] rounded-2xl border border-outline-variant/15">
            추가할 수 있는 메뉴가 없습니다.
          </div>
        `;
      } else {
        let availableHtml = '';
        availableMenus.forEach(item => {
          const iconSvg = typeof getSvgIcon === 'function'
            ? getSvgIcon(item.iconName, 'w-6 h-6')
            : '<circle cx="12" cy="12" r="8"/>';

          availableHtml += `
            <button type="button" onclick="App.addDockMenu('${item.id}')" class="group relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#1f2937] hover:bg-primary/10 dark:hover:bg-primary/20 border border-outline-variant/15 hover:border-primary/40 transition-all active:scale-95 text-center cursor-pointer shadow-2xs">
              <div class="w-10 h-10 rounded-xl bg-surface-container-lowest dark:bg-[#111827] text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                ${iconSvg}
              </div>
              <span class="font-label font-bold text-xs text-on-surface group-hover:text-primary transition-colors">${item.name}</span>
              <div class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center text-[11px] font-bold transition-all">
                +
              </div>
            </button>
          `;
        });
        availableContainer.innerHTML = availableHtml;
      }
    }
  },

  addDockMenu(menuId) {
    if (!this.state.dockMenus) {
      this.state.dockMenus = ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'];
    }

    if (this.state.dockMenus.includes(menuId)) {
      this.showToast('이미 독 메뉴에 등록된 항목입니다.');
      return;
    }

    if (this.state.dockMenus.length >= 4) {
      this.showToast('독 메뉴는 최대 4개까지 설정할 수 있습니다. 기존 메뉴를 제거 후 추가해주세요.');
      return;
    }

    const item = ALL_DOCK_MENU_ITEMS.find(m => m.id === menuId);
    this.state.dockMenus.push(menuId);
    this.saveState();
    this.renderDockNav();
    this.renderDockCustomizer();
    if (item) {
      this.showToast(`✨ '${item.name}' 메뉴가 독에 추가되었습니다.`);
    }
  },

  removeDockMenu(menuId) {
    // 고정 메뉴(메뉴·투데이)는 제거 불가
    if (this.FIXED_DOCK_MENUS.includes(menuId)) {
      const item = ALL_DOCK_MENU_ITEMS.find(m => m.id === menuId);
      this.showToast(`🔒 '${item ? item.name : menuId}'는 고정 메뉴로 변경할 수 없습니다.`);
      return;
    }

    if (!this.state.dockMenus || this.state.dockMenus.length <= 1) {
      this.showToast('독 메뉴는 최소 1개 이상 유지되어야 합니다.');
      return;
    }

    const item = ALL_DOCK_MENU_ITEMS.find(m => m.id === menuId);
    this.state.dockMenus = this.state.dockMenus.filter(id => id !== menuId);
    this.saveState();
    this.renderDockNav();
    this.renderDockCustomizer();
    if (item) {
      this.showToast(`독 메뉴에서 '${item.name}' 항목이 제거되었습니다.`);
    }
  },

  resetDockMenus() {
    this.state.dockMenus = ['screen-home', 'screen-today', 'screen-directory', 'screen-notice-list'];
    this.saveState();
    this.renderDockNav();
    this.renderDockCustomizer();
    this.showToast('🔄 기본 독 메뉴 구성으로 초기화되었습니다.');
  },

  // =========================================
  // 메뉴 화면 가로 2개 / 가로 3개 뷰 컬럼 전환
  // =========================================
  setMenuColumns(cols) {
    const targetCols = Number(cols) === 3 ? 3 : 2;
    this.state.menuColumns = targetCols;

    const grid = document.getElementById('home-menu-grid');
    const btn2 = document.getElementById('menu-col-btn-2');
    const btn3 = document.getElementById('menu-col-btn-3');

    if (grid) {
      grid.classList.remove('cols-2', 'cols-3', 'grid-cols-2', 'grid-cols-3');
      grid.classList.add(`cols-${targetCols}`);
    }

    if (btn2 && btn3) {
      if (targetCols === 2) {
        btn2.classList.add('active');
        btn3.classList.remove('active');
      } else {
        btn3.classList.add('active');
        btn2.classList.remove('active');
      }
    }

    try {
      localStorage.setItem('wordncode_menu_columns', String(targetCols));
    } catch (e) { }

    this.saveState();
  },

  // =========================================
  // 플립형 공지 티커 (텍스트 겹침 오류 완벽 방지)
  // =========================================
  startNoticeTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    // 기존 실행 중인 타이머 확실히 정지
    this.stopNoticeTicker();

    // 공지사항 목록에서 제목 및 ID 추출 (최신 순, 최대 6개)
    const items = (this.state.notices || [])
      .slice(0, 6)
      .map(n => ({
        id: n.id,
        title: n.isPinned ? `📌 ${n.title}` : n.title
      }));

    if (items.length === 0) return;

    // DOM 완전 초기화 (누적 찌꺼기 노드 즉시 삭제)
    track.innerHTML = '';

    let currentIdx = 0;
    const initialEl = document.createElement('div');
    initialEl.className = 'ticker-item static';
    initialEl.textContent = items[0].title;
    initialEl.setAttribute('title', '공지사항 상세 보기');
    initialEl.onclick = () => this.openNoticeDetail(items[0].id);
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
      const nextItem = items[nextIdx];

      // 2. 현재 노드 퇴장 애니메이션
      activeEl.className = 'ticker-item flip-out';

      // 3. 신규 노드 생성 및 등장 애니메이션
      const nextEl = document.createElement('div');
      nextEl.className = 'ticker-item flip-in';
      nextEl.textContent = nextItem.title;
      nextEl.setAttribute('title', '공지사항 상세 보기');
      nextEl.onclick = () => this.openNoticeDetail(nextItem.id);
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

    // 탭 전환 시 화면 스크롤 최상단 이동 및 공지/독메뉴 표시 상태 리셋
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.resetScrollEffects();

    // popstate(뒤로가기)에 의한 탭 전환이 아닐 때만 히스토리 스택에 push
    if (!isPopState) {
      history.pushState({ activeTab: targetId }, '', `#${targetId}`);
    }

    // Update bottom nav active state & filled icon
    this.renderDockNav();

    if (targetId === 'screen-logs') {
      this.switchTab('screen-checkin');
      this.switchCommuteTab('logs');
      return;
    } else if (targetId === 'screen-checkin') {
      this.switchCommuteTab(this.state.commuteTab || 'checkin');
    } else if (targetId === 'screen-notice-list') {
      this.renderNotices();
    } else if (targetId === 'screen-directory') {
      this.state.currentDirectoryCategory = 'all';
      const searchInput = document.getElementById('directory-search-input');
      if (searchInput) searchInput.value = '';
      const chips = document.querySelectorAll('.dir-chip');
      chips.forEach((c, idx) => {
        if (idx === 0) {
          c.classList.remove('bg-surface-container', 'text-on-surface-variant');
          c.classList.add('bg-primary', 'text-on-primary', 'active');
        } else {
          c.classList.remove('bg-primary', 'text-on-primary', 'active');
          c.classList.add('bg-surface-container', 'text-on-surface-variant');
        }
      });
      this.renderDirectory();
    } else if (targetId === 'screen-calendar') {
      const v = this.state.calView || 'month';
      if (v === 'week') {
        this.switchTab('screen-calendar-weekly');
        return;
      } else if (v === 'day') {
        this.switchTab('screen-calendar-daily');
        return;
      }
      this.renderCalendar();
    } else if (targetId === 'screen-calendar-weekly') {
      this.renderWeeklyScheduleView();
    } else if (targetId === 'screen-calendar-daily') {
      this.renderDailyTimelineView();
    } else if (targetId === 'screen-finance') {
      this.renderExpenses();
    } else if (targetId === 'screen-todo') {
      this.renderTodos();
    } else if (targetId === 'screen-project-list') {
      this.renderProjects();
    } else if (targetId === 'screen-work-report') {
      this.renderWorkReportControls();
      this.renderWorkReports();
    } else if (targetId === 'screen-request') {
      this.switchRequestType(this.state.currentRequestType || 'leave');
    } else if (targetId === 'screen-home' || targetId === 'screen-today') {
      this.renderTodayData();
    }
  },

  // 출/퇴근 페이지 상단 세그먼트 탭 전환 (출/퇴근 체크 ↔ 출석 기록)
  switchCommuteTab(tab = 'checkin') {
    this.state.commuteTab = tab;
    const checkinBtn = document.getElementById('tab-btn-commute-checkin');
    const logsBtn = document.getElementById('tab-btn-commute-logs');
    const checkinContent = document.getElementById('tab-content-commute-checkin');
    const logsContent = document.getElementById('tab-content-commute-logs');

    if (!checkinBtn || !logsBtn || !checkinContent || !logsContent) return;

    const activeBtnClass = 'flex-1 py-2.5 px-3 rounded-[0.875rem] text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center';
    const inactiveBtnClass = 'flex-1 py-2.5 px-3 rounded-[0.875rem] text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center';

    if (tab === 'logs') {
      checkinBtn.className = inactiveBtnClass;
      logsBtn.className = activeBtnClass;
      checkinContent.classList.add('hidden');
      logsContent.classList.remove('hidden');
      this.renderLogs();
    } else {
      checkinBtn.className = activeBtnClass;
      logsBtn.className = inactiveBtnClass;
      checkinContent.classList.remove('hidden');
      logsContent.classList.add('hidden');
    }
  },

  renderTodayData() {
    const userName = this.state.user?.name || '이재광';

    // 1. Home Welcome Title
    const welcomeTitle = document.getElementById('home-welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerHTML = `안녕하세요,<br/>${userName}님!`;
    }
    const greetingName = document.getElementById('user-greeting-name');
    if (greetingName) {
      greetingName.innerText = userName;
    }

    // 2. Home Notice Banner (Latest notice from live notices state)
    const homeNoticeBanner = document.querySelector('#screen-home [onclick*="openNoticeDetail"]');
    if (homeNoticeBanner && this.state.notices && this.state.notices.length > 0) {
      const latestNotice = this.state.notices[0];
      homeNoticeBanner.setAttribute('onclick', `App.openNoticeDetail(${latestNotice.id})`);
      const noticeTitleEl = homeNoticeBanner.querySelector('.font-headline');
      if (noticeTitleEl) {
        noticeTitleEl.innerText = latestNotice.title;
      }
      const pinnedBadge = homeNoticeBanner.querySelector('.bg-tertiary-container\\/20');
      if (pinnedBadge) {
        pinnedBadge.innerText = latestNotice.isPinned ? '[필독]' : `[${latestNotice.category}]`;
      }
    }

    // 3. Home Status Widget (Commute status)
    const statusTitle = document.getElementById('home-status-title');
    const statusBadge = document.getElementById('home-status-badge');
    const statusDot = document.getElementById('home-status-dot');
    if (statusTitle && statusBadge && statusDot) {
      if (this.state.isCheckedIn) {
        statusTitle.innerText = `${this.state.checkInTimeStr || '09:00'} 출근 완료`;
        statusBadge.innerText = '근무 중';
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-secondary';
      } else {
        statusTitle.innerText = '아직 출근 전입니다';
        statusBadge.innerText = '출근 전';
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-secondary-container';
      }
    }

    // --- SCREEN-TODAY (TODAY SUMMARY PAGE) LIVE DATA BINDING ---
    const now = new Date();
    const todayYear = this.state.calYear || 2026;
    const todayMonth = this.state.calMonth || 8;
    const todayDay = this.state.calSelectedDay || now.getDate();

    // Date Header
    const dateHeader = document.getElementById('today-summary-header-date');
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const targetDateObj = new Date(todayYear, todayMonth - 1, todayDay);
    if (dateHeader) {
      dateHeader.innerText = `${todayMonth}월 ${todayDay}일 ${dayNames[targetDateObj.getDay()]}`;
    }

    // Attendance Summary Widget
    const workDot = document.getElementById('today-summary-work-dot');
    const workStatus = document.getElementById('today-summary-work-status');
    const workTime = document.getElementById('today-summary-work-time');
    const checkinTime = document.getElementById('today-summary-checkin-time');
    const progressBar = document.getElementById('today-summary-progress-bar');
    const remainingTime = document.getElementById('today-summary-remaining-time');

    if (this.state.isCheckedIn) {
      if (workDot) workDot.className = 'w-2.5 h-2.5 rounded-full bg-secondary relative z-10';
      if (workStatus) {
        workStatus.innerText = '근무 중';
        workStatus.className = 'font-label text-sm font-semibold text-secondary';
      }
      const secs = this.state.todaySeconds || 0;
      const hours = String(Math.floor(secs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
      if (workTime) {
        workTime.innerHTML = `${hours}<span class="text-2xl text-on-surface-variant font-semibold">h</span> ${mins}<span class="text-2xl text-on-surface-variant font-semibold">m</span>`;
      }
      if (checkinTime) {
        checkinTime.innerText = this.state.checkInTimeStr || '08:45 AM';
      }
      const pct = Math.min(100, Math.round((secs / 28800) * 100));
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }
      const remSecs = Math.max(0, 28800 - secs);
      const remH = Math.floor(remSecs / 3600);
      const remM = Math.floor((remSecs % 3600) / 60);
      if (remainingTime) {
        remainingTime.innerText = `퇴근까지 ${remH}h ${remM}m`;
      }
    } else {
      if (workDot) workDot.className = 'w-2.5 h-2.5 rounded-full bg-outline-variant relative z-10';
      if (workStatus) {
        workStatus.innerText = '출근 전';
        workStatus.className = 'font-label text-sm font-semibold text-on-surface-variant';
      }
      if (workTime) {
        workTime.innerHTML = `00<span class="text-2xl text-on-surface-variant font-semibold">h</span> 00<span class="text-2xl text-on-surface-variant font-semibold">m</span>`;
      }
      if (checkinTime) {
        checkinTime.innerText = '--:--';
      }
      if (progressBar) {
        progressBar.style.width = `0%`;
      }
      if (remainingTime) {
        remainingTime.innerText = '퇴근까지 8h 00m';
      }
    }

    // Real-time Notifications Feed Section (투데이 실시간 알림 동적 바인딩)
    const notiContainer = document.getElementById('today-summary-notifications-container');
    if (notiContainer) {
      const visibleNotifs = typeof this.getVisibleNotifications === 'function'
        ? this.getVisibleNotifications()
        : (this.state.notifications || []);
      const displayNotifs = visibleNotifs.slice(0, 3); // 상위 3개 표시

      if (displayNotifs.length > 0) {
        notiContainer.innerHTML = displayNotifs.map(item => {
          let typeBadge = '';
          if (item.type === 'commute') {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">출/퇴근</span>';
          } else if (item.type === 'approval') {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300">전자결재</span>';
          } else if (item.type === 'business') {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-300">외근/출장</span>';
          } else {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300">공지/일정</span>';
          }

          const unreadBadge = !item.isRead
            ? '<span class="w-2.5 h-2.5 rounded-full bg-[#e83538] shrink-0" title="읽지 않음"></span>'
            : '';

          const unreadBg = !item.isRead
            ? 'bg-primary/5 border border-primary/20'
            : 'bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/10';

          return `
            <div class="p-3.5 rounded-2xl ${unreadBg} shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-1.5 text-left" onclick="App.onNotificationClick(${item.id})">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  ${typeBadge}
                  <span class="font-bold text-xs text-on-surface truncate">${item.title}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[11px] text-on-surface-variant font-medium">${item.time}</span>
                  ${unreadBadge}
                </div>
              </div>
              <p class="text-xs text-on-surface font-medium leading-relaxed break-words">${item.message}</p>
              <div class="text-[11px] text-on-surface-variant font-medium">
                <span>${item.sender?.dept || ''} ${item.sender?.name || ''} ${item.sender?.role || ''}</span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        notiContainer.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-6 text-center text-on-surface-variant font-medium border border-outline-variant/10">
            <svg class="w-8 h-8 text-outline mx-auto mb-1" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
            </svg>
            <p class="font-bold text-on-surface text-sm">새로운 알림이 없습니다.</p>
          </div>
        `;
      }
    }

    // Today's Calendar & Schedule Section
    const schedulesContainer = document.getElementById('today-summary-schedules-container');
    if (schedulesContainer) {
      const schedules = this.getMockSchedules(todayYear, todayMonth, todayDay) || [];

      if (schedules.length > 0) {
        schedulesContainer.innerHTML = schedules.map(s => {
          const isHoliday = (
            s.badge === '공휴일' ||
            s.badge === '기념일' ||
            s.badge === '절기' ||
            s.title.includes('공휴일') ||
            s.title.includes('기념일') ||
            s.title.includes('대체공휴일') ||
            s.title.includes('절기') ||
            s.author === '공휴일' ||
            s.author === '기념일' ||
            s.author === '24절기' ||
            s.author === '대한민국 공휴일' ||
            s.author === '회사공지' ||
            s.author === '국경일/기념일'
          );
          const colorInfo = this.getCategoryColorStyle(s.badge || s.title);
          const authorText = isHoliday ? '' : `<span class="font-bold text-xs text-primary whitespace-nowrap leading-none flex items-center shrink-0">${s.author || '이재광 팀장'}</span>`;
          const locationBadgeHtml = s.location ? `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 whitespace-nowrap shrink-0">
              <svg class="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>${s.location}</span>
            </span>
          ` : '';

          return `
            <div class="flex items-center ${colorInfo.cardBgClass} p-3.5 rounded-2xl border border-outline-variant/15 shadow-2xs transition-all gap-3">
              <div class="flex items-center gap-2 shrink-0">
                <div class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass} shrink-0"></div>
              </div>
              <div class="flex-1 text-left min-w-0 flex flex-col justify-center">
                <div class="flex items-center justify-between gap-2 mb-1.5 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                    ${authorText}
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none shrink-0 ${colorInfo.badgeHtml.includes('class=\"') ? colorInfo.badgeHtml.match(/class=\"(.*?)\"/)[1] : ''}">${s.badge}</span>
                    ${locationBadgeHtml}
                  </div>
                  <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap shrink-0 leading-none ml-auto">${s.time}</span>
                </div>
                <div class="text-sm text-on-surface font-bold font-headline leading-snug truncate">${this.formatScheduleCleanLabel(s)}</div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        schedulesContainer.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-6 text-center text-on-surface-variant font-medium border border-outline-variant/10">
            <span class="material-symbols-outlined text-3xl text-outline mb-1">event_available</span>
            <p class="font-bold text-on-surface text-sm">오늘 예정된 일정이 없습니다.</p>
          </div>
        `;
      }
    }

    // Today's To-Do Tasks Section (오늘의 할 일 동적 바인딩)
    const todosContainer = document.getElementById('today-summary-todos-container');
    if (todosContainer) {
      const activeTodos = (this.state.todos || []).filter(t => t.status !== 'draft');
      const displayTodos = activeTodos.slice(0, 3); // 상위 3개 표시

      if (displayTodos.length > 0) {
        todosContainer.innerHTML = displayTodos.map(todo => {
          const isDone = todo.status === 'done';
          const priorityDotColor = todo.priority === 'high' ? 'bg-error' : (todo.priority === 'medium' ? 'bg-tertiary-container' : 'bg-primary');
          const prioBgClass = todo.priority === 'high' ? 'bg-[#ffdad6] text-[#410002]' : (todo.priority === 'low' ? 'bg-surface-container text-on-surface-variant' : 'bg-[#ffe088] text-[#533a00]');
          const prioText = todo.priority === 'high' ? '높음' : (todo.priority === 'low' ? '낮음' : '보통');
          const statusBgClass = isDone
            ? 'bg-[#61fbab] text-[#004729]'
            : (todo.status === 'in_progress' ? 'bg-[#d8e2ff] text-[#001a41]' : 'bg-surface-container text-on-surface-variant');
          const statusText = isDone ? '완료' : (todo.status === 'in_progress' ? '진행 중' : '할 일');
          const assignee = (todo.assignees && todo.assignees[0]) || { name: (this.state.myProfile && this.state.myProfile.name) || '이재광', avatar: (this.state.myProfile && this.state.myProfile.avatar) || './profile.png' };

          return `
            <div class="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all flex flex-col gap-2.5 cursor-pointer text-left" onclick="App.openTodoDetailModal(${todo.id})">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-label font-bold ${statusBgClass}">
                    ${statusText}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-label font-bold ${prioBgClass}">
                    ${prioText}
                  </span>
                  <span class="text-xs font-bold text-primary truncate max-w-[140px]"># ${todo.project || '일반 업무'}</span>
                </div>
                <button type="button" onclick="event.stopPropagation(); App.toggleTodoStatus(${todo.id});" class="w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${isDone ? 'bg-secondary border-secondary text-white' : 'border-outline-variant hover:border-primary bg-surface-container-low'}" title="${isDone ? '미완료로 변경' : '완료 처리'}">
                  ${isDone ? '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                </button>
              </div>

              <h4 class="font-headline text-sm font-bold text-on-surface line-clamp-2 leading-snug ${isDone ? 'line-through opacity-60' : ''}">
                ${todo.title}
              </h4>

              <div class="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                <div class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  <span class="font-medium text-[11px]">${todo.dueDate || '마감일 미지정'}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-bold text-on-surface">${assignee.name}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        todosContainer.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-6 text-center text-on-surface-variant font-medium border border-outline-variant/10">
            <svg class="w-8 h-8 text-outline mx-auto mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM19.79 10.22C19.92 10.79 20 11.39 20 12c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.66 0 3.2.51 4.48 1.39l1.45-1.45C16.19 2.7 14.19 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z"/></svg>
            <p class="font-bold text-on-surface text-sm">등록된 오늘의 할 일이 없습니다.</p>
          </div>
        `;
      }
    }

    // Leave & Absence Section
    const leaveDaysEl = document.getElementById('today-summary-leave-days');
    const bentoRemainEl = document.getElementById('bento-remain-days');
    if (leaveDaysEl) {
      const remainText = bentoRemainEl ? bentoRemainEl.innerText.trim() : '12일';
      leaveDaysEl.innerHTML = `${remainText.replace('일', '')} <span class="text-sm font-normal text-on-surface-variant">일</span>`;
    }

    const upcomingLeaveEl = document.getElementById('today-summary-upcoming-leave');
    if (upcomingLeaveEl) {
      let foundLeaveStr = '8월 18일 (화) - 연차 (김종규 팀장)';
      for (let day = 13; day <= 31; day++) {
        const schs = this.getMockSchedules(2026, 8, day) || [];
        const vacationSch = schs.find(sc => sc.badge === '휴가' || sc.badge === '연차' || sc.title.includes('휴가') || sc.title.includes('연차'));
        if (vacationSch) {
          foundLeaveStr = `8월 ${day}일 - ${vacationSch.title} (${vacationSch.author})`;
          break;
        }
      }
      upcomingLeaveEl.innerText = foundLeaveStr;
    }

    // Finance & Expenses Section
    const unbilledCountEl = document.getElementById('today-summary-unbilled-count');
    const expenseListEl = document.getElementById('today-summary-expense-list');
    if (unbilledCountEl && expenseListEl) {
      const unresolvedCorp = (this.state.finance.expenses.corp || []).filter(e => e.status === 'unresolved');
      const unresolvedPersonal = (this.state.finance.expenses.personal || []).filter(e => e.status === 'unresolved');
      const allUnresolved = [...unresolvedCorp, ...unresolvedPersonal];

      unbilledCountEl.innerHTML = `${allUnresolved.length} <span class="text-sm font-normal text-on-surface-variant">건</span>`;

      if (allUnresolved.length > 0) {
        expenseListEl.innerHTML = allUnresolved.slice(0, 2).map(e => `
          <div class="flex justify-between items-center bg-surface p-3 rounded-2xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[16px]">${e.type === 'taxi' ? 'local_taxi' : e.type === 'restaurant' ? 'restaurant' : 'credit_card'}</span>
              </div>
              <span class="font-label text-xs font-semibold text-on-surface">${e.title}</span>
            </div>
            <span class="font-body text-sm font-bold text-on-surface">${e.amount.toLocaleString()}원</span>
          </div>
        `).join('');
      } else {
        expenseListEl.innerHTML = `
          <div class="text-xs text-on-surface-variant py-2 text-center">미청구된 경비 내역이 없습니다.</div>
        `;
      }
    }

    // Pending Approvals Section
    const pendingCountEl = document.getElementById('today-summary-pending-count');
    const pendingListEl = document.getElementById('today-summary-pending-list');
    if (pendingCountEl && pendingListEl) {
      pendingCountEl.innerText = '1건';
      pendingListEl.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer group" onclick="App.switchTab('screen-finance'); App.switchFinanceTab('report');">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-on-surface-variant">description</span>
            </div>
            <div>
              <p class="font-label text-[10px] text-tertiary-fixed-dim font-bold mb-0.5">기안 대기</p>
              <h4 class="font-body text-sm font-semibold text-on-surface mb-1">2026년 3분기 비품 구매 품의서</h4>
              <p class="font-label text-xs text-on-surface-variant">퍼블리싱팀 · 이재광 팀장</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
        </div>
      `;
    }
  },

  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => {
      s.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }
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
    modalEl.classList.add('active');

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
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('active');
    }

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
    modalEl.classList.add('active');
    this.renderDirectoryPickerList();
  },

  closeDirectoryPicker() {
    const modalEl = document.getElementById('modal-directory-picker');
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('active');
    }
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
        const existingTexts = Array.from(container.children).map(el => el.innerText.trim());
        if (!existingTexts.some(t => t.includes(memberLabel.split(' ')[0]))) {
          const chip = document.createElement('span');
          chip.className = 'inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-lg border border-primary/20 shadow-2xs';
          chip.innerHTML = `${memberLabel} <button type="button" onclick="this.parentElement.remove()" class="w-4 h-4 flex items-center justify-center rounded-full hover:bg-error-container hover:text-error transition-colors"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>`;
          container.appendChild(chip);
        }
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
    const typeEl = document.getElementById('schedule-input-type');
    const badgeRadioEl = document.querySelector('input[name="schedule_type_radio"]:checked');

    const title = (titleEl?.value || '').trim() || '신규 일정';
    const startDate = startDateEl?.value || '2026-08-12';
    const badge = badgeRadioEl ? badgeRadioEl.value : '일정';

    const [year, month, day] = startDate.split('-').map(Number);

    if (!this.mockDynamicSchedules) {
      this.mockDynamicSchedules = {};
    }
    const key = `${year}-${month}-${day}`;
    if (!this.mockDynamicSchedules[key]) {
      this.mockDynamicSchedules[key] = [];
    }

    this.mockDynamicSchedules[key].push({
      title: title,
      time: '종일',
      type: typeEl?.value || 'primary',
      badge: badge,
      author: '이재광',
      avatar: 'profile.png'
    });

    this.showToast(`✨ 일정 '${title}' 등록이 완료되었습니다!`);
    this.closeScheduleModal();

    this.renderCalendar();
    this.renderTodayData();
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

  getNationalHoliday(year, month, day) {
    // Fixed Solar National Holidays
    if (month === 1 && day === 1) return { title: "신정", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 3 && day === 1) return { title: "3·1절", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 5 && day === 5) return { title: "어린이날", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 6 && day === 6) return { title: "현충일", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 8 && day === 15) return { title: "광복절", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 10 && day === 3) return { title: "개천절", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 10 && day === 9) return { title: "한글날", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    if (month === 12 && day === 25) return { title: "성탄절", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };

    // 2026 Specific Lunar & Substitute Holidays (🔴 빨간 날)
    if (year === 2026) {
      if (month === 2 && (day === 16 || day === 18)) return { title: "설날 연휴", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 2 && day === 17) return { title: "설날", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 3 && day === 2) return { title: "3·1절 대체공휴일", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 5 && day === 24) return { title: "부처님오신날", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 5 && day === 25) return { title: "부처님오신날 대체공휴일", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 8 && day === 17) return { title: "광복절 대체공휴일", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 9 && (day === 24 || day === 26)) return { title: "추석 연휴", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 9 && day === 25) return { title: "추석", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
      if (month === 10 && day === 5) return { title: "개천절 대체공휴일", time: "종일", type: "error", badge: "공휴일", author: "공휴일", avatar: "" };
    }

    return null;
  },

  getObservanceDay(year, month, day) {
    const observances = (window.MockData && (window.MockData.observances || window.MockData.observances2026)) || {};

    const key = `${month}-${day}`;
    const obs = observances[key];
    if (obs) {
      return {
        title: obs.title,
        obsName: obs.name,
        time: "종일",
        type: "secondary",
        badge: "기념일",
        author: "기념일",
        avatar: ""
      };
    }
    return null;
  },

  getSolarTerm(year, month, day) {
    const terms = (window.MockData && (window.MockData.solarTerms || window.MockData.solarTerms2026)) || {};

    const key = `${month}-${day}`;
    const t = terms[key];
    if (t) {
      return {
        title: `${t.title} - ${t.desc}`,
        termName: t.title.split(' ')[0],
        time: "종일",
        type: "info",
        badge: "절기",
        author: "24절기",
        avatar: ""
      };
    }
    return null;
  },

  getMockSchedules(year, month, day) {
    const key = `${year}-${month}-${day}`;
    const defaultData = (window.MockData && window.MockData.schedules) || {};

    const defaults = defaultData[key] || [];
    const nationalHol = this.getNationalHoliday(year, month, day);
    const solarTerm = this.getSolarTerm(year, month, day);
    const observance = this.getObservanceDay(year, month, day);

    let combined = [];
    if (nationalHol) {
      combined.push(nationalHol);
    }
    if (solarTerm && !combined.some(s => s.title.includes(solarTerm.termName))) {
      combined.push(solarTerm);
    }
    if (observance && !combined.some(s => s.title.includes(observance.obsName) || (nationalHol && nationalHol.title.includes(observance.obsName)))) {
      combined.push(observance);
    }
    defaults.forEach(s => {
      if (!combined.some(existing => existing.title === s.title && existing.author === s.author)) {
        combined.push(s);
      }
    });

    const userAdded = (this.mockDynamicSchedules && this.mockDynamicSchedules[key]) || [];
    combined = [...combined, ...userAdded];
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
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#e6f4ea] text-[#137333] border border-[#137333]/25 whitespace-nowrap shrink-0">연차</span>',
          dotClass: 'bg-[#137333]',
          cardBgClass: 'bg-[#f2f9f4] border-[#137333]/25 hover:bg-[#e6f4ea]/60'
        };
      case '외근':
      case '출장':
      case '미팅':
        return {
          chipClass: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 font-bold shadow-xs',
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/25 whitespace-nowrap shrink-0">외근</span>',
          dotClass: 'bg-[#1a73e8]',
          cardBgClass: 'bg-[#f0f5fe] border-[#1a73e8]/25 hover:bg-[#e8f0fe]/60'
        };
      case '반차':
      case '반반차':
        return {
          chipClass: 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 font-bold shadow-xs',
          badgeHtml: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#fef7e0] text-[#b06000] border border-[#b06000]/25 whitespace-nowrap shrink-0">${category}</span>`,
          dotClass: 'bg-[#b06000]',
          cardBgClass: 'bg-[#fffdf5] border-[#b06000]/25 hover:bg-[#fef7e0]/60'
        };
      case '회의':
      case '보고':
        return {
          chipClass: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/30 font-bold shadow-xs',
          badgeHtml: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/25 whitespace-nowrap shrink-0">${category}</span>`,
          dotClass: 'bg-[#6b21a8]',
          cardBgClass: 'bg-[#fbf7ff] border-[#6b21a8]/25 hover:bg-[#f3e8ff]/60'
        };
      case '공휴일':
        return {
          chipClass: 'bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/30 font-bold shadow-xs',
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/25 whitespace-nowrap shrink-0">공휴일</span>',
          dotClass: 'bg-[#c5221f]',
          cardBgClass: 'bg-[#fff5f5] border-[#c5221f]/25 hover:bg-[#fce8e6]/60'
        };
      case '절기':
        return {
          chipClass: 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 font-bold shadow-xs',
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#e6f4ea] text-[#137333] border border-[#137333]/25 whitespace-nowrap shrink-0">절기</span>',
          dotClass: 'bg-[#137333]',
          cardBgClass: 'bg-[#f4fbf7] border-[#137333]/25 hover:bg-[#e6f4ea]/60'
        };
      case '기념일':
      case '명절':
        return {
          chipClass: 'bg-[#f0f4f9] text-[#3c4043] border border-[#3c4043]/30 font-bold shadow-xs',
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#f0f4f9] text-[#3c4043] border border-[#3c4043]/20 whitespace-nowrap shrink-0">기념일</span>',
          dotClass: 'bg-[#5f6368]',
          cardBgClass: 'bg-[#f8f9fa] border-[#3c4043]/20 hover:bg-[#f0f4f9]/60'
        };
      default:
        return {
          chipClass: 'bg-primary/15 text-primary border border-primary/25 font-bold shadow-xs',
          badgeHtml: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-primary/15 text-primary border border-primary/20 whitespace-nowrap shrink-0">${category || '일정'}</span>`,
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
    else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') categoryKey = '절기';
    else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') categoryKey = '기념일';

    const colorInfo = this.getCategoryColorStyle(categoryKey);
    let categoryBadgeHtml = colorInfo.badgeHtml;
    const isHoliday = categoryKey === '공휴일' || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지';
    const isSolarTerm = categoryKey === '절기' || s.badge === '절기' || s.author === '24절기';
    const isObservance = categoryKey === '기념일' || s.badge === '기념일' || s.author === '기념일';

    const cleanTitle = titleStr.replace(/\s*\(공휴일\)/g, '').trim();
    if (isHoliday) {
      categoryBadgeHtml = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/25 whitespace-nowrap shrink-0">${cleanTitle}</span>`;
    } else if (isSolarTerm) {
      const termName = s.termName || titleStr.split(' ')[0];
      categoryBadgeHtml = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#e6f4ea] text-[#137333] border border-[#137333]/25 whitespace-nowrap shrink-0">${termName}</span>`;
    } else if (isObservance) {
      const obsName = s.obsName || titleStr.split(' ')[0];
      categoryBadgeHtml = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold leading-none bg-[#f0f4f9] text-[#3c4043] border border-[#3c4043]/20 whitespace-nowrap shrink-0">${obsName}</span>`;
    }

    const avatarHtml = (isHoliday || isSolarTerm || isObservance) ? '' : `<img src="${avatarUrl}" alt="${s.author || '프로필'}" class="w-9 h-9 rounded-full object-cover shrink-0 border border-outline-variant/15 shadow-2xs" />`;
    const authorTextHtml = (isHoliday || isSolarTerm || isObservance) ? '' : `<span class="font-bold text-xs text-primary whitespace-nowrap leading-none flex items-center shrink-0">${s.author || '이재광 팀장'}</span>`;
    const locationBadgeHtml = s.location ? `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 whitespace-nowrap shrink-0">
        <svg class="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span>${s.location}</span>
      </span>
    ` : '';

    return `
      <div class="flex items-center ${colorInfo.cardBgClass} p-3.5 rounded-2xl border border-outline-variant/15 shadow-2xs transition-all gap-3">
        <div class="flex items-center gap-2 shrink-0">
          <div class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass} shrink-0"></div>
          ${avatarHtml}
        </div>
        <div class="flex-1 text-left min-w-0 flex flex-col justify-center">
          <div class="flex items-center justify-between gap-2 mb-1.5 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap min-w-0">
              ${authorTextHtml}
              ${categoryBadgeHtml}
              ${locationBadgeHtml}
            </div>
            <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap shrink-0 leading-none ml-auto">${s.time}</span>
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
      if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') {
        availableCategories.add('절기');
      }
    });

    // 구분 칩 동적 생성 (각 구분 고유 색상 적용)
    if (chipsEl) {
      let chipsHtml = `<button type="button" onclick="App.filterDateDetailCategory('all', this)" class="date-detail-chip px-4 py-1.5 rounded-full font-bold bg-primary text-on-primary shadow-xs transition-all active:scale-95 whitespace-nowrap active">전체</button>`;

      const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '절기', '기념일'];
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
      const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '절기', '기념일', '기타'];

      schedules.forEach(s => {
        const titleStr = s.title || '';
        const badgeStr = s.badge || '';
        let key = '기타';
        if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) key = '휴가';
        else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) key = '외근';
        else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) key = '반차';
        else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) key = '회의';
        else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) key = '공휴일';
        else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') key = '절기';
        else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') key = '기념일';

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
      const isNationalHoliday = !!this.getNationalHoliday(year, month, d);

      let textClass = 'text-on-surface font-medium';
      if (dayOfWeek === 0 || isNationalHoliday) textClass = 'text-error font-semibold';
      else if (dayOfWeek === 6) textClass = 'text-primary font-semibold';

      let barsHtml = '';
      if (schedules && schedules.length > 0) {
        barsHtml = '<div class="w-full flex flex-col gap-1 mt-1 z-10">';
        schedules.forEach(s => {
          const isHoliday = (s.badge === '공휴일' || s.title.includes('공휴일') || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지');
          const isSolarTerm = (s.badge === '절기' || s.author === '24절기');
          const isObservance = (s.badge === '기념일' || s.author === '기념일');

          let colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          if (s.title.includes('휴가') || s.title.includes('연차')) {
            colorClass = (s.type === 'error' || s.author?.includes('이재광') || s.author?.includes('조지혜')) ? 'bg-[#ffdad6] text-[#410002]' : 'bg-[#61fbab] text-[#004729]';
          } else if (s.title.includes('반차') || s.title.includes('반반차')) {
            colorClass = 'bg-[#ffe088] text-[#533a00]';
          } else if (s.title.includes('외근') || s.title.includes('미팅') || s.title.includes('회의')) {
            colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          } else if (isHoliday) {
            colorClass = 'bg-[#ffdad6] text-[#c5221f] font-bold';
          } else if (isSolarTerm) {
            colorClass = 'bg-[#e6f4ea] text-[#137333] font-bold';
          } else if (isObservance) {
            colorClass = 'bg-[#f0f4f9] text-[#3c4043] font-bold';
          }

          let spanStyle = 'rounded-md w-full';
          let labelText = this.formatScheduleCleanLabel(s);

          barsHtml += `
            <div class="text-[10px] font-bold px-1 py-0.5 ${spanStyle} ${colorClass} truncate text-center leading-tight shadow-2xs">
              ${labelText}
            </div>
          `;
        });
        barsHtml += '</div>';
      }

      gridHtml += `
        <div class="flex flex-col items-center justify-start min-h-[64px] h-auto relative cursor-pointer group py-1 px-0.5 rounded-xl hover:bg-surface-container-high/40 transition-colors" onclick="App.selectCalendarDate(${d})">
          <span class="w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0 ${isSelected ? 'bg-primary text-on-primary font-bold shadow-md' : textClass}">${d}</span>
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
      logsContainer.innerHTML = this.renderGroupedScheduleList(schedules);
    } else {
      logsContainer.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium border border-outline-variant/10 shadow-xs">
          <div class="w-10 h-10 text-outline mb-2 mx-auto flex items-center justify-center">${getSvgIcon('event_available', 'w-8 h-8')}</div>
          <p class="font-bold text-on-surface text-sm">선택한 날짜에 등록된 일정이 없습니다.</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">상단 달력에서 다른 날짜를 선택해 보세요.</p>
        </div>
      `;
    }
  },

  // 월간 일정 및 주간 일자별 일정 공통 카테고리·건수별 렌더러 (월/주간 디자인 100% 일치)
  renderGroupedScheduleList(schedules) {
    if (!schedules || schedules.length === 0) {
      return `<div class="text-center py-3 text-on-surface-variant/50 font-body text-xs font-medium">등록된 일정이 없습니다.</div>`;
    }

    const groupMap = {};
    const categoryOrder = ['공휴일', '절기', '기념일', '휴가', '외근', '반차', '회의', '기타'];

    schedules.forEach(s => {
      const titleStr = s.title || '';
      const badgeStr = s.badge || '';
      let key = '기타';
      if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) key = '공휴일';
      else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') key = '절기';
      else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') key = '기념일';
      else if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) key = '휴가';
      else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) key = '외근';
      else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) key = '반차';
      else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) key = '회의';

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

    return finalHtml;
  },

  // 3-Mode Calendar Views (월 / 주 / 일)
  setCalendarView(view) {
    this.state.calView = view || 'month';
    if (view === 'week') {
      this.switchTab('screen-calendar-weekly');
      this.renderWeeklyScheduleView();
    } else if (view === 'day') {
      this.switchTab('screen-calendar-daily');
      this.renderDailyTimelineView();
    } else {
      this.switchTab('screen-calendar');
      this.renderCalendar();
    }
  },

  getWeekDays(year, month, day) {
    const current = new Date(year, month - 1, day);
    const dayOfWeek = current.getDay(); // 0: Sun, 1: Mon... 6: Sat

    // Start of week (Sunday)
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        dayOfWeek: d.getDay(),
        dateObj: d
      });
    }
    return days;
  },

  prevWeek() {
    const curYear = this.state.weeklyYear || this.state.calYear || 2026;
    const curMonth = this.state.weeklyMonth || this.state.calMonth || 8;
    const curDay = this.state.weeklyDay || this.state.calSelectedDay || 13;
    const date = new Date(curYear, curMonth - 1, curDay - 7);
    this.state.weeklyYear = date.getFullYear();
    this.state.weeklyMonth = date.getMonth() + 1;
    this.state.weeklyDay = date.getDate();
    this.renderWeeklyScheduleView();
  },

  nextWeek() {
    const curYear = this.state.weeklyYear || this.state.calYear || 2026;
    const curMonth = this.state.weeklyMonth || this.state.calMonth || 8;
    const curDay = this.state.weeklyDay || this.state.calSelectedDay || 13;
    const date = new Date(curYear, curMonth - 1, curDay + 7);
    this.state.weeklyYear = date.getFullYear();
    this.state.weeklyMonth = date.getMonth() + 1;
    this.state.weeklyDay = date.getDate();
    this.renderWeeklyScheduleView();
  },

  resetWeeklyToToday() {
    const today = new Date();
    this.state.weeklyYear = today.getFullYear();
    this.state.weeklyMonth = today.getMonth() + 1;
    this.state.weeklyDay = today.getDate();
    this.renderWeeklyScheduleView();
  },

  selectWeeklyDay(year, month, day) {
    this.state.weeklyYear = year;
    this.state.weeklyMonth = month;
    this.state.weeklyDay = day;
    this.renderWeeklyScheduleView();

    // 상단 날짜 클릭 시 해당 일자의 일정 카드로 부드럽게 스크롤 및 하이라이트 포커스
    setTimeout(() => {
      const targetCard = document.getElementById(`weekly-day-section-${year}-${month}-${day}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('ring-2', 'ring-primary', 'bg-primary/5');
        setTimeout(() => {
          targetCard.classList.remove('ring-2', 'ring-primary', 'bg-primary/5');
        }, 1200);
      }
    }, 50);
  },

  toggleWeeklyAllDays() {
    this.state.weeklyShowAllDays = !this.state.weeklyShowAllDays;
    const btn = document.getElementById('weekly-toggle-all-btn');
    if (btn) {
      btn.innerText = this.state.weeklyShowAllDays ? '선택일만 보기' : '주간 전체 보기';
    }
    this.renderWeeklyScheduleView();
  },

  renderWeeklyScheduleView() {
    const headerTitleEl = document.getElementById('weekly-view-header-title');
    const gridCardEl = document.getElementById('weekly-7day-grid-card');
    const scheduleTitleEl = document.getElementById('weekly-schedule-title');
    const logsContainerEl = document.getElementById('weekly-schedule-logs-container');

    if (!gridCardEl || !logsContainerEl) return;

    const today = new Date();
    const curYear = this.state.weeklyYear || this.state.calYear || today.getFullYear();
    const curMonth = this.state.weeklyMonth || this.state.calMonth || (today.getMonth() + 1);
    const curDay = this.state.weeklyDay || this.state.calSelectedDay || today.getDate();

    this.state.weeklyYear = curYear;
    this.state.weeklyMonth = curMonth;
    this.state.weeklyDay = curDay;
    if (this.state.weeklyShowAllDays === undefined) {
      this.state.weeklyShowAllDays = true; // 주간 보기에서는 기본으로 주별 일정이 일자별로 전부 나오도록 설정
    }

    const weekDays = this.getWeekDays(curYear, curMonth, curDay);
    const weekNum = Math.ceil(curDay / 7);

    if (headerTitleEl) {
      headerTitleEl.innerText = `${curYear}년 ${curMonth}월 ${weekNum}주차`;
    }

    const dayNamesKr = ['일', '월', '화', '수', '목', '금', '토'];

    // 1. Render Upper 7-Day Grid Card (Matching Monthly View grid card layout)
    let totalWeekScheduleCount = 0;
    let gridCellsHtml = '';
    weekDays.forEach(w => {
      const isToday = (w.year === today.getFullYear() && w.month === (today.getMonth() + 1) && w.day === today.getDate());
      const isSelected = (w.day === curDay && w.month === curMonth);
      const schedules = this.getMockSchedules(w.year, w.month, w.day) || [];
      totalWeekScheduleCount += schedules.length;

      let dayTextClass = 'text-on-surface-variant font-semibold';
      if (w.dayOfWeek === 0) dayTextClass = 'text-error font-bold';
      else if (w.dayOfWeek === 6) dayTextClass = 'text-primary font-bold';

      let numStyle = 'w-7 h-7 flex items-center justify-center rounded-full mx-auto font-bold text-sm';
      if (isSelected) {
        numStyle += ' bg-primary text-on-primary shadow-md';
      } else if (isToday) {
        numStyle += ' bg-primary/15 text-primary';
      } else {
        numStyle += ' text-on-surface';
      }

      // Event chips (formatted like Monthly View calendar cells)
      let chipsHtml = '';
      if (schedules.length > 0) {
        chipsHtml = '<div class="w-full flex flex-col gap-1 mt-1.5 z-10">';
        schedules.forEach(s => {
          const isHoliday = (s.badge === '공휴일' || s.title.includes('공휴일') || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지');
          const isSolarTerm = (s.badge === '절기' || s.author === '24절기');
          const isObservance = (s.badge === '기념일' || s.author === '기념일');

          let colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          if (s.title.includes('휴가') || s.title.includes('연차')) {
            colorClass = (s.type === 'error' || s.author?.includes('이재광') || s.author?.includes('조지혜')) ? 'bg-[#ffdad6] text-[#410002]' : 'bg-[#61fbab] text-[#004729]';
          } else if (s.title.includes('반차') || s.title.includes('반반차')) {
            colorClass = 'bg-[#ffe088] text-[#533a00]';
          } else if (s.title.includes('외근') || s.title.includes('미팅') || s.title.includes('회의')) {
            colorClass = 'bg-[#d8e2ff] text-[#001a41]';
          } else if (isHoliday) {
            colorClass = 'bg-[#ffdad6] text-[#c5221f] font-bold';
          } else if (isSolarTerm) {
            colorClass = 'bg-[#e6f4ea] text-[#137333] font-bold';
          } else if (isObservance) {
            colorClass = 'bg-[#f0f4f9] text-[#3c4043] font-bold';
          }

          let labelText = this.formatScheduleCleanLabel(s);

          chipsHtml += `
            <div class="text-[10px] font-bold px-1 py-0.5 rounded-md ${colorClass} truncate text-center leading-tight shadow-2xs">
              ${labelText}
            </div>
          `;
        });
        chipsHtml += '</div>';
      }

      gridCellsHtml += `
        <div onclick="App.selectWeeklyDay(${w.year}, ${w.month}, ${w.day})" class="flex flex-col items-center min-h-[96px] p-1.5 rounded-xl border border-transparent hover:border-primary/20 hover:bg-surface-container-high/30 cursor-pointer transition-all ${isSelected ? 'bg-primary/5 border-primary/30 shadow-2xs' : ''}">
          <span class="text-xs font-semibold mb-1 ${dayTextClass}">${dayNamesKr[w.dayOfWeek]}</span>
          <div class="${numStyle}">${w.day}</div>
          ${chipsHtml}
        </div>
      `;
    });

    gridCardEl.innerHTML = `
      <div class="grid grid-cols-7 gap-1 text-center">
        ${gridCellsHtml}
      </div>
    `;

    // 2. Render Lower Schedule List Card (주간 일별 일정 전체 렌더링)
    const toggleBtn = document.getElementById('weekly-toggle-all-btn');
    if (toggleBtn) {
      toggleBtn.innerText = this.state.weeklyShowAllDays ? '선택일만 보기' : '주간 전체 보기';
    }

    if (this.state.weeklyShowAllDays) {
      if (scheduleTitleEl) {
        scheduleTitleEl.innerHTML = `
          <div class="flex items-center gap-2">
            <span>${curMonth}월 ${weekNum}주차 주간 일정</span>
            <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">총 ${totalWeekScheduleCount}건</span>
          </div>
        `;
      }

      let allDaysHtml = '';
      weekDays.forEach(w => {
        const isToday = (w.year === today.getFullYear() && w.month === (today.getMonth() + 1) && w.day === today.getDate());
        const isSelected = (w.day === curDay && w.month === curMonth);
        const schedules = this.getMockSchedules(w.year, w.month, w.day) || [];

        let dayTitleClass = 'text-on-surface';
        let dayBadgeClass = 'bg-surface-container text-on-surface-variant';
        if (w.dayOfWeek === 0) {
          dayTitleClass = 'text-error';
          dayBadgeClass = 'bg-error/10 text-error';
        } else if (w.dayOfWeek === 6) {
          dayTitleClass = 'text-primary';
          dayBadgeClass = 'bg-primary/10 text-primary';
        }

        let cardsContentHtml = this.renderGroupedScheduleList(schedules);

        const dateFormatted = `${String(w.month).padStart(2, '0')}.${String(w.day).padStart(2, '0')}`;
        const dayName = dayNamesKr[w.dayOfWeek];

        allDaysHtml += `
          <!-- Daily Schedule Section for ${dateFormatted} (${dayName}) -->
          <div id="weekly-day-section-${w.year}-${w.month}-${w.day}" class="bg-surface-container-lowest border ${isSelected ? 'border-primary/40 shadow-xs' : 'border-outline-variant/15'} rounded-2xl p-4 transition-all mb-3 relative">
            ${isToday ? '<div class="absolute -left-1 top-5 w-2 h-6 rounded-r-md bg-primary shadow-xs"></div>' : ''}
            <div class="flex items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-xs font-bold ${dayBadgeClass}">${dayName}요일</span>
                <h4 class="font-headline text-sm sm:text-base font-bold ${dayTitleClass}">${w.month}월 ${w.day}일 (${dayName})</h4>
                ${isToday ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary shadow-2xs">오늘</span>' : ''}
              </div>
              <span class="text-xs font-semibold text-on-surface-variant">${schedules.length > 0 ? `<span class="text-primary font-bold">총 ${schedules.length}건</span>` : '<span class="text-on-surface-variant/60">일정 없음</span>'}</span>
            </div>
            ${cardsContentHtml}
          </div>
        `;
      });

      logsContainerEl.innerHTML = allDaysHtml;
    } else {
      const selDateObj = new Date(curYear, curMonth - 1, curDay);
      const selDayOfWeekName = dayNamesKr[selDateObj.getDay()];
      const selFormattedDate = `${String(curMonth).padStart(2, '0')}.${String(curDay).padStart(2, '0')} (${selDayOfWeekName})`;

      if (scheduleTitleEl) scheduleTitleEl.innerText = `${selFormattedDate} 주간 일정`;
      const schedules = this.getMockSchedules(curYear, curMonth, curDay) || [];
      if (schedules.length === 0) {
        logsContainerEl.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium border border-outline-variant/10 shadow-xs">
            <div class="w-10 h-10 text-outline mb-2 mx-auto flex items-center justify-center">${getSvgIcon('event_available', 'w-8 h-8')}</div>
            <p class="font-bold text-on-surface text-sm">등록된 일정이 없습니다.</p>
            <p class="text-xs text-on-surface-variant/70 mt-1">상단 주간 달력에서 날짜를 클릭하여 일정을 확인해보세요.</p>
          </div>
        `;
      } else {
        logsContainerEl.innerHTML = this.renderGroupedScheduleList(schedules);
      }
    }
  },

  renderWeeklyDayCardItem(s) {
    let avatarUrl = s.avatar;
    if (s.author) {
      const authorFirstName = s.author.split(' ')[0];
      const emp = (this.state.employees || []).find(e => e.name === authorFirstName);
      if (emp && emp.avatar) avatarUrl = emp.avatar;
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
    else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') categoryKey = '절기';
    else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') categoryKey = '기념일';

    const colorInfo = this.getCategoryColorStyle(categoryKey);
    const isHoliday = categoryKey === '공휴일' || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지';
    const isSolarTerm = categoryKey === '절기' || s.badge === '절기' || s.author === '24절기';
    const isObservance = categoryKey === '기념일' || s.badge === '기념일' || s.author === '기념일';

    const cleanTitle = titleStr.replace(/\s*\(공휴일\)/g, '').trim();
    let categoryBadgeHtml = colorInfo.badgeHtml;
    if (isHoliday) {
      categoryBadgeHtml = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/25 whitespace-nowrap shrink-0">${cleanTitle}</span>`;
    } else if (isSolarTerm) {
      const termName = s.termName || titleStr.split(' ')[0];
      categoryBadgeHtml = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/25 whitespace-nowrap shrink-0">${termName}</span>`;
    } else if (isObservance) {
      const obsName = s.obsName || titleStr.split(' ')[0];
      categoryBadgeHtml = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#f0f4f9] text-[#3c4043] border border-[#3c4043]/20 whitespace-nowrap shrink-0">${obsName}</span>`;
    }

    const showAvatar = !(isHoliday || isSolarTerm || isObservance);
    const avatarImg = showAvatar ? `<img src="${avatarUrl}" alt="${s.author || '프로필'}" class="w-8 h-8 rounded-full object-cover border-2 border-surface-container-lowest shadow-2xs" />` : '';
    const authorTextHtml = showAvatar ? `${s.author || '이재광 팀장'} • ` : '';
    const displayTitle = this.formatScheduleCleanLabel(s);

    return `
      <div class="bg-surface-container-lowest rounded-xl p-4 flex gap-4 items-center shadow-2xs border border-outline-variant/10 hover:shadow-xs transition-all">
        <div class="w-1.5 self-stretch ${colorInfo.dotClass} rounded-full"></div>
        <div class="flex-1 min-w-0 text-left">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="font-headline font-bold text-sm text-on-surface truncate">${displayTitle}</h4>
            ${categoryBadgeHtml}
          </div>
          <p class="text-on-surface-variant text-xs font-medium">${authorTextHtml}${s.time}</p>
        </div>
        ${showAvatar ? `<div class="flex -space-x-2 shrink-0">${avatarImg}</div>` : ''}
      </div>
    `;
  },

  // Daily Timeline View Methods
  prevDailyMonth() {
    if (!this.state.dailyMonth) {
      this.state.dailyYear = this.state.calYear || 2026;
      this.state.dailyMonth = this.state.calMonth || 8;
      this.state.dailyDay = this.state.calSelectedDay || 13;
    }
    if (this.state.dailyMonth === 1) {
      this.state.dailyMonth = 12;
      this.state.dailyYear--;
    } else {
      this.state.dailyMonth--;
    }
    this.renderDailyTimelineView();
  },

  nextDailyMonth() {
    if (!this.state.dailyMonth) {
      this.state.dailyYear = this.state.calYear || 2026;
      this.state.dailyMonth = this.state.calMonth || 8;
      this.state.dailyDay = this.state.calSelectedDay || 13;
    }
    if (this.state.dailyMonth === 12) {
      this.state.dailyMonth = 1;
      this.state.dailyYear++;
    } else {
      this.state.dailyMonth++;
    }
    this.renderDailyTimelineView();
  },

  resetDailyToToday() {
    const today = new Date();
    this.state.dailyYear = today.getFullYear();
    this.state.dailyMonth = today.getMonth() + 1;
    this.state.dailyDay = today.getDate();
    this.renderDailyTimelineView();
  },

  selectDailyDate(day) {
    this.state.dailyDay = day;
    this.renderDailyTimelineView();
  },

  renderDailyTimelineView() {
    const headerTitleEl = document.getElementById('daily-header-title');
    const stripEl = document.getElementById('daily-date-strip');
    const timelineTitleEl = document.getElementById('daily-timeline-title');
    const eventsContainer = document.getElementById('daily-timeline-events');

    if (!stripEl) return;

    const year = this.state.dailyYear || this.state.weeklyYear || this.state.calYear || 2026;
    const month = this.state.dailyMonth || this.state.weeklyMonth || this.state.calMonth || 8;
    const selectedDay = this.state.dailyDay || this.state.weeklyDay || this.state.calSelectedDay || 13;

    this.state.dailyYear = year;
    this.state.dailyMonth = month;
    this.state.dailyDay = selectedDay;

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
          <div id="daily-date-pill-${d}" onclick="App.selectDailyDate(${d})" class="flex-shrink-0 w-12 flex flex-col items-center justify-center py-2.5 rounded-xl snap-center bg-primary text-on-primary shadow-md cursor-pointer transition-transform active:scale-95">
            <span class="text-[11px] font-bold text-on-primary/90 mb-0.5">${dayName}</span>
            <span class="text-base font-bold">${d}</span>
            ${hasDot ? '<div class="w-1.5 h-1.5 rounded-full bg-on-primary mt-1"></div>' : ''}
          </div>
        `;
      } else {
        stripHtml += `
          <div id="daily-date-pill-${d}" onclick="App.selectDailyDate(${d})" class="flex-shrink-0 w-12 flex flex-col items-center justify-center py-2.5 rounded-xl snap-center bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-colors active:scale-95">
            <span class="text-[11px] font-semibold ${textClass} mb-0.5">${dayName}</span>
            <span class="text-base font-semibold text-on-surface">${d}</span>
            ${hasDot ? '<div class="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>' : ''}
          </div>
        `;
      }
    }

    stripEl.innerHTML = stripHtml;

    setTimeout(() => {
      const activePill = document.getElementById(`daily-date-pill-${selectedDay}`);
      if (activePill) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);

    const selectedDateObj = new Date(year, month - 1, selectedDay);
    const selectedDayName = dayNames[selectedDateObj.getDay()];
    if (timelineTitleEl) {
      timelineTitleEl.innerText = `${String(month).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')} (${selectedDayName}) 타임라인 일정`;
    }

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

          const displayTitle = this.formatScheduleCleanLabel(s);

          eventsHtml += `
            <div class="mb-3 ${bgStyle} rounded-2xl p-4 shadow-xs flex justify-between items-center transition-all border border-outline-variant/10">
              <div class="flex-1">
                <span class="text-xs font-bold font-label text-primary">${s.time} • ${s.badge}</span>
                <h4 class="text-base font-bold font-headline text-on-surface mt-1">${displayTitle}</h4>
                <p class="text-xs text-on-surface-variant mt-1">작성자: ${s.author || '이재광'}</p>
              </div>
              <button onclick="App.showToast('${displayTitle} 상세 보기')" class="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors shadow-2xs">
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

  // Schedule Clean Title Helper (대괄호 제거 및 '이름 외근 (장소명)', '이름 연차', '이름 오후반차' 표준화)
  formatScheduleCleanLabel(s) {
    if (!s) return '';
    let titleStr = (s.title || '').trim();
    let badgeStr = (s.badge || '').trim();
    let authorName = (s.author || '').split(' ')[0] || '';
    let locationStr = (s.location || '').trim();

    // 1. 공휴일, 절기, 기념일, 회사공지
    const isHoliday = (s.badge === '공휴일' || titleStr.includes('공휴일') || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지');
    const isSolarTerm = (s.badge === '절기' || s.author === '24절기');
    const isObservance = (s.badge === '기념일' || s.author === '기념일');

    if (isHoliday) {
      return (s.holidayName || titleStr).replace(/\s*\(공휴일\)/g, '').replace(/[\[\]]/g, '').trim();
    }
    if (isSolarTerm) {
      return (s.termName || titleStr.split(' ')[0]).replace(/[\[\]]/g, '').trim();
    }
    if (isObservance) {
      return (s.obsName || titleStr.split(' ')[0]).replace(/[\[\]]/g, '').trim();
    }

    // 2. 대괄호 [ ... ] 및 불필요 괄호 제거
    let cleanTitle = titleStr.replace(/\s*\(공휴일\)/g, '').replace(/\[.*?\]/g, '').replace(/[\[\]]/g, '').trim();

    // 3. 만약 cleanTitle이 이미 `이름 유형` 형태(예: '오은주 연차')이면 그대로 반환
    if (authorName && cleanTitle.startsWith(authorName)) {
      if (locationStr && (cleanTitle.includes('외근') || badgeStr.includes('외근')) && !cleanTitle.includes('(')) {
        return `${cleanTitle} (${locationStr})`;
      }
      return cleanTitle;
    }

    // 4. 유형 파악 (오후반차, 오전반차, 반반차, 연차, 외근 등)
    let typeStr = '';
    if (cleanTitle.includes('오후 반차') || cleanTitle.includes('반차(오후)') || cleanTitle.includes('오후반차')) {
      typeStr = '오후반차';
    } else if (cleanTitle.includes('오전 반차') || cleanTitle.includes('반차(오전)') || cleanTitle.includes('오전반차')) {
      typeStr = '오전반차';
    } else if (cleanTitle.includes('반반차')) {
      typeStr = '반반차';
    } else if (cleanTitle.includes('연차') || cleanTitle.includes('휴가') || badgeStr.includes('연차') || badgeStr.includes('휴가')) {
      typeStr = '연차';
    } else if (cleanTitle.includes('외근') || cleanTitle.includes('출장') || badgeStr.includes('외근')) {
      typeStr = locationStr ? `외근 (${locationStr})` : '외근';
    } else if (cleanTitle.includes('회의') || cleanTitle.includes('보고') || badgeStr.includes('회의')) {
      typeStr = '회의';
    } else {
      typeStr = cleanTitle || badgeStr || '일정';
    }

    if (authorName) {
      return `${authorName} ${typeStr}`;
    }
    return cleanTitle;
  },

  // Employee Status & Schedule Helper
  simplifyScheduleText(text, location = '') {
    if (!text && !location) return '';
    const loc = String(location || '').trim();
    const str = String(text || '').trim();

    if (str.includes('오후 반차') || str.includes('반차(오후)')) return '오후 반차';
    if (str.includes('오전 반차') || str.includes('반차(오전)')) return '오전 반차';
    if (str.includes('반반차')) {
      const timeMatch = str.match(/\[(.*?)\]/);
      return timeMatch ? `반반차 [${timeMatch[1].trim()}]` : '반반차';
    }
    if (str.includes('연차')) return '연차';
    if (str.includes('외근') || str.includes('미팅') || str.includes('회의') || str.includes('방문') || loc) {
      if (loc) {
        return `외근 (${loc})`;
      }
      const alreadyFormatted = str.match(/외근\s*\((.*?)\)/);
      if (alreadyFormatted && alreadyFormatted[1]) {
        return `외근 (${alreadyFormatted[1].trim()})`;
      }
      const bracketMatch = str.match(/\[(.*?)\]/);
      if (bracketMatch && bracketMatch[1]) {
        return `외근 (${bracketMatch[1].trim()})`;
      }
      const parenMatch = str.match(/\((.*?)\)/);
      if (parenMatch && parenMatch[1] && !parenMatch[1].includes('오전') && !parenMatch[1].includes('오후') && !parenMatch[1].includes('종일')) {
        return `외근 (${parenMatch[1].trim()})`;
      }
      return '외근';
    }
    if (str.includes('휴가') || str.includes('공가') || str.includes('병가')) return '휴가';
    return str.split('(')[0].split('[')[0].trim();
  },

  getEmployeeStatusInfo(emp) {
    if (!emp) {
      return {
        type: 'work',
        text: '근무중',
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
        icon: 'laptop_mac',
        pulse: true,
        todaySchedule: '',
        location: ''
      };
    }

    const rawStatus = (emp.status || 'work').toLowerCase();
    const rawText = emp.statusText || '';

    // 1. Determine Today's Scheduled Event (금일 근태일지 일정 및 예정 뱃지 실시간 동기화)
    let rawSched = '';
    let foundLocation = emp.location || '';

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const todayKey1 = `${curYear}-${curMonth}-${curDay}`;
    const todayKey2 = `${curYear}-${String(curMonth).padStart(2, '0')}-${String(curDay).padStart(2, '0')}`;

    if (window.MockData && window.MockData.schedules) {
      const todayList = window.MockData.schedules[todayKey1] || window.MockData.schedules[todayKey2] || [];
      const match = todayList.find(s => {
        if (!s.author) return false;
        if (!s.author.includes(emp.name)) return false;
        // 동명이인 및 직책 매칭 (예: 기획팀 김종규 팀장 vs 수행본부 김종규 본부장)
        if (emp.role && (s.author.includes('팀장') || s.author.includes('본부장') || s.author.includes('대표') || s.author.includes('차장') || s.author.includes('과장') || s.author.includes('대리') || s.author.includes('주임') || s.author.includes('사원') || s.author.includes('수습'))) {
          return s.author.includes(emp.role) || (emp.dept && s.author.includes(emp.dept));
        }
        return true;
      });
      if (match) {
        rawSched = match.title;
        if (match.location) foundLocation = match.location;
      }
    } else if (emp.todaySchedule) {
      rawSched = emp.todaySchedule;
    }

    const todayScheduleText = this.simplifyScheduleText(rawSched || emp.todaySchedule, foundLocation);

    // 2. Determine Primary Live Status (근무중, 외근중, 휴가중, 퇴근)
    let mainStatus = {
      type: 'work',
      text: '근무중',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      icon: 'laptop_mac',
      pulse: true
    };

    if (rawStatus === 'business' || rawText === '외근중' || (todayScheduleText && todayScheduleText.startsWith('외근'))) {
      mainStatus = {
        type: 'business',
        text: '외근중',
        dotColor: 'bg-sky-500',
        badgeClass: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
        icon: 'directions_car',
        pulse: false
      };
    } else if (rawStatus === 'vacation' || rawText === '휴가중' || rawText === '연차' || (todayScheduleText && todayScheduleText === '연차')) {
      mainStatus = {
        type: 'vacation',
        text: '휴가중',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        icon: 'beach_access',
        pulse: false
      };
    } else if (rawStatus === 'offwork' || rawStatus === 'away' || rawStatus === 'offline' || rawText === '퇴근') {
      mainStatus = {
        type: 'offwork',
        text: '퇴근',
        dotColor: 'bg-slate-400',
        badgeClass: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
        icon: 'home',
        pulse: false
      };
    } else {
      mainStatus = {
        type: 'work',
        text: '근무중',
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
        icon: 'laptop_mac',
        pulse: true
      };
    }

    return {
      ...mainStatus,
      todaySchedule: todayScheduleText,
      location: foundLocation
    };
  },

  // Employee Directory Methods
  renderDirectory() {
    const container = document.getElementById('directory-list-container');
    const totalCountEl = document.getElementById('directory-total-count');
    const birthdayBannerContainer = document.getElementById('directory-birthday-banner-container');
    if (!container) return;

    // Ensure employees list is always loaded
    if (!this.state.employees || !this.state.employees.length) {
      this.state.employees = (window.MockData && window.MockData.employees) || [];
    }
    const allEmployees = this.state.employees || [];

    // 생일 배너 비표시 (요청에 따라 이달의 생일 상단 배너 제거)
    if (birthdayBannerContainer) {
      birthdayBannerContainer.innerHTML = '';
    }

    const query = (document.getElementById('directory-search-input')?.value || '').toLowerCase().trim();
    const cat = this.state.currentDirectoryCategory || 'all';

    let filtered = allEmployees.filter(emp => {
      if (!emp) return false;
      const statusInfo = this.getEmployeeStatusInfo(emp);
      const matchCat = cat === 'all' || emp.dept === cat;

      const empName = (emp.name || '').toLowerCase();
      const empDept = (emp.dept || '').toLowerCase();
      const empRole = (emp.role || '').toLowerCase();
      const empPhone = (emp.phone || '').toLowerCase();
      const empStatusText = (emp.statusText || '').toLowerCase();
      const infoText = (statusInfo.text || '').toLowerCase();
      const schedText = (statusInfo.todaySchedule || '').toLowerCase();

      const matchQuery = !query ||
        empName.includes(query) ||
        empDept.includes(query) ||
        empRole.includes(query) ||
        empStatusText.includes(query) ||
        infoText.includes(query) ||
        schedText.includes(query) ||
        (emp.isBirthdayThisMonth && ('생일'.includes(query) || '생일자'.includes(query) || '이달의생일'.includes(query) || 'birthday'.includes(query))) ||
        empPhone.includes(query);
      return matchCat && matchQuery;
    });

    if (totalCountEl) totalCountEl.innerText = `총 ${filtered.length}명`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium">
          <svg class="w-10 h-10 text-outline mb-2 mx-auto" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h9.49c-.31-.62-.49-1.29-.49-2 0-1.5.68-2.84 1.75-3.75C13.88 14.1 12.87 14 12 14zm8.5 0a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm-1.5 5.5v-2h1.5v2h-1.5zm0 1.5h1.5v1.5h-1.5z"/>
          </svg>
          <p>검색 조건에 맞는 임직원이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(emp => {
      const statusInfo = this.getEmployeeStatusInfo(emp);
      const isOff = statusInfo.type === 'offwork';
      const opacityClass = isOff ? 'opacity-75' : '';

      let avatarHtml = '';
      const dotHtml = `
        <div class="absolute bottom-0 right-0 h-3.5 w-3.5 ${statusInfo.dotColor} rounded-full border-2 border-surface-container-lowest z-10 ${statusInfo.pulse ? 'ring-2 ring-emerald-400/30' : ''}"></div>
      `;

      const birthdayAvatarDeco = emp.isBirthdayThisMonth
        ? `<div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center shadow-xs z-10 animate-bounce" title="이달의 생일자">🎂</div>`
        : '';

      if (emp.avatar) {
        avatarHtml = `
          <div class="h-14 w-14 rounded-full bg-surface-container-low relative flex-shrink-0 cursor-pointer" onclick="App.openDirectoryDetail(${emp.id})">
            <div class="w-full h-full rounded-full overflow-hidden">
              <img alt="${emp.name}" class="w-full h-full object-cover hover:scale-105 transition-transform" src="${emp.avatar}" />
            </div>
            ${dotHtml}
            ${birthdayAvatarDeco}
          </div>
        `;
      } else {
        avatarHtml = `
          <div class="h-14 w-14 rounded-full bg-surface-container-low relative flex items-center justify-center text-primary-dim font-headline font-bold text-xl flex-shrink-0 cursor-pointer hover:bg-surface-container transition-colors" onclick="App.openDirectoryDetail(${emp.id})">
            ${emp.avatarInitial || (emp.name ? emp.name.charAt(0) : '사')}
            ${dotHtml}
            ${birthdayAvatarDeco}
          </div>
        `;
      }

      // Primary Status Badge (근무중, 외근중, 휴가중, 퇴근)
      const primaryStatusBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.badgeClass}">
          ${typeof getSvgIcon === 'function' ? getSvgIcon(statusInfo.icon, 'w-3.5 h-3.5') : ''}
          <span>${statusInfo.text}</span>
        </span>
      `;

      // Today Scheduled Event Badge (근무중과 완벽히 동일한 크기 & '예정 : 제목' 문구)
      let todayScheduleBadge = '';
      if (statusInfo.todaySchedule) {
        const isVacationSchedule = statusInfo.todaySchedule.includes('반차') || statusInfo.todaySchedule.includes('연차') || statusInfo.todaySchedule.includes('휴가');
        const schedBadgeClass = isVacationSchedule
          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          : 'bg-sky-500/10 text-sky-700 border border-sky-500/20';
        const schedIcon = isVacationSchedule ? 'event_upcoming' : 'directions_car';

        todayScheduleBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${schedBadgeClass}">
            ${typeof getSvgIcon === 'function' ? getSvgIcon(schedIcon, 'w-3.5 h-3.5') : ''}
            <span>예정 : ${statusInfo.todaySchedule}</span>
          </span>
        `;
      }

      // Monthly Birthday Badge (이달의 생일 🎂)
      let birthdayBadge = '';
      if (emp.isBirthdayThisMonth) {
        birthdayBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/30">
            ${typeof getSvgIcon === 'function' ? getSvgIcon('cake', 'w-3.5 h-3.5 text-pink-500') : ''}
            <span>이달의 생일 🎂</span>
          </span>
        `;
      }

      // Birthday Highlight Card Style
      const birthdayCardStyle = emp.isBirthdayThisMonth
        ? 'border-2 border-pink-500/30 shadow-[0_4px_16px_rgba(236,72,153,0.08)] bg-gradient-to-r from-pink-500/[0.04] to-transparent'
        : 'shadow-[0_2px_12px_rgba(35,44,81,0.04)]';

      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 ${opacityClass} ${birthdayCardStyle} text-left">
          <div class="flex items-center space-x-4 min-w-0">
            ${avatarHtml}
            <div class="cursor-pointer min-w-0" onclick="App.openDirectoryDetail(${emp.id})">
              <div class="flex items-center gap-2">
                <h3 class="font-headline font-bold text-on-surface text-base hover:text-primary transition-colors">${emp.name}</h3>
                <span class="font-body text-xs text-on-surface-variant font-medium">${emp.role}</span>
              </div>
              <p class="font-body text-xs text-on-surface-variant/80 mt-0.5">${emp.dept}</p>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                ${primaryStatusBadge}
                ${todayScheduleBadge}
                ${birthdayBadge}
              </div>
            </div>
          </div>
          <div class="flex space-x-2 flex-shrink-0 ml-3">
            <button onclick="App.callEmployee('${emp.phone}')" class="h-10 w-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary/10 transition-colors active:scale-95" title="전화걸기">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </button>
            <button onclick="App.chatEmployee('${emp.name}')" class="h-10 w-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary/10 transition-colors active:scale-95" title="메신저">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
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
    const allEmployees = this.state.employees || (window.MockData && window.MockData.employees) || [];
    const emp = allEmployees.find(e => e.id === empId) || allEmployees[0];
    if (!emp) return;
    this.state.currentEmployeeId = emp.id;

    const nameEl = document.getElementById('dir-detail-name');
    const roleEl = document.getElementById('dir-detail-role');
    const phoneEl = document.getElementById('dir-detail-phone');
    const telEl = document.getElementById('dir-detail-tel');
    const emailEl = document.getElementById('dir-detail-email');
    const deptEl = document.getElementById('dir-detail-dept');
    const avatarWrap = document.getElementById('dir-detail-avatar-wrap');
    const statusBadgeEl = document.getElementById('dir-detail-status-badge');
    const statusTextEl = document.getElementById('dir-detail-status-text');
    const birthdayEl = document.getElementById('dir-detail-birthday');

    const statusInfo = this.getEmployeeStatusInfo(emp);

    if (nameEl) nameEl.innerText = emp.name;
    if (roleEl) roleEl.innerText = `${emp.dept} / ${emp.role}`;
    if (phoneEl) phoneEl.innerText = emp.phone;
    if (telEl) telEl.innerText = emp.tel;
    if (emailEl) emailEl.innerText = emp.email;
    if (deptEl) deptEl.innerText = emp.dept;

    // Birthday Info in detail card
    if (birthdayEl) {
      if (emp.isBirthdayThisMonth) {
        birthdayEl.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="font-body text-xs font-extrabold text-pink-600 dark:text-pink-400">${emp.birthday ? emp.birthday + '일' : '8월'}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white shadow-xs">이달의 생일 🎂</span>
          </div>
        `;
      } else if (emp.birthday) {
        birthdayEl.innerHTML = `<span class="font-body text-xs font-semibold text-on-surface">${emp.birthday}</span>`;
      } else {
        birthdayEl.innerHTML = `<span class="font-body text-xs text-on-surface-variant/60">-</span>`;
      }
    }

    if (statusBadgeEl) {
      let extraHtml = '';
      if (statusInfo.todaySchedule) {
        const isVacationSchedule = statusInfo.todaySchedule.includes('반차') || statusInfo.todaySchedule.includes('연차') || statusInfo.todaySchedule.includes('휴가');
        const schedBadgeClass = isVacationSchedule
          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          : 'bg-sky-500/10 text-sky-700 border border-sky-500/20';
        const schedIcon = isVacationSchedule ? 'event_upcoming' : 'directions_car';

        extraHtml = `
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${schedBadgeClass}">
            ${getSvgIcon(schedIcon, 'w-3.5 h-3.5')}
            <span>예정 : ${statusInfo.todaySchedule}</span>
          </span>
        `;
      }

      let birthdayBadgeHtml = '';
      if (emp.isBirthdayThisMonth) {
        birthdayBadgeHtml = `
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/30 shadow-xs">
            ${getSvgIcon('cake', 'w-3.5 h-3.5 text-pink-500')}
            <span>이달의 생일자 🎂</span>
          </span>
        `;
      }

      statusBadgeEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${statusInfo.badgeClass}">
            ${getSvgIcon(statusInfo.icon, 'w-3.5 h-3.5')}
            <span>${statusInfo.text}</span>
          </span>
          ${extraHtml}
          ${birthdayBadgeHtml}
        </div>
      `;
    }

    if (statusTextEl) {
      let scheduleSubBadge = '';
      if (statusInfo.todaySchedule) {
        const isVacationSchedule = statusInfo.todaySchedule.includes('반차') || statusInfo.todaySchedule.includes('연차') || statusInfo.todaySchedule.includes('휴가');
        const schedBadgeClass = isVacationSchedule
          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          : 'bg-sky-500/10 text-sky-700 border border-sky-500/20';
        scheduleSubBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${schedBadgeClass}">
            <span>예정 : ${statusInfo.todaySchedule}</span>
          </span>
        `;
      }

      statusTextEl.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}"></span>
            <span>${statusInfo.text}</span>
          </span>
          ${scheduleSubBadge}
        </div>
      `;
    }

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
      const timeStr = this.state.checkInTimeStr || (this.state.checkInTime ? this.formatCheckInTime(this.state.checkInTime) : '오전 08:45');
      if (homeStatusTitle) homeStatusTitle.innerText = `${timeStr} 출근 완료`;
      if (homeStatusBadge) homeStatusBadge.innerText = '근무 중';
      if (homeStatusDot) homeStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-secondary';

      if (statusCard) statusCard.classList.add('active');
      if (statusIconWrap) statusIconWrap.style.background = 'rgba(0, 105, 63, 0.15)';
      if (statusIcon) {
        statusIcon.innerText = 'directions_run';
        statusIcon.style.color = 'var(--secondary)';
      }
      if (statusTitle) statusTitle.innerText = `현재 근무 중입니다 (${timeStr} 출근)`;
      if (statusBadge) {
        statusBadge.innerText = '근무 중';
        statusBadge.style.background = 'var(--secondary-container)';
        statusBadge.style.color = 'var(--secondary)';
      }

      if (pulseBtn) pulseBtn.classList.add('checked-in');
      if (pulseIcon) pulseIcon.innerText = 'logout';
      if (pulseText) pulseText.innerText = '퇴근 하기';
      if (pulseSubtext) pulseSubtext.innerText = `${timeStr} 출근 완료됨`;
    } else {
      if (homeStatusTitle) homeStatusTitle.innerText = '아직 출근 전입니다';
      if (homeStatusBadge) homeStatusBadge.innerText = '출근 전';
      if (homeStatusDot) homeStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-secondary-container';

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
      if (pulseSubtext) pulseSubtext.innerText = '탭하여 출근';
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
    const drawerDarkToggle = document.getElementById('drawer-dark-toggle');
    const drawerDarkKnob = document.getElementById('drawer-dark-knob');
    const drawerThemeLabel = document.getElementById('drawer-theme-label');
    const drawerThemeIcon = document.getElementById('drawer-theme-icon');

    if (this.state.settings.dark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark'); // Tailwind dark: prefix 지원
      const darkToggle = document.getElementById('dark-toggle');
      if (darkToggle) darkToggle.checked = true;
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.innerText = 'light_mode';

      // Drawer Dark Mode Switch
      if (drawerDarkToggle) drawerDarkToggle.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none';
      if (drawerDarkKnob) drawerDarkKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm';
      if (drawerThemeLabel) drawerThemeLabel.innerText = '다크 모드 적용 중';
      if (drawerThemeIcon) {
        drawerThemeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
      }
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark'); // Tailwind dark: prefix 지원
      const darkToggle = document.getElementById('dark-toggle');
      if (darkToggle) darkToggle.checked = false;
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.innerText = 'dark_mode';

      // Drawer Dark Mode Switch
      if (drawerDarkToggle) drawerDarkToggle.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-surface-container-highest transition-colors focus:outline-none';
      if (drawerDarkKnob) drawerDarkKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 shadow-sm';
      if (drawerThemeLabel) drawerThemeLabel.innerText = '라이트 모드 적용 중';
      if (drawerThemeIcon) {
        drawerThemeIcon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
      }
    }

    this.renderTodayData();
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
  openRequestModal(defaultType = 'leave') {
    this.switchRequestType(defaultType);
    this.calculateLeaveDays();
    this.switchTab('screen-request');
  },

  closeRequestModal() {
    this.switchTab('screen-checkin');
  },

  // Request Type Switcher (휴가 vs 외근)
  switchRequestType(type = 'leave') {
    this.state.currentRequestType = type;

    const leaveSection = document.getElementById('request-section-leave');
    const outworkSection = document.getElementById('request-section-outwork');
    const btnLeave = document.getElementById('tab-btn-request-leave');
    const btnOutwork = document.getElementById('tab-btn-request-outwork');
    const titleEl = document.getElementById('request-page-title');
    const subtitleEl = document.getElementById('request-page-subtitle');

    if (type === 'leave') {
      if (leaveSection) leaveSection.classList.remove('hidden');
      if (outworkSection) outworkSection.classList.add('hidden');

      if (btnLeave) {
        btnLeave.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center';
      }
      if (btnOutwork) {
        btnOutwork.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center';
      }
      if (titleEl) titleEl.innerText = '휴가 신청';
      if (subtitleEl) subtitleEl.innerText = '팀원들과 원활한 일정 공유를 위해 미리 신청해주세요.';
      this.calculateLeaveDays();
    } else {
      if (leaveSection) leaveSection.classList.add('hidden');
      if (outworkSection) outworkSection.classList.remove('hidden');

      if (btnLeave) {
        btnLeave.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center';
      }
      if (btnOutwork) {
        btnOutwork.className = 'flex-1 py-2.5 px-4 rounded-[0.875rem] text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center';
      }
      if (titleEl) titleEl.innerText = '외근 신청';
      if (subtitleEl) subtitleEl.innerText = '사외 미팅 및 업무 일정을 미리 등록하여 공유해주세요.';

      // 오늘 날짜 기본 바인딩
      const outworkDateEl = document.getElementById('outwork-date');
      if (outworkDateEl && !outworkDateEl.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        outworkDateEl.value = `${yyyy}-${mm}-${dd}`;
      }
    }
  },

  onOutworkTimeslotChange(timeslot) {
    this.state.currentOutworkTimeslot = timeslot;
  },

  onLeaveTypeChange(typeVal) {
    this.state.currentLeaveType = typeVal;

    // Toggle time selection containers for 반반차
    const pageTimeContainer = document.getElementById('page-leave-time-range-container');
    const modalTimeContainer = document.getElementById('modal-leave-time-range-container');

    if (typeVal === '반반차') {
      if (pageTimeContainer) pageTimeContainer.classList.remove('hidden');
      if (modalTimeContainer) modalTimeContainer.classList.remove('hidden');
    } else {
      if (pageTimeContainer) pageTimeContainer.classList.add('hidden');
      if (modalTimeContainer) modalTimeContainer.classList.add('hidden');
    }

    this.calculateLeaveDays();
  },

  calculateLeaveDays() {
    const startEl = document.getElementById('leave-start-date');
    const endEl = document.getElementById('leave-end-date');
    const countEl = document.getElementById('leave-days-count');

    if (!startEl || !endEl || !countEl) return;

    const selectedType = document.querySelector('input[name="leave_type"]:checked')?.value ||
      document.querySelector('input[name="modal_leave_type"]:checked')?.value || '연차';

    if (selectedType === '반차(오전)' || selectedType === '반차(오후)') {
      countEl.innerText = '총 0.5일';
      return;
    }

    if (selectedType === '반반차') {
      const pageStartTime = document.getElementById('page-leave-start-time')?.value || '09:00';
      const pageEndTime = document.getElementById('page-leave-end-time')?.value || '11:00';
      const modalStartTime = document.getElementById('modal-leave-start-time')?.value || '09:00';
      const modalEndTime = document.getElementById('modal-leave-end-time')?.value || '11:00';

      const pageTimeContainer = document.getElementById('page-leave-time-range-container');
      const startTime = pageTimeContainer && !pageTimeContainer.classList.contains('hidden') ? pageStartTime : modalStartTime;
      const endTime = pageTimeContainer && !pageTimeContainer.classList.contains('hidden') ? pageEndTime : modalEndTime;

      countEl.innerText = `총 0.25일 (${startTime}~${endTime})`;
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
    const selectedType = document.querySelector('input[name="leave_type"]:checked')?.value ||
      document.querySelector('input[name="modal_leave_type"]:checked')?.value || '연차';
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

  submitOutworkRequest() {
    const dateInput = document.getElementById('outwork-date');
    const locationInput = document.getElementById('outwork-location');
    const titleInput = document.getElementById('outwork-title');
    const contentInput = document.getElementById('outwork-content');
    const timeslot = document.querySelector('input[name="outwork_timeslot"]:checked')?.value || '오후';

    const dateVal = dateInput?.value;
    const location = locationInput?.value?.trim();
    const title = titleInput?.value?.trim();
    const content = contentInput?.value?.trim() || '';

    if (!dateVal) {
      this.showToast('⚠️ 외근 날짜를 선택해주세요.');
      return;
    }
    if (!location) {
      this.showToast('⚠️ 방문 장소 또는 기관명을 입력해주세요.');
      locationInput?.focus();
      return;
    }
    if (!title) {
      this.showToast('⚠️ 외근 제목을 입력해주세요.');
      titleInput?.focus();
      return;
    }

    // 시간대 문자열 생성
    let timeStr = '13:00 ~ 18:00';
    let checkInStr = '13:00';
    let checkOutStr = '18:00';
    let durSec = 18000;

    if (timeslot === '오전') {
      timeStr = '09:00 ~ 12:00';
      checkInStr = '09:00';
      checkOutStr = '12:00';
      durSec = 10800;
    } else if (timeslot === '종일') {
      timeStr = '09:00 ~ 18:00';
      checkInStr = '09:00';
      checkOutStr = '18:00';
      durSec = 28800;
    }

    // 로그인 사용자 정보
    const user = this.state.user || { name: '이재광', role: '팀장', avatar: 'profile.png' };
    const authorName = `${user.name} ${user.role || '팀장'}`;
    const avatarUrl = user.avatar ? (user.avatar.startsWith('./') ? user.avatar : `./resource/image/${user.avatar}`) : './resource/image/profile.png';

    // 날짜 키 파싱 (YYYY-M-D, unpadded)
    const [yearStr, monthStr, dayStr] = dateVal.split('-');
    const schedDateKey = `${parseInt(yearStr, 10)}-${parseInt(monthStr, 10)}-${parseInt(dayStr, 10)}`;

    const fullTitle = `외근(${timeslot}) [${location}] ${title}`;

    const newSchedItem = {
      title: fullTitle,
      time: timeStr,
      type: 'primary',
      badge: '외근',
      author: authorName,
      avatar: avatarUrl
    };

    // 1. MockData.schedules 동기화
    if (!window.MockData) window.MockData = {};
    if (!window.MockData.schedules) window.MockData.schedules = {};
    if (!window.MockData.schedules[schedDateKey]) {
      window.MockData.schedules[schedDateKey] = [];
    }
    window.MockData.schedules[schedDateKey].unshift(newSchedItem);

    // 2. 근태 로그 추가
    const targetDate = new Date(dateVal);
    const daysArr = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const newLog = {
      id: Date.now(),
      monthStr: `${targetDate.getMonth() + 1}월`,
      dayNum: String(targetDate.getDate()),
      dayName: daysArr[targetDate.getDay()],
      statusText: `외근(${timeslot}) • [${location}] ${title}`,
      statusType: 'remote',
      checkInTimeStr: checkInStr,
      checkOutTimeStr: checkOutStr,
      durationSec: durSec
    };

    this.state.logs.unshift(newLog);
    this.saveState();

    // 3. 폼 초기화
    if (locationInput) locationInput.value = '';
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';

    // 4. 알림 및 뷰 갱신
    this.showToast(`✅ [외근] ${location} 외근 일정이 성공적으로 등록되었습니다.`);

    // 캘린더나 스케줄 뷰 리렌더링
    if (typeof this.renderCalendar === 'function') {
      this.renderCalendar();
    }
    if (typeof this.renderSchedules === 'function') {
      this.renderSchedules();
    }
    if (this.state.activeTab === 'screen-logs' && typeof this.renderLogs === 'function') {
      this.renderLogs();
    }

    // 근태일지 캘린더 화면으로 이동하여 등록 결과 확인
    setTimeout(() => {
      this.switchTab('screen-calendar');
    }, 500);
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

  // =========================================
  // 우측 사이드 설정 팝업 드로어 (Settings Drawer) 제어
  // =========================================
  openSettingsDrawer() {
    const drawer = document.getElementById('drawer-settings');
    const backdrop = document.getElementById('drawer-settings-backdrop');
    const panel = document.getElementById('drawer-settings-panel');
    if (!drawer || !backdrop || !panel) return;

    // 1. 사용자 정보 실시간 동기화
    const user = this.state.user || {};
    const nameEl = document.getElementById('drawer-user-name');
    const roleEl = document.getElementById('drawer-user-role');
    const deptEl = document.getElementById('drawer-user-dept');
    const avatarEl = document.getElementById('drawer-user-avatar');
    if (nameEl) nameEl.innerText = user.name || '이재광';
    if (roleEl) roleEl.innerText = user.role || '차장';
    if (deptEl) deptEl.innerText = `${user.dept || '퍼블리싱팀'} · ${user.email || 'yellow@wordncode.com'}`;
    if (avatarEl) avatarEl.src = user.avatar || 'profile.png';

    // 2. 테마 팔레트 활성 상태 갱신
    const currentTheme = (this.state.settings && this.state.settings.themeIdx) || 3;
    document.querySelectorAll('.drawer-theme-btn').forEach(btn => {
      if (Number(btn.getAttribute('data-theme-idx')) === Number(currentTheme)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. 다크 모드 토글 상태 갱신
    const isDark = (this.state.settings && this.state.settings.dark) || false;
    const drawerDarkToggle = document.getElementById('drawer-dark-toggle');
    const drawerDarkKnob = document.getElementById('drawer-dark-knob');
    const drawerThemeLabel = document.getElementById('drawer-theme-label');
    if (drawerDarkToggle && drawerDarkKnob && drawerThemeLabel) {
      if (isDark) {
        drawerDarkToggle.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none';
        drawerDarkKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm';
        drawerThemeLabel.innerText = '다크 모드 적용 중';
      } else {
        drawerDarkToggle.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-surface-container-highest transition-colors focus:outline-none';
        drawerDarkKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 shadow-sm';
        drawerThemeLabel.innerText = '라이트 모드 적용 중';
      }
    }

    // 드로어 노출
    drawer.classList.remove('hidden');
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');

    if (FramerMotion.engine) {
      FramerMotion.animate(backdrop, { opacity: [0, 1] }, { duration: 0.28, easing: 'ease-out' });
      FramerMotion.animate(panel, { transform: ['translateX(100%)', 'translateX(0%)'] }, { duration: 0.35, easing: FramerMotion.spring({ stiffness: 380, damping: 32 }) });
    }
  },

  closeSettingsDrawer() {
    const drawer = document.getElementById('drawer-settings');
    const backdrop = document.getElementById('drawer-settings-backdrop');
    const panel = document.getElementById('drawer-settings-panel');
    if (!drawer || !backdrop || !panel) return;

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');

    if (FramerMotion.engine) {
      FramerMotion.animate(backdrop, { opacity: [1, 0] }, { duration: 0.22, easing: 'ease-in' });
      const anim = FramerMotion.animate(panel, { transform: ['translateX(0%)', 'translateX(100%)'] }, { duration: 0.26, easing: 'ease-in' });
      if (anim && anim.finished && anim.finished.then) {
        anim.finished.then(() => {
          drawer.classList.add('hidden');
        });
      } else {
        setTimeout(() => drawer.classList.add('hidden'), 260);
      }
    } else {
      setTimeout(() => drawer.classList.add('hidden'), 300);
    }
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

    // Update Drawer Theme Buttons active state
    document.querySelectorAll('.drawer-theme-btn').forEach(btn => {
      if (Number(btn.getAttribute('data-theme-idx')) === Number(themeIdx)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

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

  // To-Do / Task Management Methods
  initKanbanDragScroll() {
    const containers = document.querySelectorAll('.kanban-row-scroll-container');
    if (!containers || containers.length === 0) return;

    containers.forEach(container => {
      if (container._hasDragListener) return;
      container._hasDragListener = true;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let hasDragged = false;

      container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        container.classList.add('is-dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      const stopDragging = () => {
        if (!isDown) return;
        isDown = false;
        container.classList.remove('is-dragging');
      };

      container.addEventListener('mouseleave', stopDragging);
      container.addEventListener('mouseup', stopDragging);

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 6) {
          hasDragged = true;
        }
        container.scrollLeft = scrollLeft - walk;
      });

      container.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
        }
      }, true);
    });
  },

  selectProject(projectName) {
    this.state.selectedProject = projectName;
    this.renderTodos();
  },

  clearSelectedProject() {
    this.state.selectedProject = null;
    this.renderTodos();
  },

  renderTodos() {
    const container = document.getElementById('todo-list-container');
    const totalCountEl = document.getElementById('todo-total-count');
    if (!container) return;

    let list = [...(this.state.todos || [])];
    const filter = this.state.todosFilter || 'all';
    const query = (this.state.todosSearchQuery || '').toLowerCase().trim();
    const selectedProject = this.state.selectedProject;

    // 1. Category Filter
    if (filter === 'my') {
      list = list.filter(t => t.isMine);
    } else if (filter === 'completed') {
      list = list.filter(t => t.status === 'done');
    } else if (filter === 'draft') {
      list = list.filter(t => t.status === 'draft');
    } else if (filter === 'overdue') {
      list = list.filter(t => t.isOverdue || t.status === 'overdue');
    }

    // 2. Search Query Filter
    if (query) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.project && t.project.toLowerCase().includes(query)) ||
        (t.notes && t.notes.toLowerCase().includes(query))
      );
    }

    if (totalCountEl) {
      totalCountEl.textContent = `총 ${list.length}개`;
    }

    // -------------------------------------------------------------
    // OPTION: 한줄 간략 리스트 모드 (todoViewMode === 'list')
    // -------------------------------------------------------------
    if (this.state.todoViewMode === 'list') {
      container.className = "flex flex-col gap-2.5";

      // 1. 프로젝트 내부 뷰 (특정 프로젝트가 선택된 경우)
      if (selectedProject) {
        const projectTodos = list.filter(t => (t.project || '일반 업무') === selectedProject);

        const backHeaderHtml = `
          <div class="w-full flex items-center justify-between bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/15 shadow-2xs mb-1">
            <button type="button" onclick="App.clearSelectedProject()" class="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline active:scale-95 transition-transform">
              <span class="material-symbols-outlined text-base">arrow_back</span>
              <span>모든 프로젝트 목록</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="font-headline font-bold text-sm text-on-surface"># ${selectedProject}</span>
              <span class="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full">${projectTodos.length}개</span>
              <button type="button" onclick="App.openTodoModal()" class="ml-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 hover:bg-primary-dim active:scale-95 transition-all shadow-xs">
                <span class="material-symbols-outlined text-sm">add</span>
                <span>미션 등록</span>
              </button>
            </div>
          </div>
        `;

        if (projectTodos.length === 0) {
          container.innerHTML = `
            ${backHeaderHtml}
            <div class="flex flex-col items-center justify-center py-12 text-center bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <span class="material-symbols-outlined text-3xl text-on-surface-variant opacity-60 mb-2">task</span>
              <h3 class="font-headline text-base font-bold text-on-surface mb-1">등록된 할 일이 없습니다</h3>
              <p class="text-xs text-on-surface-variant max-w-xs">새로운 미션을 작성해 보세요.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = `
          ${backHeaderHtml}
          ${projectTodos.map(t => {
          const isDone = t.status === 'done';
          const checkIcon = isDone ? 'check_circle' : 'radio_button_unchecked';
          const checkColor = isDone ? 'text-primary' : 'text-on-surface-variant';
          const isDoneClass = isDone ? 'line-through text-on-surface-variant opacity-70' : 'text-on-surface';

          let priorityDot = `<span class="w-2 h-2 rounded-full bg-tertiary shrink-0"></span>`;
          if (t.priority === 'high') priorityDot = `<span class="w-2 h-2 rounded-full bg-error shrink-0"></span>`;
          else if (t.priority === 'low') priorityDot = `<span class="w-2 h-2 rounded-full bg-outline shrink-0"></span>`;

          let statusBadge = `<span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold shrink-0">대기</span>`;
          if (t.status === 'in_progress') statusBadge = `<span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">진행 중</span>`;
          else if (t.status === 'done') statusBadge = `<span class="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold shrink-0">완료</span>`;
          else if (t.status === 'draft') statusBadge = `<span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold shrink-0">임시저장</span>`;

          return `
              <div class="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/10 hover:bg-surface-container-low active:scale-98 transition-all cursor-pointer group text-left shadow-2xs" onclick="App.openTodoDetailModal(${t.id})">
                <button type="button" onclick="event.stopPropagation(); App.toggleTodoStatus(${t.id});" class="shrink-0 ${checkColor} hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-xl">${checkIcon}</span>
                </button>
                ${priorityDot}
                <div class="flex-1 min-w-0 flex items-center gap-2">
                  <span class="font-headline text-sm font-semibold ${isDoneClass} truncate group-hover:text-primary transition-colors">${t.title}</span>
                </div>
                ${statusBadge}
                <span class="text-[10px] text-on-surface-variant font-medium whitespace-nowrap shrink-0">${t.dueDate || ''}</span>
                <button type="button" onclick="event.stopPropagation(); App.editTodo(${t.id});" class="shrink-0 p-1 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>
              </div>
            `;
        }).join('')}
        `;
        return;
      }

      // 2. 메인 프로젝트 목록 뷰 (한 줄 간략 모드일 때 프로젝트 단위로 표출 & 클릭 시 프로젝트 진입!)
      const projectsMap = {};
      list.forEach(t => {
        const projName = t.project || '일반 업무';
        if (!projectsMap[projName]) projectsMap[projName] = [];
        projectsMap[projName].push(t);
      });

      const projectNames = Object.keys(projectsMap);

      if (projectNames.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <span class="material-symbols-outlined text-3xl text-on-surface-variant opacity-60 mb-2">task</span>
            <h3 class="font-headline text-base font-bold text-on-surface mb-1">등록된 할 일이 없습니다</h3>
            <p class="text-xs text-on-surface-variant max-w-xs">새로운 미션을 작성하거나 다른 검색 조건으로 조회해 보세요.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = projectNames.map(projName => {
        const items = projectsMap[projName];
        const todoCount = items.filter(t => t.status === 'todo' || t.status === 'draft').length;
        const inProgressCount = items.filter(t => t.status === 'in_progress').length;
        const doneCount = items.filter(t => t.status === 'done').length;

        return `
          <div class="flex items-center justify-between bg-surface-container-lowest rounded-xl px-4 py-3.5 border border-outline-variant/10 hover:bg-surface-container-low active:scale-98 transition-all cursor-pointer group text-left shadow-2xs" onclick="App.selectProject('${projName.replace(/'/g, "\\'")}')">
            <div class="flex items-center gap-3 min-w-0 flex-1 mr-3">
              <span class="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">folder_open</span>
              <h3 class="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">${projName}</h3>
            </div>
            
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant">
                <span class="px-2 py-0.5 rounded-full bg-surface-container">대기 ${todoCount}</span>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">진행 중 ${inProgressCount}</span>
                <span class="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold">완료 ${doneCount}</span>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant text-base group-hover:translate-x-1 transition-transform ml-1">chevron_right</span>
            </div>
          </div>
        `;
      }).join('');
      return;
    }

    // -------------------------------------------------------------
    // CASE A: 특정 프로젝트가 선택된 상태 -> 대기 / 진행 중 / 완료 세로 배치 & 각 행별 가로 스크롤 뷰
    // -------------------------------------------------------------
    if (selectedProject) {
      const projectTodos = list.filter(t => (t.project || '일반 업무') === selectedProject);

      // 상단 뒤로가기 헤더 바
      const backHeaderHtml = `
        <div class="w-full flex items-center justify-between bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/15 shadow-2xs mb-2">
          <button type="button" onclick="App.clearSelectedProject()" class="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            <span>모든 프로젝트 목록</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="font-headline font-bold text-sm text-on-surface"># ${selectedProject}</span>
            <span class="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full">${projectTodos.length}개</span>
            <button type="button" onclick="App.openTodoModal()" class="ml-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 hover:bg-primary-dim active:scale-95 transition-all shadow-xs">
              <span class="material-symbols-outlined text-sm">add</span>
              <span>미션 등록</span>
            </button>
          </div>
        </div>
      `;

      // 3개 카테고리 분리 (대기, 진행 중, 완료)
      const todoList = projectTodos.filter(t => t.status === 'todo' || t.status === 'draft');
      const inProgressList = projectTodos.filter(t => t.status === 'in_progress');
      const doneList = projectTodos.filter(t => t.status === 'done');

      const renderCard = (t) => {
        const isDone = t.status === 'done';
        const isDoneClass = isDone ? 'line-through text-on-surface-variant opacity-70' : 'text-on-surface';

        let priorityBadgeHtml = '';
        if (t.priority === 'high') {
          priorityBadgeHtml = `<span class="bg-error/10 text-error text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-error"></span>높음</span>`;
        } else if (t.priority === 'low') {
          priorityBadgeHtml = `<span class="bg-surface-container-high text-on-surface-variant text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-outline"></span>낮음</span>`;
        } else {
          priorityBadgeHtml = `<span class="bg-tertiary/10 text-tertiary text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>보통</span>`;
        }

        let statusBadgeHtml = `<span class="bg-surface-container-high text-on-surface-variant text-[11px] font-bold px-2.5 py-0.5 rounded-full">대기</span>`;
        if (t.status === 'in_progress') {
          statusBadgeHtml = `<span class="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full">진행 중</span>`;
        } else if (t.status === 'done') {
          statusBadgeHtml = `<span class="bg-secondary/10 text-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full">완료</span>`;
        } else if (t.status === 'draft') {
          statusBadgeHtml = `<span class="bg-surface-container-high text-on-surface-variant text-[11px] font-bold px-2.5 py-0.5 rounded-full">임시저장</span>`;
        }

        const assigneesHtml = (t.assignees || []).map((a, idx) => `
          <img alt="${a.name}" src="${a.avatar || 'profile.png'}" class="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover z-${10 - idx}" title="${a.name}" />
        `).join('');

        return `
          <div class="kanban-card-item bg-surface-container-lowest p-4 rounded-2xl flex flex-col gap-3 group relative cursor-pointer border border-outline-variant/10 shadow-[0_2px_12px_rgba(35,44,81,0.03)] hover:shadow-[0_8px_24px_rgba(35,44,81,0.08)] transition-all text-left shrink-0 active:scale-98" onclick="App.openTodoDetailModal(${t.id})">
            <div class="flex items-center gap-2 flex-wrap">
              ${statusBadgeHtml}
              ${priorityBadgeHtml}
            </div>
            <h3 class="font-headline font-semibold text-sm leading-snug group-hover:text-primary transition-colors ${isDoneClass}">${t.title}</h3>
            ${t.notes ? `<p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${t.notes}</p>` : ''}
            
            <div class="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/10">
              <div class="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-medium">
                <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                <span>${t.dueDate || '마감일 미정'}</span>
              </div>
              <div class="flex -space-x-2 items-center">
                ${assigneesHtml || '<div class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">ME</div>'}
              </div>
            </div>
          </div>
        `;
      };

      container.className = "flex flex-col gap-6";
      container.innerHTML = `
        ${backHeaderHtml}
        
        <!-- Row 1: 대기 (To-Do) -->
        <section class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between px-1">
            <h2 class="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-outline"></span>
              대기
              <span class="bg-surface-container-high text-on-surface-variant text-xs font-bold py-0.5 px-2.5 rounded-full">${todoList.length}</span>
            </h2>
          </div>
          ${todoList.length > 0 ? `
            <div class="kanban-row-scroll-container no-scrollbar">
              ${todoList.map(renderCard).join('')}
            </div>
          ` : `
            <div class="bg-surface-container-low rounded-2xl p-5 text-center text-on-surface-variant text-xs font-medium border border-dashed border-outline-variant/30">
              대기 중인 할 일이 없습니다.
            </div>
          `}
        </section>

        <!-- Row 2: 진행 중 (In Progress) -->
        <section class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between px-1">
            <h2 class="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              진행 중
              <span class="bg-primary/10 text-primary text-xs font-bold py-0.5 px-2.5 rounded-full">${inProgressList.length}</span>
            </h2>
          </div>
          ${inProgressList.length > 0 ? `
            <div class="kanban-row-scroll-container no-scrollbar">
              ${inProgressList.map(renderCard).join('')}
            </div>
          ` : `
            <div class="bg-surface-container-low rounded-2xl p-5 text-center text-on-surface-variant text-xs font-medium border border-dashed border-outline-variant/30">
              진행 중인 할 일이 없습니다.
            </div>
          `}
        </section>

        <!-- Row 3: 완료 (Done) -->
        <section class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between px-1">
            <h2 class="font-headline font-bold text-base text-on-surface-variant flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              완료
              <span class="bg-secondary/10 text-secondary text-xs font-bold py-0.5 px-2.5 rounded-full">${doneList.length}</span>
            </h2>
          </div>
          ${doneList.length > 0 ? `
            <div class="kanban-row-scroll-container no-scrollbar opacity-90">
              ${doneList.map(renderCard).join('')}
            </div>
          ` : `
            <div class="bg-surface-container-low rounded-2xl p-5 text-center text-on-surface-variant text-xs font-medium border border-dashed border-outline-variant/30">
              완료된 할 일이 없습니다.
            </div>
          `}
        </section>
      `;
      setTimeout(() => this.initKanbanDragScroll(), 0);
      return;
    }

    // -------------------------------------------------------------
    // CASE B: 프로젝트 목록 뷰 (기존 처럼 프로젝트별로 다 보여주는 메인 카드 목록)
    // -------------------------------------------------------------
    if (list.length === 0) {
      container.className = "flex flex-col gap-4";
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
          <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-3 text-on-surface-variant opacity-60">
            <span class="material-symbols-outlined text-3xl">task</span>
          </div>
          <h3 class="font-headline text-base font-bold text-on-surface mb-1">등록된 할 일이 없습니다</h3>
          <p class="text-xs text-on-surface-variant max-w-xs">새로운 미션을 작성하거나 다른 검색 조건으로 조회해 보세요.</p>
        </div>
      `;
      return;
    }

    // 프로젝트별 그룹핑
    const projectsMap = {};
    list.forEach(t => {
      const projName = t.project || '일반 업무';
      if (!projectsMap[projName]) {
        projectsMap[projName] = [];
      }
      projectsMap[projName].push(t);
    });

    const projectNames = Object.keys(projectsMap);

    container.className = "flex flex-col gap-4";
    container.innerHTML = projectNames.map(projName => {
      const items = projectsMap[projName];
      const todoCount = items.filter(t => t.status === 'todo' || t.status === 'draft').length;
      const inProgressCount = items.filter(t => t.status === 'in_progress').length;
      const doneCount = items.filter(t => t.status === 'done').length;

      // 미리보기용 최근 2개 업무
      const previewItemsHtml = items.slice(0, 2).map(t => {
        const isDone = t.status === 'done';
        const isDoneClass = isDone ? 'line-through opacity-60' : '';
        return `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/10 last:border-none">
            <span class="font-medium text-on-surface truncate ${isDoneClass}">${t.title}</span>
            <span class="text-[10px] text-on-surface-variant shrink-0 ml-2">${t.dueDate || ''}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3.5 border border-outline-variant/10 shadow-[0_2px_12px_rgba(35,44,81,0.03)] hover:shadow-[0_8px_24px_rgba(35,44,81,0.08)] active:scale-98 transition-all cursor-pointer group text-left" onclick="App.selectProject('${projName.replace(/'/g, "\\'")}')">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">folder_open</span>
              <h3 class="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">${projName}</h3>
            </div>
            <div class="flex items-center gap-1 text-on-surface-variant">
              <span class="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">${items.length}개 업무</span>
              <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>

          <!-- 진행도 요약 칩 바 -->
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">대기 ${todoCount}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">진행 중 ${inProgressCount}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">완료 ${doneCount}</span>
          </div>

          <!-- 최근 업무 미리보기 -->
          <div class="bg-surface-container-low p-3 rounded-md flex flex-col">
            ${previewItemsHtml}
          </div>
        </div>
      `;
    }).join('');
  },

  setTodoViewMode(mode, btnEl) {
    this.state.todoViewMode = mode;
    // Toggle button active states
    const toggleContainer = document.getElementById('todo-view-toggle');
    if (toggleContainer) {
      toggleContainer.querySelectorAll('.todo-view-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-on-primary');
        btn.classList.add('text-on-surface-variant');
      });
    }
    if (btnEl) {
      btnEl.classList.remove('text-on-surface-variant');
      btnEl.classList.add('bg-primary', 'text-on-primary');
    }
    this.renderTodos();
  },

  renderRecentProjectChips() {
    const container = document.getElementById('recent-projects-chips');
    if (!container) return;

    const list = this.state.recentProjects || ['그룹웨어 고도화', '근태관리 시스템', '디자인 시스템 (M3)', '경영지원 / 재무'];
    container.innerHTML = list.map(p => `
      <button type="button" onclick="App.selectRecentProject('${p}')" class="recent-project-chip px-3 py-1.5 rounded-lg bg-surface-container-highest/60 border border-outline-variant/15 text-on-surface font-label text-xs font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95 transition-all">
        ${p}
      </button>
    `).join('');
  },

  selectRecentProject(projName) {
    const input = document.getElementById('todo-input-project');
    if (input) {
      input.value = projName;
      input.focus();
    }
    this.showToast(`프로젝트 '${projName}'가 선택되었습니다.`);
  },

  addRecentProject(projName) {
    if (!projName) return;
    let list = this.state.recentProjects || [];
    list = list.filter(p => p !== projName);
    list.unshift(projName);
    this.state.recentProjects = list.slice(0, 8); // 최대 8개까지 최근 프로젝트 보관
  },

  setTodoFilter(filterType, btnEl) {
    this.state.todosFilter = filterType;
    const chips = document.querySelectorAll('#todo-filter-chips .todo-chip');
    chips.forEach(c => {
      c.classList.remove('active', 'bg-primary', 'text-on-primary');
      c.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    if (btnEl) {
      btnEl.classList.remove('bg-surface-container', 'text-on-surface-variant');
      btnEl.classList.add('active', 'bg-primary', 'text-on-primary');
    }
    this.renderTodos();
  },

  filterTodos() {
    const input = document.getElementById('todo-search-input');
    if (input) {
      this.state.todosSearchQuery = input.value;
    }
    this.renderTodos();
  },

  toggleTodoStatus(todoId) {
    const todo = (this.state.todos || []).find(t => t.id === todoId);
    if (!todo) return;
    if (todo.status === 'done') {
      todo.status = 'in_progress';
      this.showToast('할 일이 진행 중 상태로 전환되었습니다.');
    } else {
      todo.status = 'done';
      this.showToast('🎉 할 일이 완료 처리되었습니다!');
    }
    this.saveState();
    this.renderTodos();
    this.renderTodayData();
  },

  requestDeleteTodo(todoId) {
    this.state.pendingDeleteTodoId = todoId;
    const modal = document.getElementById('modal-todo-delete-confirm');
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  closeTodoDeleteModal() {
    this.state.pendingDeleteTodoId = null;
    const modal = document.getElementById('modal-todo-delete-confirm');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  confirmDeleteTodo() {
    const todoId = this.state.pendingDeleteTodoId;
    if (todoId) {
      const todoIdx = (this.state.todos || []).findIndex(t => t.id === todoId);
      if (todoIdx !== -1) {
        const item = this.state.todos.splice(todoIdx, 1)[0];
        const nowStr = new Date().toISOString().split('T')[0];
        item.deletedAt = nowStr;
        if (!this.state.trashedTodos) this.state.trashedTodos = [];
        this.state.trashedTodos.unshift(item);

        this.saveState();
        this.renderTodos();
        this.updateTrashCount();
        this.showToast('🗑️ 할 일이 휴지통으로 이동되었습니다.');
      }
    }
    this.closeTodoDeleteModal();
  },

  updateTrashCount() {
    const trashCountEl = document.getElementById('todo-trash-count');
    if (trashCountEl) {
      const count = (this.state.trashedTodos || []).length;
      trashCountEl.textContent = count;
    }
  },

  openTodoTrashModal() {
    const modal = document.getElementById('modal-todo-trash');
    if (!modal) return;
    this.renderTrashTodos();
    this.updateTrashCount();
    modal.classList.remove('hidden');
  },

  closeTodoTrashModal() {
    const modal = document.getElementById('modal-todo-trash');
    if (modal) modal.classList.add('hidden');
  },

  renderTrashTodos() {
    const container = document.getElementById('todo-trash-list-container');
    if (!container) return;

    const list = this.state.trashedTodos || [];
    this.updateTrashCount();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10">
          <div class="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-on-surface-variant opacity-60">
            <span class="material-symbols-outlined text-4xl">auto_delete</span>
          </div>
          <h3 class="font-headline text-lg font-bold text-on-surface mb-1">휴지통이 비어 있습니다</h3>
          <p class="text-xs text-on-surface-variant max-w-xs">삭제된 할 일 항목이 여기에 안전하게 보관됩니다.</p>
        </div>
      `;
      return;
    }

    const selectedSet = new Set(this.state.selectedTrashIds || []);

    container.innerHTML = list.map(t => {
      const isChecked = selectedSet.has(t.id) ? 'checked' : '';
      return `
        <div class="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3 group transition-transform hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(35,44,81,0.03)] border border-outline-variant/10 text-left">
          <div class="flex items-start justify-between gap-4">
            <label class="pt-0.5 cursor-pointer select-none">
              <input type="checkbox" ${isChecked} onchange="App.toggleTrashSelect(${t.id})" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"/>
            </label>
            <div class="flex-1 flex flex-col text-left">
              <h3 class="font-body text-base font-bold text-on-surface line-through opacity-70 leading-tight">${t.title}</h3>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span class="text-xs text-on-surface-variant font-medium">삭제일: ${t.deletedAt || '방금 전'}</span>
                ${t.project ? `<span class="text-[11px] text-outline font-medium"># ${t.project}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-1 border-t border-outline-variant/10 pt-3">
            <button type="button" onclick="App.restoreTodoFromTrash(${t.id})" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold transition-colors">
              <span class="material-symbols-outlined text-base">settings_backup_restore</span>
              <span>복구</span>
            </button>
            <button type="button" onclick="App.permaDeleteFromTrash(${t.id})" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error/10 hover:bg-error/20 text-error text-xs font-bold transition-colors">
              <span class="material-symbols-outlined text-base">delete</span>
              <span>영구 삭제</span>
            </button>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="mt-4 rounded-2xl overflow-hidden relative h-28 flex items-center justify-center bg-surface-container-low border border-outline-variant/10">
        <p class="relative z-10 font-label text-xs text-on-surface-variant font-bold tracking-wide">삭제 항목 끝</p>
      </div>
    `;
  },

  toggleTrashSelect(todoId) {
    if (!this.state.selectedTrashIds) this.state.selectedTrashIds = [];
    const idx = this.state.selectedTrashIds.indexOf(todoId);
    if (idx === -1) {
      this.state.selectedTrashIds.push(todoId);
    } else {
      this.state.selectedTrashIds.splice(idx, 1);
    }
  },

  toggleSelectAllTrash(checkboxEl) {
    if (!checkboxEl) return;
    if (checkboxEl.checked) {
      this.state.selectedTrashIds = (this.state.trashedTodos || []).map(t => t.id);
    } else {
      this.state.selectedTrashIds = [];
    }
    this.renderTrashTodos();
  },

  restoreTodoFromTrash(todoId) {
    const idx = (this.state.trashedTodos || []).findIndex(t => t.id === todoId);
    if (idx !== -1) {
      const item = this.state.trashedTodos.splice(idx, 1)[0];
      delete item.deletedAt;
      item.status = 'in_progress';
      if (!this.state.todos) this.state.todos = [];
      this.state.todos.unshift(item);

      this.saveState();
      this.renderTodos();
      this.renderTrashTodos();
      this.showToast('♻️ 할 일이 성공적으로 복구되었습니다.');
    }
  },

  permaDeleteFromTrash(todoId) {
    if (!confirm('정말로 이 항목을 영구 삭제하시겠습니까? (복구 불가능)')) return;
    this.state.trashedTodos = (this.state.trashedTodos || []).filter(t => t.id !== todoId);
    this.saveState();
    this.renderTrashTodos();
    this.showToast('할 일이 영구 삭제되었습니다.');
  },

  emptyTodoTrash() {
    if ((!this.state.trashedTodos || this.state.trashedTodos.length === 0)) {
      this.showToast('휴지통이 이미 비어 있습니다.');
      return;
    }
    if (!confirm('휴지통의 모든 항목을 영구 비우시겠습니까?')) return;
    this.state.trashedTodos = [];
    this.state.selectedTrashIds = [];
    this.saveState();
    this.renderTrashTodos();
    this.showToast('🗑️ 휴지통이 깨끗이 비워졌습니다.');
  },

  // To-Do Detail Read-Only View Modal Methods
  openTodoDetailModal(todoId) {
    const modal = document.getElementById('modal-todo-detail');
    const container = document.getElementById('todo-detail-content');
    const actionBtnText = document.getElementById('todo-detail-action-btn-text');
    if (!modal || !container) return;

    const todo = (this.state.todos || []).find(t => t.id === todoId) ||
      (this.state.trashedTodos || []).find(t => t.id === todoId);
    if (!todo) return;

    this.state.currentDetailTodoId = todo.id;

    // Status Badge
    let statusBadgeHtml = '';
    if (todo.status === 'in_progress') {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-label text-xs font-bold">진행 중</span>`;
    } else if (todo.status === 'done') {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label text-xs font-bold">완료</span>`;
    } else if (todo.status === 'draft') {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label text-xs font-bold">임시저장</span>`;
    } else {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label text-xs font-bold">${todo.status || '대기'}</span>`;
    }

    // Priority Badge
    let priorityBadgeHtml = '';
    if (todo.priority === 'high') {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-error/10 text-error font-label text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>높음</span>`;
    } else if (todo.priority === 'low') {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label text-xs font-bold">낮음</span>`;
    } else {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5"></span>보통</span>`;
    }

    // Assignees Stack (주소록 연동)
    const assigneesHtml = (todo.assignees || [
      { name: '이재광', avatar: 'profile.png' }
    ]).map((a) => {
      const emp = this.getEmployeeByName(a.name);
      const displayName = emp ? `${emp.name} ${emp.role}` : a.name;
      const avatarSrc = emp ? emp.avatar : (a.avatar || 'profile.png');
      const deptText = emp ? `<span class="text-[10px] text-on-surface-variant font-normal">(${emp.dept})</span>` : '';
      return `
        <div class="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/15">
          <img src="${avatarSrc}" class="w-6 h-6 rounded-full object-cover" />
          <span class="text-xs font-bold text-on-surface">${displayName}</span>
          ${deptText}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Header Tags & Title -->
      <section class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          ${statusBadgeHtml}
          ${priorityBadgeHtml}
          ${todo.project ? `<span class="text-on-surface-variant font-label text-xs ml-auto font-bold bg-surface-container-low px-3 py-1 rounded-full"># ${todo.project}</span>` : ''}
        </div>
        <h1 class="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight tracking-tight mt-1">
          ${todo.title}
        </h1>
      </section>

      <!-- Meta Data Card -->
      <section class="bg-surface-container-lowest rounded-lg p-5 flex flex-col gap-4 shadow-sm border border-outline-variant/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span class="material-symbols-outlined text-xl">calendar_today</span>
          </div>
          <div class="flex flex-col text-left">
            <span class="font-label text-[11px] text-on-surface-variant font-bold tracking-wider">마감일</span>
            <span class="font-body text-sm font-semibold text-on-surface mt-0.5">${todo.dueDate || '마감일 미정'}</span>
          </div>
        </div>

        <div class="w-full h-px bg-outline-variant/15"></div>

        <div class="flex flex-col gap-2 text-left">
          <span class="font-label text-[11px] text-on-surface-variant font-bold tracking-wider">담당자</span>
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            ${assigneesHtml}
          </div>
        </div>
      </section>

      <!-- Attachments Section (공지사항 상세 디자인 통일) -->
      <section class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-3 text-left">
        <h3 class="font-headline text-base font-bold text-on-surface flex items-center justify-between">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">attach_file</span>
            <span>첨부파일 (${(todo.files || []).length > 0 ? todo.files.length : (todo.hasAttachment ? 1 : 0)})</span>
          </span>
        </h3>
        <div class="flex flex-col gap-2">
          ${(todo.files || []).length > 0 ? todo.files.map(f => `
            <div class="flex items-center justify-between bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-3.5 group cursor-pointer" onclick="App.showToast('📥 [${f.name}] 첨부파일 다운로드가 시작되었습니다.')">
              <div class="flex items-center gap-3 truncate">
                <span class="material-symbols-outlined text-primary text-2xl">description</span>
                <div class="flex flex-col truncate">
                  <span class="font-body text-xs font-bold text-on-surface truncate">${f.name}</span>
                  <span class="font-label text-[11px] text-on-surface-variant">${f.size || '1.2 MB'} • 등록완료</span>
                </div>
              </div>
              <button type="button" class="bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0" title="다운로드">
                <span class="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          `).join('') : (todo.hasAttachment ? `
            <div class="flex items-center justify-between bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-3.5 group cursor-pointer" onclick="App.showToast('📥 [${todo.title}_기획안.pdf] 첨부파일 다운로드가 시작되었습니다.')">
              <div class="flex items-center gap-3 truncate">
                <span class="material-symbols-outlined text-primary text-2xl">description</span>
                <div class="flex flex-col truncate">
                  <span class="font-body text-xs font-bold text-on-surface truncate">${todo.title}_관련자료.pdf</span>
                  <span class="font-label text-[11px] text-on-surface-variant">2.4 MB • 업무 첨부문서</span>
                </div>
              </div>
              <button type="button" class="bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0" title="다운로드">
                <span class="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          ` : `
            <div class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 text-xs text-on-surface-variant flex items-center justify-center text-center min-h-[70px]">
              등록된 첨부파일이 없습니다.
            </div>
          `)}
        </div>
      </section>

      <!-- Description Section -->
      <section class="flex flex-col gap-2.5 text-left">
        <h3 class="font-headline text-base font-bold text-on-surface">상세 내용</h3>
        <div class="bg-surface-container-low rounded-lg p-5 border border-outline-variant/10">
          <p class="font-body text-sm leading-relaxed text-on-surface whitespace-pre-line">
            ${todo.notes || '작성된 상세 설명 내용이 없습니다.'}
          </p>
        </div>
      </section>

      <!-- Activity Timeline -->
      <section class="flex flex-col gap-3 text-left">
        <h3 class="font-headline text-base font-bold text-on-surface">작업 히스토리</h3>
        <div class="flex flex-col gap-3 relative pl-2">
          <div class="flex gap-3 relative z-10 items-start">
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-base">edit_note</span>
            </div>
            <div class="flex flex-col bg-surface-container-lowest rounded-xl p-3.5 w-full border border-outline-variant/10 text-left">
              <div class="flex items-center justify-between">
                <span class="font-headline text-xs font-bold text-on-surface">${todo.assignees?.[0]?.name || '이재광'}</span>
                <span class="font-label text-[10px] text-on-surface-variant">방금 전</span>
              </div>
              <p class="font-body text-xs text-on-surface-variant mt-1">
                할 일이 성공적으로 생성 및 갱신되었습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;

    if (actionBtnText) {
      actionBtnText.textContent = todo.status === 'done' ? '진행 중 상태로 변경' : '완료 처리하기';
    }

    modal.classList.remove('hidden');
  },

  closeTodoDetailModal() {
    const modal = document.getElementById('modal-todo-detail');
    if (modal) modal.classList.add('hidden');
    this.state.currentDetailTodoId = null;
  },

  editCurrentDetailTodo() {
    const todoId = this.state.currentDetailTodoId;
    if (todoId) {
      this.closeTodoDetailModal();
      this.editTodo(todoId);
    }
  },

  toggleDetailTodoStatus() {
    const todoId = this.state.currentDetailTodoId;
    if (todoId) {
      this.toggleTodoStatus(todoId);
      this.openTodoDetailModal(todoId);
    }
  },

  openTodoModal(todoToEdit = null) {
    const modal = document.getElementById('modal-todo-write');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-todo-write-title');
    const modalSubtitle = document.getElementById('modal-todo-write-subtitle');
    const projectContainer = document.getElementById('todo-project-input-container');
    const idInput = document.getElementById('todo-input-id');
    const titleInput = document.getElementById('todo-input-title');
    const projectInput = document.getElementById('todo-input-project');
    const notesInput = document.getElementById('todo-input-notes');
    const dateInput = document.getElementById('todo-input-date');

    const selectedProj = this.state.selectedProject;

    if (todoToEdit) {
      if (modalTitle) modalTitle.textContent = todoToEdit.status === 'draft' ? '임시저장 수정' : '할 일 / 미션 수정';
      if (modalSubtitle) modalSubtitle.textContent = todoToEdit.project ? `'${todoToEdit.project}'의 세부 미션을 수정합니다.` : '업무 항목을 수정합니다.';
      if (idInput) idInput.value = todoToEdit.id;
      if (titleInput) titleInput.value = todoToEdit.title || '';
      if (projectInput) projectInput.value = todoToEdit.project || '';
      if (notesInput) notesInput.value = todoToEdit.notes || '';
      this.setTodoPriorityForm(todoToEdit.priority || 'medium');
      this.setTodoStatusForm(todoToEdit.status || 'todo');

      if (selectedProj) {
        if (projectContainer) projectContainer.classList.add('hidden');
      } else {
        if (projectContainer) projectContainer.classList.remove('hidden');
      }
    } else {
      if (idInput) idInput.value = '';
      if (titleInput) titleInput.value = '';
      if (notesInput) notesInput.value = '';
      if (dateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.value = todayStr;
      }
      this.setTodoPriorityForm('medium');
      this.setTodoStatusForm('todo');

      if (selectedProj) {
        // [프로젝트 내부에서 등록] 프로젝트 선택 입력창 숨김 & 현재 프로젝트명 자동 할당
        if (modalTitle) modalTitle.textContent = '프로젝트 내 미션 등록';
        if (modalSubtitle) modalSubtitle.textContent = `'${selectedProj}' 프로젝트 내 신규 업무 미션을 등록합니다.`;
        if (projectInput) projectInput.value = selectedProj;
        if (projectContainer) projectContainer.classList.add('hidden');
      } else {
        // [프로젝트 메인 화면에서 등록] 프로젝트명 직접 입력 노출
        if (modalTitle) modalTitle.textContent = '신규 프로젝트 / 업무 등록';
        if (modalSubtitle) modalSubtitle.textContent = '새로운 프로젝트명 및 할 일 미션을 등록합니다.';
        if (projectInput) projectInput.value = '';
        if (projectContainer) projectContainer.classList.remove('hidden');
      }
    }

    this.renderRecentProjectChips();
    modal.classList.remove('hidden');
  },

  editTodo(todoId) {
    const todo = (this.state.todos || []).find(t => t.id === todoId);
    if (todo) {
      this.openTodoModal(todo);
    }
  },

  editDraftTodo(todoId) {
    this.editTodo(todoId);
  },

  closeTodoModal() {
    const modal = document.getElementById('modal-todo-write');
    if (modal) modal.classList.add('hidden');
  },

  setTodoStatusForm(statusVal, btnEl) {
    const statusInput = document.getElementById('todo-input-status');
    const customInput = document.getElementById('todo-input-custom-status');
    if (statusInput) statusInput.value = statusVal;

    const btns = document.querySelectorAll('.todo-status-btn');
    btns.forEach(b => {
      b.classList.remove('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
      b.classList.add('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
    });

    if (btnEl) {
      btnEl.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
      btnEl.classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
    } else {
      if (statusVal === 'todo' && btns[0]) {
        btns[0].classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
        btns[0].classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
      } else if (statusVal === 'in_progress' && btns[1]) {
        btns[1].classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
        btns[1].classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
      } else if (statusVal === 'done' && btns[2]) {
        btns[2].classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
        btns[2].classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
      } else if (customInput) {
        customInput.value = statusVal;
      }
    }
  },

  applyCustomStatusFromInput() {
    const customInput = document.getElementById('todo-input-custom-status');
    const customVal = customInput ? customInput.value.trim() : '';
    if (!customVal) {
      alert('등록할 상태명을 입력하세요.');
      return;
    }
    this.setTodoStatusForm(customVal);
    this.showToast(`📌 상태 '${customVal}'이(가) 설정되었습니다.`);
  },

  setTodoPriorityForm(priority, btnEl) {
    this.state.todoFormPriority = priority;
    const priorityInput = document.getElementById('todo-input-priority');
    if (priorityInput) priorityInput.value = priority;

    const btns = document.querySelectorAll('.todo-priority-btn');
    btns.forEach(b => {
      b.classList.remove('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
      b.classList.add('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
    });

    if (btnEl) {
      btnEl.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/15');
      btnEl.classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'border-primary', 'shadow-xs');
    }
  },

  triggerTodoFileUpload() {
    this.showToast('파일 첨부 기능: 파일이 첨부되었습니다 (demo.pdf).');
  },

  saveTodoDraft() {
    const idInput = document.getElementById('todo-input-id');
    const titleInput = document.getElementById('todo-input-title');
    const projectInput = document.getElementById('todo-input-project');
    const priorityInput = document.getElementById('todo-input-priority');
    const dateInput = document.getElementById('todo-input-date');
    const timeInput = document.getElementById('todo-input-time');
    const notesInput = document.getElementById('todo-input-notes');
    const statusInput = document.getElementById('todo-input-status');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      alert('임시저장을 위해 할 일 제목을 입력해주세요.');
      return;
    }

    const existingId = idInput ? parseInt(idInput.value) : null;
    const project = projectInput ? projectInput.value.trim() : '기타 업무';
    const priority = priorityInput ? priorityInput.value : 'medium';
    const dateVal = dateInput && dateInput.value ? dateInput.value : '오늘';
    const timeVal = timeInput && timeInput.value ? timeInput.value : '18:00';
    const notes = notesInput ? notesInput.value.trim() : '';
    const status = statusInput ? statusInput.value : 'draft';

    if (project) this.addRecentProject(project);

    if (existingId) {
      const idx = (this.state.todos || []).findIndex(t => t.id === existingId);
      if (idx !== -1) {
        this.state.todos[idx] = {
          ...this.state.todos[idx],
          title,
          project,
          priority,
          dueDate: `${dateVal}, ${timeVal}`,
          notes,
          status
        };
      }
    } else {
      const newDraft = {
        id: Date.now(),
        title,
        project,
        status,
        priority,
        dueDate: `${dateVal}, ${timeVal}`,
        assignees: [
          { name: this.state.user.name || '이재광', avatar: 'profile.png' }
        ],
        isOverdue: false,
        isMine: true,
        notes
      };
      if (!this.state.todos) this.state.todos = [];
      this.state.todos.unshift(newDraft);
    }

    this.saveState();
    this.closeTodoModal();
    this.renderTodos();
    this.showToast('📝 할 일이 임시저장되었습니다.');
  },

  submitTodoModal() {
    const idInput = document.getElementById('todo-input-id');
    const titleInput = document.getElementById('todo-input-title');
    const projectInput = document.getElementById('todo-input-project');
    const priorityInput = document.getElementById('todo-input-priority');
    const dateInput = document.getElementById('todo-input-date');
    const timeInput = document.getElementById('todo-input-time');
    const notesInput = document.getElementById('todo-input-notes');
    const statusInput = document.getElementById('todo-input-status');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      alert('할 일 제목을 입력해주세요.');
      return;
    }

    const existingId = idInput ? parseInt(idInput.value) : null;
    const project = projectInput ? projectInput.value.trim() : '기타 업무';
    const priority = priorityInput ? priorityInput.value : 'medium';
    const dateVal = dateInput && dateInput.value ? dateInput.value : '오늘';
    const timeVal = timeInput && timeInput.value ? timeInput.value : '18:00';
    const notes = notesInput ? notesInput.value.trim() : '';
    const status = statusInput ? statusInput.value : 'todo';

    if (project) this.addRecentProject(project);

    if (existingId) {
      const idx = (this.state.todos || []).findIndex(t => t.id === existingId);
      if (idx !== -1) {
        this.state.todos[idx] = {
          ...this.state.todos[idx],
          title,
          project,
          priority,
          dueDate: `${dateVal}, ${timeVal}`,
          notes,
          status
        };
      }
    } else {
      const newTodo = {
        id: Date.now(),
        title,
        project,
        status,
        priority,
        dueDate: `${dateVal}, ${timeVal}`,
        assignees: [
          { name: this.state.user.name || '이재광', avatar: 'profile.png' }
        ],
        isOverdue: false,
        isMine: true,
        notes
      };
      if (!this.state.todos) this.state.todos = [];
      this.state.todos.unshift(newTodo);
    }

    this.saveState();
    this.closeTodoModal();
    this.renderTodos();
    this.showToast('🚀 새로운 할 일이 성공적으로 등록되었습니다!');
  },

  // =========================================
  // 전사 프로젝트 관리 모듈 (Projects Management)
  // =========================================
  setProjectFilter(filterKey, chipEl) {
    this.state.projectsFilter = filterKey;
    const chips = document.querySelectorAll('.project-chip');
    chips.forEach(c => {
      c.classList.remove('bg-primary', 'text-on-primary', 'active');
      c.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    if (chipEl) {
      chipEl.classList.remove('bg-surface-container', 'text-on-surface-variant');
      chipEl.classList.add('bg-primary', 'text-on-primary', 'active');
    }
    this.renderProjects();
  },

  filterProjects() {
    const input = document.getElementById('project-search-input');
    this.state.projectsSearchQuery = input ? input.value : '';
    this.renderProjects();
  },

  setProjectViewMode(mode, btnEl) {
    this.state.projectViewMode = mode;
    const btns = document.querySelectorAll('.project-view-btn');
    btns.forEach(b => {
      b.classList.remove('bg-primary', 'text-on-primary');
      b.classList.add('text-on-surface-variant');
    });
    if (btnEl) {
      btnEl.classList.remove('text-on-surface-variant');
      btnEl.classList.add('bg-primary', 'text-on-primary');
    }
    this.renderProjects();
  },

  renderProjects() {
    const container = document.getElementById('project-list-container');
    const totalCountEl = document.getElementById('project-total-count');
    if (!container) return;

    let list = [...(this.state.projects || (window.MockData && window.MockData.projects) || [])];
    const filter = this.state.projectsFilter || 'all';
    const query = (this.state.projectsSearchQuery || '').toLowerCase().trim();

    // 1. 상태 및 탭 필터링
    if (filter === 'in_progress') {
      list = list.filter(p => p.status === 'in_progress');
    } else if (filter === 'maintenance') {
      list = list.filter(p => p.status === 'maintenance');
    } else if (filter === 'build') {
      list = list.filter(p => p.status === 'build');
    } else if (filter === 'my') {
      const myName = this.state.user?.name || '이재광';
      list = list.filter(p => (p.pm && p.pm.includes(myName)) || (p.author && p.author.includes(myName)));
    }

    // 2. 통합 검색 필터링
    if (query) {
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.projectId && p.projectId.toLowerCase().includes(query)) ||
        (p.siteName && p.siteName.toLowerCase().includes(query)) ||
        (p.siteId && p.siteId.toLowerCase().includes(query)) ||
        (p.pm && p.pm.toLowerCase().includes(query)) ||
        (p.author && p.author.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    if (totalCountEl) {
      totalCountEl.textContent = `총 ${list.length}개`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-2xs">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant opacity-60 mb-2">folder_off</span>
          <h3 class="font-headline text-base font-bold text-on-surface mb-1">검색된 프로젝트가 없습니다</h3>
          <p class="text-xs text-on-surface-variant max-w-xs">다른 검색어를 입력하거나 필터를 변경해 보세요.</p>
        </div>
      `;
      return;
    }

    // -------------------------------------------------------------
    // 1. 간략화 리스트 모드 (projectViewMode === 'list')
    // 1. 좌측: 폴더아이콘 + 프로젝트 제목
    // 2. 우측: 작성한 날짜만 깔끔하게 표시
    // -------------------------------------------------------------
    if (this.state.projectViewMode === 'list') {
      container.className = "flex flex-col gap-2.5";
      container.innerHTML = list.map(p => {
        const formattedDate = (p.date || '').replace(/-/g, '.');

        return `
          <div class="flex items-center justify-between bg-surface-container-lowest rounded-md px-4 py-3.5 border border-outline-variant/10 hover:bg-surface-container-low active:scale-98 transition-all cursor-pointer group text-left shadow-2xs" onclick="App.openProjectDetail(${p.id})">
            <!-- 1. 폴더아이콘 + 프로젝트 제목 및 하단 줄내림 날짜 -->
            <div class="flex items-center gap-3 min-w-0 flex-1 mr-3">
              <span class="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform shrink-0">folder_open</span>
              <div class="flex flex-col min-w-0">
                <h3 class="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">${p.title}</h3>
                <span class="text-[11px] font-mono text-on-surface-variant/80 font-medium mt-0.5">${formattedDate}</span>
              </div>
            </div>
            
            <!-- 2. 우측: 이동 화살표 -->
            <span class="material-symbols-outlined text-on-surface-variant text-base group-hover:translate-x-1 transition-transform shrink-0">chevron_right</span>
          </div>
        `;
      }).join('');
      return;
    }

    // -------------------------------------------------------------
    // 2. 카드 모드 (projectViewMode === 'card')
    // 1. 상단타이틀(폴더아이콘 영역): 프로젝트 제목 (ID 표시 안함)
    // 2. 우측(기존 몇개 업무 자리): PM 이름
    // 3. 진행도 요약(기존 대기/진행중 자리): 글 번호, 상태 뱃지, 프로젝트 ID
    // 4. 그레이박스 안: 사이트명과 (id)
    // -------------------------------------------------------------
    container.className = "flex flex-col gap-4";
    container.innerHTML = list.map(p => {
      const pmText = (p.pm && p.pm !== '-') ? p.pm : '미지정';
      const formattedDate = (p.date || '').replace(/-/g, '.');

      let statusBadgeClass = 'bg-primary/10 text-primary border-primary/20';
      if (p.status === 'maintenance') statusBadgeClass = 'bg-secondary/10 text-secondary border-secondary/20';
      else if (p.status === 'build') statusBadgeClass = 'bg-tertiary-container/30 text-tertiary border-tertiary/20';

      return `
        <div class="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3.5 border border-outline-variant/10 shadow-[0_2px_12px_rgba(35,44,81,0.03)] hover:shadow-[0_8px_24px_rgba(35,44,81,0.08)] active:scale-98 transition-all cursor-pointer group text-left" onclick="App.openProjectDetail(${p.id})">
          <!-- 1: 상단 타이틀(폴더아이콘 + 프로젝트제목) & 우측 화살표 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0 flex-1 mr-2">
              <span class="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform shrink-0">folder_open</span>
              <h3 class="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">${p.title}</h3>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant text-lg group-hover:translate-x-1 transition-transform shrink-0">chevron_right</span>
          </div>

          <!-- 2: 글 번호, PM, 상태 뱃지, 프로젝트 ID 태그 & 우측 끝 작성일자 -->
          <div class="flex items-center justify-between gap-2 pt-0.5">
            <div class="flex items-center gap-2 flex-wrap min-w-0">
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-mono font-bold">
                No. ${p.no}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                ${pmText}
              </span>
              <span class="px-2.5 py-0.5 rounded-full ${statusBadgeClass} text-[11px] font-bold border">
                ${p.statusText || '진행중'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-mono font-medium">
                ${p.projectId}
              </span>
            </div>
            <span class="font-mono text-on-surface-variant text-xs font-medium shrink-0">
              ${formattedDate}
            </span>
          </div>

          <!-- 4: 그레이박스 -> 사이트명과 (id) -->
          <div class="bg-surface-container-low p-3 rounded-md flex items-center text-xs border border-outline-variant/10">
            <div class="flex items-center gap-1.5 truncate">
              <span class="material-symbols-outlined text-sm text-on-surface-variant shrink-0">web</span>
              <span class="font-medium text-on-surface truncate">${p.siteName}</span>
              <span class="text-on-surface-variant/70 text-[11px] font-mono shrink-0">(${p.siteId})</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 주소록 연동 헬퍼: 이름으로 임직원 정보 조회
  getEmployeeByName(name) {
    if (!name || name === '-' || name === '.') return null;
    const cleanName = String(name).trim();
    const list = this.state.employees || (window.MockData && window.MockData.employees) || [];
    return list.find(e => e.name === cleanName || cleanName.includes(e.name)) || null;
  },

  // 주소록 기반 이름 + 직책 포맷팅 (예: "장현아 수습", "남기현 본부장")
  formatEmployeeWithRole(name) {
    if (!name || name === '-' || name === '.') return '-';
    const emp = this.getEmployeeByName(name);
    if (emp) {
      return `${emp.name} ${emp.role}`;
    }
    return name;
  },

  openProjectDetail(projectId) {
    const modal = document.getElementById('modal-project-detail');
    const container = document.getElementById('project-detail-content');
    if (!modal || !container) return;

    const p = (this.state.projects || []).find(item => item.id === projectId) ||
      ((window.MockData && window.MockData.projects) || []).find(item => item.id === projectId);
    if (!p) return;

    this.state.currentDetailProjectId = p.id;
    const formattedDate = (p.date || '').replace(/-/g, '.');
    const formattedDateFull = p.dateFull ? p.dateFull.replace(/-/g, '.') : formattedDate;

    let statusBadgeClass = 'bg-primary/10 text-primary border-primary/20';
    if (p.status === 'maintenance') statusBadgeClass = 'bg-secondary/10 text-secondary border-secondary/20';
    else if (p.status === 'build') statusBadgeClass = 'bg-tertiary-container/30 text-tertiary border-tertiary/20';

    // 주소록과 작성자 정보 매핑
    const authorEmp = this.getEmployeeByName(p.author);
    const authorDept = authorEmp ? authorEmp.dept : (p.authorDept || '기획팀');
    const authorRole = authorEmp ? authorEmp.role : (p.authorRole || '사원');
    const authorName = authorEmp ? authorEmp.name : p.author;

    // 첨부파일 렌더링 (공지사항 상세 페이지 첨부파일 디자인으로 통일)
    const attachments = p.attachments || [];
    const attachmentsHtml = attachments.length > 0 ? attachments.map(att => `
      <div class="flex items-center justify-between bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-3.5 group cursor-pointer" onclick="App.downloadProjectAttachment('${att.name}')">
        <div class="flex items-center gap-3 truncate">
          <span class="material-symbols-outlined text-primary text-2xl">description</span>
          <div class="flex flex-col truncate">
            <span class="font-body text-xs font-bold text-on-surface truncate">${att.name}</span>
            <span class="font-label text-[11px] text-on-surface-variant">${att.size} • 다운로드 ${att.downloads || 0}회 • ${att.date || ''}</span>
          </div>
        </div>
        <button type="button" class="bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0" title="다운로드">
          <span class="material-symbols-outlined text-lg">download</span>
        </button>
      </div>
    `).join('') : `
      <div class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 text-xs text-on-surface-variant flex items-center justify-center text-center min-h-[70px]">
        등록된 첨부파일이 없습니다.
      </div>
    `;

    // 고객사 담당자 렌더링
    const clientContacts = p.clientContacts || [];
    const clientContactsHtml = clientContacts.length > 0 ? clientContacts.map(c => `
      <div class="bg-surface-container-lowest p-3.5 rounded-md border border-outline-variant/10 text-xs flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-primary font-mono">${c.label || '담당자 1'}</span>
            <span class="font-mono text-[11px] text-on-surface-variant">[${c.date || ''}]</span>
          </div>
          <div class="flex items-center gap-1">
            ${c.mobile ? `<a href="tel:${c.mobile}" class="p-1 rounded-full hover:bg-surface-container text-primary" title="전화걸기"><span class="material-symbols-outlined text-base">call</span></a>` : ''}
            ${c.email ? `<a href="mailto:${c.email}" class="p-1 rounded-full hover:bg-surface-container text-primary" title="이메일 보내기"><span class="material-symbols-outlined text-base">mail</span></a>` : ''}
          </div>
        </div>
        <div class="text-on-surface leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
          <span class="font-bold">${c.name || '-'}</span>
          <span class="text-on-surface-variant/40">|</span>
          <span>${c.position || '-'}</span>
          <span class="text-on-surface-variant/40">|</span>
          <span>전화 ${c.tel || '-'}</span>
          <span class="text-on-surface-variant/40">|</span>
          <span>팩스 ${c.fax || '-'}</span>
          <span class="text-on-surface-variant/40">|</span>
          <span class="font-mono text-primary">${c.mobile || '-'}</span>
          <span class="text-on-surface-variant/40">|</span>
          <span class="font-mono text-on-surface-variant">${c.email || '-'}</span>
        </div>
      </div>
    `).join('') : `
      <div class="p-3.5 bg-surface-container-lowest rounded-md border border-outline-variant/10 text-xs text-on-surface-variant">
        <span class="font-bold text-on-surface">담당자 1 :</span> 등록된 고객사 담당자 정보가 없습니다.
      </div>
    `;

    // 댓글 / 작업 히스토리 렌더링 (주소록 기반 이름/부서/직책 매핑)
    const comments = p.comments || [];
    const commentsHtml = comments.length > 0 ? comments.map(cm => {
      const cEmp = this.getEmployeeByName(cm.author);
      const cDept = cEmp ? cEmp.dept : (cm.authorDept || '기획팀');
      const cRole = cEmp ? ` ${cEmp.role}` : '';
      return `
        <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-2 shadow-2xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                ${(cm.author || '사')[0]}
              </div>
              <span class="font-bold text-xs text-on-surface">${cm.author}${cRole}</span>
              <span class="text-[11px] text-on-surface-variant">(${cDept})</span>
            </div>
            <span class="font-mono text-[11px] text-on-surface-variant/80">${cm.date}</span>
          </div>
          <div class="bg-surface-container-low p-3 rounded-md text-xs font-mono text-on-surface leading-relaxed whitespace-pre-line select-text">
            ${cm.content}
          </div>
        </div>
      `;
    }).join('') : `
      <div class="p-4 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/20 text-center text-on-surface-variant text-xs">
        등록된 댓글 및 작업 메모가 없습니다.
      </div>
    `;

    container.innerHTML = `
      <!-- 1. Header Card (공지사항 상세 타이틀 디자인 1:1 통일) -->
      <div class="bg-surface-container-lowest rounded-2xl p-6 relative overflow-hidden shadow-sm text-left">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>
        <div class="flex items-center gap-3 mb-3">
          <span class="bg-primary text-on-primary font-label text-xs font-bold px-3 py-1 rounded-full">${p.category || '프로젝트'}</span>
          <span class="text-on-surface-variant font-body text-xs">${formattedDate}</span>
        </div>
        <h1 class="font-headline text-xl font-bold text-on-surface mb-3 leading-snug">
          ${p.title}
        </h1>
        <div class="flex items-center gap-2 text-on-surface-variant font-body text-xs border-t border-outline-variant/10 pt-3 mt-2">
          <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">person</span>
          <span>${authorDept} <strong>${authorName}</strong> (${authorRole})</span>
        </div>
      </div>

      <!-- 2. 프로젝트 기본 정보 테이블 (모든 항목 빠짐없이 노출 및 주소록 매핑) -->
      <section class="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-outline-variant/15 shadow-2xs">
        <h3 class="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">info</span>
          <span>프로젝트 기본 정보</span>
        </h3>

        <div class="flex flex-col gap-2.5 text-xs">
          <!-- 프로젝트 주소 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline-variant/10 gap-1">
            <span class="text-on-surface-variant font-bold shrink-0 w-28">• 프로젝트 주소</span>
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <a href="${p.projectUrl || '#'}" target="_blank" class="text-primary font-mono text-xs hover:underline truncate">${p.projectUrl || 'http://sitegate.co.kr'}</a>
              <button type="button" onclick="navigator.clipboard.writeText('${p.projectUrl}'); App.showToast('주소가 복사되었습니다!');" class="p-1 text-on-surface-variant hover:text-primary shrink-0" title="주소 복사">
                <span class="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          </div>

          <!-- 클라이언트 ID -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline-variant/10 gap-1">
            <span class="text-on-surface-variant font-bold shrink-0 w-28">• 클라이언트 ID</span>
            <span class="font-medium text-on-surface">${p.clientName || '-'} <span class="font-mono text-primary font-bold">(${p.clientId || '-'})</span></span>
          </div>

          <!-- 사이트 ID -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline-variant/10 gap-1">
            <span class="text-on-surface-variant font-bold shrink-0 w-28">• 사이트 ID</span>
            <div class="flex items-center gap-2">
              <span class="font-medium text-on-surface">${p.siteName}</span>
              <span class="font-mono text-primary font-bold">(${p.siteId})</span>
              <span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">낙찰정보(${p.bidCount || 0})</span>
            </div>
          </div>

          <!-- PM 및 직군별 담당자 그리드 (주소록 직책 자동 매핑) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1.5 border-b border-outline-variant/10">
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• PM</span>
              <span class="font-medium text-on-surface">${this.formatEmployeeWithRole(p.pm)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• 담당자(기획)</span>
              <span class="font-medium text-on-surface">${this.formatEmployeeWithRole(p.planner)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• 담당자(디자인)</span>
              <span class="font-medium text-on-surface">${this.formatEmployeeWithRole(p.designer)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• 담당자(코딩)</span>
              <span class="font-medium text-on-surface">${this.formatEmployeeWithRole(p.publisher)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• 담당자(개발)</span>
              <span class="font-medium text-on-surface">${this.formatEmployeeWithRole(p.developer)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant font-bold w-28">• 개발 언어</span>
              <span class="font-medium text-on-surface">${p.devLang || '-'}</span>
            </div>
          </div>

          <!-- 프로젝트 기간 & 진행상태 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline-variant/10 gap-1">
            <span class="text-on-surface-variant font-bold shrink-0 w-28">• 프로젝트 기간</span>
            <span class="font-mono font-bold text-on-surface">${p.period || '-'}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline-variant/10 gap-1">
            <span class="text-on-surface-variant font-bold shrink-0 w-28">• 진행상태</span>
            <span class="font-bold text-primary">${p.statusText || '진행 중'}</span>
          </div>

          <!-- 담당자 1 [고객사 연락처] -->
          <div class="flex flex-col gap-2 pt-1.5">
            <span class="text-on-surface-variant font-bold">• 고객사 담당자</span>
            ${clientContactsHtml}
          </div>
        </div>
      </section>

      <!-- 3. 첨부파일 섹션 (공지사항 상세 디자인 통일) -->
      <section class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <h3 class="font-headline text-base font-bold text-on-surface flex items-center justify-between">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">attach_file</span>
            <span>첨부파일 (${attachments.length})</span>
          </span>
        </h3>
        <div class="flex flex-col gap-2">
          ${attachmentsHtml}
        </div>
      </section>

      <!-- 4. 본문 내용 -->
      <section class="flex flex-col gap-2.5">
        <h3 class="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">subject</span>
          <span>상세 내용</span>
        </h3>
        ${p.content && p.content !== '.' ? `
          <div class="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-outline-variant/10 text-xs text-on-surface leading-relaxed min-h-[70px] whitespace-pre-line">
            ${p.content}
          </div>
        ` : `
          <div class="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 text-xs text-on-surface-variant flex items-center justify-center text-center min-h-[90px]">
            별도 등록된 본문 텍스트가 없습니다.
          </div>
        `}
      </section>

      <!-- 5. 댓글 / 작업 히스토리 -->
      <section class="flex flex-col gap-3">
        <h3 class="font-headline font-bold text-sm text-on-surface flex items-center justify-between">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">forum</span>
            <span>댓글 및 작업 메모 (${comments.length})</span>
          </span>
        </h3>
        <div class="flex flex-col gap-2.5" id="project-comments-list">
          ${commentsHtml}
        </div>

        <!-- 댓글 작성 폼 -->
        <div class="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/15 flex flex-col gap-2.5 mt-2">
          <span class="text-xs font-bold text-on-surface">새 댓글 / 메모 작성</span>
          <textarea id="project-new-comment-input" class="w-full p-3 bg-surface-container-lowest rounded-md text-xs text-on-surface border border-outline-variant/15 focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="서버 정보, 개발 링크, 진행 사항 등을 자유롭게 입력하세요..." rows="3"></textarea>
          <div class="flex justify-end">
            <button type="button" onclick="App.submitProjectComment(${p.id})" class="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-dim active:scale-95 transition-all shadow-xs flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">send</span>
              <span>작성 완료</span>
            </button>
          </div>
        </div>
      </section>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeProjectDetailModal() {
    const modal = document.getElementById('modal-project-detail');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  },

  copyProjectUrl() {
    const p = (this.state.projects || []).find(item => item.id === this.state.currentDetailProjectId);
    if (p && p.projectUrl) {
      navigator.clipboard.writeText(p.projectUrl);
      this.showToast('🔗 프로젝트 주소가 클립보드에 복사되었습니다.');
    } else {
      this.showToast('🔗 프로젝트 링크가 복사되었습니다.');
    }
  },

  downloadProjectAttachment(fileName) {
    this.showToast(`📥 [${fileName}] 첨부파일 다운로드를 시작합니다.`);
  },

  openProjectCommentModal() {
    const textarea = document.getElementById('project-new-comment-input');
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth' });
    }
  },

  submitProjectComment(projectId) {
    const input = document.getElementById('project-new-comment-input');
    if (!input || !input.value.trim()) {
      this.showToast('댓글 내용을 입력해주세요.');
      return;
    }

    const p = (this.state.projects || []).find(item => item.id === projectId);
    if (p) {
      if (!p.comments) p.comments = [];
      const now = new Date();
      const yr = String(now.getFullYear()).slice(-2);
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      const ho = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');

      p.comments.push({
        id: Date.now(),
        author: this.state.user?.name || '이재광',
        authorDept: '수행본부',
        date: `${yr}-${mo}-${da} ${ho}:${mi}`,
        content: input.value.trim()
      });

      this.openProjectDetail(projectId);
      this.showToast('💬 새로운 댓글 및 작업 메모가 등록되었습니다.');
    }
  },

  // ==================== WORK REPORT METHODS ====================
  switchWorkReportTab(tab) {
    this.state.workReportTab = tab;

    // Update Tab Buttons UI (지출결의서 탭 규격 100% 통일)
    const tabBtns = document.querySelectorAll('.report-nav-tab');
    tabBtns.forEach(btn => {
      btn.className = 'flex-1 py-2.5 px-3 rounded-[0.875rem] text-xs sm:text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-highest transition-all text-center report-nav-tab';
    });

    const activeBtn = document.getElementById(`tab-btn-report-${tab}`);
    if (activeBtn) {
      activeBtn.className = 'flex-1 py-2.5 px-3 rounded-[0.875rem] text-xs sm:text-sm font-label font-bold text-on-primary bg-primary shadow-sm transition-all text-center report-nav-tab active';
    }

    this.renderWorkReportControls();
    this.renderWorkReports();
  },

  changeReportWeek(delta) {
    let week = (this.state.workReportWeek || 3) + delta;
    if (week < 1) week = 1;
    if (week > 4) week = 4;
    this.state.workReportWeek = week;
    this.renderWorkReportControls();
    this.renderWorkReports();
  },

  changeReportDate(delta) {
    const curr = new Date(this.state.workReportDate || '2026-08-25');
    curr.setDate(curr.getDate() + delta);
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    this.state.workReportDate = `${y}-${m}-${d}`;
    this.renderWorkReportControls();
    this.renderWorkReports();
  },

  selectReportTeam(dept, chipEl) {
    this.state.workReportTeam = dept;
    const chips = document.querySelectorAll('.report-team-chip');
    chips.forEach(c => {
      c.classList.remove('bg-primary', 'text-on-primary', 'active');
      c.classList.add('bg-surface-container', 'text-on-surface-variant');
    });
    if (chipEl) {
      chipEl.classList.remove('bg-surface-container', 'text-on-surface-variant');
      chipEl.classList.add('bg-primary', 'text-on-primary', 'active');
    }
    this.renderWorkReports();
  },

  renderWorkReportControls() {
    const container = document.getElementById('work-report-sub-controls');
    if (!container) return;

    const tab = this.state.workReportTab || 'weekly';

    if (tab === 'weekly') {
      const year = this.state.workReportYear || 2026;
      const month = this.state.workReportMonth || 8;
      const week = this.state.workReportWeek || 3;
      const weekDateRanges = {
        1: `${month}월 3일(월) ~ ${month}월 7일(금)`,
        2: `${month}월 10일(월) ~ ${month}월 14일(금)`,
        3: `${month}월 17일(월) ~ ${month}월 21일(금)`,
        4: `${month}월 24일(월) ~ ${month}월 28일(금)`
      };
      const rangeText = weekDateRanges[week] || `${month}월 ${week}주차`;

      container.innerHTML = `
        <!-- Weekly Selector -->
        <div class="flex items-center justify-between bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10 shadow-xs">
          <button type="button" onclick="App.changeReportWeek(-1)" class="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95" title="이전 주">
            ${getSvgIcon('chevron_left', 'w-5 h-5')}
          </button>
          <div class="text-center">
            <h3 class="font-headline font-bold text-base text-primary">${year}년 ${month}월 ${week}주차</h3>
            <p class="font-body text-[11px] text-on-surface-variant font-medium mt-0.5">${rangeText}</p>
          </div>
          <button type="button" onclick="App.changeReportWeek(1)" class="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95" title="다음 주">
            ${getSvgIcon('chevron_right', 'w-5 h-5')}
          </button>
        </div>
      `;
    } else if (tab === 'daily') {
      const dateStr = this.state.workReportDate || '2026-08-25';
      const d = new Date(dateStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = days[d.getDay()];

      container.innerHTML = `
        <!-- Daily Selector -->
        <div class="flex items-center justify-between bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10 shadow-xs">
          <button type="button" onclick="App.changeReportDate(-1)" class="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95" title="이전 날">
            ${getSvgIcon('chevron_left', 'w-5 h-5')}
          </button>
          <div class="text-center">
            <h3 class="font-headline font-bold text-base text-primary">${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayName})</h3>
            <p class="font-body text-[11px] text-secondary font-bold mt-0.5">금일 일일 업무 진행 현황</p>
          </div>
          <button type="button" onclick="App.changeReportDate(1)" class="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95" title="다음 날">
            ${getSvgIcon('chevron_right', 'w-5 h-5')}
          </button>
        </div>
      `;
    } else if (tab === 'team') {
      const currentTeam = this.state.workReportTeam || 'all';
      const teams = ['all', '개발팀', '퍼블리싱팀', '디자인팀', '기획팀', '경영지원팀', '전략본부', '수행본부'];
      const teamLabels = {
        all: '전체',
        개발팀: '개발',
        퍼블리싱팀: '퍼블리싱',
        디자인팀: '디자인',
        기획팀: '기획',
        경영지원팀: '경영지원',
        전략본부: '전략본부',
        수행본부: '수행본부'
      };

      const chipsHtml = teams.map(t => {
        const isActive = currentTeam === t;
        const activeClass = isActive
          ? 'bg-primary text-on-primary active'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest';
        return `
          <button class="whitespace-nowrap px-4 py-2 rounded-full font-label text-xs font-bold transition-all active:scale-95 report-team-chip ${activeClass}" onclick="App.selectReportTeam('${t}', this)">${teamLabels[t]}</button>
        `;
      }).join('');

      container.innerHTML = `
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" id="report-team-chips">
          ${chipsHtml}
        </div>
      `;
    }
  },

  renderWorkReports() {
    const container = document.getElementById('work-report-list-container');
    if (!container) return;

    const tab = this.state.workReportTab || 'weekly';

    // 1. 주간 업무보고 탭
    if (tab === 'weekly') {
      const week = this.state.workReportWeek || 3;
      const allReports = (this.state.workReports && this.state.workReports.length > 0)
        ? this.state.workReports
        : ((window.MockData && window.MockData.workReports) || []);

      const filtered = allReports.filter(r => r.week === week || (!r.week && week === 3));

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium shadow-xs">
            ${getSvgIcon('assignment', 'w-10 h-10 text-outline mb-2 mx-auto')}
            <p class="font-bold text-on-surface">선택하신 8월 ${week}주차에 등록된 주간 업무보고가 없습니다.</p>
            <p class="text-xs text-on-surface-variant mt-1">상단 화살표를 눌러 다른 주차를 확인해 보세요.</p>
          </div>
        `;
        return;
      }

      const renderSectionBlock = (sections) => {
        if (!sections || sections.length === 0) return '';
        return sections.map((sec, idx) => {
          const divider = idx > 0 ? `<div class="h-px w-full bg-outline-variant/15 my-1"></div>` : '';

          let itemsHtml = '';
          if (sec.items && sec.items.length > 0) {
            itemsHtml = `
              <ul class="text-xs sm:text-sm text-on-surface-variant space-y-1 pl-1 list-disc list-inside mt-1 font-body leading-relaxed">
                ${sec.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            `;
          }

          let commentHtml = '';
          if (sec.comment) {
            commentHtml = `
              <p class="text-xs sm:text-sm text-error-dim pl-1 mt-1 font-medium font-body leading-relaxed">
                ${sec.comment}
              </p>
            `;
          }

          const isGenericLabel = !sec.label || ['전주', '금주', '전주 실적', '금주 진행', '작업내역', '디자인', '개발', '기획', '퍼블리싱', '프로젝트 진행 중'].includes(sec.label.trim());
          const labelHtml = isGenericLabel ? '' : `<span class="text-xs font-semibold text-on-surface">${sec.label}</span>`;

          return `
            ${divider}
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-bold ${sec.deptColor || 'text-primary'}">${sec.dept}</span>
                ${labelHtml}
              </div>
              ${itemsHtml}
              ${commentHtml}
            </div>
          `;
        }).join('');
      };

      const alternatingThemes = [
        {
          borderLeft: 'border-l-[5px] border-l-primary',
          badgeBg: 'bg-primary/10 text-primary border border-primary/20'
        },
        {
          borderLeft: 'border-l-[5px] border-l-[#00693f]',
          badgeBg: 'bg-[#00693f]/10 text-[#00693f] dark:text-emerald-300 border border-[#00693f]/20'
        }
      ];

      container.innerHTML = filtered.map((report, rIdx) => {
        const theme = alternatingThemes[rIdx % alternatingThemes.length];
        const prevSections = report.prevWeekSections || [];
        const thisSections = report.thisWeekSections || report.sections || [];

        return `
          <article class="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 shadow-[0_2px_12px_rgba(35,44,81,0.04)] hover:-translate-y-0.5 transition-all duration-200 text-left ${theme.borderLeft}">
            <div class="min-w-0">
              <span class="text-xs font-semibold ${theme.badgeBg} px-2.5 py-1 rounded-md mb-2 inline-block shadow-xs">${report.client}</span>
              <h3 class="font-headline font-bold text-on-surface leading-snug text-base sm:text-lg hover:text-primary transition-colors">${report.title}</h3>
              <p class="text-xs text-on-surface-variant mt-1.5 font-medium flex items-center gap-1">
                ${getSvgIcon('schedule', 'w-3.5 h-3.5 text-outline')}
                <span>${report.period}</span>
              </p>
            </div>

            <div class="flex flex-col gap-3.5">
              <!-- 1. [전주] 실적 박스 -->
              <div class="space-y-1.5">
                <div class="flex items-center gap-1.5 px-0.5">
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surface-container-highest text-on-surface flex items-center gap-1 shadow-2xs">
                    ${getSvgIcon('history', 'w-3.5 h-3.5 text-outline')}
                    <span>전주 실적</span>
                  </span>
                </div>
                <div class="bg-surface-container-lowest rounded-md p-3.5 flex flex-col gap-2.5 shadow-xs border border-outline-variant/15">
                  ${renderSectionBlock(prevSections)}
                </div>
              </div>

              <!-- 2. [금주] 계획 및 진행 박스 -->
              <div class="space-y-1.5">
                <div class="flex items-center gap-1.5 px-0.5">
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 shadow-2xs">
                    ${getSvgIcon('trending_up', 'w-3.5 h-3.5 text-primary')}
                    <span>금주 계획 및 진행</span>
                  </span>
                </div>
                <div class="bg-surface-container-lowest rounded-md p-3.5 flex flex-col gap-2.5 shadow-xs border border-outline-variant/15">
                  ${renderSectionBlock(thisSections)}
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');
      return;
    }

    // 2. 일간 업무보고 탭
    if (tab === 'daily') {
      const dateStr = this.state.workReportDate || '2026-08-25';
      const dailyList = (window.MockData && window.MockData.dailyWorkReports) || [];
      const filtered = dailyList.filter(d => d.date === dateStr);

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium shadow-xs">
            ${getSvgIcon('event_note', 'w-10 h-10 text-outline mb-2 mx-auto')}
            <p class="font-bold text-on-surface">${dateStr} 일자에 등록된 일간 업무보고가 없습니다.</p>
            <p class="text-xs text-on-surface-variant mt-1">상단 날짜 변경 버튼으로 8월 25일, 24일, 21일 등을 확인해 보세요.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(item => {
        const isDone = item.status === 'completed';
        const statusBadge = isDone
          ? `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00693f]/10 text-[#00693f] dark:text-emerald-300 border border-[#00693f]/20">완료</span>`
          : `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">진행중</span>`;

        return `
          <article class="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 shadow-[0_2px_12px_rgba(35,44,81,0.04)] border-l-[5px] border-l-primary text-left">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span class="text-xs font-semibold bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-md shadow-xs">${item.client}</span>
                  <span class="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">${item.primaryDept}</span>
                  ${statusBadge}
                </div>
                <h3 class="font-headline font-bold text-on-surface text-base sm:text-lg leading-snug">${item.project}</h3>
                <p class="text-xs text-on-surface-variant mt-1 flex items-center gap-1 font-medium">
                  ${getSvgIcon('person', 'w-3.5 h-3.5 text-outline')}
                  <span>작성자/담당: <strong class="text-on-surface">${item.author}</strong></span>
                </p>
              </div>
            </div>

            <!-- 금일 수행 업무 박스 -->
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/15 flex flex-col gap-2">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <h4 class="text-xs font-bold text-primary">금일 수행 업무 (Today)</h4>
              </div>
              <ul class="text-xs sm:text-sm text-on-surface-variant space-y-1.5 pl-2 list-disc list-inside font-body leading-relaxed">
                ${item.todayTasks.map(t => `<li>${t}</li>`).join('')}
              </ul>
            </div>

            <!-- 명일 예정 업무 박스 -->
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/15 flex flex-col gap-2">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="w-2 h-2 rounded-full bg-[#00693f]"></span>
                <h4 class="text-xs font-bold text-[#00693f] dark:text-emerald-300">명일 예정 업무 (Tomorrow Plan)</h4>
              </div>
              <ul class="text-xs sm:text-sm text-on-surface-variant space-y-1.5 pl-2 list-disc list-inside font-body leading-relaxed">
                ${item.tomorrowTasks.map(t => `<li>${t}</li>`).join('')}
              </ul>
            </div>

            ${item.note ? `
              <div class="text-[11px] text-on-surface-variant bg-surface-container p-2.5 rounded-lg flex items-center gap-1.5">
                ${getSvgIcon('info', 'w-3.5 h-3.5 text-outline shrink-0')}
                <span>${item.note}</span>
              </div>
            ` : ''}
          </article>
        `;
      }).join('');
      return;
    }

    // 3. 팀별 업무보고 탭
    if (tab === 'team') {
      const selectedTeam = this.state.workReportTeam || 'all';
      const teamList = (window.MockData && window.MockData.teamWorkReports) || [];
      const filtered = selectedTeam === 'all' ? teamList : teamList.filter(t => t.dept === selectedTeam || t.deptName === selectedTeam);

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant font-medium shadow-xs">
            ${getSvgIcon('group', 'w-10 h-10 text-outline mb-2 mx-auto')}
            <p class="font-bold text-on-surface">선택하신 부서(${selectedTeam})의 등록된 업무보고가 없습니다.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(team => {
        const membersBadges = team.members.map(m => `
          <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container-highest text-on-surface shadow-2xs">
            ${m.name} ${m.role}
          </span>
        `).join('');

        const projectCards = team.projects.map(p => `
          <div class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/15 shadow-xs flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="text-xs font-bold text-primary">${p.client}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">${p.status} (${p.progress})</span>
            </div>
            <h5 class="font-bold text-sm text-on-surface">${p.title}</h5>
            <ul class="text-xs text-on-surface-variant space-y-1 pl-2 list-disc list-inside leading-relaxed mt-1 font-body">
              ${p.tasks.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        `).join('');

        return `
          <article class="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 shadow-[0_2px_12px_rgba(35,44,81,0.04)] border-l-[5px] border-l-primary text-left">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-headline font-bold text-lg text-primary">${team.deptName}</h3>
                  <span class="text-xs font-bold text-on-surface-variant">팀장: ${team.leader}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap mt-2">
                  ${membersBadges}
                </div>
              </div>
            </div>

            <!-- 팀 총괄 요약 브리핑 박스 -->
            <div class="bg-primary/5 rounded-2xl p-3.5 border border-primary/15 flex items-start gap-2">
              ${getSvgIcon('assignment', 'w-4 h-4 text-primary shrink-0 mt-0.5')}
              <p class="text-xs sm:text-sm font-medium text-on-surface leading-relaxed">${team.summary}</p>
            </div>

            <!-- 전담 프로젝트별 업무 현황 리스트 -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-on-surface-variant flex items-center gap-1 px-0.5">
                ${getSvgIcon('folder', 'w-3.5 h-3.5 text-outline')}
                <span>진행 프로젝트 및 세부 업무 (${team.projects.length}건)</span>
              </h4>
              ${projectCards}
            </div>
          </article>
        `;
      }).join('');
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
