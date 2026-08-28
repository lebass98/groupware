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
      role: '팀장',
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
    workReportTab: 'weekly',
    workReportYear: 2026,
    workReportMonth: 8,
    workReportWeek: 3,
    workReportDate: '2026-08-21',
    workReportTeam: 'all',
    workReportDept: 'all',
    financeFilter: 'all',
    todoFilter: 'all',
    todoViewMode: 'card', // 'card' or 'list'
    selectedProject: null, // null: Project List View, string: Project Kanban/Detail View
    requestTab: 'leave',
    isSidebarExpanded: false,
    notifications: (window.MockData && window.MockData.notifications) ? JSON.parse(JSON.stringify(window.MockData.notifications)) : [],
    notificationFilter: 'all',
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
        notes: '3분기 평가 UI 디자인 시스템 반응형 레이아웃 반영 및 웹접근성 마크업 최적화',
        hasAttachment: true
      },
      {
        id: 2,
        title: '모바일 웹 접근성 품질 인증 마크업 검수',
        project: '그룹웨어 고도화',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-08-28',
        assignees: [
          { name: '손석호', avatar: './resource/image/profile_pub.png', dept: '퍼블리싱팀', role: '주임' }
        ],
        isOverdue: false,
        isMine: true,
        notes: '스크린리더 ARIA 라벨링 및 키보드 초점 이동 순서 전수 검증',
        hasAttachment: false
      },
      {
        id: 3,
        title: 'PC Bento 대시보드 3열 레이아웃 구축',
        project: '그룹웨어 고도화',
        status: 'done',
        priority: 'high',
        dueDate: '2026-08-24',
        assignees: [
          { name: '이재광', avatar: 'profile.png', dept: '퍼블리싱팀', role: '팀장' }
        ],
        isOverdue: false,
        isMine: true,
        notes: 'Figma 와이드 Bento Grid 및 Glassmorphism 디자인 시스템 완성',
        hasAttachment: true
      },
      {
        id: 4,
        title: '국문 서브페이지 32종 반응형 퍼블리싱',
        project: 'FCES 대표 웹사이트 개편',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-08-30',
        assignees: [
          { name: '이재광', avatar: 'profile.png', dept: '퍼블리싱팀', role: '팀장' },
          { name: '손석호', avatar: './resource/image/profile_pub.png', dept: '퍼블리싱팀', role: '주임' }
        ],
        isOverdue: false,
        isMine: true,
        notes: '반응형 미디어쿼리 및 모바일 전용 UI 템플릿 제작',
        hasAttachment: true
      },
      {
        id: 5,
        title: '헤더 GNB 메가메뉴 키보드 접근성 연동',
        project: 'FCES 대표 웹사이트 개편',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2026-08-27',
        assignees: [
          { name: '손석호', avatar: './resource/image/profile_pub.png', dept: '퍼블리싱팀', role: '주임' }
        ],
        isOverdue: false,
        isMine: false,
        notes: 'Tab 키 네비게이션 및 ESC 닫기 키이벤트 처리',
        hasAttachment: false
      },
      {
        id: 6,
        title: '메인 비주얼 슬라이더 모션 및 테마 적용',
        project: 'FCES 대표 웹사이트 개편',
        status: 'done',
        priority: 'medium',
        dueDate: '2026-08-20',
        assignees: [
          { name: '명희진', avatar: './resource/image/profile_gray_20240502__.png', dept: '디자인팀', role: '주임' }
        ],
        isOverdue: false,
        isMine: false,
        notes: '스와이퍼 슬라이더 인터랙션 및 오토플레이 제어 버튼 구현',
        hasAttachment: true
      },
      {
        id: 7,
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
        notes: '근태 기록 1초 단위 타이머 백엔드 동기화 API 연동',
        hasAttachment: false
      },
      {
        id: 8,
        title: '외근/출장 전자결재 승인 프로세스 연동',
        project: '근태관리 시스템',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-08-26',
        assignees: [
          { name: '안영재', avatar: './resource/image/profile_pro.png', dept: '개발팀', role: '대리' }
        ],
        isOverdue: false,
        isMine: false,
        notes: '결재선 지정 및 승인 완료 시 캘린더 자동 등록 로직 구현',
        hasAttachment: true
      },
      {
        id: 9,
        title: '1초 단위 실시간 디지털 시계 위젯 구현',
        project: '근태관리 시스템',
        status: 'done',
        priority: 'low',
        dueDate: '2026-08-22',
        assignees: [
          { name: '최우석', avatar: './resource/image/profile_mobile.png', dept: '개발팀', role: '과장' }
        ],
        isOverdue: false,
        isMine: false,
        notes: '출근/퇴근 실시간 타임스탬프 기록 엔진 개발',
        hasAttachment: false
      },
      {
        id: 10,
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
        notes: '주간 보고서 신규 템플릿 마크다운 양식 가이드 전달',
        hasAttachment: true
      },
      {
        id: 11,
        title: '8월 법인카드 지출결의서 정산 마감',
        project: '경영지원 / 재무',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-08-31',
        assignees: [
          { name: '오은주', avatar: './resource/image/profile_sky.png', dept: '경영지원팀', role: '차장' }
        ],
        isOverdue: false,
        isMine: false,
        notes: '영수증 증빙 확인 및 부서별 예산 집행 승인 처리',
        hasAttachment: true
      }
    ],
    notices: (window.MockData && window.MockData.notices) ? JSON.parse(JSON.stringify(window.MockData.notices)) : [],
    members: (window.MockData && window.MockData.employees) ? JSON.parse(JSON.stringify(window.MockData.employees)) : [],
    projects: (window.MockData && window.MockData.projects) ? JSON.parse(JSON.stringify(window.MockData.projects)) : [],
    projectFilter: 'all',
    projectSearch: '',
    projectSort: 'recommend',
    expenses: [
      { id: 1, type: 'corp', typeLabel: '법인카드', date: '2026-08-24 12:30', title: '(주)맛있는식당 가산점', amount: 85000, category: '식대', status: 'unresolved', statusLabel: '결재 대기' },
      { id: 2, type: 'corp', typeLabel: '법인카드', date: '2026-08-23 20:15', title: '카카오T 택시 (야간교통비)', amount: 18500, category: '교통비', status: 'unresolved', statusLabel: '결재 대기' },
      { id: 3, type: 'corp', typeLabel: '법인카드', date: '2026-08-22 14:00', title: '스타벅스 가산디지털점', amount: 21000, category: '음료대', status: 'completed', statusLabel: '승인 완료' },
      { id: 4, type: 'personal', typeLabel: '개인영수증', date: '2026-08-21 10:10', title: '교보문고 (개발 서적 구매)', amount: 34000, category: '도서구입비', status: 'completed', statusLabel: '승인 완료' },
      { id: 5, type: 'personal', typeLabel: '개인영수증', date: '2026-08-20 15:45', title: '알파문구 가산점 (사무용품)', amount: 12500, category: '소모품비', status: 'completed', statusLabel: '승인 완료' }
    ]
  },

  // ==========================================================================
  // 멀티 디바이스 데이터 동기화 엔진 (Cross-Device LocalStorage Synchronization)
  // ==========================================================================
  loadState() {
    try {
      const saved = localStorage.getItem('wordncode_groupware_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isCheckedIn !== undefined) {
          this.state.isCheckedIn = parsed.isCheckedIn;
        }
        if (parsed.checkInTimeStr) {
          const match = parsed.checkInTimeStr.match(/(\d{1,2}:\d{2})/);
          this.state.checkInTime = match ? match[1] : parsed.checkInTimeStr;
        } else if (parsed.checkInTime) {
          const d = new Date(parsed.checkInTime);
          if (!isNaN(d.getTime())) {
            this.state.checkInTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }
        }
        if (parsed.logs && Array.isArray(parsed.logs) && parsed.logs.length > 0) {
          this.state.logs = parsed.logs;
        }
        if (parsed.todos && Array.isArray(parsed.todos) && parsed.todos.length > 0) {
          this.state.todos = parsed.todos;
        }
        if (parsed.recentProjects && Array.isArray(parsed.recentProjects) && parsed.recentProjects.length > 0) {
          this.state.recentProjects = parsed.recentProjects;
        }
        if (parsed.finance) this.state.finance = parsed.finance;
        if (parsed.approvals) this.state.approvals = parsed.approvals;
        if (parsed.leave) this.state.leave = parsed.leave;
        if (parsed.user) this.state.user = { ...this.state.user, ...parsed.user };
      }

      // Projects State Sync (PC-Mobile 공통 마스터 데이터 동기화)
      const savedProjects = localStorage.getItem('wordncode_groupware_projects');
      if (savedProjects) {
        try {
          const parsedProj = JSON.parse(savedProjects);
          if (Array.isArray(parsedProj) && parsedProj.length > 0) {
            this.state.projects = parsedProj;
          }
        } catch (_) {}
      }
      if (!this.state.projects || this.state.projects.length === 0) {
        this.state.projects = (window.MockData && window.MockData.projects) ? JSON.parse(JSON.stringify(window.MockData.projects)) : [];
      }

      // Notifications Read State Sync
      const savedNotifs = localStorage.getItem('wordncode_notifications_read_state');
      if (savedNotifs) {
        const readIds = JSON.parse(savedNotifs);
        if (Array.isArray(readIds) && this.state.notifications) {
          this.state.notifications.forEach(n => {
            if (readIds.includes(n.id)) {
              n.isRead = true;
            }
          });
        }
      }
    } catch (e) {
      console.warn('[PC] LocalStorage load error:', e);
    }
  },

  saveProjects() {
    try {
      localStorage.setItem('wordncode_groupware_projects', JSON.stringify(this.state.projects || []));
    } catch (e) {
      console.warn('[PC] Projects save error:', e);
    }
  },

  saveState() {
    try {
      let currentState = {};
      const saved = localStorage.getItem('wordncode_groupware_state');
      if (saved) {
        try { currentState = JSON.parse(saved); } catch (_) {}
      }

      currentState.isCheckedIn = this.state.isCheckedIn;
      if (this.state.isCheckedIn) {
        const now = new Date();
        const timePart = this.state.checkInTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        currentState.checkInTime = currentState.checkInTime || now.toISOString();
        currentState.checkInTimeStr = timePart.includes('오전') || timePart.includes('오후') ? timePart : (parseInt(timePart.split(':')[0], 10) >= 12 ? `오후 ${timePart}` : `오전 ${timePart}`);
      } else {
        currentState.checkInTime = null;
        currentState.checkInTimeStr = null;
      }

      if (this.state.todos) currentState.todos = this.state.todos;
      if (this.state.logs) currentState.logs = this.state.logs;
      if (this.state.recentProjects) currentState.recentProjects = this.state.recentProjects;
      if (this.state.finance) currentState.finance = this.state.finance;
      if (this.state.approvals) currentState.approvals = this.state.approvals;
      if (this.state.leave) currentState.leave = this.state.leave;
      if (this.state.user) currentState.user = this.state.user;

      localStorage.setItem('wordncode_groupware_state', JSON.stringify(currentState));

      if (this.state.projects) {
        this.saveProjects();
      }

      // Save Notifications Read State
      if (this.state.notifications) {
        const readIds = this.state.notifications.filter(n => n.isRead).map(n => n.id);
        localStorage.setItem('wordncode_notifications_read_state', JSON.stringify(readIds));
      }
    } catch (e) {
      console.warn('[PC] LocalStorage save error:', e);
    }
  },

  init() {
    this.loadState();
    this.bindTheme();
    this.bindSidebarState();
    this.startClock();
    this.renderSidebar();
    this.updateNotificationBadge();

    // 1. Initial Hash / Screen Route Resolution
    const hash = (window.location.hash || '').replace(/^#screen-/, '').replace(/^#/, '');
    const validScreens = ['dashboard', 'directory', 'notice', 'calendar', 'finance', 'todo', 'project', 'work-report', 'checkin', 'request'];
    const initialScreen = validScreens.includes(hash) ? hash : 'dashboard';

    // 2. Initial History State
    history.replaceState({ screen: initialScreen, modalOpen: false }, '', `#screen-${initialScreen}`);
    this.switchScreen(initialScreen, true);

    this.startNoticeTicker();
    this.bindGlobalEvents();
    console.log('🚀 WnC PC Groupware Engine Initialized with Cross-Device Data Sync');
  },

  // ==========================================================================
  // 실시간 알림 센터 시스템 (PC Notification Center)
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
    const badgeEl = document.getElementById('pc-notification-badge');
    const modalBadgeEl = document.getElementById('pc-notif-modal-count');
    
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
  },

  openNotificationModal() {
    const isManager = this.isManagerRole(this.state.user);
    const roleText = isManager
      ? `팀장 권한 (${this.state.user.role || '팀장'}): 팀원 실시간 출퇴근 알림 연동됨`
      : `일반 권한 (${this.state.user.role || '팀원'}): 개인 결재/외근/사내 공지 알림 연동됨`;

    const modalHtml = `
      <div class="flex flex-col h-full max-h-[80vh]">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-outline">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <svg class="w-6 h-6" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-2xl font-bold text-on-surface">알림 센터</h3>
                <span id="pc-notif-modal-count" class="px-2 py-0.5 rounded-full text-xs font-bold bg-[#e83538] text-white">${this.getUnreadNotificationCount()}</span>
              </div>
              <p class="text-sm text-on-surface-variant">${roleText}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="px-3.5 py-2 text-sm text-primary font-bold bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" onclick="PCApp.markAllNotificationsRead()">
              모두 읽음
            </button>
            <button type="button" class="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors" onclick="PCApp.closeModal()">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 pb-3 mb-3 border-b border-outline" id="pc-notification-filter-tabs">
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold transition-all ${this.state.notificationFilter === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}" data-filter="all" onclick="PCApp.filterNotifications('all')">
            전체 알림
          </button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold transition-all ${this.state.notificationFilter === 'commute' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}" data-filter="commute" onclick="PCApp.filterNotifications('commute')">
            출/퇴근
          </button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold transition-all ${this.state.notificationFilter === 'approval' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}" data-filter="approval" onclick="PCApp.filterNotifications('approval')">
            전자결재
          </button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold transition-all ${this.state.notificationFilter === 'business' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}" data-filter="business" onclick="PCApp.filterNotifications('business')">
            외근/출장
          </button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold transition-all ${this.state.notificationFilter === 'notice' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}" data-filter="notice" onclick="PCApp.filterNotifications('notice')">
            공지/일정
          </button>
        </div>

        <!-- List Container -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1" id="pc-notification-list-container">
          ${this.getNotificationListHtml()}
        </div>
      </div>
    `;

    this.showModal(modalHtml, true);
  },

  getNotificationListHtml() {
    const list = this.getVisibleNotifications();

    if (list.length === 0) {
      return `
        <div class="py-16 flex flex-col items-center justify-center text-center text-on-surface-variant">
          <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/50 mb-3">
            <svg class="w-8 h-8" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
            </svg>
          </div>
          <p class="text-base font-bold text-on-surface">도착한 알림이 없습니다.</p>
          <p class="text-sm text-on-surface-variant mt-1">임직원 상황 변화 및 새로운 업무 내역이 생기면 알려드립니다.</p>
        </div>
      `;
    }

    return list.map(item => {
      let typeBadge = '';
      if (item.type === 'commute') {
        typeBadge = '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">출/퇴근</span>';
      } else if (item.type === 'approval') {
        typeBadge = '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300">전자결재</span>';
      } else if (item.type === 'business') {
        typeBadge = '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-container text-on-surface-variant">외근/출장</span>';
      } else {
        typeBadge = '<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300">공지/일정</span>';
      }

      const unreadBadge = !item.isRead
        ? '<span class="w-3 h-3 rounded-full bg-[#e83538] shrink-0" title="읽지 않음"></span>'
        : '';

      const unreadBg = !item.isRead
        ? 'bg-primary/5 border border-primary/25 shadow-xs'
        : 'bg-surface-container-low hover:bg-surface-container border border-transparent';

      const avatarSrc = item.sender?.avatar || './resource/image/profile_abc.png';

      return `
        <div class="p-4 rounded-2xl ${unreadBg} transition-all hover:-translate-y-0.5 cursor-pointer flex items-start gap-4 relative" onclick="PCApp.onNotificationClick(${item.id})">
          <img src="${avatarSrc}" alt="${item.sender?.name || '임직원'}" class="w-12 h-12 rounded-full object-cover shrink-0 border border-outline/30 mt-0.5" onerror="this.src='./resource/image/profile_abc.png'" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-3 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                ${typeBadge}
                <span class="font-bold text-base text-on-surface truncate">${item.title}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-on-surface-variant font-medium">${item.time}</span>
                ${unreadBadge}
              </div>
            </div>
            <p class="text-sm text-on-surface font-medium leading-relaxed mb-2 break-words">${item.message}</p>
            <div class="text-xs text-on-surface-variant font-medium">
              <span>${item.sender?.dept || ''} ${item.sender?.name || ''} ${item.sender?.role || ''}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  filterNotifications(filterType) {
    this.state.notificationFilter = filterType || 'all';
    this.openNotificationModal();
  },

  markAllNotificationsRead() {
    const isManager = this.isManagerRole(this.state.user);
    (this.state.notifications || []).forEach(n => {
      if (isManager || !n.managerOnly) {
        n.isRead = true;
      }
    });
    this.saveState();
    this.updateNotificationBadge();
    this.renderRightCol();
    this.openNotificationModal();
  },

  onNotificationClick(id) {
    const notif = (this.state.notifications || []).find(n => n.id === id);
    if (!notif) return;

    notif.isRead = !notif.isRead;
    this.saveState();
    this.updateNotificationBadge();
    this.renderRightCol();
    const container = document.getElementById('pc-notification-list-container');
    if (container) {
      container.innerHTML = this.getNotificationListHtml();
    }
  },

  // 1. Sidebar Expand / Collapse Toggle
  toggleSidebar(forceState) {
    const isExpanded = (forceState !== undefined) ? forceState : !this.state.isSidebarExpanded;
    this.state.isSidebarExpanded = isExpanded;
    localStorage.setItem('wnc_pc_sidebar_expanded', isExpanded ? 'true' : 'false');

    const sidebar = document.getElementById('pc-sidebar');
    if (sidebar) {
      if (isExpanded) {
        sidebar.classList.add('expanded');
      } else {
        sidebar.classList.remove('expanded');
      }
    }
  },

  bindSidebarState() {
    const saved = localStorage.getItem('wnc_pc_sidebar_expanded');
    if (saved === 'true') {
      this.toggleSidebar(true);
    }
  },

  // 1-1. Theme Management
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
  switchScreen(screenId, isPopState = false) {
    // 1. Close active modal if open
    const modal = document.getElementById('pc-global-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
    this._isModalOpen = false;

    this.state.activeScreen = screenId;
    this.renderSidebar();

    // Update screen views
    const screens = document.querySelectorAll('.pc-screen-view');
    screens.forEach(s => {
      if (s.id === `pc-screen-${screenId}`) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    // 2. History Push / Replace Management
    if (!isPopState) {
      const targetHash = `#screen-${screenId}`;
      if (window.location.hash !== targetHash) {
        history.pushState({ screen: screenId, modalOpen: false }, '', targetHash);
      }
    }

    // Screen specific renderers
    if (screenId === 'dashboard') this.renderDashboard();
    else if (screenId === 'calendar') this.renderCalendarView();
    else if (screenId === 'directory') this.renderDirectoryView();
    else if (screenId === 'notice') this.renderNoticeView();
    else if (screenId === 'finance') this.renderFinanceView();
    else if (screenId === 'todo') this.renderTodoView();
    else if (screenId === 'project') this.renderProjectView();
    else if (screenId === 'work-report') this.renderWorkReportView();
    else if (screenId === 'checkin') this.renderCheckinView();
    else if (screenId === 'request') this.renderRequestView();

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // 4. Render Sidebar (10 Core Service Icons & Labels)
  renderSidebar() {
    const navItems = [
      { id: 'dashboard', name: '대시보드', iconName: 'grid_view' },
      { id: 'calendar', name: '근태일지', iconName: 'calendar_month' },
      { id: 'checkin', name: '출/퇴근', iconName: 'login' },
      { id: 'request', name: '휴가/외근', iconName: 'flight_takeoff' },
      { id: 'directory', name: '주소록', iconName: 'contact_page' },
      { id: 'notice', name: '공지사항', iconName: 'campaign' },
      { id: 'finance', name: '재무/경비', iconName: 'account_balance_wallet' },
      { id: 'todo', name: '할 일', iconName: 'task_alt' },
      { id: 'project', name: '프로젝트', iconName: 'folder_managed' },
      { id: 'work-report', name: '업무보고', iconName: 'assignment' }
    ];

    const navListEl = document.getElementById('pc-sidebar-nav');
    if (!navListEl) return;

    navListEl.innerHTML = navItems.map(item => {
      const isActive = (this.state.activeScreen === item.id);
      const iconSvg = typeof getSvgIcon === 'function' 
        ? getSvgIcon(item.iconName, 'w-5 h-5', '', isActive)
        : `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`;

      return `
        <li class="pc-nav-item">
          <button type="button" class="pc-nav-btn ${isActive ? 'active' : ''}" data-screen="${item.id}" onclick="PCApp.switchScreen('${item.id}')">
            ${iconSvg}
            <span class="pc-nav-label">${item.name}</span>
            <span class="pc-tooltip">${item.name}</span>
          </button>
        </li>
      `;
    }).join('');
  },

  // 5. Render Main Full-Width Bento Dashboard (3-Column Layout)
  renderDashboard() {
    this.renderLeftCol();
    this.renderCenterCol();
    this.renderRightCol();
  },

  // 5-1. Left Column (1열: 프로필 + 근태 & 출/퇴근 + 연차/휴가 현황 통합 위젯 & 이달의 생일자 위젯)
  renderLeftCol() {
    // 1. Profile + Commute + Leave Unified Bento Card Widget
    const profileWrap = document.getElementById('pc-widget-profile');
    if (profileWrap) {
      const now = new Date();
      const todayScheds = this.getSchedulesForDay(now.getFullYear(), now.getMonth() + 1, now.getDate()) || [];
      profileWrap.innerHTML = `
        <div class="pc-bento-card">
          <!-- 1. Profile Section (Horizontal Layout: Photo left, Name/Role/Company right) -->
          <div class="flex items-center gap-3 py-0.5">
            <img src="${this.state.user.avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shrink-0 shadow-xs" alt="사용자 프로필" />
            <div class="min-w-0 flex-1 text-left">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h2 class="font-headline text-sm sm:text-base font-black text-on-surface tracking-tight">${this.state.user.name}</h2>
                <span class="text-[11px] font-bold text-primary px-1.5 py-0.5 rounded-md bg-primary/10 leading-none">${this.state.user.role}</span>
              </div>
              <p class="text-[11px] text-on-surface-variant font-medium mt-0.5 truncate">${this.state.user.dept} · 워드앤코드</p>
            </div>
          </div>

          <!-- Divider Line 1 -->
          <div class="my-5 border-t border-outline/60"></div>

          <!-- 2. Commute & Check-In Section -->
          <div>
            <div class="pc-card-header mb-3">
              <span class="pc-card-title flex items-center gap-2">
                <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                근태
              </span>
              <span class="pc-commute-status-pill ${this.state.isCheckedIn ? 'checked-in' : ''}">
                <span class="w-1.5 h-1.5 rounded-full ${this.state.isCheckedIn ? 'bg-secondary' : 'bg-on-surface-variant'}"></span>
                ${this.state.isCheckedIn ? '근무 중 (정상)' : '퇴근 완료'}
              </span>
            </div>

            <div class="pc-commute-time-display mb-4">
              <div>
                <span class="text-xs text-on-surface-variant block mb-0.5 font-medium">출근 시간</span>
                <span class="pc-commute-big-time text-primary">${this.state.checkInTime}</span>
              </div>
              <span class="text-on-surface-variant text-xl font-bold">→</span>
              <div>
                <span class="text-xs text-on-surface-variant block mb-0.5 font-medium">퇴근 시간</span>
                <span class="pc-commute-big-time ${this.state.checkOutTime !== '--:--' ? 'text-secondary' : 'text-on-surface-variant'}">${this.state.checkOutTime}</span>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                <span>주 누적 근무시간</span>
                <span class="text-primary font-bold">38시간 45분 / 40시간</span>
              </div>
              <div class="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: 96%;"></div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 text-xs text-on-surface-variant mb-3.5 font-medium">
              <svg class="w-4 h-4 text-secondary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="truncate">위치 인증: <strong class="font-bold text-on-surface">${this.state.user.location}</strong></span>
            </div>

            <div class="pc-commute-btn-group">
              <button class="pc-commute-btn pc-commute-btn-in" onclick="PCApp.handleCheckIn()">
                <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                출근하기
              </button>
              <button class="pc-commute-btn pc-commute-btn-out" onclick="PCApp.handleCheckOut()">
                <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
                퇴근하기
              </button>
            </div>
          </div>

          <!-- Divider Line 2 -->
          <div class="my-5 border-t border-outline/60"></div>

          <!-- 3. Leave / Vacation Section -->
          <div>
            <div class="pc-card-header mb-3">
              <span class="pc-card-title whitespace-nowrap flex items-center gap-2">
                <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/>
                </svg>
                연차
              </span>
              <button class="pc-card-action text-xs" onclick="PCApp.switchScreen('request')">신청</button>
            </div>
            
            <div class="pc-leave-stat-grid mb-3.5">
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
                <span class="font-bold text-sm text-on-surface">연차 (종일)</span>
                <span class="text-xs text-on-surface-variant font-medium">2026-08-19</span>
              </div>
              <div class="pc-leave-history-item">
                <span class="font-bold text-sm text-secondary">반차 (오후)</span>
                <span class="text-xs text-on-surface-variant font-medium">2026-08-21</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Birthday Widget
    const birthWrap = document.getElementById('pc-widget-birthday');
    if (birthWrap) {
      birthWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title whitespace-nowrap">
              <svg class="w-5 h-5 text-tertiary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.3-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.64V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.64c-.56.41-1.23.64-1.96.64-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.39.57 1.08 0 1.96-.88 1.96-1.96V12c0-1.66-1.34-3-3-3z"/>
              </svg>
              8월 생일자 🎂
            </span>
            <span class="text-xs font-bold text-primary">1명</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img src="./profile.png" class="w-11 h-11 rounded-full object-cover border border-outline" />
            <div>
              <p class="font-bold text-on-surface text-sm">이재광 팀장 (퍼블리싱팀)</p>
              <p class="text-xs text-on-surface-variant font-medium mt-0.5">08월 11일 · 축하메시지 전송</p>
            </div>
          </div>
        </div>
      `;
    }
  },

  // 5-2. Center Column (2열: 근태일지 & 오늘의 일정 통합 위젯 -> 공지사항 위젯)
  renderCenterCol() {
    // 1. Company Schedule & Today's Schedule Integrated Widget (2열 최상단: 근태일지 간소화 달력 + 구분선 + 오늘의 일정 통합)
    this.renderCompanyScheduleWidget();

    // 2. Notice Card Widget (최근 5개 공지사항 카드 UI)
    const noticeWrap = document.getElementById('pc-widget-notice-banner');
    if (noticeWrap) {
      const notices = (this.state.notices && this.state.notices.length > 0)
        ? this.state.notices.slice(0, 5)
        : (window.MockData && window.MockData.notices ? window.MockData.notices.slice(0, 5) : []);

      noticeWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header mb-3">
            <span class="pc-card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              공지사항
            </span>
            <button class="pc-card-action" onclick="PCApp.switchScreen('notice')">전체보기</button>
          </div>

          <div class="space-y-1">
            ${notices.length > 0 ? notices.map((n, idx) => `
              <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline/50 group" onclick="PCApp.openNoticeModal(${idx})">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span class="px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${n.isPinned || n.pinned ? 'bg-[#fee2e2] text-[#ef4444] dark:bg-rose-500/20 dark:text-rose-300' : 'bg-surface-container text-on-surface-variant dark:bg-surface-container dark:text-on-surface'}">
                    ${n.isPinned || n.pinned ? '필독' : (n.category || '공통')}
                  </span>
                  <span class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    ${n.title}
                  </span>
                </div>
                <div class="flex items-center gap-2 shrink-0 text-xs text-on-surface-variant font-medium">
                  <span class="whitespace-nowrap">${n.date}</span>
                </div>
              </div>
            `).join('') : '<p class="text-xs text-on-surface-variant text-center py-4">등록된 공지사항이 없습니다.</p>'}
          </div>
        </div>
      `;
    }

    // 3. Finance & Expenses Widget (경비 내역 위젯)
    const expenseWrap = document.getElementById('pc-widget-expense');
    if (expenseWrap) {
      const unresolvedCorp = (this.state.finance && this.state.finance.expenses && this.state.finance.expenses.corp || []).filter(e => e.status === 'unresolved');
      const unresolvedPersonal = (this.state.finance && this.state.finance.expenses && this.state.finance.expenses.personal || []).filter(e => e.status === 'unresolved');
      const allUnresolved = (unresolvedCorp.length || unresolvedPersonal.length)
        ? [...unresolvedCorp, ...unresolvedPersonal]
        : [
            { id: 1, title: '디자인팀 Figma 연간 라이선스 결제', amount: 450000, date: '2026.08.24', category: '법인카드' },
            { id: 2, title: '고객사 미팅 시내교통비 청구', amount: 15400, date: '2026.08.25', category: '개인영수증' }
          ];

      expenseWrap.innerHTML = `
        <div class="pc-bento-card">
          <div>
            <div class="pc-card-header mb-3">
              <span class="pc-card-title flex items-center gap-2">
                <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                경비 내역
              </span>
              <button class="pc-card-action" onclick="PCApp.switchScreen('finance')">상세보기</button>
            </div>

            <div class="flex justify-between items-center bg-surface-container-low/70 px-3.5 py-2 rounded-xl mb-3">
              <span class="text-xs font-bold text-on-surface">미청구 내역</span>
              <span class="font-headline text-base font-black text-primary">${allUnresolved.length} <span class="text-xs font-medium text-on-surface-variant">건</span></span>
            </div>

            <div class="space-y-2">
              ${allUnresolved.slice(0, 2).map(e => `
                <div class="flex justify-between items-center p-2.5 bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl border border-transparent hover:border-outline/50 transition-all cursor-pointer group" onclick="PCApp.switchScreen('finance')">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <div class="w-7 h-7 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant shrink-0">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">${e.title}</p>
                      <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">${e.date || '2026.08.26'} · ${e.category || '법인카드'}</p>
                    </div>
                  </div>
                  <span class="font-bold text-xs text-primary shrink-0 ml-2">${Number(e.amount).toLocaleString()}원</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // 4. Pending Approvals Widget (결재 내역 / 결재 대기 위젯)
    const approvalWrap = document.getElementById('pc-widget-approval');
    if (approvalWrap) {
      const pendingApprovals = (this.state.approvals && this.state.approvals.filter(a => a.status === 'pending')) || [
        { id: 'appr-101', title: '8월 4주차 UI/UX 라이선스 구매 품의', drafter: '손석호 대리', date: '2026.08.25', dept: '디자인팀' },
        { id: 'appr-102', title: '2026 하반기 신규 서버 증설 결재', drafter: '정영훈 과장', date: '2026.08.26', dept: '개발팀' }
      ];

      approvalWrap.innerHTML = `
        <div class="pc-bento-card">
          <div>
            <div class="pc-card-header mb-3">
              <span class="pc-card-title flex items-center gap-2">
                <svg class="w-5 h-5 text-tertiary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.71 5.29l-3-3a1.003 1.003 0 0 0-1.42 0L3 16.59V21h4.41L21.71 6.71c.39-.39.39-1.03 0-1.42zM6.59 19H5v-1.59l11-11L17.59 8l-11 11z"/>
                </svg>
                결재 내역
              </span>
              <span class="bg-tertiary-container text-on-tertiary-container font-label text-xs font-bold px-2 py-0.5 rounded-full">${pendingApprovals.length}건</span>
            </div>

            <div class="flex justify-between items-center bg-surface-container-low/70 px-3.5 py-2 rounded-xl mb-3">
              <span class="text-xs font-bold text-on-surface">대기 중인 결재</span>
              <span class="font-headline text-base font-black text-amber-600 dark:text-amber-400">${pendingApprovals.length} <span class="text-xs font-medium text-on-surface-variant">건</span></span>
            </div>

            <div class="space-y-2">
              ${pendingApprovals.slice(0, 2).map(a => `
                <div class="flex justify-between items-center p-2.5 bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl border border-transparent hover:border-outline/50 transition-all cursor-pointer group" onclick="PCApp.switchScreen('approval')">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <div class="w-7 h-7 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">${a.title}</p>
                      <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">${a.date} · ${a.drafter}</p>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 shrink-0 ml-2">결재대기</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  },

  // 5-2. Center Column: Integrated Attendance Calendar & Today's Schedule Widget (캘린더 달력 + 구분선 + 선택 일자 일정 통합 위젯)
  renderCompanyScheduleWidget() {
    const schedWrap = document.getElementById('pc-widget-company-schedule');
    if (!schedWrap) return;

    const year = this.state.calYear || 2026;
    const month = this.state.calMonth || 8;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    const now = new Date();

    // Calculate monthly total
    let monthTotalScheds = 0;
    for (let d = 1; d <= lastDate; d++) {
      const schs = this.getSchedulesForDay(year, month, d) || [];
      monthTotalScheds += schs.length;
    }

    // Today & Selected Date Calculation
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    const selYear = this.state.selectedCalYear || year;
    const selMonth = this.state.selectedCalMonth || month;
    const selDay = (this.state.selectedCalDay !== undefined && this.state.selectedCalDay !== null)
      ? this.state.selectedCalDay
      : (selMonth === todayMonth && selYear === todayYear ? todayDay : 1);

    const selDate = new Date(selYear, selMonth - 1, selDay);
    const selDayOfWeekStr = dayNames[selDate.getDay()];
    const isSelectedToday = (selYear === todayYear && selMonth === todayMonth && selDay === todayDay);
    const scheduleTitleLabel = isSelectedToday ? '오늘의 일정' : `${selMonth}월 ${selDay}일 일정`;
    const selSchedules = this.getSchedulesForDay(selYear, selMonth, selDay) || [];

    schedWrap.innerHTML = `
      <div class="pc-bento-card">
        <!-- 1. Top Section: 캘린더 간소화 달력 (중앙 년월 네비게이션 & 배경/보더 없음, 전체보기/총건수 삭제) -->
        <div class="flex items-center justify-between mb-3 relative min-h-[32px]">
          <div class="flex items-center gap-2">
            <span class="pc-card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
              캘린더
            </span>
          </div>

          <!-- Centered Month Controls without background/border -->
          <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <button type="button" class="p-1 hover:bg-surface-container-low rounded-full text-on-surface transition-colors" onclick="PCApp.changeDashboardCalMonth(-1)" title="이전 달">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="px-1.5 font-bold text-sm text-on-surface min-w-[70px] text-center">${year}.${String(month).padStart(2, '0')}</span>
            <button type="button" class="p-1 hover:bg-surface-container-low rounded-full text-on-surface transition-colors" onclick="PCApp.changeDashboardCalMonth(1)" title="다음 달">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>

          <div></div>
        </div>

        <!-- Simplified Calendar Grid in Dashboard Card -->
        <div>
          <!-- Day of week header -->
          <div class="grid grid-cols-7 gap-1.5 mb-1.5 text-center font-bold text-xs select-none">
            <div class="py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">일</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">월</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">화</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">수</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">목</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">금</div>
            <div class="py-1 rounded bg-surface-container-low text-on-surface">토</div>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-1.5">
            ${this.generateDashboardCalGridHTML(year, month, firstDay, lastDate, now, selDay, selMonth, selYear)}
          </div>
        </div>

        <!-- Divider Line (캘린더와 하단 일정 구분선) -->
        <div class="my-5 border-t border-outline/60"></div>

        <!-- 2. Bottom Section: 선택 일자 일정 -->
        <div>
          <div class="pc-card-header mb-3">
            <div class="flex items-center gap-2.5">
              <span class="pc-card-title flex items-center gap-2">
                <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                </svg>
                ${scheduleTitleLabel}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary whitespace-nowrap">${selMonth}월 ${selDay}일 (${selDayOfWeekStr}) · 총 ${selSchedules.length}건</span>
            </div>
            <button class="pc-card-action text-xs" onclick="PCApp.switchScreen('calendar')">전체보기</button>
          </div>

          <div class="space-y-2.5">
            ${selSchedules.length > 0 ? selSchedules.map(s => {
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
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-surface-container text-on-surface-variant border border-outline/30 whitespace-nowrap shrink-0">
                  <svg class="w-3 h-3 text-on-surface-variant shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>${s.location}</span>
                </span>
              ` : '';

              return `
                <div class="flex items-center ${colorInfo.cardBgClass} p-3.5 rounded-2xl border border-outline/30 hover:border-primary/50 transition-all gap-3 cursor-pointer group" onclick="PCApp.switchScreen('calendar')" title="클릭하여 캘린더 전체 일정 보기">
                  <div class="flex items-center gap-2 shrink-0">
                    <div class="w-2.5 h-2.5 rounded-full ${colorInfo.dotClass} shrink-0"></div>
                  </div>
                  <div class="flex-1 text-left min-w-0 flex flex-col justify-center">
                    <div class="flex items-center justify-between gap-2 mb-1.5 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                        ${authorText}
                        ${colorInfo.badgeHtml}
                        ${locationBadgeHtml}
                      </div>
                      <span class="text-xs text-on-surface-variant font-medium whitespace-nowrap shrink-0 leading-none ml-auto">${s.time}</span>
                    </div>
                    <div class="text-sm text-on-surface font-bold leading-snug truncate group-hover:text-primary transition-colors">${this.formatScheduleCleanLabel(s)}</div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="p-6 text-center text-on-surface-variant font-medium bg-surface-container-low rounded-2xl">
                <svg class="w-8 h-8 text-on-surface-variant/40 mx-auto mb-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                <p class="font-bold text-sm text-on-surface">${selMonth}월 ${selDay}일에 등록된 일정이 없습니다.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // Calendar Grid Generator (Dashboard Widget - 날짜 숫자 확대 & 이벤트 수 뱃지만 노출하는 간소화 캘린더)
  generateDashboardCalGridHTML(year, month, firstDay, lastDate, now, selDay, selMonth, selYear) {
    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="h-11 sm:h-12 p-1 bg-surface-container-lowest/30 border border-outline/20 rounded-xl opacity-30"></div>`;
    }

    // Days
    for (let d = 1; d <= lastDate; d++) {
      const isToday = (d === now.getDate() && month === (now.getMonth() + 1) && year === now.getFullYear());
      const isSelected = (d === selDay && month === selMonth && year === selYear);
      const dayOfWeek = (firstDay + d - 1) % 7;
      const isSunday = (dayOfWeek === 0);
      const isSaturday = (dayOfWeek === 6);

      const daySchedules = this.getSchedulesForDay(year, month, d) || [];

      let dateNumClass = 'text-on-surface';
      if (isSunday) dateNumClass = 'text-red-500 font-bold';
      else if (isSaturday) dateNumClass = 'text-blue-500 font-bold';

      const selectedClass = isSelected
        ? 'ring-2 ring-primary bg-primary/15 border-primary shadow-xs font-black'
        : (isToday ? 'ring-1 ring-primary/40 bg-primary/5 border-outline/60' : 'bg-surface-container-low/70 hover:bg-primary/10 border-outline/60 hover:border-primary');

      html += `
        <div class="h-11 sm:h-12 px-2 py-1.5 border rounded-xl transition-all cursor-pointer flex items-center justify-between group ${selectedClass}" onclick="PCApp.selectDashboardDate(${year}, ${month}, ${d})" title="${month}월 ${d}일 (일정 ${daySchedules.length}건) · 클릭하여 일정 확인">
          <span class="text-sm sm:text-base font-bold ${dateNumClass} ${isToday ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs' : ''}">${d}</span>
          ${daySchedules.length > 0 ? `<span class="min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center bg-primary/15 text-primary group-hover:bg-primary group-hover:text-white transition-colors">${daySchedules.length}</span>` : ''}
        </div>
      `;
    }

    return html;
  },

  selectDashboardDate(year, month, day) {
    this.state.selectedCalYear = year;
    this.state.selectedCalMonth = month;
    this.state.selectedCalDay = day;
    this.renderCompanyScheduleWidget();
  },

  changeDashboardCalMonth(offset) {
    let y = this.state.calYear || 2026;
    let m = this.state.calMonth || 8;
    m += offset;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    const now = new Date();
    this.state.calYear = y;
    this.state.calMonth = m;
    this.state.selectedCalYear = y;
    this.state.selectedCalMonth = m;
    this.state.selectedCalDay = (m === (now.getMonth() + 1) && y === now.getFullYear()) ? now.getDate() : 1;
    this.renderCompanyScheduleWidget();
  },

  // 2. Today's Schedule Widget (하위 호환성 유지)
  renderTodayScheduleWidget() {
    this.renderCompanyScheduleWidget();
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
          chipClass: 'bg-surface-container text-on-surface-variant border border-outline/30 font-bold shadow-xs',
          badgeHtml: '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-surface-container text-on-surface-variant border border-outline/25 whitespace-nowrap shrink-0">외근</span>',
          dotClass: 'bg-primary',
          cardBgClass: 'bg-surface-container-lowest border-outline/25 hover:bg-surface-container-low'
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
      default:
        return {
          chipClass: 'bg-surface-container text-on-surface font-bold',
          badgeHtml: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold leading-none bg-surface-container text-on-surface whitespace-nowrap shrink-0">${category || '일정'}</span>`,
          dotClass: 'bg-primary',
          cardBgClass: 'bg-surface-container-lowest border-outline/30 hover:bg-surface-container-low'
        };
    }
  },

  // 5-3. Right Column (하단 서브 3열)
  renderRightCol() {
    // 1. Quick Action Widget (Figma Style)
    const quickWrap = document.getElementById('pc-widget-quick-menu');
    if (quickWrap) {
      quickWrap.innerHTML = `
        <div class="bg-transparent border-0 shadow-none p-0">
          <div class="pc-card-header mb-2.5 px-0.5">
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

    // 2. Project Status Donut Chart Widget (5대 핵심 영역 구성 & Harmonic Blue Donut Spec)
    const summaryWrap = document.getElementById('pc-widget-project-summary');
    if (summaryWrap) {
      const allProjects = (this.state.projects || (window.MockData && window.MockData.projects) || []);
      const totalCount = allProjects.length || 1;

      // 5대 핵심 영역 카테고리 정의 (단일 조화 블루 팔레트 매핑)
      const catDefs = [
        { key: 'operation', num: '01', name: '운영용역', color: '#0052D0' },
        { key: 'build', num: '02', name: '구축중', color: '#0070E0' },
        { key: 'maintenance', num: '03', name: '유지보수', color: '#2563EB' },
        { key: 'improvement', num: '04', name: '개선사업', color: '#4B96F3' },
        { key: 'in_progress', num: '05', name: '진행중', color: '#93C5FD' }
      ];

      const counts = {
        operation: 0,
        build: 0,
        maintenance: 0,
        improvement: 0,
        in_progress: 0,
        completed: 0
      };

      allProjects.forEach(p => {
        const c = this.getProjectCategory(p);
        if (counts[c] !== undefined) counts[c]++;
        else counts.in_progress++;
      });

      const activeCategories = catDefs.map(cat => {
        const count = counts[cat.key] || 0;
        const pct = allProjects.length > 0 ? Math.round((count / allProjects.length) * 100) : 0;
        return { ...cat, count, pct };
      });

      summaryWrap.innerHTML = `
        <div class="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 w-full shadow-[0_8px_32px_rgba(35,44,81,0.06)] border border-outline-variant/15 relative overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            <!-- Left Half: Header & 5 Area Progress List -->
            <div class="md:col-span-6 md:border-r md:border-outline-variant/20 md:pr-6 flex flex-col justify-between h-full">
              <div>
                <!-- Main Header -->
                <div class="mb-4">
                  <h3 class="font-headline text-lg sm:text-xl font-black text-on-surface tracking-tight">프로젝트 현황</h3>
                </div>

                <!-- 5 Status Progress Items (Single row: Name - Bar - Percent) -->
                <div class="space-y-3.5">
                  ${activeCategories.map(cat => `
                    <div 
                      class="flex items-center gap-3 cursor-pointer group rounded-xl p-1 -mx-1 hover:bg-surface-container-low transition-colors"
                      onclick="PCApp.switchScreen('project'); PCApp.setProjectFilter('${cat.key}');"
                      title="${cat.name} (${cat.count}건 / ${cat.pct}%) 프로젝트 보기"
                    >
                      <!-- Left: Dot + Category Name -->
                      <div class="flex items-center gap-2 shrink-0 min-w-[70px]">
                        <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${cat.color};"></span>
                        <span class="text-xs font-bold text-on-surface group-hover:text-primary transition-colors whitespace-nowrap">${cat.name}</span>
                      </div>

                      <!-- Middle: Inline Progress Bar -->
                      <div class="flex-1 bg-[#E8F1FC] dark:bg-surface-container-high rounded-full h-2 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-700" style="background-color: ${cat.color}; width: ${cat.pct}%;"></div>
                      </div>

                      <!-- Right: Percentage -->
                      <span class="text-xs font-extrabold text-on-surface font-mono shrink-0 min-w-[36px] text-right">${cat.pct}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right Half: Donut Chart -->
            <div class="md:col-span-6 flex flex-col items-center justify-center">
              <!-- Donut Chart Canvas with Center 100% -->
              <div class="relative w-44 h-44 sm:w-48 sm:h-48 my-1 flex items-center justify-center">
                <canvas id="pc-project-donut-canvas" class="w-full h-full"></canvas>

                <!-- Center Text inside Doughnut cutout -->
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span class="font-headline text-3xl font-black text-primary tracking-tight">100%</span>
                  <span class="text-xs font-bold text-on-surface-variant mt-0.5">전체 프로젝트</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;

      // Chart.js Doughnut 인스턴스 생성 및 렌더링
      const canvas = document.getElementById('pc-project-donut-canvas');
      if (canvas && window.Chart) {
        if (this._projectChart) {
          try { this._projectChart.destroy(); } catch (_) {}
          this._projectChart = null;
        }

        const labels = activeCategories.map(c => c.name);
        const data = activeCategories.map(c => c.count);
        const bgColors = activeCategories.map(c => c.color);

        this._projectChart = new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: bgColors,
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 6,
              cutout: '68%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(35, 44, 81, 0.92)',
                titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
                bodyFont: { family: 'Manrope', size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const idx = context.dataIndex;
                    const cat = activeCategories[idx];
                    return ` ${cat.name}: ${cat.count}건 (${cat.pct}%)`;
                  }
                }
              }
            },
            animation: {
              duration: 750,
              easing: 'easeOutQuart'
            },
            onClick: (evt, elements) => {
              if (elements && elements.length > 0) {
                const elementIndex = elements[0].index;
                const cat = activeCategories[elementIndex];
                if (cat) {
                  PCApp.switchScreen('project');
                  PCApp.setProjectFilter(cat.key);
                }
              }
            }
          }
        });
      }
    }

    // 3. To-Do Widget (카드 형태 최근 3개 렌더링)
    const todoWrap = document.getElementById('pc-widget-todo');
    if (todoWrap) {
      const topTodos = (this.state.todos || []).slice(0, 3);
      todoWrap.innerHTML = `
        <div class="pc-bento-card">
          <div class="pc-card-header">
            <span class="pc-card-title">
              <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM19.79 10.22C19.92 10.79 20 11.39 20 12c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.66 0 3.2.51 4.48 1.39l1.45-1.45C16.19 2.7 14.19 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z"/>
              </svg>
              할일 목록
            </span>
            <button class="pc-card-action" onclick="PCApp.switchScreen('todo')">전체보기</button>
          </div>

          <div class="space-y-3">
            ${topTodos.length > 0 ? topTodos.map((t, idx) => {
              const isDone = t.status === 'done' || t.completed;
              const statusBg = isDone ? 'bg-secondary-container text-secondary' : (t.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant');
              const statusText = isDone ? '완료' : (t.status === 'in_progress' ? '진행 중' : '대기');
              const prioBg = t.priority === 'high' ? 'bg-error-container text-error' : (t.priority === 'low' ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container text-tertiary');
              const prioText = t.priority === 'high' ? '높음' : (t.priority === 'low' ? '낮음' : '보통');
              const assignee = (t.assignees && t.assignees[0]) || { name: this.state.user.name, avatar: this.state.user.avatar };

              return `
                <div class="p-3.5 rounded-xl border border-outline hover:border-primary transition-all cursor-pointer group flex flex-col justify-between gap-2.5" onclick="PCApp.openTodoDetailModal(${t.id})">
                  <div class="flex items-center justify-between gap-1.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${statusBg}">${statusText}</span>
                      <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${prioBg}">${prioText}</span>
                      <span class="text-xs font-bold text-primary truncate max-w-[120px]"># ${t.project || '일반 업무'}</span>
                    </div>
                    <button type="button" onclick="event.stopPropagation(); PCApp.toggleTodo(${idx});" class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${isDone ? 'bg-secondary border-secondary text-white' : 'border-outline hover:border-primary bg-surface-container-lowest'}" title="${isDone ? '미완료로 변경' : '완료 처리'}">
                      ${isDone ? '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                    </button>
                  </div>

                  <h4 class="font-bold text-sm text-on-surface line-clamp-2 leading-snug ${isDone ? 'line-through opacity-50' : ''}">
                    ${t.title}
                  </h4>

                  <div class="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline/50">
                    <div class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                      <span class="font-medium text-xs">${t.dueDate || '마감일 미지정'}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                      <img src="${assignee.avatar || './profile.png'}" class="w-5 h-5 rounded-full object-cover border border-outline/30 shrink-0" alt="${assignee.name}" />
                      <span class="text-xs font-bold text-on-surface">${assignee.name}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('') : '<p class="text-xs text-on-surface-variant text-center py-4">등록된 할 일이 없습니다.</p>'}
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

  renderDirectoryView() {
    const container = document.getElementById('pc-directory-grid');
    if (!container) return;

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const todaySchedules = this.getSchedulesForDay(curYear, curMonth, curDay) || [];

    const membersList = (this.state.members && this.state.members.length) ? this.state.members : ((window.MockData && window.MockData.employees) || []);

    const filtered = membersList.map(m => {
      let schedText = m.todaySchedule || '';
      let foundLocation = m.location || '';
      const match = todaySchedules.find(s => {
        if (!s.author) return false;
        if (!s.author.includes(m.name)) return false;
        if (m.role && (s.author.includes('팀장') || s.author.includes('본부장') || s.author.includes('대표') || s.author.includes('차장') || s.author.includes('과장') || s.author.includes('대리') || s.author.includes('주임') || s.author.includes('사원') || s.author.includes('수습'))) {
          return s.author.includes(m.role) || (m.dept && s.author.includes(m.dept));
        }
        return true;
      });
      if (match) {
        if (match.location) foundLocation = match.location;
        schedText = this.simplifyScheduleText(match.title || match.badge, foundLocation);
      } else if (m.todaySchedule) {
        schedText = this.simplifyScheduleText(m.todaySchedule, foundLocation);
      }

      let status = m.status || 'work';
      let statusText = m.statusText || '근무중';
      if (schedText && schedText.startsWith('외근')) {
        status = 'business';
        statusText = '외근중';
      } else if (schedText === '연차') {
        status = 'offwork';
        statusText = '휴가';
      }

      return {
        ...m,
        status,
        statusText,
        location: foundLocation,
        todaySchedule: schedText
      };
    }).filter(m => {
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
      const isOff = m.status === 'offwork' || m.statusText === '퇴근' || m.statusText === '휴가';
      const isBusiness = m.status === 'business' || m.statusText === '외근중';
      const statusClass = isBusiness ? 'bg-surface-container text-on-surface-variant border border-outline/20' : isWork ? 'bg-secondary-container text-secondary' : isOff ? 'bg-surface-container-high text-on-surface-variant' : 'bg-surface-container text-on-surface-variant';
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

  // 6-3. Work Report Screen (팀별 / 주간 / 일간 업무보고)
  switchWorkReportTab(tab) {
    this.state.workReportTab = tab;
    const tabBtns = document.querySelectorAll('.pc-report-nav-tab');
    tabBtns.forEach(btn => {
      btn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high pc-report-nav-tab';
    });
    const activeBtn = document.getElementById(`pc-tab-btn-report-${tab}`);
    if (activeBtn) {
      activeBtn.className = 'flex-1 py-3.5 rounded-2xl font-bold text-base transition-all bg-primary text-white shadow-xs pc-report-nav-tab active';
    }
    this.renderWorkReportControls();
    this.renderWorkReportView();
  },

  changeReportWeek(delta) {
    let week = (this.state.workReportWeek || 3) + delta;
    if (week < 1) week = 1;
    if (week > 4) week = 4;
    this.state.workReportWeek = week;
    this.renderWorkReportControls();
    this.renderWorkReportView();
  },

  changeReportDate(delta) {
    const curr = new Date(this.state.workReportDate || '2026-08-25');
    curr.setDate(curr.getDate() + delta);
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    this.state.workReportDate = `${y}-${m}-${d}`;
    this.renderWorkReportControls();
    this.renderWorkReportView();
  },

  selectReportTeam(dept, chipEl) {
    this.state.workReportTeam = dept;
    const chips = document.querySelectorAll('.pc-report-team-chip');
    chips.forEach(c => {
      c.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 transition-all pc-report-team-chip';
    });
    if (chipEl) {
      chipEl.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shrink-0 shadow-xs transition-all pc-report-team-chip active';
    }
    this.renderWorkReportView();
  },

  setWorkReportDept(dept, btn) {
    this.selectReportTeam(dept, btn);
  },

  renderWorkReportControls() {
    const container = document.getElementById('pc-work-report-sub-controls');
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
        <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline/40 shadow-xs w-full max-w-xl mx-auto">
          <button type="button" onclick="PCApp.changeReportWeek(-1)" class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-xl transition-all active:scale-95" title="이전 주">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="text-center">
            <h3 class="font-bold text-lg text-primary">${year}년 ${month}월 ${week}주차</h3>
            <p class="text-xs text-on-surface-variant font-medium mt-0.5">${rangeText}</p>
          </div>
          <button type="button" onclick="PCApp.changeReportWeek(1)" class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-xl transition-all active:scale-95" title="다음 주">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      `;
    } else if (tab === 'daily') {
      const dateStr = this.state.workReportDate || '2026-08-25';
      const d = new Date(dateStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = days[d.getDay()];

      container.innerHTML = `
        <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline/40 shadow-xs w-full max-w-xl mx-auto">
          <button type="button" onclick="PCApp.changeReportDate(-1)" class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-xl transition-all active:scale-95" title="이전 날">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="text-center">
            <h3 class="font-bold text-lg text-primary">${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayName})</h3>
            <p class="text-xs text-secondary font-bold mt-0.5">금일 일일 업무 진행 현황</p>
          </div>
          <button type="button" onclick="PCApp.changeReportDate(1)" class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-xl transition-all active:scale-95" title="다음 날">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
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
          ? 'bg-primary text-white shadow-xs active'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
        return `
          <button class="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 pc-report-team-chip ${activeClass}" onclick="PCApp.selectReportTeam('${t}', this)">${teamLabels[t]}</button>
        `;
      }).join('');

      container.innerHTML = `
        <div class="flex gap-2 overflow-x-auto pb-1" id="pc-report-team-chips">
          ${chipsHtml}
        </div>
      `;
    }
  },

  renderWorkReportView() {
    this.renderWorkReportControls();

    const wrap = document.getElementById('pc-workreport-full-container');
    if (!wrap) return;

    const tab = this.state.workReportTab || 'weekly';

    // 1. 주간 업무보고 탭
    if (tab === 'weekly') {
      const week = this.state.workReportWeek || 3;
      const allReports = (this.state.workReports && this.state.workReports.length > 0)
        ? this.state.workReports
        : ((window.MockData && window.MockData.workReports) || []);

      const filtered = allReports.filter(r => r.week === week || (!r.week && week === 3));

      if (filtered.length === 0) {
        wrap.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-12 text-center text-on-surface-variant font-medium shadow-xs border border-outline/40 flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-outline mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <p class="text-base font-bold text-on-surface mb-1">선택하신 8월 ${week}주차에 등록된 주간 업무보고가 없습니다.</p>
            <p class="text-xs text-on-surface-variant">상단 컨트롤러를 통해 다른 주차를 확인해 보세요.</p>
          </div>
        `;
        return;
      }

      const renderSectionBlock = (sections) => {
        if (!sections || sections.length === 0) return '<p class="text-xs text-on-surface-variant italic">등록된 내역이 없습니다.</p>';
        return sections.map((sec, idx) => {
          const divider = idx > 0 ? `<div class="h-px w-full bg-outline-variant/15 my-2"></div>` : '';

          let itemsHtml = '';
          if (sec.items && sec.items.length > 0) {
            itemsHtml = `
              <ul class="text-xs text-on-surface-variant space-y-1.5 pl-1 list-disc list-inside mt-1 leading-relaxed">
                ${sec.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            `;
          }

          let commentHtml = '';
          if (sec.comment) {
            commentHtml = `
              <p class="text-xs text-error-dim pl-1 mt-1.5 font-semibold leading-relaxed">
                ${sec.comment}
              </p>
            `;
          }

          const isGenericLabel = !sec.label || ['전주', '금주', '전주 실적', '금주 진행', '작업내역', '디자인', '개발', '기획', '퍼블리싱', '프로젝트 진행 중'].includes(sec.label.trim());
          const labelHtml = isGenericLabel ? '' : `<span class="text-xs font-semibold text-on-surface ml-1.5">(${sec.label})</span>`;

          return `
            ${divider}
            <div class="text-left">
              <div class="flex items-center gap-1.5 mb-1">
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

      wrap.innerHTML = filtered.map((report, rIdx) => {
        const theme = alternatingThemes[rIdx % alternatingThemes.length];
        const prevSections = report.prevWeekSections || [];
        const thisSections = report.thisWeekSections || report.sections || [];

        return `
          <article class="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 shadow-2xs hover:shadow-xs transition-all duration-200 text-left border border-outline/40 ${theme.borderLeft}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline/30">
              <div class="min-w-0">
                <span class="text-xs font-semibold ${theme.badgeBg} px-2.5 py-0.5 rounded-md mb-1.5 inline-block shadow-2xs">${report.client}</span>
                <h3 class="font-bold text-on-surface text-lg hover:text-primary transition-colors">${report.title}</h3>
                <p class="text-xs text-on-surface-variant mt-1 font-medium flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                  <span>${report.period}</span>
                  <span class="text-outline">·</span>
                  <span>주관: <strong>${report.primaryDept || '수행본부'}</strong></span>
                </p>
              </div>
              <span class="text-xs font-bold px-3 py-1 bg-surface-container-high rounded-full text-on-surface-variant shrink-0 self-start sm:self-auto">${report.weekLabel || `2026년 8월 ${week}주차`}</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- 1. [전주] 실적 (좌측 박스) -->
              <div class="space-y-2 flex flex-col">
                <div class="flex items-center gap-1.5 px-0.5">
                  <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-surface-container-highest text-on-surface flex items-center gap-1.5 shadow-2xs">
                    <svg class="w-3.5 h-3.5 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                    <span>전주 실적 (Last Week)</span>
                  </span>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-4 flex-1 flex flex-col gap-2.5 shadow-xs border border-outline/40">
                  ${renderSectionBlock(prevSections)}
                </div>
              </div>

              <!-- 2. [금주] 계획 및 진행 (우측 박스) -->
              <div class="space-y-2 flex flex-col">
                <div class="flex items-center gap-1.5 px-0.5">
                  <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary flex items-center gap-1.5 shadow-2xs border border-primary/20">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                    <span>금주 계획 및 진행 (This Week)</span>
                  </span>
                </div>
                <div class="bg-surface-container-lowest rounded-xl p-4 flex-1 flex flex-col gap-2.5 shadow-xs border border-outline/40">
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
        wrap.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-12 text-center text-on-surface-variant font-medium shadow-xs border border-outline/40 flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-outline mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
            <p class="text-base font-bold text-on-surface mb-1">${dateStr} 일자에 등록된 일간 업무보고가 없습니다.</p>
            <p class="text-xs text-on-surface-variant">상단 날짜 컨트롤러를 통해 8월 25일, 24일, 21일 등을 확인해 보세요.</p>
          </div>
        `;
        return;
      }

      wrap.innerHTML = filtered.map(item => {
        const isDone = item.status === 'completed';
        const statusBadge = isDone
          ? `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-[#00693f]/10 text-[#00693f] dark:text-emerald-300 border border-[#00693f]/20">완료</span>`
          : `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">진행중</span>`;

        return `
          <article class="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 shadow-2xs hover:shadow-xs transition-all duration-200 text-left border border-outline/40 border-l-[5px] border-l-primary">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline/30">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span class="text-xs font-semibold bg-surface-container-highest text-on-surface px-2.5 py-0.5 rounded-md shadow-2xs">${item.client}</span>
                  <span class="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">${item.primaryDept}</span>
                  ${statusBadge}
                </div>
                <h3 class="font-bold text-on-surface text-lg leading-snug">${item.project}</h3>
                <p class="text-xs text-on-surface-variant mt-1 font-medium flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <span>작성자/담당: <strong class="text-on-surface">${item.author}</strong></span>
                  <span class="text-outline">·</span>
                  <span>보고 일자: <strong>${item.date}</strong></span>
                </p>
              </div>
            </div>

            <!-- 금일 / 명일 2열 Bento 그리드 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- 금일 수행 업무 (Today) -->
              <div class="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline/40 flex flex-col gap-2.5">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <h4 class="text-xs font-bold text-primary">금일 수행 업무 (Today's Tasks)</h4>
                </div>
                <ul class="text-xs text-on-surface-variant space-y-1.5 pl-2 list-disc list-inside leading-relaxed font-body">
                  ${item.todayTasks.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>

              <!-- 명일 예정 업무 (Tomorrow Plan) -->
              <div class="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline/40 flex flex-col gap-2.5">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#00693f]"></span>
                  <h4 class="text-xs font-bold text-[#00693f] dark:text-emerald-300">명일 예정 업무 (Tomorrow's Plan)</h4>
                </div>
                <ul class="text-xs text-on-surface-variant space-y-1.5 pl-2 list-disc list-inside leading-relaxed font-body">
                  ${item.tomorrowTasks.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>
            </div>

            ${item.note ? `
              <div class="text-xs text-on-surface-variant bg-surface-container-highest p-3 rounded-xl flex items-center gap-2 border border-outline/30">
                <svg class="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <span>특이사항/비고: <strong class="text-on-surface">${item.note}</strong></span>
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
        wrap.innerHTML = `
          <div class="bg-surface-container-lowest rounded-2xl p-12 text-center text-on-surface-variant font-medium shadow-xs border border-outline/40 flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-outline mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <p class="text-base font-bold text-on-surface mb-1">선택하신 부서(${selectedTeam})의 등록된 업무보고가 없습니다.</p>
          </div>
        `;
        return;
      }

      wrap.innerHTML = filtered.map(team => {
        const membersBadges = team.members.map(m => `
          <div class="px-3 py-1.5 rounded-lg text-xs bg-surface-container-lowest border border-outline/30 flex items-center gap-1.5 shadow-2xs">
            <span class="font-bold text-on-surface">${m.name} ${m.role}</span>
            <span class="text-outline">·</span>
            <span class="text-on-surface-variant truncate max-w-[240px]">${m.currentTask}</span>
          </div>
        `).join('');

        const projectCards = team.projects.map(p => `
          <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline/40 shadow-xs flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-outline/20">
              <span class="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">${p.client}</span>
              <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">${p.status} (${p.progress})</span>
            </div>
            <h5 class="font-bold text-sm text-on-surface">${p.title}</h5>
            <ul class="text-xs text-on-surface-variant space-y-1.5 pl-2 list-disc list-inside leading-relaxed mt-1 font-body">
              ${p.tasks.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        `).join('');

        return `
          <article class="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-5 shadow-2xs hover:shadow-xs transition-all duration-200 text-left border border-outline/40 border-l-[5px] border-l-primary">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline/30">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <h3 class="font-headline font-bold text-xl text-primary">${team.deptName}</h3>
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface">팀장: ${team.leader}</span>
                  <span class="text-xs text-on-surface-variant">소속 팀원: ${team.members.length}명</span>
                </div>
              </div>
            </div>

            <!-- 팀원 업무 배정 현황 칩 리스트 -->
            <div class="space-y-1.5">
              <h4 class="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span>팀원별 현재 전담 업무</span>
              </h4>
              <div class="flex flex-wrap gap-2">
                ${membersBadges}
              </div>
            </div>

            <!-- 팀 총괄 요약 브리핑 박스 -->
            <div class="bg-primary/5 rounded-xl p-4 border border-primary/20 flex items-start gap-2.5">
              <svg class="w-4 h-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              <p class="text-xs sm:text-sm font-medium text-on-surface leading-relaxed">${team.summary}</p>
            </div>

            <!-- 전담 프로젝트별 업무 현황 그리드 -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                <span>진행 프로젝트 및 세부 작업 내역 (${team.projects.length}건)</span>
              </h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                ${projectCards}
              </div>
            </div>
          </article>
        `;
      }).join('');
    }
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
    this.renderCalendarWidget();
    this.renderCenterCol();
  },

  goToTodayCal() {
    const now = new Date();
    this.state.calYear = now.getFullYear();
    this.state.calMonth = now.getMonth() + 1;
    this.state.selectedDate = `${this.state.calYear}-${this.state.calMonth}-${now.getDate()}`;
    this.changeCalMonth(0);
  },

  selectDate(key) {
    this.state.selectedDate = key;
    this.openDateScheduleModal(key);
  },

  // =========================================================================
  // 6. Calendar View (근태일지 - 간략화된 월간 달력 & 일자별 모달 연동)
  // =========================================================================
  renderCalendarView() {
    const year = this.state.calYear || 2026;
    const month = this.state.calMonth || 8;

    // 1. Month Label Update
    const monthLabelEl = document.getElementById('pc-cal-current-month-label');
    if (monthLabelEl) {
      monthLabelEl.innerText = `${year}년 ${month}월`;
    }

    // 2. Calculate Monthly Statistics
    const lastDate = new Date(year, month, 0).getDate();
    let totalSchedCount = 0;
    let vacationCount = 0;
    let outworkCount = 0;
    let halfVacationCount = 0;

    for (let d = 1; d <= lastDate; d++) {
      const dayScheds = this.getSchedulesForDay(year, month, d) || [];
      totalSchedCount += dayScheds.length;
      dayScheds.forEach(s => {
        const titleStr = s.title || '';
        const badgeStr = s.badge || '';
        if (titleStr.includes('연차') || titleStr.includes('휴가') || badgeStr.includes('연차') || badgeStr.includes('휴가')) vacationCount++;
        else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) outworkCount++;
        else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) halfVacationCount++;
      });
    }

    const totalStatBadge = document.getElementById('pc-cal-stat-total');
    if (totalStatBadge) {
      totalStatBadge.innerText = `총 ${totalSchedCount}건`;
    }

    const statsWrap = document.getElementById('pc-cal-monthly-stats');
    if (statsWrap) {
      statsWrap.innerHTML = `
        <div class="p-4 bg-surface-container-low border border-outline rounded-2xl flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-on-surface-variant">월간 전체 일정</p>
            <h4 class="text-2xl font-extrabold text-on-surface mt-1">${totalSchedCount}<span class="text-sm font-normal text-on-surface-variant ml-1">건</span></h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          </div>
        </div>
        <div class="p-4 bg-surface-container-low border border-outline rounded-2xl flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-on-surface-variant">연차 및 휴가</p>
            <h4 class="text-2xl font-extrabold text-[#137333] mt-1">${vacationCount}<span class="text-sm font-normal text-on-surface-variant ml-1">건</span></h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center font-bold">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.42-2.02.54 4.09 7.37-4.79 1.28-2.27-1.74-1.4.38 2.05 3.55 1.4.38 15.45-4.14c.81-.21 1.29-1.04 1.07-1.84z"/></svg>
          </div>
        </div>
        <div class="p-4 bg-surface-container-low border border-outline rounded-2xl flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-on-surface-variant">외근 및 출장</p>
            <h4 class="text-2xl font-extrabold text-[#1a73e8] mt-1">${outworkCount}<span class="text-sm font-normal text-on-surface-variant ml-1">건</span></h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.1 0 2-.89 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>
          </div>
        </div>
        <div class="p-4 bg-surface-container-low border border-outline rounded-2xl flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-on-surface-variant">반차 / 반반차</p>
            <h4 class="text-2xl font-extrabold text-[#b06000] mt-1">${halfVacationCount}<span class="text-sm font-normal text-on-surface-variant ml-1">건</span></h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center font-bold">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          </div>
        </div>
      `;
    }

    // 3. Render Calendar Grid & Side Schedule Panel
    this.renderCalendarGrid();
    this.renderCalendarSideSchedule();
  },

  selectCalendarDate(key) {
    this.state.selectedDate = key;
    this.renderCalendarGrid();
    this.renderCalendarSideSchedule(key);
  },

  renderCalendarGrid() {
    const gridWrap = document.getElementById('pc-cal-grid-container');
    if (!gridWrap) return;

    const year = this.state.calYear || 2026;
    const month = this.state.calMonth || 8;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    const now = new Date();

    const selectedKey = this.state.selectedDate || `${year}-${month}-${now.getDate()}`;

    let html = '';

    // Empty previous month padding cells
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="min-h-[105px] p-2 bg-surface-container-lowest/40 border border-outline/30 rounded-xl opacity-40"></div>`;
    }

    // Current Month Days
    for (let d = 1; d <= lastDate; d++) {
      const key = `${year}-${month}-${d}`;
      const isToday = (d === now.getDate() && month === (now.getMonth() + 1) && year === now.getFullYear());
      const isSelected = (selectedKey === key);
      const dayOfWeek = (firstDay + d - 1) % 7;
      const isSunday = (dayOfWeek === 0);
      const isSaturday = (dayOfWeek === 6);

      const daySchedules = this.getSchedulesForDay(year, month, d) || [];
      const topScheds = daySchedules.slice(0, 3);
      const extraCount = daySchedules.length - topScheds.length;

      let dateNumClass = 'text-on-surface';
      if (isSunday) dateNumClass = 'text-red-500 font-bold';
      else if (isSaturday) dateNumClass = 'text-blue-500 font-bold';

      let cellHighlight = '';
      if (isSelected) {
        cellHighlight = 'ring-2 ring-primary bg-primary/10 shadow-xs';
      } else if (isToday) {
        cellHighlight = 'border-primary/60 bg-primary/5';
      }

      html += `
        <div class="min-h-[105px] p-2 bg-surface-container-low border border-outline/70 hover:border-primary hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between group ${cellHighlight}" onclick="PCApp.selectCalendarDate('${key}')">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-extrabold ${dateNumClass} ${isToday ? 'w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs' : ''}">${d}</span>
              ${isToday ? '<span class="text-[9px] font-bold text-primary px-1 py-0.2 bg-primary/15 rounded-full">오늘</span>' : ''}
            </div>
            ${daySchedules.length > 0 ? `<span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'} transition-colors">${daySchedules.length}건</span>` : ''}
          </div>

          <div class="space-y-1 flex-1 overflow-hidden">
            ${topScheds.map(s => {
              const tagClass = this.getScheduleTagClass(s);
              const cleanLabel = this.formatScheduleCleanLabel(s);
              return `
                <div class="text-[10px] px-1 py-0.5 rounded truncate font-medium ${tagClass}" title="${cleanLabel}">
                  ${cleanLabel}
                </div>
              `;
            }).join('')}
            ${extraCount > 0 ? `<div class="text-[9px] text-on-surface-variant font-bold px-1">+${extraCount}건 더보기</div>` : ''}
          </div>
        </div>
      `;
    }

    gridWrap.innerHTML = html;
  },

  // =========================================================================
  // 6-1. Calendar Right Column: Today / Selected Date Schedule Panel (우측 상시 떠있는 패널)
  // =========================================================================
  stateSideSchedule: {
    activeFilter: 'all' // 'all', '휴가', '외근', '반차', '회의'
  },

  setSideScheduleFilter(filterCat) {
    this.stateSideSchedule.activeFilter = filterCat;
    this.renderCalendarSideSchedule();
  },

  navigateSideScheduleDate(offset) {
    let key = this.state.selectedDate;
    if (!key) {
      const now = new Date();
      key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    }
    const parts = key.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + offset);

    this.state.selectedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    this.renderCalendarGrid();
    this.renderCalendarSideSchedule();
  },

  renderCalendarSideSchedule(dateKey, activeFilter) {
    const sidePanel = document.getElementById('pc-cal-side-schedule-panel');
    if (!sidePanel) return;

    if (dateKey) this.state.selectedDate = dateKey;
    if (activeFilter !== undefined) this.stateSideSchedule.activeFilter = activeFilter;

    let key = this.state.selectedDate;
    const now = new Date();
    if (!key) {
      key = `${this.state.calYear || 2026}-${this.state.calMonth || 8}-${now.getDate()}`;
      this.state.selectedDate = key;
    }

    const parts = key.split('-').map(Number);
    const year = parts[0] || 2026;
    const month = parts[1] || 8;
    const day = parts[2] || now.getDate();

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dObj = new Date(year, month - 1, day);
    const dayName = dayNames[dObj.getDay()];
    const isToday = (day === now.getDate() && month === (now.getMonth() + 1) && year === now.getFullYear());

    const rawSchedules = this.getSchedulesForDay(year, month, day) || [];
    const filter = this.stateSideSchedule.activeFilter;

    // Filter Chips
    const filters = [
      { id: 'all', label: '전체', activeBg: 'bg-[#3b82f6] text-white shadow-xs', inactiveBg: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 hover:bg-[#d8e8fe]' },
      { id: '휴가', label: '휴가', activeBg: 'bg-[#137333] text-white shadow-xs', inactiveBg: 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 hover:bg-[#d4edd9]' },
      { id: '외근', label: '외근', activeBg: 'bg-[#1a73e8] text-white shadow-xs', inactiveBg: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 hover:bg-[#d8e8fe]' },
      { id: '반차', label: '반차', activeBg: 'bg-[#b06000] text-white shadow-xs', inactiveBg: 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 hover:bg-[#fdeec4]' },
      { id: '회의', label: '회의', activeBg: 'bg-[#6b21a8] text-white shadow-xs', inactiveBg: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/30 hover:bg-[#e9d5ff]' }
    ];

    // Grouping
    const groupMap = {};
    const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '절기', '기념일', '기타'];

    rawSchedules.forEach(s => {
      const titleStr = s.title || '';
      const badgeStr = s.badge || '';
      let cat = '기타';
      if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) cat = '휴가';
      else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) cat = '외근';
      else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) cat = '반차';
      else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) cat = '회의';
      else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) cat = '공휴일';
      else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') cat = '절기';
      else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') cat = '기념일';

      if (!groupMap[cat]) groupMap[cat] = [];
      groupMap[cat].push(s);
    });

    let listHtml = '';
    let renderedCount = 0;

    categoryOrder.forEach(catKey => {
      if (filter !== 'all' && filter !== catKey) return;

      const items = groupMap[catKey];
      if (items && items.length > 0) {
        renderedCount += items.length;
        let catTitle = catKey === '휴가' ? '연차/휴가' : catKey;
        let dotColor = 'bg-[#137333]';
        let countColor = 'text-[#137333]';

        if (catKey === '외근') {
          dotColor = 'bg-[#1a73e8]';
          countColor = 'text-[#1a73e8]';
        } else if (catKey === '반차') {
          dotColor = 'bg-[#b06000]';
          countColor = 'text-[#b06000]';
        } else if (catKey === '회의') {
          dotColor = 'bg-[#6b21a8]';
          countColor = 'text-[#6b21a8]';
        } else if (catKey === '공휴일') {
          dotColor = 'bg-[#c5221f]';
          countColor = 'text-[#c5221f]';
        }

        const cardsHtml = items.map(s => this.renderDateModalCard(s, catKey)).join('');

        listHtml += `
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${dotColor}"></span>
                <span class="font-bold text-xs text-on-surface">${catTitle}</span>
              </div>
              <span class="text-xs font-bold ${countColor}">${items.length}건</span>
            </div>
            <div class="space-y-2.5">
              ${cardsHtml}
            </div>
          </div>
        `;
      }
    });

    if (renderedCount === 0) {
      listHtml = `
        <div class="py-16 text-center text-on-surface-variant flex flex-col items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-2">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          </div>
          <p class="font-bold text-sm text-on-surface">등록된 일정이 없습니다.</p>
          <p class="text-xs text-on-surface-variant mt-0.5">휴가, 외근 등 새로운 일정을 등록해보세요.</p>
        </div>
      `;
    }

    sidePanel.innerHTML = `
      <!-- Side Panel Header with Date Navigation -->
      <div class="flex items-center justify-between pb-3.5 mb-3 border-b border-outline">
        <button type="button" class="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors" onclick="PCApp.navigateSideScheduleDate(-1)" title="이전 날짜">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>

        <div class="text-center">
          <h4 class="font-bold text-base text-on-surface flex items-center gap-1.5 justify-center">
            ${month}월 ${day}일 (${dayName})
            ${isToday ? '<span class="text-[10px] font-bold text-primary px-1.5 py-0.2 bg-primary/15 rounded-full">오늘</span>' : ''}
          </h4>
          <p class="text-xs text-primary font-bold mt-0.5">총 ${rawSchedules.length}건의 일정</p>
        </div>

        <button type="button" class="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors" onclick="PCApp.navigateSideScheduleDate(1)" title="다음 날짜">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>

      <!-- Filter Chips Bar -->
      <div class="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 shrink-0">
        ${filters.map(f => {
          const isActive = (this.stateSideSchedule.activeFilter === f.id);
          const btnClass = isActive ? f.activeBg : f.inactiveBg;
          return `
            <button type="button" class="px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${btnClass}" onclick="PCApp.setSideScheduleFilter('${f.id}')">
              ${f.label}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Schedule Cards List (Scrollable Area) -->
      <div class="flex-1 overflow-y-auto pr-1">
        ${listHtml}
      </div>
    `;
  },

  prevMonth() {
    let y = this.state.calYear || 2026;
    let m = this.state.calMonth || 8;
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
    this.state.calYear = y;
    this.state.calMonth = m;
    this.renderCalendarView();
  },

  nextMonth() {
    let y = this.state.calYear || 2026;
    let m = this.state.calMonth || 8;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
    this.state.calYear = y;
    this.state.calMonth = m;
    this.renderCalendarView();
  },

  goToCurrentMonth() {
    const now = new Date();
    this.state.calYear = now.getFullYear();
    this.state.calMonth = now.getMonth() + 1;
    this.state.selectedDate = `${this.state.calYear}-${this.state.calMonth}-${now.getDate()}`;
    this.renderCalendarView();
  },

  // =========================================================================
  // 6-2. Date Schedule Detail Modal (모바일 이미지 1:1 일치 단일 다이얼로그 모달)
  // =========================================================================
  stateDateModal: {
    currentDateKey: '2026-8-12',
    activeFilter: 'all' // 'all', '휴가', '외근', '반차', '회의'
  },

  openDateScheduleModal(dateKey, activeFilter) {
    if (dateKey) this.stateDateModal.currentDateKey = dateKey;
    if (activeFilter !== undefined) this.stateDateModal.activeFilter = activeFilter;

    const key = this.stateDateModal.currentDateKey;
    const parts = key.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dObj = new Date(year, month - 1, day);
    const dayName = dayNames[dObj.getDay()];

    const rawSchedules = this.getSchedulesForDay(year, month, day) || [];
    const filter = this.stateDateModal.activeFilter;

    // Filter Chips
    const filters = [
      { id: 'all', label: '전체', activeBg: 'bg-[#3b82f6] text-white shadow-xs', inactiveBg: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 hover:bg-[#d8e8fe]' },
      { id: '휴가', label: '휴가', activeBg: 'bg-[#137333] text-white shadow-xs', inactiveBg: 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 hover:bg-[#d4edd9]' },
      { id: '외근', label: '외근', activeBg: 'bg-[#1a73e8] text-white shadow-xs', inactiveBg: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 hover:bg-[#d8e8fe]' },
      { id: '반차', label: '반차', activeBg: 'bg-[#b06000] text-white shadow-xs', inactiveBg: 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 hover:bg-[#fdeec4]' },
      { id: '회의', label: '회의', activeBg: 'bg-[#6b21a8] text-white shadow-xs', inactiveBg: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/30 hover:bg-[#e9d5ff]' }
    ];

    // Categorization
    const groupMap = {};
    const categoryOrder = ['휴가', '외근', '반차', '회의', '공휴일', '절기', '기념일', '기타'];

    rawSchedules.forEach(s => {
      const titleStr = s.title || '';
      const badgeStr = s.badge || '';
      let cat = '기타';
      if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('휴가') || badgeStr.includes('연차')) cat = '휴가';
      else if (titleStr.includes('외근') || titleStr.includes('출장') || titleStr.includes('미팅') || badgeStr.includes('외근')) cat = '외근';
      else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) cat = '반차';
      else if (titleStr.includes('회의') || titleStr.includes('보고') || badgeStr.includes('회의')) cat = '회의';
      else if (titleStr.includes('공휴일') || badgeStr.includes('공휴일')) cat = '공휴일';
      else if (titleStr.includes('절기') || badgeStr.includes('절기') || s.author === '24절기') cat = '절기';
      else if (titleStr.includes('기념일') || badgeStr.includes('기념일') || s.author === '기념일') cat = '기념일';

      if (!groupMap[cat]) groupMap[cat] = [];
      groupMap[cat].push(s);
    });

    let bodyHtml = '';
    let renderedCount = 0;

    categoryOrder.forEach(catKey => {
      if (filter !== 'all' && filter !== catKey) return;

      const items = groupMap[catKey];
      if (items && items.length > 0) {
        renderedCount += items.length;
        let catTitle = catKey === '휴가' ? '연차/휴가' : catKey;
        let dotColor = 'bg-[#137333]';
        let countColor = 'text-[#137333]';

        if (catKey === '외근') {
          dotColor = 'bg-[#1a73e8]';
          countColor = 'text-[#1a73e8]';
        } else if (catKey === '반차') {
          dotColor = 'bg-[#b06000]';
          countColor = 'text-[#b06000]';
        } else if (catKey === '회의') {
          dotColor = 'bg-[#6b21a8]';
          countColor = 'text-[#6b21a8]';
        } else if (catKey === '공휴일') {
          dotColor = 'bg-[#c5221f]';
          countColor = 'text-[#c5221f]';
        }

        const cardsHtml = items.map(s => this.renderDateModalCard(s, catKey)).join('');

        bodyHtml += `
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2.5 px-1">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${dotColor}"></span>
                <span class="font-bold text-sm text-on-surface">${catTitle}</span>
              </div>
              <span class="text-xs font-bold ${countColor}">${items.length}건</span>
            </div>
            <div class="space-y-2.5">
              ${cardsHtml}
            </div>
          </div>
        `;
      }
    });

    if (renderedCount === 0) {
      bodyHtml = `
        <div class="py-14 text-center text-on-surface-variant flex flex-col items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-2">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          </div>
          <p class="font-bold text-base text-on-surface">등록된 일정이 없습니다.</p>
          <p class="text-xs text-on-surface-variant mt-1">해당 날짜에 등록된 근태/일정이 없습니다.</p>
        </div>
      `;
    }

    // Single Frame Clean Modal Content (중복 박스/배경/그림자 전면 제거)
    const modalHtml = `
      <div class="flex flex-col h-full">
        
        <!-- Modal Top Header (< YYYY년 M월 D일 (요일) > + ✕) -->
        <div class="flex items-center justify-between pb-3.5 mb-3.5 border-b border-outline">
          <button type="button" class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors" onclick="PCApp.navigateDateModal(-1)" title="이전 날짜">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>

          <h3 class="text-lg font-bold text-on-surface tracking-tight flex items-center gap-1">
            ${year}년 ${month}월 ${day}일 (${dayName})
          </h3>

          <div class="flex items-center gap-1">
            <button type="button" class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors" onclick="PCApp.navigateDateModal(1)" title="다음 날짜">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button type="button" class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors ml-2" onclick="PCApp.closeModal()" title="닫기">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        <!-- Filter Chips Bar (전체, 휴가, 외근, 반차, 회의) -->
        <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
          ${filters.map(f => {
            const isActive = (this.stateDateModal.activeFilter === f.id);
            const btnClass = isActive ? f.activeBg : f.inactiveBg;
            return `
              <button type="button" class="px-3.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${btnClass}" onclick="PCApp.openDateScheduleModal(null, '${f.id}')">
                ${f.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Schedule Items List (Scrollable) -->
        <div class="flex-1 overflow-y-auto pr-1">
          ${bodyHtml}
        </div>

      </div>
    `;

    this.showModal(modalHtml, 'date-dialog');
  },

  renderDateModalCard(s, catKey) {
    let authorName = s.author || '임직원';
    let avatarUrl = s.avatar || './resource/image/profile_abc.png';

    if (authorName && (!avatarUrl || avatarUrl.includes('profile_abc.png'))) {
      const firstName = authorName.split(' ')[0];
      const emp = (window.MockData && window.MockData.employees || []).find(e => e.name === firstName);
      if (emp && emp.avatar) avatarUrl = emp.avatar;
    }

    const titleStr = s.title || '';
    const badgeStr = s.badge || '';
    const locationStr = (s.location || '').trim();
    const timeStr = s.time || '종일';
    const cleanTitle = titleStr.replace(/\s*\(공휴일\)/g, '').trim();

    const isHoliday = catKey === '공휴일' || s.author === '공휴일' || s.author === '대한민국 공휴일' || s.author === '회사공지';
    const isSolarTerm = catKey === '절기' || s.badge === '절기' || s.author === '24절기';
    const isObservance = catKey === '기념일' || s.badge === '기념일' || s.author === '기념일';

    // Style according to category (Matching User Uploaded Modal Image 1:1)
    let cardBg = 'bg-[#f0f5fe] border-[#1a73e8]/30';
    let dotClass = 'bg-[#1a73e8]';
    let authorClass = 'text-[#1a73e8]';
    let badgeBg = 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/25';

    if (catKey === '휴가') {
      cardBg = 'bg-[#f2f9f4] border-[#137333]/30';
      dotClass = 'bg-[#137333]';
      authorClass = 'text-[#137333]';
      badgeBg = 'bg-[#e6f4ea] text-[#137333] border-[#137333]/25';
    } else if (catKey === '반차') {
      cardBg = 'bg-[#fffdf5] border-[#b06000]/30';
      dotClass = 'bg-[#b06000]';
      authorClass = 'text-[#b06000]';
      badgeBg = 'bg-[#fef7e0] text-[#b06000] border-[#b06000]/25';
    } else if (catKey === '회의') {
      cardBg = 'bg-[#fbf7ff] border-[#6b21a8]/30';
      dotClass = 'bg-[#6b21a8]';
      authorClass = 'text-[#6b21a8]';
      badgeBg = 'bg-[#f3e8ff] text-[#6b21a8] border-[#6b21a8]/25';
    } else if (catKey === '공휴일') {
      cardBg = 'bg-[#fff5f5] border-[#c5221f]/30';
      dotClass = 'bg-[#c5221f]';
      authorClass = 'text-[#c5221f]';
      badgeBg = 'bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/25';
    }

    const showAvatar = !(isHoliday || isSolarTerm || isObservance);
    const avatarHtml = showAvatar ? `
      <img src="${avatarUrl}" alt="${authorName}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-outline/30 shadow-2xs" onerror="this.src='./resource/image/profile_abc.png'" />
    ` : '';

    return `
      <div class="p-3.5 rounded-2xl ${cardBg} border shadow-2xs transition-all hover:shadow-xs flex items-center justify-between gap-3 text-left">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <span class="w-2 h-2 rounded-full ${dotClass} shrink-0"></span>
          ${avatarHtml}
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
              ${showAvatar ? `<span class="font-bold text-xs sm:text-sm ${authorClass}">${authorName}</span>` : ''}
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeBg} border">${badgeStr || catKey}</span>
              ${locationStr ? `
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none bg-surface-container text-on-surface-variant border border-outline/30">
                  <svg class="w-2.5 h-2.5 text-on-surface-variant" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>${locationStr}</span>
                </span>
              ` : ''}
            </div>
            <p class="font-bold text-sm text-on-surface truncate">${cleanTitle}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-xs font-medium text-on-surface-variant">${timeStr}</span>
        </div>
      </div>
    `;
  },

  navigateDateModal(offset) {
    const key = this.stateDateModal.currentDateKey;
    const parts = key.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + offset);

    const newKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    this.openDateScheduleModal(newKey);
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

    // 2026 Specific Lunar & Substitute Holidays
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

  getSchedulesForDay(year, month, day) {
    const key = `${year}-${month}-${day}`;
    const altKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const defaultData = (window.MockData && window.MockData.schedules) || {};

    const defaults = defaultData[key] || defaultData[altKey] || [];
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

    const userAdded = (window.App && window.App.mockDynamicSchedules && window.App.mockDynamicSchedules[key]) || [];
    combined = [...combined, ...userAdded];
    return combined;
  },

  getScheduleTagClass(s) {
    const titleStr = s.title || '';
    const badgeStr = s.badge || '';
    const authorStr = s.author || '';

    const isHoliday = (badgeStr === '공휴일' || titleStr.includes('공휴일') || authorStr === '공휴일' || authorStr === '대한민국 공휴일' || authorStr === '회사공지');
    const isSolarTerm = (badgeStr === '절기' || authorStr === '24절기');
    const isObservance = (badgeStr === '기념일' || authorStr === '기념일');

    if (isHoliday) return 'bg-[#fee2e2] text-[#c5221f] font-bold';
    if (isSolarTerm) return 'bg-[#e6f4ea] text-[#137333] font-bold';
    if (isObservance) return 'bg-[#f0f4f9] text-[#3c4043] font-bold';
    if (titleStr.includes('휴가') || titleStr.includes('연차') || badgeStr.includes('연차')) {
      return (s.type === 'error' || authorStr.includes('이재광') || authorStr.includes('조지혜')) ? 'bg-[#fee2e2] text-[#c5221f]' : 'bg-[#e3fcef] text-[#00693f]';
    }
    if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) return 'bg-[#fef7e0] text-[#b06000]';
    if (titleStr.includes('외근') || titleStr.includes('미팅') || titleStr.includes('출장') || badgeStr.includes('외근')) return 'bg-[#e8f0fe] text-[#1a73e8]';
    if (titleStr.includes('회의') || titleStr.includes('보고')) return 'bg-[#f3e8fd] text-[#7627bb]';
    return 'bg-primary/10 text-primary';
  },

  getScheduleCardHtml(item) {
    let dotClass = 'bg-[#00693f]';
    let badgeBg = 'bg-[#e3fcef] text-[#00693f] border border-[#00693f]/25';
    let categoryKey = '연차';

    const titleStr = (item.title || '');
    const badgeStr = (item.badge || '');
    const authorStr = (item.author || '');
    const locationStr = (item.location || '').trim();

    const isHoliday = (badgeStr === '공휴일' || titleStr.includes('공휴일') || authorStr === '공휴일' || authorStr === '대한민국 공휴일' || authorStr === '회사공지');
    const isSolarTerm = (badgeStr === '절기' || authorStr === '24절기');
    const isObservance = (badgeStr === '기념일' || authorStr === '기념일');

    if (isHoliday) {
      categoryKey = '공휴일';
      dotClass = 'bg-[#ef4444]';
      badgeBg = 'bg-[#fee2e2] text-[#c5221f] border border-[#c5221f]/25';
    } else if (isSolarTerm) {
      categoryKey = '절기';
      dotClass = 'bg-[#10b981]';
      badgeBg = 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/25';
    } else if (isObservance) {
      categoryKey = '기념일';
      dotClass = 'bg-[#64748b]';
      badgeBg = 'bg-[#f0f4f9] text-[#3c4043] border border-[#3c4043]/25';
    } else if (titleStr.includes('반차') || titleStr.includes('반반차') || badgeStr.includes('반차')) {
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

    const isSpecial = isHoliday || isSolarTerm || isObservance || authorStr === '회사공지';
    const authorHtml = isSpecial ? `<span class="font-bold text-xs text-on-surface-variant whitespace-nowrap leading-none flex items-center shrink-0">${item.badge || categoryKey}</span>` : `<span class="font-bold text-xs text-primary whitespace-nowrap leading-none flex items-center shrink-0">${item.author || '이재광 팀장'}</span>`;
    const locationBadgeHtml = locationStr ? `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold leading-none bg-surface-container text-on-surface-variant border border-outline/30 whitespace-nowrap shrink-0">
        <svg class="w-3 h-3 text-on-surface-variant shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span>${locationStr}</span>
      </span>
    ` : '';
    const displayTitle = this.formatScheduleCleanLabel(item);

    return `
      <div class="flex items-center p-3 bg-surface-container-low rounded-xl border border-outline/70 hover:border-primary transition-all gap-2.5">
        <div class="flex items-center gap-2 shrink-0">
          <div class="w-2 h-2 rounded-full ${dotClass} shrink-0"></div>
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-center text-left">
          <div class="flex items-center justify-between gap-1.5 mb-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap min-w-0">
              ${authorHtml}
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold leading-none shrink-0 ${badgeBg}">${item.badge || categoryKey}</span>
              ${locationBadgeHtml}
            </div>
            <span class="text-[10px] text-on-surface-variant font-medium whitespace-nowrap shrink-0 leading-none ml-auto">${item.time || '종일'}</span>
          </div>
          <div class="text-sm text-on-surface font-bold leading-snug break-words">${displayTitle}</div>
        </div>
      </div>
    `;
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
  setTodoViewMode(mode, btn) {
    this.state.todoViewMode = mode;
    const toggleContainer = document.getElementById('pc-todo-view-toggle');
    if (toggleContainer) {
      toggleContainer.querySelectorAll('.pc-todo-view-btn').forEach(b => {
        b.className = 'pc-todo-view-btn w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95';
      });
    }
    if (btn) {
      btn.className = 'pc-todo-view-btn w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white transition-all active:scale-95';
    }
    this.renderTodoView();
  },

  setTodoFilter(filter, btn) {
    this.state.todoFilter = filter;
    const tabs = document.querySelectorAll('#pc-todo-filter-tabs button');
    tabs.forEach(t => {
      t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0';
    });
    if (btn) btn.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0';
    this.renderTodoView();
  },

  selectProject(projectName) {
    this.state.selectedProject = projectName;
    this.renderTodoView();
    this.showToast(`📁 '${projectName}' 프로젝트가 선택되었습니다.`);
  },

  clearSelectedProject() {
    this.state.selectedProject = null;
    this.renderTodoView();
  },

  quickAddTodo(title) {
    if (!title || !title.trim()) return;
    const projName = this.state.selectedProject || '일반 업무';
    const newTodo = {
      id: Date.now(),
      title: title.trim(),
      project: projName,
      completed: false,
      priority: 'medium',
      status: 'in_progress',
      dueDate: '2026-08-24',
      isMine: true,
      assignees: [
        { name: this.state.user.name, avatar: this.state.user.avatar, dept: this.state.user.dept, role: this.state.user.role }
      ],
      notes: '새로 등록된 태스크 항목입니다.',
      hasAttachment: false
    };
    this.state.todos.unshift(newTodo);
    this.renderTodoView();
    this.renderRightCol();
    this.showToast('새로운 할 일이 등록되었습니다.');
  },

  toggleTodoStatus(todoId) {
    const todo = (this.state.todos || []).find(t => t.id === todoId);
    if (!todo) return;
    if (todo.status === 'done' || todo.completed) {
      todo.status = 'in_progress';
      todo.completed = false;
      this.showToast('할 일이 진행 중 상태로 전환되었습니다.');
    } else {
      todo.status = 'done';
      todo.completed = true;
      this.showToast('🎉 할 일이 완료 처리되었습니다!');
    }
    this.renderTodoView();
    this.renderRightCol();

    // If detail modal is open, refresh its content
    const modalEl = document.getElementById('pc-global-modal');
    if (modalEl && modalEl.classList.contains('active') && this.state.currentDetailTodoId === todoId) {
      this.openTodoDetailModal(todoId);
    }
  },

  deleteTodoById(todoId) {
    if (confirm('해당 할 일을 삭제하시겠습니까?')) {
      this.state.todos = (this.state.todos || []).filter(t => t.id !== todoId);
      this.closeModal();
      this.renderTodoView();
      this.renderRightCol();
      this.showToast('할 일이 삭제되었습니다.');
    }
  },

  // 할 일 상세 모달 (Mobile Parity Detail Modal)
  openTodoDetailModal(todoId) {
    const todo = (this.state.todos || []).find(t => t.id === todoId);
    if (!todo) return;

    this.state.currentDetailTodoId = todo.id;
    const isDone = todo.status === 'done' || todo.completed;

    // Status Badge
    let statusBadgeHtml = '';
    if (todo.status === 'in_progress') {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">진행 중</span>`;
    } else if (isDone) {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold">완료</span>`;
    } else {
      statusBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">${todo.status || '대기'}</span>`;
    }

    // Priority Badge
    let priorityBadgeHtml = '';
    if (todo.priority === 'high') {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>높음</span>`;
    } else if (todo.priority === 'low') {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">낮음</span>`;
    } else {
      priorityBadgeHtml = `<span class="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5"></span>보통</span>`;
    }

    // Assignees Stack
    const assigneesHtml = (todo.assignees || [
      { name: this.state.user.name, avatar: this.state.user.avatar, dept: this.state.user.dept, role: this.state.user.role }
    ]).map((a) => `
      <div class="flex items-center gap-2 bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-outline">
        <img src="${a.avatar || './profile.png'}" class="w-7 h-7 rounded-full object-cover border border-outline/30" />
        <span class="text-xs font-bold text-on-surface">${a.name} ${a.role || ''}</span>
        ${a.dept ? `<span class="text-[11px] text-on-surface-variant font-medium">(${a.dept})</span>` : ''}
      </div>
    `).join('');

    const modalHtml = `
      <div class="p-2 text-left">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-outline mb-5">
          <div class="flex items-center gap-2 flex-wrap">
            ${statusBadgeHtml}
            ${priorityBadgeHtml}
            <span class="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full"># ${todo.project || '일반 업무'}</span>
          </div>
          <button class="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all" onclick="PCApp.closeModal()">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-on-surface leading-snug mb-5 ${isDone ? 'line-through opacity-60' : ''}">
          ${todo.title}
        </h2>

        <!-- Meta Grid Card -->
        <div class="bg-surface-container-low rounded-2xl p-5 border border-outline space-y-4 mb-5">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
            </div>
            <div>
              <span class="text-xs font-bold text-on-surface-variant block">마감 일자</span>
              <span class="text-base font-bold text-on-surface mt-0.5">${todo.dueDate || '마감일 미정'}</span>
            </div>
          </div>

          <div class="h-px bg-outline/60"></div>

          <div>
            <span class="text-xs font-bold text-on-surface-variant block mb-2.5">담당자</span>
            <div class="flex items-center gap-2 flex-wrap">
              ${assigneesHtml}
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline mb-5">
          <h4 class="text-xs font-bold text-on-surface-variant mb-2">세부 내용 / 업무 메모</h4>
          <p class="text-base text-on-surface leading-relaxed whitespace-pre-wrap">${todo.notes || '작성된 세부 메모가 없습니다.'}</p>
        </div>

        <!-- Attachments Section -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline mb-6">
          <h4 class="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a3 3 0 0 0 6 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
            첨부파일 (${todo.hasAttachment ? 1 : 0})
          </h4>
          ${todo.hasAttachment ? `
            <div class="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-outline hover:border-primary transition-all cursor-pointer group" onclick="PCApp.showToast('📥 [${todo.title}_관련자료.pdf] 첨부파일 다운로드가 시작되었습니다.')">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-6 h-6 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <div class="truncate">
                  <span class="text-sm font-bold text-on-surface block truncate group-hover:text-primary transition-colors">${todo.title}_기획문서.pdf</span>
                  <span class="text-xs text-on-surface-variant font-medium">1.8 MB · 업무 기획자료</span>
                </div>
              </div>
              <button class="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              </button>
            </div>
          ` : `
            <p class="text-xs text-on-surface-variant text-center py-2">등록된 첨부파일이 없습니다.</p>
          `}
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-outline">
          <button class="px-4 py-2.5 rounded-xl text-error hover:bg-error/10 font-bold text-sm flex items-center gap-1.5 transition-all" onclick="PCApp.deleteTodoById(${todo.id})">
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            삭제
          </button>
          <div class="flex items-center gap-3">
            <button class="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all" onclick="PCApp.closeModal()">
              닫기
            </button>
            <button class="px-6 py-2.5 rounded-xl ${isDone ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-white'} font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-xs" onclick="PCApp.toggleTodoStatus(${todo.id})">
              <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              ${isDone ? '진행 중으로 변경' : '할 일 완료 처리'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.openModal(modalHtml);
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

    // -----------------------------------------------------------------
    // CASE A: 특정 프로젝트 내부 뷰 (선택된 프로젝트의 대기/진행중/완료 리스트)
    // -----------------------------------------------------------------
    if (this.state.selectedProject) {
      const projName = this.state.selectedProject;
      const projTodos = filtered.filter(t => (t.project || '일반 업무') === projName);

      const todoList = projTodos.filter(t => t.status === 'todo' || t.status === 'draft');
      const inProgressList = projTodos.filter(t => t.status === 'in_progress' && !t.completed);
      const doneList = projTodos.filter(t => t.status === 'done' || t.completed);

      // 상단 뒤로가기 네비게이션 헤더 바
      const backHeaderHtml = `
        <div class="w-full flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline shadow-2xs mb-6">
          <button type="button" onclick="PCApp.clearSelectedProject()" class="flex items-center gap-2 text-sm font-bold text-primary hover:underline active:scale-95 transition-transform">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            <span>전체 프로젝트 목록으로</span>
          </button>
          <div class="flex items-center gap-3">
            <span class="font-bold text-base text-on-surface"># ${projName}</span>
            <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">${projTodos.length}개 업무</span>
            <button type="button" onclick="PCApp.openQuickModal('todo')" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-xs">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>할 일 추가</span>
            </button>
          </div>
        </div>
      `;

      const renderCardItem = (t) => {
        const isDone = t.status === 'done' || t.completed;
        const assigneesHtml = (t.assignees || [
          { name: this.state.user.name, avatar: this.state.user.avatar }
        ]).map((a, idx) => `
          <img alt="${a.name}" src="${a.avatar || './profile.png'}" class="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover" title="${a.name}" />
        `).join('');

        return `
          <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline hover:border-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between" onclick="PCApp.openTodoDetailModal(${t.id})">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-bold ${t.priority === 'high' ? 'bg-error-container text-error' : (t.priority === 'low' ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container text-tertiary')}">
                  ${t.priority === 'high' ? '높음' : (t.priority === 'low' ? '낮음' : '보통')}
                </span>
                <span class="text-xs text-on-surface-variant font-medium">📅 ${t.dueDate || '오늘까지'}</span>
              </div>
              <div class="flex items-start gap-3 mb-2.5">
                <input type="checkbox" ${isDone ? 'checked' : ''} onclick="event.stopPropagation(); PCApp.toggleTodoStatus(${t.id});" class="w-5 h-5 accent-primary rounded cursor-pointer mt-0.5 shrink-0" />
                <h4 class="font-bold text-base text-on-surface leading-snug group-hover:text-primary transition-colors break-words ${isDone ? 'line-through opacity-50' : ''}">
                  ${t.title}
                </h4>
              </div>
              ${t.notes ? `<p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3 pl-8">${t.notes}</p>` : ''}
            </div>

            <div class="pt-3 border-t border-outline/50 flex items-center justify-between text-xs mt-2">
              <span class="text-[11px] text-on-surface-variant font-medium">클릭하여 상세 보기</span>
              <div class="flex -space-x-2 items-center">
                ${assigneesHtml}
              </div>
            </div>
          </div>
        `;
      };

      const renderListItem = (t) => {
        const isDone = t.status === 'done' || t.completed;
        return `
          <div class="flex items-center justify-between p-4 hover:bg-surface-container-low transition-all cursor-pointer group" onclick="PCApp.openTodoDetailModal(${t.id})">
            <div class="flex items-center gap-3.5 flex-1 min-w-0 mr-4">
              <input type="checkbox" ${isDone ? 'checked' : ''} onclick="event.stopPropagation(); PCApp.toggleTodoStatus(${t.id});" class="w-5 h-5 accent-primary rounded cursor-pointer shrink-0" />
              <div class="min-w-0 flex-1">
                <span class="text-base text-on-surface font-bold truncate block group-hover:text-primary transition-colors ${isDone ? 'line-through opacity-50' : ''}">${t.title}</span>
                <div class="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                  <span>📅 ${t.dueDate || '오늘까지'}</span>
                  ${t.notes ? `<span>·</span><span class="truncate max-w-xs">${t.notes}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="px-2.5 py-1 rounded-md text-xs font-bold ${t.priority === 'high' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}">
                ${t.priority === 'high' ? '높음' : '보통'}
              </span>
              <svg class="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        `;
      };

      listEl.className = 'w-full';

      if (this.state.todoViewMode === 'card') {
        // 칸반 3열 그리드 레이아웃
        listEl.innerHTML = `
          ${backHeaderHtml}
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Col 1: 대기 (To-Do) -->
            <div class="flex flex-col gap-3.5 bg-surface-container-low/60 p-5 rounded-2xl border border-outline">
              <div class="flex items-center justify-between pb-2 border-b border-outline">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-outline"></span>
                  대기
                  <span class="bg-surface-container text-on-surface-variant text-xs font-bold px-2.5 py-0.5 rounded-full">${todoList.length}</span>
                </h3>
              </div>
              <div class="flex flex-col gap-3.5">
                ${todoList.length > 0 ? todoList.map(renderCardItem).join('') : `
                  <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline text-xs text-on-surface-variant">
                    대기 중인 할 일이 없습니다.
                  </div>
                `}
              </div>
            </div>

            <!-- Col 2: 진행 중 (In Progress) -->
            <div class="flex flex-col gap-3.5 bg-surface-container-low/60 p-5 rounded-2xl border border-outline">
              <div class="flex items-center justify-between pb-2 border-b border-outline">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary"></span>
                  진행 중
                  <span class="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">${inProgressList.length}</span>
                </h3>
              </div>
              <div class="flex flex-col gap-3.5">
                ${inProgressList.length > 0 ? inProgressList.map(renderCardItem).join('') : `
                  <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline text-xs text-on-surface-variant">
                    진행 중인 할 일이 없습니다.
                  </div>
                `}
              </div>
            </div>

            <!-- Col 3: 완료 (Done) -->
            <div class="flex flex-col gap-3.5 bg-surface-container-low/60 p-5 rounded-2xl border border-outline">
              <div class="flex items-center justify-between pb-2 border-b border-outline">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-secondary"></span>
                  완료
                  <span class="bg-secondary-container text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full">${doneList.length}</span>
                </h3>
              </div>
              <div class="flex flex-col gap-3.5">
                ${doneList.length > 0 ? doneList.map(renderCardItem).join('') : `
                  <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline text-xs text-on-surface-variant">
                    완료된 할 일이 없습니다.
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
      } else {
        // 한줄 리스트 레이아웃
        listEl.innerHTML = `
          ${backHeaderHtml}
          <div class="space-y-6">
            <!-- 대기 섹션 -->
            <div class="pc-bento-card">
              <div class="px-5 py-3.5 border-b border-outline flex items-center justify-between">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-outline"></span>
                  대기
                  <span class="bg-surface-container text-on-surface-variant text-xs font-bold px-2.5 py-0.5 rounded-full">${todoList.length}</span>
                </h3>
              </div>
              <div class="divide-y divide-outline">
                ${todoList.length > 0 ? todoList.map(renderListItem).join('') : `
                  <p class="text-xs text-on-surface-variant text-center py-6">대기 중인 할 일이 없습니다.</p>
                `}
              </div>
            </div>

            <!-- 진행 중 섹션 -->
            <div class="pc-bento-card">
              <div class="px-5 py-3.5 border-b border-outline flex items-center justify-between">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary"></span>
                  진행 중
                  <span class="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">${inProgressList.length}</span>
                </h3>
              </div>
              <div class="divide-y divide-outline">
                ${inProgressList.length > 0 ? inProgressList.map(renderListItem).join('') : `
                  <p class="text-xs text-on-surface-variant text-center py-6">진행 중인 할 일이 없습니다.</p>
                `}
              </div>
            </div>

            <!-- 완료 섹션 -->
            <div class="pc-bento-card">
              <div class="px-5 py-3.5 border-b border-outline flex items-center justify-between">
                <h3 class="font-bold text-base text-on-surface flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-secondary"></span>
                  완료
                  <span class="bg-secondary-container text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full">${doneList.length}</span>
                </h3>
              </div>
              <div class="divide-y divide-outline">
                ${doneList.length > 0 ? doneList.map(renderListItem).join('') : `
                  <p class="text-xs text-on-surface-variant text-center py-6">완료된 할 일이 없습니다.</p>
                `}
              </div>
            </div>
          </div>
        `;
      }
      return;
    }

    // -----------------------------------------------------------------
    // CASE B: 전체 프로젝트 목록 뷰 (프로젝트별 그룹핑 메인 뷰)
    // -----------------------------------------------------------------
    const projectsMap = {};
    filtered.forEach(t => {
      const projName = t.project || '일반 업무';
      if (!projectsMap[projName]) projectsMap[projName] = [];
      projectsMap[projName].push(t);
    });

    const projectNames = Object.keys(projectsMap);

    if (projectNames.length === 0) {
      listEl.className = 'pc-bento-card text-center py-12';
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center text-on-surface-variant">
          <svg class="w-12 h-12 text-on-surface-variant/50 mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
          <h4 class="font-bold text-lg text-on-surface mb-1">등록된 프로젝트 및 할 일이 없습니다</h4>
          <p class="text-sm">상단 등록창을 통해 새로운 할 일을 추가해보세요.</p>
        </div>
      `;
      return;
    }

    if (this.state.todoViewMode === 'card') {
      // 1. 카드형 모드 (Card Mode): 프로젝트별 대형 Bento 카드
      listEl.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
      listEl.innerHTML = projectNames.map(projName => {
        const items = projectsMap[projName];
        const todoCount = items.filter(t => t.status === 'todo' || t.status === 'draft').length;
        const inProgressCount = items.filter(t => t.status === 'in_progress' && !t.completed).length;
        const doneCount = items.filter(t => t.status === 'done' || t.completed).length;

        // 미리보기용 최근 2개 업무
        const previewItemsHtml = items.slice(0, 2).map(t => {
          const isDone = t.status === 'done' || t.completed;
          return `
            <div class="flex items-center justify-between text-xs py-1.5 border-b border-outline/40 last:border-none">
              <span class="font-medium text-on-surface truncate ${isDone ? 'line-through opacity-50' : ''}">${t.title}</span>
              <span class="text-[11px] text-on-surface-variant shrink-0 ml-2">${t.dueDate || ''}</span>
            </div>
          `;
        }).join('');

        return `
          <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline hover:border-primary hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between text-left" onclick="PCApp.selectProject('${projName.replace(/'/g, "\\'")}')">
            <div>
              <!-- Header: Folder Icon + Title + Count -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
                  </div>
                  <h3 class="font-bold text-lg text-on-surface group-hover:text-primary transition-colors truncate">${projName}</h3>
                </div>
                <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full shrink-0">${items.length}개 업무</span>
              </div>

              <!-- Status Progress Chips -->
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-bold">대기 ${todoCount}</span>
                <span class="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">진행 중 ${inProgressCount}</span>
                <span class="px-2.5 py-1 rounded-md bg-secondary-container text-secondary text-xs font-bold">완료 ${doneCount}</span>
              </div>

              <!-- Recent Tasks Preview -->
              <div class="bg-surface-container-low p-3.5 rounded-xl border border-outline/50 flex flex-col">
                <span class="text-[11px] font-bold text-on-surface-variant mb-1.5">최근 등록 업무</span>
                ${previewItemsHtml || '<p class="text-xs text-on-surface-variant py-1">등록된 업무가 없습니다.</p>'}
              </div>
            </div>

            <!-- Footer Action -->
            <div class="pt-4 border-t border-outline/50 flex items-center justify-between text-xs text-primary font-bold mt-4">
              <span>상세 업무 목록 열기</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        `;
      }).join('');
    } else {
      // 2. 한줄 리스트형 모드 (List Mode)
      listEl.className = 'pc-bento-card divide-y divide-outline';
      listEl.innerHTML = projectNames.map(projName => {
        const items = projectsMap[projName];
        const todoCount = items.filter(t => t.status === 'todo' || t.status === 'draft').length;
        const inProgressCount = items.filter(t => t.status === 'in_progress' && !t.completed).length;
        const doneCount = items.filter(t => t.status === 'done' || t.completed).length;

        return `
          <div class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-all cursor-pointer group text-left" onclick="PCApp.selectProject('${projName.replace(/'/g, "\\'")}')">
            <div class="flex items-center gap-3.5 min-w-0 flex-1 mr-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
              </div>
              <div class="truncate">
                <h3 class="font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">${projName}</h3>
                <span class="text-xs text-on-surface-variant font-medium">총 ${items.length}개의 업무 태스크</span>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-2 text-xs font-bold">
                <span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant">대기 ${todoCount}</span>
                <span class="px-2.5 py-1 rounded-md bg-primary/10 text-primary">진행 중 ${inProgressCount}</span>
                <span class="px-2.5 py-1 rounded-md bg-secondary-container text-secondary">완료 ${doneCount}</span>
              </div>
              <svg class="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-transform ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  // 6-8. Projects Screen (구분탭: 전체, 진행중, 유지보수, 개선사업, 구축중, 운영용역, 완료 / 정렬: 추천순, 최근수정, 이름순, 진척도순, 마감임박순 / 실시간 통합 검색)
  setProjectFilter(filter, btn) {
    this.state.projectFilter = filter || 'all';
    const tabs = document.querySelectorAll('#pc-project-filter-tabs button');
    tabs.forEach(t => {
      const isTarget = t.getAttribute('data-filter') === this.state.projectFilter;
      const countBadge = t.querySelector('span:last-child');
      if (isTarget) {
        t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-primary text-white shrink-0 flex items-center gap-1.5 shadow-xs';
        if (countBadge) countBadge.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white';
      } else {
        t.className = 'px-4 py-2 rounded-xl text-base font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5 transition-colors';
        if (countBadge) countBadge.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container-highest text-on-surface-variant';
      }
    });
    this.renderProjectView();
  },

  setProjectSearch(keyword) {
    this.state.projectSearch = keyword || '';
    this.renderProjectView();
  },

  setProjectSort(sortType) {
    this.state.projectSort = sortType || 'recommend';
    this.renderProjectView();
  },

  getProjectCategory(p) {
    const text = `${p.status || ''} ${p.statusText || ''} ${p.title || ''} ${p.category || ''}`;
    if (p.status === 'completed' || text.includes('완료')) {
      return 'completed';
    }
    if (p.status === 'build' || text.includes('플랫폼 구축') || text.includes('신규구축') || (text.includes('구축') && !text.includes('고도화') && !text.includes('개선'))) {
      return 'build';
    }
    if (p.status === 'improvement' || text.includes('개선') || text.includes('고도화') || text.includes('연계개선')) {
      return 'improvement';
    }
    if (p.status === 'operation' || text.includes('운영용역') || text.includes('운영 용역') || text.includes('유지보수 용역') || text.includes('유지보수용역') || text.includes('유지관리')) {
      return 'operation';
    }
    if (p.status === 'maintenance' || text.includes('유지보수')) {
      return 'maintenance';
    }
    return 'in_progress';
  },

  getProjectStatusBadge(p) {
    const cat = this.getProjectCategory(p);
    switch (cat) {
      case 'build':
        return {
          badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold',
          label: p.statusText || '구축중'
        };
      case 'improvement':
        return {
          badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold',
          label: p.statusText || '개선사업'
        };
      case 'operation':
        return {
          badgeClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold',
          label: p.statusText || '운영용역'
        };
      case 'maintenance':
        return {
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold',
          label: p.statusText || '유지보수'
        };
      case 'completed':
        return {
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold',
          label: p.statusText || '완료'
        };
      case 'in_progress':
      default:
        return {
          badgeClass: 'bg-primary/15 text-primary border border-primary/20 font-bold',
          label: p.statusText || '진행중'
        };
    }
  },

  renderProjectView() {
    const grid = document.getElementById('pc-project-grid');
    if (!grid) return;

    const allProjects = (this.state.projects || []);

    // 1. 카테고리별 건수 계산 및 탭 뱃지 갱신
    const counts = {
      all: allProjects.length,
      in_progress: 0,
      maintenance: 0,
      improvement: 0,
      build: 0,
      operation: 0,
      completed: 0
    };

    allProjects.forEach(p => {
      const cat = this.getProjectCategory(p);
      if (counts[cat] !== undefined) counts[cat]++;
    });

    Object.keys(counts).forEach(key => {
      const badge = document.getElementById(`pc-proj-count-${key}`);
      if (badge) badge.textContent = counts[key];
    });

    // 2. 카테고리 필터링
    const filter = this.state.projectFilter || 'all';
    let filtered = allProjects.filter(p => {
      if (filter === 'all') return true;
      return this.getProjectCategory(p) === filter;
    });

    // 3. 실시간 검색어 필터링
    const search = (this.state.projectSearch || '').trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(p => {
        const fullText = [
          p.title,
          p.clientName,
          p.siteName,
          p.siteId,
          p.projectId,
          p.category,
          p.statusText,
          p.pm,
          p.planner,
          p.designer,
          p.publisher,
          p.developer,
          p.author,
          p.devLang,
          p.content
        ].filter(Boolean).join(' ').toLowerCase();
        return fullText.includes(search);
      });
    }

    // 4. 정렬 옵션 적용 (추천순, 최근수정순, 이름순, 진척도순, 마감임박순)
    const sort = this.state.projectSort || 'recommend';
    filtered.sort((a, b) => {
      if (sort === 'name') {
        return (a.title || '').localeCompare(b.title || '', 'ko');
      } else if (sort === 'recent') {
        const dateA = a.dateFull || a.date || '';
        const dateB = b.dateFull || b.date || '';
        return dateB.localeCompare(dateA);
      } else if (sort === 'progress') {
        const progA = parseInt(a.views || 80, 10);
        const progB = parseInt(b.views || 80, 10);
        return progB - progA;
      } else if (sort === 'deadline') {
        const deadA = a.periodEnd || a.period || '9999-99-99';
        const deadB = b.periodEnd || b.period || '9999-99-99';
        return deadA.localeCompare(deadB);
      } else {
        // recommend: 추천순 (진행/구축/개선/운영 가중치 + 최근 수정일)
        const catScore = { build: 5, improvement: 4, in_progress: 3, operation: 2, maintenance: 1, completed: 0 };
        const scoreA = catScore[this.getProjectCategory(a)] || 0;
        const scoreB = catScore[this.getProjectCategory(b)] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        const dateA = a.dateFull || a.date || '';
        const dateB = b.dateFull || b.date || '';
        return dateB.localeCompare(dateA);
      }
    });

    // 5. 총 프로젝트 개수 뱃지 갱신
    const totalBadge = document.getElementById('pc-project-total-badge');
    if (totalBadge) totalBadge.textContent = `${filtered.length}개`;

    // 6. 결과 렌더링
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline">
          <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <h3 class="font-bold text-lg text-on-surface mb-1">조건에 맞는 프로젝트가 없습니다</h3>
          <p class="text-sm text-on-surface-variant mb-4">검색어 또는 구분 탭을 변경하여 다시 검색해보세요.</p>
          <button class="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all" onclick="PCApp.setProjectSearch(''); const searchInp = document.getElementById('pc-project-search-input'); if(searchInp) searchInp.value=''; PCApp.setProjectFilter('all');">
            필터 초기화
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const badge = this.getProjectStatusBadge(p);
      const progressVal = p.views ? `${p.views}%` : '85%';
      return `
        <div class="p-6 bg-surface-container-lowest rounded-2xl border border-outline hover:border-primary/60 hover:shadow-lg transition-all text-base flex flex-col justify-between cursor-pointer group" onclick="PCApp.openProjectModal(${p.id})">
          <div>
            <!-- 상단 태그 & 상태 뱃지 -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary truncate max-w-[140px]">${p.clientName || '고객사'}</span>
                ${p.category ? `<span class="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant shrink-0">${p.category}</span>` : ''}
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${badge.badgeClass}">
                ${badge.label}
              </span>
            </div>

            <!-- 프로젝트 명 및 서브 정보 -->
            <h3 class="font-bold text-lg text-on-surface group-hover:text-primary transition-colors mb-1.5 line-clamp-2 leading-snug">
              ${p.title}
            </h3>
            <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-4">
              <span>#${p.siteId || p.projectId || 'p_project'}</span>
              ${p.devLang && p.devLang !== '-' ? `<span>·</span><span>${p.devLang}</span>` : ''}
            </div>

            <!-- 기간 및 진척도 -->
            <div class="p-3.5 bg-surface-container-low rounded-xl mb-4 border border-outline/30">
              <div class="flex justify-between items-center text-xs text-on-surface-variant font-medium mb-2">
                <span>기간: <strong class="text-on-surface font-bold">${p.period || '2026-07 ~ 2026-12'}</strong></span>
                <span class="font-bold text-primary">${progressVal}</span>
              </div>
              <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: ${progressVal};"></div>
              </div>
            </div>

            <!-- 참여 팀원 배정 뱃지 -->
            <div class="flex items-center gap-1.5 flex-wrap mb-2">
              ${p.pm && p.pm !== '.' && p.pm !== '-' ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300">PM ${p.pm}</span>` : ''}
              ${p.planner && p.planner !== '.' && p.planner !== '-' ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container text-on-surface-variant">기획 ${p.planner}</span>` : ''}
              ${p.designer && p.designer !== '.' && p.designer !== '-' ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300">디자인 ${p.designer}</span>` : ''}
              ${p.publisher && p.publisher !== '.' && p.publisher !== '-' ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">퍼블 ${p.publisher}</span>` : ''}
              ${p.developer && p.developer !== '.' && p.developer !== '-' ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">개발 ${p.developer}</span>` : ''}
            </div>
          </div>

          <!-- 하단 메타 및 상세보기 버튼 -->
          <div class="pt-3.5 mt-2 border-t border-outline/50 flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <div class="flex items-center gap-2">
              <span>작성: ${p.author || '기획팀'}</span>
              <span>·</span>
              <span>${p.date || '2026-08-04'}</span>
            </div>
            <span class="font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              상세보기
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
          </div>
        </div>
      `;
    }).join('');
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
      author: '이재광 팀장',
      avatar: './profile.png'
    });

    this.showToast(`[신청 완료] ${startDate} ${leaveType} 신청서가 정상 접수되었습니다.`);
    this.switchScreen('dashboard');
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
      author: '이재광 팀장',
      avatar: './profile.png'
    });

    this.showToast(`[신청 완료] ${date} ${place} 외근 신청서가 정상 접수되었습니다.`);
    this.switchScreen('dashboard');
  },

  // 7. Commute Check In/Out Actions
  handleCheckIn() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = true;
    this.state.checkInTime = timeStr;
    this.saveState();
    this.showToast(`[출근 완료] ${timeStr} 정상 출근 처리되었습니다.`);
    this.renderLeftCol();
    if (this.state.activeScreen === 'checkin') this.renderCheckinView();
  },

  handleCheckOut() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.isCheckedIn = false;
    this.state.checkOutTime = timeStr;
    this.saveState();
    this.showToast(`[퇴근 완료] ${timeStr} 정상 퇴근 처리되었습니다. 수고하셨습니다!`);
    this.renderLeftCol();
    if (this.state.activeScreen === 'checkin') this.renderCheckinView();
  },

  toggleTodo(idx) {
    if (this.state.todos[idx]) {
      this.state.todos[idx].completed = !this.state.todos[idx].completed;
      this.saveState();
      this.renderRightCol();
    }
  },

  // 8. Modals
  openModal(html) {
    this.showModal(html);
  },

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

    this.showModal();
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

    const modalBody = document.getElementById('pc-modal-content');
    if (!modalBody) return;

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

    this.showModal();
  },

  openNoticeModal(idxOrId) {
    let n = null;
    if (typeof idxOrId === 'number' && this.state.notices && this.state.notices[idxOrId]) {
      n = this.state.notices[idxOrId];
    } else {
      n = (this.state.notices || []).find(item => item.id === idxOrId) || (this.state.notices && this.state.notices[0]);
    }
    if (!n) return;

    const modalBody = document.getElementById('pc-modal-content');
    if (!modalBody) return;

    const isPinned = n.isPinned || n.pinned;
    const isNew = n.isNew;
    const formattedDate = (n.date || '').replace(/-/g, '.');

    // 카테고리/구분 뱃지 태그
    const pinnedBadge = isPinned
      ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error/10 text-error border border-error/20 flex items-center gap-1 shrink-0"><svg class="w-3 h-3 text-error" viewBox="0 0 24 24" fill="currentColor"><path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg><span>필독</span></span>'
      : '';
    const newBadge = isNew
      ? '<span class="px-1.5 py-0.5 rounded bg-error text-white font-bold text-[10px] tracking-wider shrink-0">NEW</span>'
      : '';
    const categoryBadge = `
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
        ${n.category || '공통'}
      </span>
    `;

    modalBody.innerHTML = `
      <div class="flex flex-col max-h-[82vh] overflow-hidden text-left">
        <!-- 1. Header Area (상단 메타 바 / 타이틀 / 작성자 정보 완벽 분리) -->
        <div class="flex items-start justify-between pb-4 border-b border-outline mb-4 shrink-0">
          <div class="flex-1 min-w-0 mr-4">
            <!-- 1-1. 상단 뱃지 및 등록일자 바 -->
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              ${pinnedBadge}
              ${categoryBadge}
              ${newBadge}
              <span class="text-xs text-on-surface-variant font-medium ml-auto sm:ml-1 font-mono">${formattedDate}</span>
            </div>

            <!-- 1-2. 공지사항 타이틀 (독립 단독 행) -->
            <h2 class="text-xl font-bold text-on-surface leading-snug break-words">
              ${n.title}
            </h2>

            <!-- 1-3. 작성자 및 공지 메타 정보 -->
            <div class="flex items-center gap-2 text-xs text-on-surface-variant mt-2.5 pt-2 border-t border-outline/30">
              <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span class="font-medium text-on-surface">${n.author || '경영지원팀 오은주 차장'}</span>
              <span class="text-outline">|</span>
              <span class="text-on-surface-variant">공지번호: No.${n.id || 1}</span>
            </div>
          </div>

          <!-- 우측 상단 닫기 X 버튼 -->
          <button type="button" class="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all shrink-0" onclick="PCApp.closeModal()" title="닫기">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- 2. Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto pr-1.5 space-y-4 text-sm text-on-surface leading-relaxed select-text">
          <div class="p-4 bg-surface-container-low/50 rounded-xl border border-outline/30 text-on-surface space-y-3 leading-relaxed">
            ${n.content || `<p>${n.summary || '상세 공지 내용입니다.'}</p>`}
          </div>

          <!-- 첨부파일 영역 -->
          ${n.fileName ? `
            <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline/50 flex items-center justify-between hover:border-primary/50 transition-all">
              <div class="flex items-center gap-3 truncate min-w-0 mr-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <div class="flex flex-col truncate text-left">
                  <span class="text-xs font-bold text-on-surface truncate">${n.fileName}</span>
                  <span class="text-[11px] text-on-surface-variant font-medium">${n.fileSize || '1.2 MB'}</span>
                </div>
              </div>
              <button type="button" class="px-3 py-1.5 bg-primary text-white hover:bg-primary-dim font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5" onclick="PCApp.showToast('파일 [${n.fileName}] 다운로드가 시작되었습니다.')">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                <span>다운로드</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- 3. Bottom Footer Actions -->
        <div class="flex justify-end pt-4 border-t border-outline mt-4 shrink-0">
          <button type="button" class="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors" onclick="PCApp.closeModal()">닫기</button>
        </div>
      </div>
    `;
    this.showModal();
  },

  // 주소록 연동 헬퍼: 이름으로 임직원 정보 조회
  getEmployeeByName(name) {
    if (!name || name === '-' || name === '.') return null;
    const cleanName = String(name).trim();
    const list = this.state.members || (window.MockData && window.MockData.employees) || [];
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

  openProjectModal(projectId) {
    const p = (this.state.projects || []).find(proj => proj.id === projectId) ||
      ((window.MockData && window.MockData.projects) || []).find(proj => proj.id === projectId);
    if (!p) return;

    this.state.currentDetailProjectId = p.id;
    const modalBody = document.getElementById('pc-modal-content');
    if (!modalBody) return;

    const formattedDate = (p.date || '').replace(/-/g, '.');
    const formattedDateFull = p.dateFull ? p.dateFull.replace(/-/g, '.') : formattedDate;

    // Status badge style
    let statusBadgeClass = 'bg-primary/10 text-primary border border-primary/20';
    if (p.status === 'maintenance') statusBadgeClass = 'bg-secondary/10 text-secondary border border-secondary/20';
    else if (p.status === 'build') statusBadgeClass = 'bg-tertiary-container/30 text-tertiary border border-tertiary/20';

    // Author mapping with address book
    const authorEmp = this.getEmployeeByName(p.author);
    const authorDept = authorEmp ? authorEmp.dept : (p.authorDept || '기획팀');
    const authorRole = authorEmp ? authorEmp.role : (p.authorRole || '사원');
    const authorName = authorEmp ? authorEmp.name : p.author;

    // 1. 첨부파일 목록 렌더링
    const attachments = p.attachments || [];
    const attachmentsHtml = attachments.length > 0 ? attachments.map(att => `
      <div class="flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-all rounded-lg p-2.5 border border-outline/40 group cursor-pointer" onclick="PCApp.downloadProjectAttachment('${att.name.replace(/'/g, "\\'")}')">
        <div class="flex items-center gap-2.5 truncate">
          <div class="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          <div class="flex flex-col truncate text-left">
            <span class="text-xs font-bold text-on-surface truncate">${att.name}</span>
            <span class="text-[11px] text-on-surface-variant font-medium">${att.size} • 다운로드 ${att.downloads || 0}회 • ${att.date || ''}</span>
          </div>
        </div>
        <button type="button" class="px-2.5 py-1 bg-primary text-white font-bold rounded-md text-[11px] hover:bg-primary-dim transition-colors shrink-0 flex items-center gap-1">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          <span>다운로드</span>
        </button>
      </div>
    `).join('') : `
      <div class="bg-surface-container-low rounded-lg p-3 border border-dashed border-outline/60 text-xs text-on-surface-variant flex items-center justify-center text-center min-h-[44px]">
        등록된 첨부파일이 없습니다.
      </div>
    `;

    // 2. 고객사 담당자 목록 렌더링
    const clientContacts = p.clientContacts || [];
    const clientContactsHtml = clientContacts.length > 0 ? clientContacts.map(c => `
      <div class="bg-surface-container-lowest p-3 rounded-lg border border-outline/50 text-xs flex flex-col gap-1.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-primary font-mono text-xs">${c.label || '담당자 1'}</span>
            <span class="font-mono text-[11px] text-on-surface-variant">[${c.date || ''}]</span>
          </div>
          <div class="flex items-center gap-1.5">
            ${c.mobile ? `<a href="tel:${c.mobile}" class="px-2 py-0.5 rounded-md bg-surface-container hover:bg-primary hover:text-white text-primary transition-all font-bold flex items-center gap-1 text-[11px]" title="전화걸기"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg><span>전화</span></a>` : ''}
            ${c.email ? `<a href="mailto:${c.email}" class="px-2 py-0.5 rounded-md bg-surface-container hover:bg-primary hover:text-white text-primary transition-all font-bold flex items-center gap-1 text-[11px]" title="이메일 보내기"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>메일</span></a>` : ''}
          </div>
        </div>
        <div class="text-on-surface leading-relaxed flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 border-t border-outline/30 text-[11px]">
          <span class="font-bold text-xs text-on-surface">${c.name || '-'}</span>
          <span class="text-outline">|</span>
          <span class="text-on-surface-variant font-medium">${c.position || '-'}</span>
          <span class="text-outline">|</span>
          <span class="text-on-surface-variant">전화 ${c.tel || '-'}</span>
          <span class="text-outline">|</span>
          <span class="text-on-surface-variant">팩스 ${c.fax || '-'}</span>
          <span class="text-outline">|</span>
          <span class="font-mono text-primary font-bold">휴대폰 ${c.mobile || '-'}</span>
          <span class="text-outline">|</span>
          <span class="font-mono text-on-surface-variant">${c.email || '-'}</span>
        </div>
      </div>
    `).join('') : `
      <div class="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/40 text-xs text-on-surface-variant">
        <span class="font-bold text-on-surface">담당자 1 :</span> 등록된 고객사 담당자 정보가 없습니다.
      </div>
    `;

    // 3. 댓글 / 작업 히스토리 렌더링
    const comments = p.comments || [];
    const commentsHtml = comments.length > 0 ? comments.map(cm => {
      const cEmp = this.getEmployeeByName(cm.author);
      const cDept = cEmp ? cEmp.dept : (cm.authorDept || '기획팀');
      const cRole = cEmp ? ` ${cEmp.role}` : '';
      return `
        <div class="bg-surface-container-lowest p-3 rounded-lg border border-outline/50 flex flex-col gap-1.5 shadow-2xs text-left">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <div class="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                ${(cm.author || '사')[0]}
              </div>
              <span class="font-bold text-xs text-on-surface">${cm.author}${cRole}</span>
              <span class="text-[11px] text-on-surface-variant font-medium">(${cDept})</span>
            </div>
            <span class="font-mono text-[11px] text-on-surface-variant">${cm.date}</span>
          </div>
          <div class="bg-surface-container-low p-2.5 rounded-md text-xs font-mono text-on-surface leading-relaxed whitespace-pre-line select-text border border-outline/30">
            ${cm.content}
          </div>
        </div>
      `;
    }).join('') : `
      <div class="p-3.5 bg-surface-container-lowest rounded-lg border border-dashed border-outline/50 text-center text-on-surface-variant text-xs">
        등록된 댓글 및 작업 메모가 없습니다.
      </div>
    `;

    modalBody.innerHTML = `
      <div class="flex flex-col max-h-[82vh] overflow-hidden">
        <!-- Header Area (Fixed Top) -->
        <div class="flex items-start justify-between pb-3 border-b border-outline mb-3 shrink-0">
          <div class="text-left flex-1 mr-4">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">${p.category || '프로젝트'}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">${p.clientName || '고객사'}</span>
              <span class="text-xs font-medium text-on-surface-variant font-mono">${formattedDateFull || formattedDate}</span>
            </div>
            <h2 class="text-xl font-bold text-on-surface leading-snug">${p.title}</h2>
            <div class="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1.5">
              <div class="w-4.5 h-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                ${(authorName || '사')[0]}
              </div>
              <span>${authorDept} <strong>${authorName}</strong> (${authorRole})</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="px-3 py-1 rounded-full font-bold text-xs ${statusBadgeClass}">${p.statusText || '진행 중'}</span>
            <button class="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all" onclick="PCApp.closeModal()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Body Area -->
        <div class="flex-1 overflow-y-auto pr-1.5 space-y-3 text-left">
          <!-- 1. 프로젝트 기본 정보 테이블 -->
          <section class="bg-surface-container-low rounded-xl p-3.5 border border-outline/50 flex flex-col gap-2">
            <h3 class="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              <span>프로젝트 기본 정보</span>
            </h3>

            <div class="flex flex-col gap-1.5 text-xs">
              <!-- 프로젝트 주소 -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline/30 gap-1.5">
                <span class="text-on-surface-variant font-bold shrink-0 w-28">• 프로젝트 주소</span>
                <div class="flex items-center gap-2 flex-1 min-w-0 justify-between sm:justify-end">
                  <a href="${p.projectUrl || '#'}" target="_blank" class="text-primary font-mono text-xs hover:underline truncate max-w-[440px] flex items-center gap-1">
                    <span>${p.projectUrl || 'http://sitegate.co.kr'}</span>
                    <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                  </a>
                  <button type="button" onclick="PCApp.copyProjectUrl('${p.projectUrl || ''}')" class="px-2 py-0.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-all shrink-0 flex items-center gap-1 font-bold text-[10px]" title="주소 복사">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    <span>복사</span>
                  </button>
                </div>
              </div>

              <!-- 클라이언트 ID (단독 줄) -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline/30 gap-1">
                <span class="text-on-surface-variant font-bold shrink-0 w-28">• 클라이언트 ID</span>
                <span class="font-medium text-on-surface text-left sm:text-right">${p.clientName || '-'} <span class="font-mono text-primary font-bold">(${p.clientId || '-'})</span></span>
              </div>

              <!-- 사이트 ID (단독 줄) -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline/30 gap-1">
                <span class="text-on-surface-variant font-bold shrink-0 w-28">• 사이트 ID</span>
                <div class="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                  <span class="font-medium text-on-surface">${p.siteName || '-'}</span>
                  <span class="font-mono text-primary font-bold">(${p.siteId || '-'})</span>
                  <span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">낙찰정보(${p.bidCount || 0})</span>
                </div>
              </div>

              <!-- PM 및 직군별 담당자 그리드 (2열 넉넉한 배치) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 py-1.5 border-b border-outline/30">
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• PM</span>
                  <span class="font-medium text-on-surface text-right truncate">${this.formatEmployeeWithRole(p.pm)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• 담당자(기획)</span>
                  <span class="font-medium text-on-surface text-right truncate">${this.formatEmployeeWithRole(p.planner)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• 담당자(디자인)</span>
                  <span class="font-medium text-on-surface text-right truncate">${this.formatEmployeeWithRole(p.designer)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• 담당자(코딩)</span>
                  <span class="font-medium text-on-surface text-right truncate">${this.formatEmployeeWithRole(p.publisher)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• 담당자(개발)</span>
                  <span class="font-medium text-on-surface text-right truncate">${this.formatEmployeeWithRole(p.developer)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-on-surface-variant font-bold shrink-0 w-24">• 개발 언어</span>
                  <span class="font-medium text-on-surface text-right truncate">${p.devLang || '-'}</span>
                </div>
              </div>

              <!-- 프로젝트 기간 (단독 줄) -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline/30 gap-1">
                <span class="text-on-surface-variant font-bold shrink-0 w-28">• 프로젝트 기간</span>
                <span class="font-mono font-bold text-on-surface text-left sm:text-right">${p.period || '-'}</span>
              </div>

              <!-- 진행상태 (단독 줄) -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-outline/30 gap-1">
                <span class="text-on-surface-variant font-bold shrink-0 w-28">• 진행상태</span>
                <span class="font-bold text-primary text-left sm:text-right">${p.statusText || '진행 중'}</span>
              </div>

              <!-- 고객사 담당자 목록 -->
              <div class="flex flex-col gap-2 pt-1.5">
                <span class="text-on-surface-variant font-bold">• 고객사 담당자 (${clientContacts.length})</span>
                ${clientContactsHtml}
              </div>
            </div>
          </section>

          <!-- 2. 첨부파일 섹션 -->
          <section class="bg-surface-container-low rounded-xl p-3.5 border border-outline/50 flex flex-col gap-2">
            <h3 class="font-bold text-xs text-on-surface flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a3 3 0 0 0 6 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                <span>첨부 산출물 및 파일 (${attachments.length})</span>
              </span>
            </h3>
            <div class="flex flex-col gap-1.5">
              ${attachmentsHtml}
            </div>
          </section>

          <!-- 3. 상세 내용 본문 -->
          <section class="bg-surface-container-low rounded-xl p-3.5 border border-outline/50 flex flex-col gap-2">
            <h3 class="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M14 17H4v-2h10v2zm6-8H4V7h16v2zm0 4H4v-2h16v2zm0 4h-4v-2h4v2z"/></svg>
              <span>상세 내용</span>
            </h3>
            ${p.content && p.content !== '.' ? `
              <div class="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface leading-relaxed min-h-[44px] whitespace-pre-line border border-outline/40 select-text">
                ${p.content}
              </div>
            ` : `
              <div class="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface-variant flex items-center justify-center text-center min-h-[44px] border border-dashed border-outline/40">
                별도 등록된 본문 텍스트가 없습니다.
              </div>
            `}
          </section>

          <!-- 4. 댓글 및 작업 메모 -->
          <section class="bg-surface-container-low rounded-xl p-3.5 border border-outline/50 flex flex-col gap-2">
            <h3 class="font-bold text-xs text-on-surface flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
                <span>댓글 및 작업 메모 (${comments.length})</span>
              </span>
            </h3>

            <div class="flex flex-col gap-2" id="pc-project-comments-list">
              ${commentsHtml}
            </div>

            <!-- 새 댓글 작성 폼 -->
            <div class="bg-surface-container-lowest p-3 rounded-lg border border-outline/50 flex flex-col gap-2 mt-1">
              <span class="text-xs font-bold text-on-surface">새 댓글 / 작업 메모 작성</span>
              <textarea id="pc-project-new-comment-input" class="w-full p-2.5 bg-surface-container-low rounded-md text-xs text-on-surface border border-outline/40 focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono" placeholder="서버 정보, 개발 링크, 진행 사항 등을 자유롭게 입력하세요..." rows="2"></textarea>
              <div class="flex justify-end">
                <button type="button" onclick="PCApp.submitProjectComment(${p.id})" class="px-3.5 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-dim active:scale-95 transition-all shadow-xs flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  <span>작성 완료</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer Buttons (Fixed Bottom) -->
        <div class="flex justify-end pt-3 border-t border-outline mt-3 shrink-0">
          <button class="px-5 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-all" onclick="PCApp.closeModal()">닫기</button>
        </div>
      </div>
    `;

    this.showModal(null, true);
  },

  copyProjectUrl(url) {
    if (url) {
      navigator.clipboard.writeText(url);
      this.showToast('🔗 프로젝트 주소가 클립보드에 복사되었습니다.');
    } else {
      this.showToast('🔗 복사할 프로젝트 주소가 없습니다.');
    }
  },

  downloadProjectAttachment(fileName) {
    this.showToast(`📥 [${fileName}] 첨부파일 다운로드를 시작합니다.`);
  },

  submitProjectComment(projectId) {
    const input = document.getElementById('pc-project-new-comment-input');
    if (!input || !input.value.trim()) {
      this.showToast('댓글 내용을 입력해주세요.');
      return;
    }

    const p = (this.state.projects || []).find(item => item.id === projectId) ||
      ((window.MockData && window.MockData.projects) || []).find(item => item.id === projectId);
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
        authorDept: this.state.user?.dept || '수행본부',
        date: `${yr}-${mo}-${da} ${ho}:${mi}`,
        content: input.value.trim()
      });

      this.openProjectModal(projectId);
      this.showToast('💬 새로운 댓글 및 작업 메모가 등록되었습니다.');
    }
  },

  showModal(contentHtml, mode = false) {
    const modal = document.getElementById('pc-global-modal');
    const modalBody = document.getElementById('pc-modal-content');
    const modalBox = modal ? modal.querySelector('.pc-modal-box') : null;
    if (!modal) return;

    if (modalBox) {
      modalBox.className = 'pc-modal-box';
      if (mode === true || mode === 'large' || mode === 'lg') {
        modalBox.classList.add('pc-modal-lg');
      } else if (mode === 'date-dialog' || mode === 'calendar') {
        modalBox.classList.add('pc-modal-date-dialog');
      }
    }

    if (contentHtml && modalBody) {
      modalBody.innerHTML = contentHtml;
    }

    modal.classList.add('active');

    // Push modal state into browser history if not already open
    if (!this._isModalOpen) {
      this._isModalOpen = true;
      history.pushState({ screen: this.state.activeScreen, modalOpen: true }, '', window.location.href);
    }
  },

  closeModal(isFromPopState = false) {
    const modal = document.getElementById('pc-global-modal');
    if (!modal) return;

    const modalBox = modal.querySelector('.pc-modal-box');
    if (modalBox) {
      modalBox.className = 'pc-modal-box';
    }

    const wasActive = modal.classList.contains('active') || this._isModalOpen;
    modal.classList.remove('active');
    this._isModalOpen = false;

    // 만약 UI 버튼(취소, 닫기, 배경 클릭)으로 닫은 경우 히스토리 스택 복원
    if (!isFromPopState && wasActive) {
      if (history.state && history.state.modalOpen) {
        history.back();
      }
    }
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
    // 1. ESC Key Modal Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // 2. Browser History Back / Forward (popstate)
    window.addEventListener('popstate', (event) => {
      const modal = document.getElementById('pc-global-modal');
      const isModalActive = (modal && modal.classList.contains('active')) || this._isModalOpen;

      // 만약 모달이 열려있던 상태에서 뒤로가기를 누른 경우 모달만 닫기
      if (isModalActive) {
        if (modal) modal.classList.remove('active');
        this._isModalOpen = false;
        if (event.state && event.state.screen && event.state.screen !== this.state.activeScreen) {
          this.switchScreen(event.state.screen, true);
        }
        return;
      }

      // 화면 복원
      if (event.state && event.state.screen) {
        this.switchScreen(event.state.screen, true);
      } else {
        const hash = (window.location.hash || '').replace(/^#screen-/, '').replace(/^#/, '');
        const validScreens = ['dashboard', 'directory', 'notice', 'calendar', 'finance', 'todo', 'project', 'work-report', 'checkin', 'request'];
        const targetScreen = validScreens.includes(hash) ? hash : 'dashboard';
        this.switchScreen(targetScreen, true);
      }
    });

    // 3. Hash Change Fallback
    window.addEventListener('hashchange', () => {
      const hash = (window.location.hash || '').replace(/^#screen-/, '').replace(/^#/, '');
      const validScreens = ['dashboard', 'directory', 'notice', 'calendar', 'finance', 'todo', 'project', 'work-report', 'checkin', 'request'];
      if (validScreens.includes(hash) && this.state.activeScreen !== hash) {
        this.switchScreen(hash, true);
      }
    });

    // 4. Cross-Device Cross-Tab Real-time Storage Sync (모바일-PC 실시간 동기화)
    window.addEventListener('storage', (e) => {
      if (e.key === 'wordncode_groupware_state' || e.key === 'wordncode_notifications_read_state' || e.key === 'wordncode_groupware_projects') {
        this.loadState();
        this.updateNotificationBadge();
        // 메인 대시보드 3열 위젯 전면 실시간 갱신
        this.renderLeftCol();
        this.renderCenterCol();
        this.renderRightCol();
        // 현재 열려있는 활성 서브스크린 실시간 갱신
        if (this.state.activeScreen === 'checkin') this.renderCheckinView();
        else if (this.state.activeScreen === 'todo') this.renderTodoView();
        else if (this.state.activeScreen === 'notice') this.renderNoticeView();
        else if (this.state.activeScreen === 'directory') this.renderDirectoryView();
        else if (this.state.activeScreen === 'calendar') this.renderCalendarView();
        else if (this.state.activeScreen === 'work-report') this.renderWorkReportView();
        else if (this.state.activeScreen === 'finance') this.renderFinanceView();
        else if (this.state.activeScreen === 'project') this.renderProjectView();
      }
    });
  }
};

// Auto boot on DOM load
document.addEventListener('DOMContentLoaded', () => {
  PCApp.init();
});
