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
      name: 'Alex',
      fullName: '알렉스 리버스',
      email: 'alex.rivera@company.com',
      role: '시니어 운영 관리자',
      id: 'FA-99283'
    },
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
    }
  },

  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
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
